import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InteriorFrame, PageMast } from "@/components/interior/frame";
import { ImagePreview } from "@/components/interior/media";
import { certificatePreviews } from "@/data/certificate-previews";
import { localizedAlternates } from "@/lib/i18n";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";

export const metadata: Metadata = {
  title: "Fire Pump Certificates and Documents",
  description: "Review available GRIMM quality certificates, CE documents, test reports and project document packages for fire pump buyers.",
  alternates: localizedAlternates("/certificates"),
};

type CertificatesPageProps = { searchParams: Promise<{ page?: string }> };

export default async function CertificatesPage({ searchParams }: CertificatesPageProps) {
  const { page } = await searchParams;
  const pagedCertificates = getPageSlice(certificatePreviews, getPageNumber(page), 6);

  return (
    <InteriorFrame path="/certificates" breadcrumbs={[{ label: "Certificates" }]}>
      <PageMast eyebrow="Company documents" title="Certificates & attestations"
        action={<Link className="interior-button" href="/contact" prefetch={false}>Request project documents <ArrowRight size={16} /></Link>} />
      <section className="interior-shell interior-band">
        <div className="interior-grid interior-grid-4">
          {pagedCertificates.items.map((item) => (
            <figure key={item.title} className="interior-card">
              <ImagePreview title={item.title} image={{ src: item.src, alt: item.title }}>
                <span className="interior-image interior-certificate"><Image src={item.src} alt={item.title} fill sizes="(min-width: 901px) 25vw, 50vw" /></span>
              </ImagePreview>
              <figcaption className="interior-card-body text-sm font-extrabold">{item.label}</figcaption>
            </figure>
          ))}
        </div>
        <ContentPagination currentPage={pagedCertificates.currentPage} totalItems={certificatePreviews.length} pageSize={6} pathname="/certificates" />
      </section>
    </InteriorFrame>
  );
}
