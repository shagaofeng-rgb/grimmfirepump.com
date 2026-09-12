import Link from "next/link";

export function HomeCta() {
  return (
    <section className="home-final-cta">
      <div className="home-section-inner">
        <div><p>LET&apos;S BUILD A SAFER TOMORROW</p><h2>Ready to Discuss Your Project?</h2><span>Our team is here to provide the right fire pump solution for your needs.</span></div>
        <div><Link href="/contact">Get a Quote&nbsp; →</Link><Link href="/contact">Contact Us</Link></div>
      </div>
    </section>
  );
}
