"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="section container" style={{ paddingTop: 170 }}>
      <h1>LET’S RESET THE ARENA.</h1>
      <p>Something didn’t load correctly. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
