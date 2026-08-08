import { company } from "@/data/site";

export const dynamic = "force-dynamic";

export function GET() {
  const body = `# ${company.shortName}\n\n> ${company.legalName} provides fire pump, water supply, drainage and mobile pumping equipment for project buyers.\n\n## Product systems\n- Fire Pump Systems: ${company.website}/products?group=fire-pump-systems\n- Water Supply Systems: ${company.website}/products?group=water-supply-systems\n- Sewage & Drainage Pumps: ${company.website}/products?group=sewage-drainage-pumps\n- Mobile & Irrigation Pump Solutions: ${company.website}/products?group=mobile-irrigation-solutions\n\n## Applications\n- Warehouse fire protection: ${company.website}/applications/warehouse-fire-protection\n- Data center fire protection: ${company.website}/applications/data-center-fire-protection\n- Oil and gas fire pump packages: ${company.website}/applications/oil-gas-fire-pump-package\n- Industrial plant fire protection: ${company.website}/applications/industrial-plant-fire-protection\n\n## Resources\n- Industry news: ${company.website}/news\n- Knowledge center: ${company.website}/knowledge\n- Contact: ${company.website}/contact\n\n## Contact\n- Email: ${company.email}\n- WhatsApp: ${company.phone}\n- Address: ${company.address}\n`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" } });
}
