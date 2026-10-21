import { HeaderClient } from "@/components/header-client";
import { getPublicProductNavigation } from "@/lib/public-cms";

export async function Header() {
  const groups = await getPublicProductNavigation();
  return <HeaderClient groups={groups} />;
}
