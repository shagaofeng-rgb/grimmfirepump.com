import Image from "next/image";
import type { ReactNode } from "react";
import { company } from "@/data/site";

const accounts = {
  facebook: { href: company.facebookUrl, name: "Facebook", label: "Follow GRIMM PUMP on Facebook" },
  youtube: { href: company.youtubeUrl, name: "YouTube", label: "Watch GRIMM PUMP on YouTube" },
  whatsapp: { href: company.whatsappUrl, name: "WhatsApp", label: "Contact GRIMM PUMP on WhatsApp" },
};

type Platform = keyof typeof accounts;

// Facebook and WhatsApp artwork from the Meta Brand Resource Center.
// Red YouTube icon from https://brand.youtube/youtube-icon/.
export function SocialPlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
  return (
    <Image
      src={`/assets/social/${platform}.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="shrink-0 object-contain"
      loading="eager"
      unoptimized
    />
  );
}

type SocialAccountLinkProps = {
  platform: Platform;
  className?: string;
  iconSize?: number;
  placement?: string;
  children?: ReactNode;
};

export function SocialAccountLink({ platform, className, iconSize, placement, children }: SocialAccountLinkProps) {
  const { href, name, label } = accounts[platform];

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={children ? undefined : label}
      title={name}
      data-event={`${platform}_click`}
      data-whatsapp-account={platform === "whatsapp" ? "grimm-main" : undefined}
      data-whatsapp-placement={platform === "whatsapp" ? placement : undefined}
    >
      <SocialPlatformIcon platform={platform} size={iconSize} />
      {children}
    </a>
  );
}
