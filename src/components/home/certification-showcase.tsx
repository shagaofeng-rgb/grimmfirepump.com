"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const certificates = [
  {
    src: "/assets/certificates/public/fire-pump-emc-attestation.jpg",
    title: "Machinery & EMC Attestation",
    redactions: [
      { left: "37%", top: "53%", width: "30%", height: "5%" },
      { left: "37%", top: "74%", width: "22%", height: "11%" },
    ],
  },
  {
    src: "/assets/certificates/home/iso-45001-ohs.png",
    title: "ISO 45001 Occupational Health & Safety",
    redactions: [{ left: "30%", top: "65%", width: "18%", height: "10%" }],
  },
  {
    src: "/assets/certificates/home/iso-9001-quality.png",
    title: "ISO 9001 Quality Management",
    redactions: [{ left: "30%", top: "65%", width: "18%", height: "10%" }],
  },
  {
    src: "/assets/certificates/home/iso-14001-environmental.png",
    title: "ISO 14001 Environmental Management",
    redactions: [{ left: "30%", top: "65%", width: "18%", height: "10%" }],
  },
];

function CertificatePreview({ certificate, sizes }: { certificate: typeof certificates[number]; sizes: string }) {
  return (
    <>
      <Image src={certificate.src} alt={certificate.title} fill className="object-contain" sizes={sizes} priority unoptimized />
      {certificate.redactions.map((area, index) => (
        <span
          key={`${certificate.title}-${index}`}
          aria-hidden="true"
          className="certificate-date-redaction"
          style={area}
        />
      ))}
    </>
  );
}

export function CertificationShowcase() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <section className="home-certifications" id="certifications" aria-labelledby="certifications-title">
      <div className="home-section-inner home-certifications-layout">
        <div className="home-certifications-copy">
          <p>OUR COMMITMENT TO QUALITY</p>
          <h2 id="certifications-title">Compliance &amp;<br />Certifications</h2>
          <h3>Verified documentation<br />for project confidence.</h3>
          <span>Our products are manufactured under strict quality, environmental and management systems. GRIMM PUMP holds internationally recognized certifications, ensuring our fire pump systems meet global standards and customer requirements.</span>
          <Link href="/certificates">View all certificates <ArrowRight size={17} /></Link>
        </div>
        <div className="home-certificate-stage" aria-label="Certificate previews">
          {certificates.map((certificate, index) => (
            <button key={certificate.title} type="button" className={`home-certificate-card home-certificate-card-${index}`} onClick={() => setSelected(index)} aria-label={`Open ${certificate.title}`}>
              <CertificatePreview certificate={certificate} sizes="(min-width: 1100px) 16vw, 38vw" />
            </button>
          ))}
          <p>GLOBAL STANDARDS. A STRONGER TOMORROW.</p>
        </div>
      </div>
      {selected !== null ? (
        <div className="home-certificate-dialog-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <div className="home-certificate-dialog" role="dialog" aria-modal="true" aria-label={certificates[selected].title} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelected(null)} aria-label="Close certificate preview"><X size={22} /></button>
            <CertificatePreview certificate={certificates[selected]} sizes="90vw" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

