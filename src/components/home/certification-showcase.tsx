"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { certificatePreviews } from "@/data/certificate-previews";

const certificates = ["Machinery & EMC", "ISO 45001", "ISO 9001", "ISO 14001"].flatMap((label) =>
  certificatePreviews.filter((certificate) => certificate.label === label));

export function CertificationShowcase() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <section className="home-certifications" id="certifications" aria-labelledby="certifications-title">
      <div className="home-section-inner home-certifications-layout">
        <div className="home-certifications-copy">
          <p>OUR COMMITMENT TO QUALITY</p>
          <h2 id="certifications-title">Compliance &amp;<br />Certifications</h2>
          <h3>Verified documentation<br />for project confidence.</h3>
          <span>Review our ISO management system certificates and machinery and EMC attestation. Confirm the applicable document and scope for your specified model before procurement.</span>
          <Link href="/certificates">View all certificates <ArrowRight size={17} /></Link>
        </div>
        <div className="home-certificate-stage" aria-label="Certificate previews">
          {certificates.map((certificate, index) => (
            <button key={certificate.title} type="button" className={`home-certificate-card home-certificate-card-${index}`} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={`Open ${certificate.title}`}>
              <Image src={certificate.src} alt={certificate.title} fill className="object-contain" sizes="(min-width: 1100px) 16vw, 24vw" />
            </button>
          ))}
          <p>GLOBAL STANDARDS. A STRONGER TOMORROW.</p>
        </div>
      </div>
      <dialog ref={dialog} className="home-certificate-dialog" aria-label={selected === null ? "Certificate preview" : certificates[selected].title} onClose={() => setSelected(null)}>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Close certificate preview" autoFocus><X size={22} /></button>
        {selected !== null && <Image src={certificates[selected].src} alt={certificates[selected].title} fill className="object-contain" sizes="(max-width: 768px) 90vw, 690px" loading="eager" />}
      </dialog>
    </section>
  );
}

