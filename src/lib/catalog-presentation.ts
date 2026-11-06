export type CatalogParameter = { name: string; value: string; unit: string };

const unitLabels: Record<string, string> = { "l/s": "L/s", "m3/h": "m³/h", "m³/h": "m³/h", gpm: "GPM", mpa: "MPa", bar: "bar", kw: "kW", psi: "psi", mm: "mm", rpm: "rpm", "r/min": "rpm" };

export function displayParameter(param: CatalogParameter): CatalogParameter {
  const value = param.value.trim();
  const embeddedUnit = value.match(/^([<>≤≥]?\s*\d[\d.,]*(?:\s*[-~–]\s*\d[\d.,]*)?)\s*(L\/s|m[³3]\/h|GPM|MPa|bar|psi|mm|m|kW|r\/min|rpm)$/i);
  const rawUnit = param.unit.trim() || embeddedUnit?.[2] || "";
  const unit = unitLabels[rawUnit.toLowerCase()] || rawUnit;
  const name = param.name.trim();
  return {
    name: /^(head|rated head)$/i.test(name) && /^(bar|mpa|psi)$/i.test(unit) ? "Pressure" : /^caliber$/i.test(name) ? "Nominal diameter" : name,
    value: embeddedUnit && (unitLabels[embeddedUnit[2].toLowerCase()] || embeddedUnit[2]) === unit ? embeddedUnit[1].replace(/~/g, "–") : value,
    unit,
  };
}

export function keyParameters(parameters: CatalogParameter[], limit = 3) {
  const formatted = parameters.filter((param) => param.name.trim() && param.value.trim()).map(displayParameter);
  const preferred = [
    formatted.find((p) => /flow|capacity/i.test(p.name)),
    formatted.find((p) => /^pressure$/i.test(p.name) && /^bar$/i.test(p.unit)) || formatted.find((p) => /pressure|head/i.test(p.name)),
    formatted.find((p) => /nominal diameter|connection size|discharge size|power/i.test(p.name)),
  ];
  const result: CatalogParameter[] = [];
  for (const param of [...preferred, ...formatted]) {
    if (param && !result.some((item) => item.name.toLowerCase() === param.name.toLowerCase())) result.push(param);
    if (result.length === limit) break;
  }
  return result;
}

export function boundedQuery(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function catalogHref(path: string, values: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value) query.set(key, value); });
  return query.size ? `${path}?${query}` : path;
}
