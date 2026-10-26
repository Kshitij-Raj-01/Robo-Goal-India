import { gsap } from "gsap";
import { INTRO_TIMING } from "../intro-config";

/** White/orange fabric, supplied logo, football-O portal, then homepage reveal. */
export function addCurtainReveal(
  host: HTMLDivElement,
  timeline: gsap.core.Timeline,
) {
  const intro = host.parentElement!;
  const curtain = intro.querySelector<HTMLElement>(".intro-curtain")!;
  const brand = intro.querySelector<HTMLElement>(".curtain-brand")!;
  const mouth = intro.querySelector<HTMLElement>(".curtain-portal-mouth")!;
  const left = curtain.querySelector<HTMLElement>(".curtain-panel-left")!;
  const right = curtain.querySelector<HTMLElement>(".curtain-panel-right")!;
  gsap.set(curtain, { yPercent: -105, visibility: "visible" });
  gsap.set(brand, { opacity: 0, y: 25, scale: 0.92 });
  gsap.set(mouth, { opacity: 0, scale: 0.7 });
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
    .set(host, { visibility: "hidden" }, INTRO_TIMING.logo - 0.05)
    .call(
      () => {
        host.dataset.stage = "curtain-logo";
      },
      [],
      INTRO_TIMING.logo,
    )
    .to(
      brand,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: "back.out(1.25)",
      },
      INTRO_TIMING.logo,
    )
    .to(
      mouth,
      { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
      INTRO_TIMING.portal,
    )
    .to(
      brand,
      { opacity: 0, duration: 0.35, ease: "power2.in" },
      INTRO_TIMING.logoOut,
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
