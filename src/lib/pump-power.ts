export function estimateWaterPumpPower(flowGpm: number, headMeters: number, efficiencyPercent: number) {
  if (![flowGpm, headMeters, efficiencyPercent].every(Number.isFinite) || flowGpm <= 0 || headMeters <= 0 || efficiencyPercent <= 0 || efficiencyPercent > 100) return null;
  const hydraulicKw = 1000 * 9.80665 * (flowGpm * 0.003785411784 / 60) * headMeters / 1000;
  const shaftKw = hydraulicKw / (efficiencyPercent / 100);
  return { hydraulicKw, shaftKw, shaftHp: shaftKw / 0.745699872 };
}
