"use client";

import { useState, type FormEvent } from "react";
import { Calculator } from "lucide-react";
import { estimateWaterPumpPower } from "@/lib/pump-power";

export function PowerCalculator() {
  const [estimate, setEstimate] = useState<ReturnType<typeof estimateWaterPumpPower>>();
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setEstimate(estimateWaterPumpPower(Number(fields.get("flow")), Number(fields.get("head")), Number(fields.get("efficiency"))));
  }
  return (
    <form className="interior-form" onSubmit={calculate} onChange={() => setEstimate(undefined)}>
      <label className="interior-field">Flow (US GPM)<input name="flow" type="number" defaultValue={500} min=".01" max="100000" step="any" required /></label>
      <label className="interior-field">Head (m)<input name="head" type="number" defaultValue={90} min=".01" max="10000" step="any" required /></label>
      <label className="interior-field">Pump efficiency (%)<input name="efficiency" type="number" defaultValue={65} min="1" max="100" step="any" required /></label>
      <div className="interior-form-wide"><button type="submit" className="interior-button interior-primary"><Calculator size={16} /> Calculate</button></div>
      <output className="interior-form-wide interior-calculator-output" aria-live="polite">
        {estimate ? <><strong>Estimated shaft power: {estimate.shaftKw.toFixed(1)} kW / {estimate.shaftHp.toFixed(1)} hp</strong><span>Hydraulic power: {estimate.hydraulicKw.toFixed(1)} kW</span></> : estimate === null ? "Enter valid operating values." : null}
      </output>
    </form>
  );
}
