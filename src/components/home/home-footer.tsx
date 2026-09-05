import Link from "next/link";
import { company } from "@/data/site";

const groups = [
  {
    title: "Products",
    links: [
      ["EDJ fire pump systems", "/products/edj-fire-pump-set"],
      ["Diesel fire pump sets", "/products/diesel-engine-fire-pump"],
      ["Jockey pump configurations", "/products/vertical-stainless-steel-multistage-pump-jockey-pump"],
    ],
  },
  {
    title: "Applications",
    links: [
      ["Building & construction", "/applications/commercial-building-fire-pump"],
      ["Industrial", "/applications/industrial-plant-fire-protection"],
      ["Infrastructure", "/applications"],
    ],
  },
  {
    title: "Project support",
    links: [
      ["Technical review", "/contact"],
      ["Documentation", "/certificates"],
      ["System submittals", "/downloads"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Knowledge center", "/knowledge"],
      ["Literature", "/downloads"],
      ["Drawing resources", "/downloads"],
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer-grid">
        <div className="home-footer-brand">
          <Link href="/">GRIMM PUMP</Link>
          <p>Fire pump systems for project teams that need clear technical inputs before ordering.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <nav>
              {group.links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
            </nav>
          </div>
        ))}
        <div className="home-footer-action">
          <Link href="/contact">Send project brief</Link>
        </div>
      </div>
      <div className="home-footer-bottom">
        <span>© GRIMM PUMP. All rights reserved.</span>
        <span>{company.email}</span>
      </div>
    </footer>
  );
}
