import { NextResponse } from "next/server";
import { appendStore, createId } from "@/lib/local-store";
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
  if (!process.env.META_LEADS_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Meta Lead Ads 未配置" }, { status: 501 });
  }

  const payload = (await request.json()) as MetaLeadPayload;
  const now = new Date().toISOString();
  const rawRecord = {
    id: createId("meta"),
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
    const lead = {
      id: createId("fb"),
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
