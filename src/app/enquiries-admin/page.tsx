import { AdminDashboard } from "@/components/admin-dashboard";
import { PageHero } from "@/components/ui";
export const metadata = {
  title: "Enquiry administration",
  robots: { index: false, follow: false },
};
export default function EnquiryAdmin() {
  return (
    <>
      <PageHero
        eyebrow="RGI / RESTRICTED"
        title="ENQUIRY CONTROL ROOM."
        description="Authorized enquiry management. Website publishing is available in Django admin."
      />
      <section className="section container">
        <a className="text-link" href="/cms-admin/">
          Website publishing admin ↗
        </a>
        <AdminDashboard />
      </section>
    </>
  );
}
