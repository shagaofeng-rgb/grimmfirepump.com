import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { InteriorFrame } from "@/components/interior/frame";

export default function NotFound() {
  return (
    <InteriorFrame path="/" productMenu={false}>
      <section className="interior-white">
        <div className="interior-shell interior-not-found">
          <p className="interior-error-code" aria-hidden="true">404</p>
          <div>
            <p className="interior-kicker">Page not found</p>
            <h1 className="interior-title">This page is unavailable</h1>
            <p className="interior-deck">The address may have changed or the page may have moved.</p>
            <div className="interior-actions mt-5">
              <Link href="/products" prefetch={false} className="interior-button interior-primary">Browse products <ArrowRight size={16} /></Link>
              <Link href="/search" prefetch={false} className="interior-button"><Search size={16} /> Search the site</Link>
            </div>
          </div>
        </div>
      </section>
    </InteriorFrame>
  );
}
