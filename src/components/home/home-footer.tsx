import Image from "next/image";
import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { company } from "@/data/site";

const links = ["Home", "Products", "Solutions", "Quality", "Projects", "About", "Contact"];

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <Image src="/assets/images/footer-world-map.png" alt="" fill className="home-footer-map" sizes="100vw" />
      <div className="home-footer-grid">
        <div className="home-footer-brand">
          <Link href="/" aria-label="GRIMM PUMP home"><strong>GRIMM<span>PUMP</span></strong><small>PUMPING A SAFER TOMORROW</small></Link>
        </div>
        <div className="home-footer-links"><h3>Quick Links</h3><nav>{links.map((label) => <Link key={label} href={label === "Home" ? "/" : `/${label.toLowerCase() === "solutions" ? "applications" : label.toLowerCase()}`}>{label}</Link>)}</nav></div>
        <div className="home-footer-contact"><h3>Contact Us</h3><p><MapPin />{company.address}</p><p><Phone />{company.phone}</p><p><Mail />{company.email}</p><p>◎ {company.website}</p></div>
        <div className="home-footer-social"><h3>Follow Us</h3><div><a href={company.facebookUrl} target="_blank" rel="noreferrer" aria-label="Follow GRIMM PUMP on Facebook" data-event="facebook_click"><Facebook /></a><a href={company.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Watch GRIMM PUMP on YouTube" data-event="youtube_click"><Youtube /></a></div><span>A SAFER WORLD<br />THROUGH<br />RELIABLE FIRE PROTECTION</span></div>
      </div>
      <div className="home-footer-bottom"><span>© 2025 GRIMM PUMP. All rights reserved.</span><span><Link href="/">Privacy Policy</Link><Link href="/">Terms of Use</Link><Link href="/sitemap.xml">Site Map</Link></span></div>
    </footer>
  );
}
