"use server";

import { redirect } from "next/navigation";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  if (!verifyAdminPassword(formData.get("password"))) {
    return { error: "Invalid admin password." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}
