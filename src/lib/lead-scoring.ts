type LeadInput = {
  product?: string;
  certification?: string;
  flow?: string;
  head?: string;
  company?: string;
  country?: string;
  message?: string;
};

export function scoreLead(input: LeadInput) {
  let score = 20;
  if (input.company) score += 10;
  if (input.country) score += 8;
  if (input.flow) score += 12;
  if (input.head) score += 12;
  if (input.certification?.toLowerCase().includes("ul")) score += 20;
  if (input.product?.toLowerCase().includes("ul")) score += 15;
  if (input.message && input.message.length > 40) score += 10;
  const status = score >= 70 ? "hot" : score >= 45 ? "qualified" : "new";
  return { score: Math.min(score, 100), status };
}
