import { redirect } from "next/navigation";

export default function AdminInquiriesRedirect() {
  redirect("/admin/leads");
}
