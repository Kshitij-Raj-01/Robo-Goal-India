import { gsap } from "gsap";
import { INTRO_TIMING } from "../intro-config";

/** Drop the velvet curtain, illuminate the title, then part it over the homepage. */
export function addCurtainReveal(
  host: HTMLDivElement,
  timeline: gsap.core.Timeline,
) {
  const intro = host.parentElement!;
  const curtain = intro.querySelector<HTMLElement>(".intro-curtain")!;
  const title = intro.querySelector<HTMLElement>(".curtain-title")!;
  const letters = title.querySelectorAll(".curtain-letter");
  const left = curtain.querySelector<HTMLElement>(".curtain-panel-left")!;
  const right = curtain.querySelector<HTMLElement>(".curtain-panel-right")!;
  gsap.set(curtain, { yPercent: -105, visibility: "visible" });
  gsap.set(letters, { opacity: 0, y: 35, rotateX: -70, scale: 0.92 });
  timeline
    .call(
      () => {
        host.dataset.stage = "curtain-down";
      },
      [],
      INTRO_TIMING.curtainDown,
    )
    .to(
      curtain,
      { yPercent: 0, duration: 0.65, ease: "power3.inOut" },
      INTRO_TIMING.curtainDown,
    )
    .set(host, { visibility: "hidden" }, INTRO_TIMING.title - 0.05)
    .call(
      () => {
        host.dataset.stage = "gold-title";
        curtain.classList.add("curtain-illuminated");
      },
      [],
      INTRO_TIMING.title,
    )
    .to(
      letters,
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.035,
        ease: "back.out(1.25)",
      },
      INTRO_TIMING.title,
    )
    .to(
      title,
      { opacity: 0, scale: 1.04, duration: 0.25, ease: "power2.in" },
      INTRO_TIMING.titleOut,
    )
    .call(
      () => {
        // Release the page only once the curtain completely covers the 3D scene.
        host.dataset.stage = "reveal";
        intro.classList.add("intro-revealing");
        document.documentElement.dataset.intro = "revealing";
      },
      [],
      INTRO_TIMING.curtainOpen - 0.05,
    )
    .to(
      left,
      { xPercent: -104, duration: 0.8, ease: "power3.inOut" },
      INTRO_TIMING.curtainOpen,
    )
    .to(
      right,
      { xPercent: 104, duration: 0.8, ease: "power3.inOut" },
      INTRO_TIMING.curtainOpen,
    );
}
