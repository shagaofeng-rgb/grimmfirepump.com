import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { applications } from "@/data/site";

type ApplicationPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return applications.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) return {};
  return {
    title: `${application.title} Fire Protection`,
    description: `${application.keyword}: recommended pump configuration, project challenges and inquiry path.`,
  };
}

export default async function ApplicationDetailPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="container-shell grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-4">{application.keyword}</p>
            <h1 className="text-5xl font-black leading-tight text-[var(--navy-950)]">{application.title} Fire Protection</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{application.text}</p>
            <p className="mt-6 rounded-lg bg-blue-50 p-5 font-bold text-[var(--navy-800)]">Recommended: {application.recommended}</p>
            <Link className="button button-primary mt-8" href="/contact">Get Engineering Advice</Link>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg">
            <Image src={application.image} alt={`${application.title} fire protection`} fill priority className="object-cover" />
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
