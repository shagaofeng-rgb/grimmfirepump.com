# GRIMM homepage reference QA

Date: 2026-11-08. Scope: English homepage, local preview only. No commit, push, environment change, database migration or production deployment was performed.

## Visual Truth And Captures

- Source: `/var/folders/9t/z2r6r54j5lx7p317zs6l35_h0000gn/T/codex-clipboard-4a82dd3a-c60e-409d-85b3-657394f4dc7a.jpg`.
- Source dimensions: 1024 x 1536 pixels.
- Implementation: `http://127.0.0.1:4185/`, isolated Next.js 15.5.29 production build with production database, Blob uploads, analytics providers and automated publishing disconnected.
- Final desktop capture: `tmp/home-reference-2026-11-08/desktop-final.jpg`, 1024 x 1727 pixels. Browser viewport 1024 x 1536 CSS pixels, devicePixelRatio 1. No density scaling was needed.
- Combined full-view evidence: `tmp/home-reference-2026-11-08/comparison-final.jpg`. Source is on the left; implementation is on the right.
- Focused evidence: `tmp/home-reference-2026-11-08/comparison-hero.jpg` and `comparison-products.jpg`; the latter compares identical y=735, height=290 regions.
- Additional browser captures: `desktop-wide.jpg` (1440px), `tablet-final.jpg` (768px), `mobile-final.jpg` (390px), `mobile-small.jpg` (320px).
- State: default homepage, closed menus, optional analytics declined through the existing consent interface, all homepage images loaded. The Next.js developer indicator is absent from the production preview.

## Required Fidelity Surfaces

| Surface | Verified Result |
| --- | --- |
| Typography | Locally hosted Barlow 400/600/800 and Barlow Condensed 800 reproduce the condensed display hierarchy. Headings, body text and buttons remain actual HTML. Letter spacing is zero, with fixed breakpoint font sizes. One H1 contains the readable text `INSIDE THE FACTORY.` |
| Layout rhythm | Header, wine-colored hero, layered EDJ image, manufacturing, three systems, dark checks band, applications, documents and final CTA follow the source order and proportions. At the reference width the retained footer begins at y=1482, approximately the source body's endpoint. The longer total screenshot is primarily the explicitly retained existing footer. |
| Colors | Wine #733037, paper #f8f5f2, charcoal #222b30 and restrained bronze dividing rules follow the supplied reference. Buttons and focus states remain clearly distinguishable. No decorative gradients or added marketing sections. |
| Images/icons | Main workshop and three product images use existing GRIMM originals. Known product originals use existing tightly cropped derivatives; arbitrary CMS uploads are not replaced. The hero uses a transparent-background derivative of the supplied EDJ photograph. The application exterior is a generated illustration, not a company-factory claim. Interface symbols use Lucide, and the existing official social icons are untouched. |
| Copy/content | Reference copy is reproduced as editable text. EDJ range comes from the existing product parameters, normalized to L/s and bar. Application links use the actual canonical application slugs. Product visibility and menu categories use the existing public CMS queries. |

## Comparison And Repair History

1. Initial browser capture: the hero's aspect-ratio plus minimum height expanded its width to 1066px at a 1024px viewport. Fixed by an explicit 100% width and an absolutely positioned title layer; final browser scroll width equals viewport width.
2. Initial images: existing product source whitespace made the three systems too small, while a multiply-blended hero image showed the factory through the equipment. Reused the existing product derivatives and produced a non-destructive transparent EDJ cutout; the original files remain intact.
3. Intermediate evidence: `desktop-r2.jpg` and `comparison-r2.jpg`. Body sections remained roughly 50px taller than the target. Tuned the 1000-1279px breakpoint's manufacturing, product, check and document spacing; the final combined comparison is recorded above.
4. Mobile: reserved a right gutter for the fixed official WhatsApp control, constrained CTA width, and adjusted display headings at 320px. The final 320/390/768/1024/1440px checks found no horizontal overflow or clipped headings/buttons after fonts loaded.
5. Navigation: verified real product categories including Water Supply, Pumps and Accessories, mobile opening, nested expansion, Escape closing, restored body scrolling and desktop dropdown focus return.
6. Link validation found the initial proposed application URLs did not match the existing route schema. Replaced them with the existing canonical slugs before final production-mode verification; all 20 homepage internal targets returned HTTP 200.

## Functional And Technical Verification

- Production build passed, including framework type validation and 120 static outputs. Homepage first-load shared JavaScript is 114 kB according to the build report.
- Existing 40 automated tests passed, 0 failed and 0 skipped, including isolated PostgreSQL store tests. No live Google submissions were made by the tests.
- `git diff --check` passed.
- Browser-clicked homepage EDJ product link opened `EDJ Fire Pump Set`.
- Browser-clicked `Request Pump Curves` opened the existing contact form with a verified, editable curve request prefilled. No inquiry was submitted.
- Browser-clicked catalog link opened the real local document list; its gated download dialog opened and closed with Escape. No lead was submitted.
- Browser console inspection after production-mode navigation returned zero captured errors/warnings.
- HTTP checks: 20/20 existing homepage internal targets returned 200, including all three application pages and the curves request. Evidence: `tmp/home-reference-2026-11-08/link-checks.json`.
- Homepage has one H1, canonical `https://www.grimmfirepump.com`, and parseable existing Organization/WebSite JSON-LD.
- WhatsApp target remains `https://wa.me/message/JV3PVHGQYO5SB1`.
- Footer source SHA-256 before/after: `3b44d5e03ae0360bbff20444bf6563895844b9942b94275f252215fc3638a279`. Both `home-footer.tsx` and global CSS remain unchanged. The footer's existing small-screen behavior is retained rather than redesigned.

## Intentional Differences And Follow-up Polish

- The existing footer is retained exactly as requested, rather than replaced by the reference's compact contact strip.
- Original GRIMM photographs retain their real details and viewpoint. The workshop crop and minor product framing therefore differ from parts of the generated reference.
- The generated building exterior matches the subject and aspect ratio, but is not the identical reference building. It is explicitly an illustrative application image in its alt text.
- Official WhatsApp contact remains available, with reserved edge space; it was not removed merely because the reference omits it.
- No mobile source mockup was supplied. Mobile/tablet layouts adapt the same content and visual hierarchy rather than claim pixel-level matching to a nonexistent reference.
- Small font-metric differences from the raster source remain P3 polish. No known actionable P0/P1/P2 findings remain for this local-preview scope. This is not a full accessibility certification or a production release approval.

## Handoff And Rollback

- Preview remains on `http://127.0.0.1:4185/` for user review. The temporary screenshot-saving service is not part of the application.
- Source backup: `/Users/apple/Documents/格瑞姆水处理/.private-backups/grimm-home-reference-2026-11-08-si7vWk/source.tar.gz`, baseline commit `e31f6857c23bcf0b5262b6874f97ef0d9f8ca829`.
- Modified existing files: `src/app/page.tsx`, `src/app/contact/page.tsx`, `src/components/product-inquiry-form.tsx`. New home components/styles and source-owned fonts/assets are isolated from interior navigation and footer styling.
- Await explicit user approval before committing, pushing or deploying this homepage.

final result: passed
