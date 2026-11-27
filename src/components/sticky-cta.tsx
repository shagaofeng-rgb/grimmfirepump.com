import { SocialAccountLink } from "@/components/social-accounts";

export function StickyCta() {
  return (
    <SocialAccountLink
      platform="whatsapp"
      className="whatsapp-float"
      iconSize={36}
      placement="sticky_float"
    />
  );
}
