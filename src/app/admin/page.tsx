import { AdminDashboard } from "@/components/admin-dashboard";
import { PageHero } from "@/components/ui";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return (
    <>
      <PageHero
        eyebrow="ROBO GOAL INDIA / RESTRICTED"
        title="COLLABORATION"
        accent="CONTROL ROOM."
        description="Review enquiries, manage follow-ups and track the next generation of partnerships."
      />
      <section className="section container">
        <AdminDashboard />
      </section>
    </>
  );
}
