import { gsap } from "gsap";
import { INTRO_LOGO_PIECES, INTRO_TIMING } from "../intro-config";

/** Football lands in GOAL; logo assembles and disperses before the page reveal. */
export function addCurtainReveal(
  host: HTMLDivElement,
  timeline: gsap.core.Timeline,
) {
  const intro = host.parentElement!;
  const curtain = intro.querySelector<HTMLElement>(".intro-curtain")!;
  const brand = intro.querySelector<HTMLElement>(".curtain-brand")!;
  const left = curtain.querySelector<HTMLElement>(".curtain-panel-left")!;
  const right = curtain.querySelector<HTMLElement>(".curtain-panel-right")!;
  const pieces = [
    ...intro.querySelectorAll<HTMLElement>(".curtain-logo-piece"),
  ];
  gsap.set(curtain, { yPercent: -104, visibility: "visible" });
  gsap.set(brand, { opacity: 1 });
  pieces.forEach((element, index) => {
    const piece = INTRO_LOGO_PIECES[index];
    gsap.set(element, {
      opacity: 0,
      x: () => host.clientWidth * piece.x,
      y: () => host.clientHeight * piece.y,
      rotation: piece.rotate,
      scale: piece.id === "goal-o" ? 1 : 0.8,
      force3D: true,
    });
    timeline.to(
      element,
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: piece.id === "goal-o" ? 0.25 : 1,
        ease: "power3.out",
      },
      piece.id === "goal-o"
        ? INTRO_TIMING.assembled - 0.25
        : INTRO_TIMING.logo + index * 0.04,
    );
    const direction = index < 5 ? -1 : 1;
    timeline.to(
      element,
      {
        opacity: 0,
        x: () => direction * host.clientWidth * (0.23 + index * 0.025),
        y: () =>
          (index % 2 ? 1 : -1) *
          host.clientHeight *
          (0.22 + (index % 3) * 0.06),
        rotation: direction * (18 + index * 4),
        scale: 0.75,
        duration: 1,
        ease: "power2.in",
      },
      INTRO_TIMING.scatter + index * 0.012,
    );
  });
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
      { yPercent: 0, duration: 1, ease: "power3.inOut" },
      INTRO_TIMING.curtainDown,
    )
    .set(host, { visibility: "hidden" }, INTRO_TIMING.curtainDown + 1)
    .call(
      () => {
        curtain.classList.add("curtain-lit");
      },
      [],
      INTRO_TIMING.curtainDown + 1,
    )
    .call(
      () => {
        host.dataset.stage = "football-o";
      },
      [],
      INTRO_TIMING.football,
    )
    .call(
      () => {
        host.dataset.stage = "logo-assembling";
      },
      [],
      INTRO_TIMING.logo,
    )
    .call(
      () => {
        host.dataset.stage = "logo-assembled";
      },
      [],
      INTRO_TIMING.assembled,
    )
    .call(
      () => {
        host.dataset.stage = "logo-scatter";
      },
      [],
      INTRO_TIMING.scatter,
    )
    .call(
      () => {
        // Release the page only once the curtain completely covers the 3D scene.
        host.dataset.stage = "reveal";
        intro.classList.add("intro-revealing");
        document.documentElement.dataset.intro = "revealing";
      },
      [],
      INTRO_TIMING.curtainOpen - 0.02,
    )
    .to(
      left,
      { xPercent: -104, duration: 1.2, ease: "power3.inOut" },
      INTRO_TIMING.curtainOpen,
    )
    .to(
      right,
      { xPercent: 104, duration: 1.2, ease: "power3.inOut" },
      INTRO_TIMING.curtainOpen,
    );
}
