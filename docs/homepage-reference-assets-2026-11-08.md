# Homepage Reference Assets

This homepage is a local preview of the user-approved reference. Existing source imagery, logo, footer and social icons are retained where applicable.

## Existing Assets

- Workshop: `public/assets/factory/real/production-capacity.webp`.
- Product rows: real CMS main images processed through the existing `interiorProductPhoto` map. Only known original paths resolve to existing tightly cropped derivatives; uploaded images remain unchanged.
- Logo: `public/assets/images/logo.png`.
- UI icons: the existing Lucide React package. No generated brand logos or custom SVG approximations.
- Fonts: Barlow 400/600/800 and Barlow Condensed 800, Latin WOFF2 from Google Fonts, self-hosted under `public/assets/fonts/grimm-home/`. Both SIL Open Font License files are included. Sources: https://fonts.google.com/specimen/Barlow and https://fonts.google.com/specimen/Barlow+Condensed .

## Built-in Image Generation

### Industrial Building Illustration

- Final: `public/assets/home-reference/industrial-building.webp`, 1400 x 467.
- Original: `/Users/apple/.codex/generated_images/019eb567-6a64-77d1-b6b9-3dd928f5c487/exec-4223a731-9169-4917-be51-59983c30be64.png`.
- Mode: built-in Image Gen, new asset, no external stock photograph.
- Prompt: A single standalone, 3:1 panoramic architectural photograph of a clean modern two-story light-gray industrial warehouse. Pale silver cladding, continuous blue glazing, warehouse doors, paved forecourt, small palms, natural blue sky and daylight. Professional neutral architectural photography, no company branding, signage, captions, people, fire or disaster. Place the whole main facade in the middle/lower 80% so it remains clear in a 420 x 125 display crop. Not a webpage or UI mockup.
- Usage: illustrative application image. It must not be presented as a verified GRIMM factory exterior or a customer project.

### EDJ Transparent Cutout

- Final: `public/assets/home-reference/edj-package-cutout.webp`, alpha preserved, maximum 900px width.
- Source: `public/assets/products/edj-package.png`, the existing real GRIMM photograph.
- Generated original: `/Users/apple/.codex/generated_images/019eb567-6a64-77d1-b6b9-3dd928f5c487/exec-923337b6-2b46-453d-a6fc-01bf078de347.png`.
- Mode: built-in Image Gen, background extraction, transparent output.
- Prompt: Remove only the plain white background from the supplied original photograph. Preserve the exact photographed machine, component positions, red pipes, pressure gauges, diesel engine, controller, yellow housing, steel base, colors, lighting and perspective. No invented components, text, logos, scene or floor. Retain all equipment ends and top gauges with a small transparent safety margin; do not reimagine the product.
- Usage: hero compositing only. The product-list imagery and product detail records continue to use original CMS imagery. The original source files are not overwritten.

Both generated files were subsequently resized/compressed to WebP for delivery. Visual comparisons, final browser captures and known intentional deviations are documented in `design-qa.md`.
