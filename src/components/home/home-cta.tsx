import Link from "next/link";

export function HomeCta() {
  return (
    <section className="home-final-cta">
      <div className="home-section-inner">
        <h2>Have a duty point or project drawing?</h2>
        <p>Start a focused fire pump discussion with your project team.</p>
        <Link href="/contact">Send project brief</Link>
      </div>
    </section>
  );
}
