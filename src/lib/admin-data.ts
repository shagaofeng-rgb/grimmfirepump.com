import { readStore } from "@/lib/local-store";
import {
  listAdminUsers,
  listAuditLogs,
  listCmsNews,
  listCmsProducts,
  listDownloadAssets,
  listManagedPages,
  listMediaFiles,
  listProductCategories,
} from "@/lib/admin-cms";

export type InquiryRecord = {
  id: string;
  createdAt: string;
  stage: string;
  score: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  product?: string;
  flow?: string;
  head?: string;
  certification?: string;
  message?: string;
  sourcePage?: string;
  sourceType?: string;
  jobTitle?: string;
  websiteUrl?: string;
  customerType?: string;
  projectType?: string;
  application?: string;
  voltage?: string;
  frequency?: string;
  quantity?: string;
  purchaseTime?: string;
  projectStage?: string;
  oemOdm?: boolean;
  privacyConsent?: boolean;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ip?: string;
  userAgent?: string;
  status?: string;
  intent?: "A" | "B" | "C" | "unrated";
  owner?: string;
  notes?: string;
};

export type DownloadLeadRecord = {
  id: string;
  createdAt: string;
  assetTitle: string;
  name: string;
  email: string;
  company?: string;
  country?: string;
};

export type AnalyticsEventRecord = {
  id: string;
  createdAt: string;
  event: string;
  path?: string;
  label?: string;
};

export async function getAdminData() {
  const [inquiries, downloadLeads, events, cmsProducts, cmsNews, categories, media, cmsDownloads, pages, users, auditLogs] = await Promise.all([
    readStore<InquiryRecord[]>("inquiries.json", []),
    readStore<DownloadLeadRecord[]>("download-leads.json", []),
    readStore<AnalyticsEventRecord[]>("analytics-events.json", []),
    listCmsProducts(),
    listCmsNews(),
    listProductCategories(),
    listMediaFiles(),
    listDownloadAssets(),
    listManagedPages(),
    listAdminUsers(),
    listAuditLogs(),
  ]);

  const eventCounts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.event] = (acc[item.event] || 0) + 1;
    return acc;
  }, {});

  return {
    inquiries,
    downloadLeads,
    events,
    eventCounts,
    cmsProducts,
    cmsNews,
    categories,
    media,
    cmsDownloads,
    pages,
    users,
    auditLogs,
    totals: {
      products: cmsProducts.length,
      publishedProducts: cmsProducts.filter((item) => item.status === "published").length,
      draftProducts: cmsProducts.filter((item) => item.status === "draft").length,
      downloads: cmsDownloads.length,
      posts: cmsNews.length,
      publishedNews: cmsNews.filter((item) => item.status === "published").length,
      categories: categories.length,
      media: media.length,
      pages: pages.length,
      users: users.length,
      auditLogs: auditLogs.length,
      inquiries: inquiries.length,
      downloadLeads: downloadLeads.length,
      events: events.length,
    },
  };
}
