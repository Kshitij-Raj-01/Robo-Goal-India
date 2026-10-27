import { redirect } from "next/navigation";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default function Admin() {
  redirect("/cms-admin/");
}
