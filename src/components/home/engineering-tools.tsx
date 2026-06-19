"use client";

import { FormEvent, useState } from "react";
import { SectionHeading } from "@/components/section-heading";

export function EngineeringTools() {
  const [selection, setSelection] = useState("Recommended result will appear here.");
  const [calculation, setCalculation] = useState("Estimated motor power will appear here.");

  function selectPump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const flow = Number(data.get("flow"));
    const pressure = Number(data.get("pressure"));
    const application = String(data.get("application"));
    let recommendation = "EDJ Fire Pump System";
    let reason = "balanced electric, diesel and jockey package for most building and industrial projects";

    if (application === "water-source") {
      recommendation = "Vertical Turbine Fire Pump";
      reason = "better suited for tank, reservoir and deep water source conditions";
    } else if (application === "oil-gas" || application === "remote" || pressure > 13) {
      recommendation = "Diesel Fire Pump Set";
      reason = "standby diesel operation supports high-risk or remote projects";
    } else if (flow <= 300 && pressure <= 9) {
      recommendation = "Electric Fire Pump Set with Jockey Pump";
      reason = "efficient for standard commercial pump rooms and warehouse systems";
    } else if (flow >= 1500) {
      recommendation = "EDJ High-flow Fire Pump Package";
      reason = "large flow projects benefit from packaged main, standby and pressure maintenance pumps";
    }

    setSelection(`${recommendation}: ${reason}. Send your flow, pressure, country and application for a detailed model selection.`);
  }

  function calculatePower(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const flowGpm = Number(data.get("flow"));
    const headM = Number(data.get("head"));
    const efficiency = Number(data.get("efficiency")) / 100;
    const flowM3h = flowGpm * 0.2271247;
    const kw = (flowM3h * headM) / (367 * efficiency);
    const hp = kw * 1.34102;
    setCalculation(
      `Estimated hydraulic power: ${kw.toFixed(1)} kW / ${hp.toFixed(1)} HP. Final selection should confirm pump curve, duty point and safety margin.`,
    );
  }

  return (
    <section className="section bg-gradient-to-b from-white to-slate-50">
      <SectionHeading eyebrow="Engineering Tools" title="Help buyers move from interest to a specific requirement." />
      <div className="container-shell grid gap-5 lg:grid-cols-2">
        <form onSubmit={selectPump} className="card grid gap-4 p-6">
          <h3 className="text-2xl font-black text-[var(--navy-950)]">Fire Pump Selector</h3>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Flow demand
            <select name="flow" className="min-h-12 rounded-md border border-slate-300 px-3">
              <option value="100">100 GPM</option>
              <option value="300">300 GPM</option>
              <option value="750">750 GPM</option>
              <option value="1500">1500 GPM</option>
              <option value="2500">2500 GPM</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Pressure
            <select name="pressure" className="min-h-12 rounded-md border border-slate-300 px-3">
              <option value="7">7 bar</option>
              <option value="9">9 bar</option>
              <option value="12">12 bar</option>
              <option value="14">Above 13 bar</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Application
            <select name="application" className="min-h-12 rounded-md border border-slate-300 px-3">
              <option value="building">Commercial building</option>
              <option value="warehouse">Warehouse</option>
              <option value="oil-gas">Oil & gas</option>
              <option value="remote">Remote project</option>
              <option value="water-source">Deep water source</option>
            </select>
          </label>
          <button className="button button-primary" type="submit">Recommend Pump</button>
          <output className="min-h-[72px] rounded-lg bg-blue-50 p-4 font-bold text-[var(--navy-900)]">{selection}</output>
        </form>

        <form onSubmit={calculatePower} className="card grid gap-4 p-6">
          <h3 className="text-2xl font-black text-[var(--navy-950)]">Pump Power Calculator</h3>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Flow, GPM
            <input name="flow" type="number" min="1" defaultValue="500" className="min-h-12 rounded-md border border-slate-300 px-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Head, m
            <input name="head" type="number" min="1" defaultValue="90" className="min-h-12 rounded-md border border-slate-300 px-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Efficiency, %
            <input name="efficiency" type="number" min="20" max="90" defaultValue="65" className="min-h-12 rounded-md border border-slate-300 px-3" />
          </label>
          <button className="button button-primary" type="submit">Calculate</button>
          <output className="min-h-[72px] rounded-lg bg-blue-50 p-4 font-bold text-[var(--navy-900)]">{calculation}</output>
        </form>
      </div>
    </section>
  );
}
