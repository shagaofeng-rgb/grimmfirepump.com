import { redirect } from "next/navigation";
import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
