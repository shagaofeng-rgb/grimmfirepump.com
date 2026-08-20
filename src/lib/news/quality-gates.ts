export type FactLock = { field: string; value: string };
export type NewsQualityInput = {
  title: string; body: string; productSlug: string; industry: string; scenario: string;
  sources: Array<{ title: string; url: string; publisher: string; publishedAt: string; verified: boolean }>;
  images: Array<{ src: string; sourceType: "owned-product" | "licensed-external" | "licensed-stock" | "original-infographic"; licenseBasis: "owned" | "public-domain" | "creative-commons" | "press-use-approved" | "commercial-license"; verifiedAt: string }>;
  factLocks: FactLock[]; previousCombinations: string[]; previousTitles: string[];
};
export type QualityGateResult = { passed: boolean; failures: string[]; wordCount: number; combinationKey: string };

const prohibited = [/\bas an ai\b/i, /\bai-generated\b/i, /let's dive in/i, /in today's fast-paced world/i, /it is worth noting/i, /\bworld-leading\b/i, /\bguaranteed\b/i, /\bgame-changing\b/i];
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const jaccard = (left: string, right: string) => { const a = new Set(normalized(left).split(" ")); const b = new Set(normalized(right).split(" ")); return [...a].filter((word) => b.has(word)).length / Math.max(1, new Set([...a, ...b]).size); };

export function validateNewsQuality(input: NewsQualityInput): QualityGateResult {
  const failures: string[] = []; const wordCount = words(input.body);
  const combinationKey = [input.productSlug, input.industry, input.scenario].map(normalized).join("|");
  if (!input.productSlug || !input.industry || !input.scenario) failures.push("Product, industry and scenario are required.");
  if (wordCount < 1100 || wordCount > 1600) failures.push(`Word count ${wordCount} is outside 1100-1600.`);
  if (input.sources.length < 1 || input.sources.length > 2 || input.sources.some((source) => !source.verified || !/^https:\/\//.test(source.url))) failures.push("One or two verified HTTPS sources are required.");
  if (input.images.some((image) => !image.verifiedAt || !image.licenseBasis)) failures.push("Every image requires rights metadata.");
  if (!input.images.length || !input.images.some((image) => image.sourceType === "owned-product")) failures.push("A verified owned product image is required.");
  if (prohibited.some((pattern) => pattern.test(`${input.title}\n${input.body}`))) failures.push("Prohibited AI or unsupported promotional language detected.");
  if (input.previousCombinations.includes(combinationKey)) failures.push("Product-industry-scenario combination was used in the last 60 days.");
  if (input.previousTitles.some((title) => jaccard(title, input.title) > 0.4)) failures.push("Title similarity exceeds 40%.");
  for (const fact of input.factLocks) if (!input.body.includes(fact.value)) failures.push(`Locked fact changed or missing: ${fact.field}.`);
  return { passed: failures.length === 0, failures, wordCount, combinationKey };
}