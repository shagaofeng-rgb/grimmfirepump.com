import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function MediaCard({
  title, image, text, label, href, linkText, icon, contain,
}: {
  title: string; image: string; text?: string; label?: string; href?: string; linkText?: string; icon?: ReactNode; contain?: boolean;
}) {
  return (
    <article className="interior-card">
      {href ? (
        <Link className={`interior-image${contain ? " contain" : ""}`} href={href} aria-label={title} prefetch={false}>
          <Image src={image} alt="" fill sizes="(min-width: 1280px) 420px, (min-width: 701px) 34vw, 50vw" />
        </Link>
      ) : (
        <div className={`interior-image${contain ? " contain" : ""}`}><Image src={image} alt={title} fill sizes="(min-width: 1280px) 530px, 50vw" /></div>
      )}
      <div className="interior-card-body">
        {label && <p className="interior-card-meta">{label}</p>}
        <h3 className="interior-card-title flex items-start gap-2">{icon}{href ? <Link href={href} prefetch={false}>{title}</Link> : title}</h3>
        {text && <p className="interior-card-copy">{text}</p>}
        {href && linkText && <Link className="interior-text-link" href={href} prefetch={false}>{linkText}<ArrowRight size={15} /></Link>}
      </div>
    </article>
  );
}

export function InteriorBanner({ title, text, href, label }: { title: string; text?: string; href: string; label: string }) {
  return (
    <section className="interior-banner">
      <div className="interior-shell">
        <div><h2 className="interior-subtitle">{title}</h2>{text && <p className="interior-copy mt-2">{text}</p>}</div>
        <Link className="interior-button interior-primary" href={href} prefetch={false}>{label} <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}
