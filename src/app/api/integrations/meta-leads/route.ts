import { NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { appendStore } from "@/lib/local-store";
import { scoreLead } from "@/lib/lead-scoring";

type MetaField = {
  name?: string;
  values?: string[];
};

type MetaLeadPayload = {
  entry?: Array<{
    id?: string;
    time?: number;
    changes?: Array<{
      field?: string;
      value?: {
        leadgen_id?: string;
        form_id?: string;
        page_id?: string;
        created_time?: number;
        field_data?: MetaField[];
      };
    }>;
  }>;
};

function normalizeFieldName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function getField(fields: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (fields[key]) return fields[key];
  }
  return "";
}

function extractLeadFields(fieldData: MetaField[] = []) {
  return fieldData.reduce<Record<string, string>>((acc, field) => {
    if (!field.name) return acc;
    acc[normalizeFieldName(field.name)] = field.values?.join(", ") || "";
    return acc;
  }, {});
}

function validMetaSignature(body: string, signature: string, secret: string) {
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") || "";
  const expectedToken = process.env.META_LEADS_VERIFY_TOKEN;

  if (!expectedToken) {
    return NextResponse.json({ error: "Meta Lead Ads 未配置 META_LEADS_VERIFY_TOKEN" }, { status: 501 });
  }
  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const appSecret = process.env.META_APP_SECRET;
  if (!process.env.META_LEADS_VERIFY_TOKEN || !appSecret) {
    return NextResponse.json({ error: "Meta Lead Ads 未配置" }, { status: 501 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const signature = request.headers.get("x-hub-signature-256") || "";
  if (!validMetaSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Invalid Meta webhook signature" }, { status: 401 });
  }
  let payload: MetaLeadPayload;
  try {
    payload = JSON.parse(rawBody) as MetaLeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const deliveryFingerprint = createHash("sha256").update(rawBody).digest("hex").slice(0, 32);
  const rawRecord = {
    id: `meta_${deliveryFingerprint}`,
    createdAt: now,
    payload,
  };
  await appendStore("facebook-leads.json", rawRecord);

  const changes = payload.entry?.flatMap((entry) => entry.changes || []) || [];
  const created = [];
  for (const change of changes) {
    if (change.field !== "leadgen" || !change.value) continue;
    const fields = extractLeadFields(change.value.field_data);
    const leadInput = {
      name: getField(fields, ["full_name", "name", "first_name"]),
      email: getField(fields, ["email", "email_address"]),
      company: getField(fields, ["company", "company_name"]),
      phone: getField(fields, ["phone_number", "phone", "mobile_phone"]),
      country: getField(fields, ["country", "country_region"]),
      product: getField(fields, ["product", "interested_product", "pump_type"]),
      message: getField(fields, ["message", "project_details", "requirements"]),
      sourcePage: `facebook:${change.value.page_id || "unknown-page"}`,
      sourceType: "facebook_lead_ads",
    };

    if (!leadInput.name || !leadInput.email) continue;
    const scoring = scoreLead(leadInput);
    const leadId = change.value.leadgen_id
      ? `fb_${change.value.leadgen_id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120)}`
      : `fb_${createHash("sha256").update(JSON.stringify(change.value)).digest("hex").slice(0, 32)}`;
    const lead = {
      id: leadId,
      createdAt: now,
      stage: scoring.status,
      status: "new",
      score: scoring.score,
      intent: scoring.score >= 70 ? "A" : scoring.score >= 45 ? "B" : "C",
      metaLeadId: change.value.leadgen_id || "",
      metaFormId: change.value.form_id || "",
      rawFields: fields,
      ...leadInput,
    };
    await appendStore("inquiries.json", lead);
    created.push(lead.id);
  }

  return NextResponse.json({ ok: true, stored: rawRecord.id, createdLeads: created.length });
}
