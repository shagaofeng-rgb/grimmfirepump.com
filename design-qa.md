# Homepage reference-fidelity QA

- Reference: `首页最新参考模板.png`, desktop composition at 1440px.
- Implementation: locally built production homepage at 1440px.
- Structure checks: home width `1440/1440`, certificate cards `4`, footer map present.
- Build gate: TypeScript typecheck passed; Next.js production build passed.

## Verified fidelity work

- Navigation now follows the compact reference layout, with search divider and EN control.
- Hero, statistic rail, product-card density, certificate-card scale, factory background layer, CTA map treatment, and four-column footer were rebuilt to follow the selected reference composition.
- Four user-supplied certificates remain real source documents and keep click-to-enlarge behavior.
- Existing real product and factory photos remain the content source; generated artwork is used only for the two non-product map textures.

## Follow-up note

- Product photography is intentionally real GRIMM imagery rather than a generated imitation of the reference assets.

final result: passed
