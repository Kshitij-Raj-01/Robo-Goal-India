import { PageHero, Button } from "@/components/ui";
export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404 / OUT OF BOUNDS"
        title="LET’S GET YOU"
        accent="BACK IN PLAY."
        description="This page or profile isn’t available. Explore the tour or return to the arena."
      />
      <section className="section container button-row">
        <Button href="/">Back to the Homepage</Button>
        <Button href="/tour" secondary>
          Explore the Tour
        </Button>
      </section>
    </>
  );
}
