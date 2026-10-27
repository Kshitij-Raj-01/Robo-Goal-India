import * as T from "three";
import { gsap } from "gsap";
import { INTRO_LOGO_BALL, INTRO_TIMING } from "../intro-config";

/** Carry the actual scored mesh above the fabric; never spawn a replacement ball. */
export function createScoredBallFlight(
  host: HTMLDivElement,
  world: T.Scene,
  camera: T.PerspectiveCamera,
  ball: T.Group,
  timeline: gsap.core.Timeline,
) {
  const layer =
    host.parentElement!.querySelector<HTMLElement>(".intro-ball-flight")!;
  const logo = host.parentElement!.querySelector<HTMLElement>(
    ".curtain-logo-stage",
  )!;
  const overlay = new T.Scene();
  const flightCamera = new T.PerspectiveCamera().copy(camera, false);
  overlay.add(flightCamera);
  world.children.forEach((object) => {
    if (object instanceof T.Light) overlay.add(object.clone());
  });
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  layer.appendChild(renderer.domElement);
  // Prewarm just the two shared ball meshes, not a second stadium or robot.
  const warmup = ball.clone(true);
  overlay.add(warmup);
  const ready = renderer.compileAsync(overlay, flightCamera).then(() => {
    overlay.remove(warmup);
  });
  let active = false;
  const flight = { progress: 0 };
  const start = new T.Vector3();
  let startScale = 1;
  timeline.call(
    () => {
      camera.updateMatrixWorld(true);
      flightCamera.copy(camera, false);
      flightCamera.updateMatrixWorld(true);
      // attach() preserves the world-space pose, so there is no jump or duplicate.
      flightCamera.attach(ball);
      start.copy(ball.position);
      startScale = ball.scale.x;
      active = true;
      host.dataset.ballContinuity = "scored-mesh";
      host.dataset.stage = "ball-to-logo";
    },
    [],
    INTRO_TIMING.ballFlight,
  );
  timeline.to(
    flight,
    {
      progress: 1,
      duration: INTRO_TIMING.football - INTRO_TIMING.ballFlight,
      ease: "sine.inOut",
    },
    INTRO_TIMING.ballFlight,
  );
  timeline.to(
    ball.rotation,
    { x: -20, z: 0, duration: 2.6, ease: "sine.out" },
    INTRO_TIMING.ballFlight,
  );
  timeline.to(
    renderer.domElement,
    { opacity: 0, duration: 0.25 },
    INTRO_TIMING.assembled - 0.25,
  );
  timeline.call(
    () => {
      active = false;
    },
    [],
    INTRO_TIMING.assembled,
  );

  function render() {
    if (!active) return;
    const bounds = logo.getBoundingClientRect();
    const viewport = layer.getBoundingClientRect();
    // The fabric moves; use its settled center, not its animated y offset.
    const x = bounds.left + bounds.width * INTRO_LOGO_BALL.x - viewport.left;
    const y = viewport.height / 2 + bounds.height * (INTRO_LOGO_BALL.y - 0.5);
    const depth = 3;
    const halfHeight =
      Math.tan(T.MathUtils.degToRad(flightCamera.getEffectiveFOV()) / 2) *
      depth;
    const target = new T.Vector3(
      ((x / viewport.width) * 2 - 1) * halfHeight * flightCamera.aspect,
      (1 - (y / viewport.height) * 2) * halfHeight,
      -depth,
    );
    ball.position.lerpVectors(start, target, flight.progress);
    ball.position.y += Math.sin(flight.progress * Math.PI) * halfHeight * 0.45;
    const targetScale =
      (((bounds.width * INTRO_LOGO_BALL.radiusX) / viewport.height) *
        2 *
        halfHeight) /
      0.37;
    ball.scale.setScalar(
      T.MathUtils.lerp(startScale, targetScale, flight.progress),
    );
    renderer.render(overlay, flightCamera);
  }
  function resize() {
    flightCamera.aspect = host.clientWidth / host.clientHeight;
    flightCamera.zoom = Math.min(1, Math.max(0.5, flightCamera.aspect / 1.35));
    flightCamera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
  return {
    ready,
    render,
    resize,
    dispose() {
      // Return shared geometry to the owning scene for its usual disposal pass.
      world.attach(ball);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
