import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/admin-data";

type CsvRecord = Record<string, unknown>;
const exportSections = { leads: "inquiries", products: "cmsProducts", news: "cmsNews", downloads: "cmsDownloads", events: "events" } as const;
const exportRoles = { leads: ["sales"], products: ["product_manager"], news: ["content_manager"], downloads: ["content_manager", "product_manager"], events: ["analyst"] };

function safeCell(value: unknown) {
  const raw = value == null ? "" : String(value);
  const escaped = /^(?:\s*[=+\-@]|[\t\r\n])/.test(raw) ? `'${raw}` : raw;
  return `"${escaped.replace(/"/g, '""')}"`;
}

function toCsv(rows: CsvRecord[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(safeCell).join(","),
    ...rows.map((row) => headers.map((header) => safeCell(row[header])).join(",")),
  ].join("\n");
}

function flatten(value: unknown) {
  if (Array.isArray(value)) return value.join(" | ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return value;
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type") || "leads";
  if (!Object.hasOwn(exportSections, type)) return NextResponse.json({ error: "Unsupported export type" }, { status: 400 });
  const key = type as keyof typeof exportSections;
  if (admin.role !== "super_admin" && !exportRoles[key].includes(admin.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await getAdminData([exportSections[key]]);
  const rowsByType: Record<string, CsvRecord[]> = {
    leads: data.inquiries.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      name: item.name,
      email: item.email,
      company: item.company,
      phone: item.phone,
      country: item.country,
      product: item.product,
      score: item.score,
      status: item.status || item.stage,
      intent: item.intent,
      owner: item.owner,
      sourcePage: item.sourcePage,
      sourceType: item.sourceType,
      whatsappAccount: item.whatsappAccountLabel,
      whatsappClickSource: item.whatsappClickSource,
      whatsappClickPage: item.whatsappClickPage,
      whatsappClickedAt: item.whatsappClickedAt,
      message: item.message,
      notes: item.notes,
    })),
    products: data.cmsProducts.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      categoryName: item.categoryName,
      model: item.model,
      sku: item.sku,
      status: item.status,
      featured: item.featured,
      sortOrder: item.sortOrder,
      seoTitle: item.seoTitle,
      updatedAt: item.updatedAt,
    })),
    news: data.cmsNews.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category,
      status: item.status,
      publishAt: item.publishAt,
      seoTitle: item.seoTitle,
      updatedAt: item.updatedAt,
    })),
    downloads: data.cmsDownloads.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      relatedProduct: item.relatedProduct,
      language: item.language,
      gated: item.gated,
      status: item.status,
      downloads: item.downloads,
      fileUrl: item.fileUrl,
    })),
    events: data.events.map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, flatten(value)]))),
  };

  const rows = rowsByType[type];
  if (!rows) {
    return NextResponse.json({ error: "Unsupported export type" }, { status: 400 });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="grimm-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
