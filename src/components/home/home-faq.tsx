import Link from "next/link";
import { ArrowRight } from "lucide-react";

const questions = [
  ["What information is needed for a fire pump review?", "Share the required flow, pressure or head, driver preference, water source, country and any project standard or drawing available."],
  ["Can GRIMM support project documentation?", "Catalogs, available certificates and published equipment information can be reviewed against the requested configuration before quotation."],
  ["How do I choose between electric and diesel drive?", "The selection depends on the project duty, power availability, code requirements and the overall fire protection system design."],
  ["Can we discuss an OEM or distributor requirement?", "Yes. Use the contact page to identify the target market, product scope and expected cooperation model so the right team can respond."],
];

export function HomeFaq() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 md:px-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-sm font-black text-[var(--orange-dark)]">PROJECT FAQ</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">Clear the practical questions before the inquiry.</h2>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--navy-900)] underline decoration-[var(--orange)] decoration-2 underline-offset-4">Ask a project question <ArrowRight size={17} /></Link>
        </div>
        <div className="grid gap-3">
          {questions.map(([question, answer]) => (
            <details key={question} className="group border border-slate-200 bg-slate-50 px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-black text-[var(--navy-950)] marker:content-none">
                {question}<span className="text-xl text-[var(--orange)] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
