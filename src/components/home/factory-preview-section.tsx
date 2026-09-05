import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const evidence = [
  {
    src: "/assets/factory/real/production-capacity.webp",
    eyebrow: "System configuration",
    title: "See how package capability is presented.",
    text: "Review the manufacturing and assembly context behind GRIMM pump packages.",
    href: "/factory",
    action: "View factory",
  },
  {
    src: "/assets/applications/edj-testing.webp",
    eyebrow: "Testing process",
    title: "Follow the checks before shipment.",
    text: "See the published inspection, duty verification and controller review sequence.",
    href: "/testing",
    action: "Review testing",
  },
  {
    src: "/assets/factory/real/controller-assembly.webp",
    eyebrow: "Project documents",
    title: "Request the documents your review needs.",
    text: "Confirm available drawings, test records and supporting documents for the project.",
    href: "/certificates",
    action: "Review documents",
  },
];

export function FactoryPreviewSection() {
  return (
    <section className="home-evidence-section">
      <div className="container-shell py-20 md:py-24">
        <div className="max-w-3xl">
          <p className="home-kicker">Evidence, not decoration</p>
          <h2 className="home-display mt-3 text-3xl leading-tight text-[var(--navy-950)] md:text-[48px]">
            Built for practical review.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Move from the pump package to the available factory, testing and documentation evidence.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {evidence.map((item) => (
            <article key={item.title} className="group overflow-hidden border border-slate-200 bg-white">
              <figure className="relative h-[220px] overflow-hidden">
                <Image src={item.src} alt={item.eyebrow} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 33vw, 100vw" />
              </figure>
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--orange-dark)]">{item.eyebrow}</p>
                <h3 className="mt-3 text-xl font-black leading-snug text-[var(--navy-950)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[var(--navy-900)]">
                  {item.action}
                  <ArrowRight size={16} className="text-[var(--orange)]" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
