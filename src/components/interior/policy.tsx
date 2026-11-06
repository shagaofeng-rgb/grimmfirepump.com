import type { ReactNode } from "react";
import { InteriorFrame, PageMast } from "./frame";

export function PolicyPage({ path, title, sections }: { path: string; title: string; sections: { id: string; heading: string; content: ReactNode }[] }) {
  return (
    <InteriorFrame path={path} breadcrumbs={[{ label: title }]}>
      <PageMast eyebrow="GRIMM PUMP" title={title} text="Last updated: 21 October 2026" />
      <div className="interior-white">
        <div className="interior-shell interior-band interior-rail-layout">
          <aside className="interior-rail">
            <p>On this page</p>
            <nav className="interior-rail-nav" aria-label="Policy sections">{sections.map(({ id, heading }) => <a key={id} href={`#${id}`}>{heading}</a>)}</nav>
          </aside>
          <div className="grid max-w-3xl gap-6">
            {sections.map(({ id, heading, content }) => <section key={id} id={id} className="interior-anchor"><h2 className="interior-subtitle">{heading}</h2><div className="interior-copy mt-2">{content}</div></section>)}
          </div>
        </div>
      </div>
    </InteriorFrame>
  );
}
