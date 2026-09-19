import { company } from "@/data/site";
import { WhatsAppIcon } from "@/components/social-platform-icons";

export function StickyCta() {
  return (
    <a
      className="whatsapp-float"
      href={company.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      data-event="whatsapp_click"
      data-whatsapp-account="grimm-main"
      data-whatsapp-placement="sticky_float"
      aria-label="Contact GRIMM PUMP on WhatsApp"
      title="WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
