import { downloads, posts, products, projects } from "@/data/site";
import { readStore } from "@/lib/local-store";

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
  const [inquiries, downloadLeads, events] = await Promise.all([
    readStore<InquiryRecord[]>("inquiries.json", []),
    readStore<DownloadLeadRecord[]>("download-leads.json", []),
    readStore<AnalyticsEventRecord[]>("analytics-events.json", []),
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
    totals: {
      products: products.length,
      downloads: downloads.length,
      posts: posts.length,
      projects: projects.length,
      inquiries: inquiries.length,
      downloadLeads: downloadLeads.length,
      events: events.length,
    },
  };
}
