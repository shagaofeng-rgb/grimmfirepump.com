import type { NewsSourceCatalogRecord } from "./source-catalog";

export type RotationContext = {
  now: Date;
  usedDomainDates: Map<string, Date>;
  recentGroups: string[];
  recentRegions: string[];
};

export function chooseRotatedSources(records: NewsSourceCatalogRecord[], context: RotationContext, limit = 8) {
  const cutoff = new Date(context.now); cutoff.setUTCDate(cutoff.getUTCDate() - 14);
  const eligible = records.filter((record) => record.active && record.validationStatus === "valid" && !(context.usedDomainDates.get(record.domain) && context.usedDomainDates.get(record.domain)! > cutoff));
  const tierScore = { A: 3, B: 2, C: 1, "discovery-only": 0 };
  return [...eligible].sort((a, b) => {
    const aGroupPenalty = context.recentGroups.slice(-2).filter((group) => group === a.sourceGroup).length;
    const bGroupPenalty = context.recentGroups.slice(-2).filter((group) => group === b.sourceGroup).length;
    return (tierScore[b.tier] * 10 - b.useCount - bGroupPenalty * 20) - (tierScore[a.tier] * 10 - a.useCount - aGroupPenalty * 20) || a.ordinal - b.ordinal;
  }).slice(0, limit);
}