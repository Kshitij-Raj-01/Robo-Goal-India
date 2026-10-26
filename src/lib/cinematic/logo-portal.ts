import * as T from "three";
import type { gsap } from "gsap";
import { INTRO_LOGO_PORTAL, INTRO_TIMING } from "../intro-config";
import type { createRobot } from "./robot";

/** Reuse the existing WebGL canvas above the curtain, with a transparent 3D scene. */
export function createLogoPortal(
  host: HTMLDivElement,
  renderer: T.WebGLRenderer,
  robot: ReturnType<typeof createRobot>,
  timeline: gsap.core.Timeline,
) {
  const layer = host.parentElement!.querySelector<HTMLElement>(
    ".curtain-portal-canvas",
  )!;
  const logo = host.parentElement!.querySelector<HTMLElement>(".curtain-logo")!;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(
    42,
    host.clientWidth / host.clientHeight,
    0.05,
    40,
  );
  camera.position.set(0, 0, 8);
  const bot = robot.root.clone(true);
  bot.position.set(0, -0.45, 0);
  bot.rotation.set(0.4, 1.95, 0);
  bot.visible = true;
  const carrier = new T.Group();
  carrier.add(bot);
  scene.add(carrier);
  scene.add(new T.HemisphereLight(0xffffff, 0x7e5741, 3));
  const key = new T.DirectionalLight(0xfff1df, 3);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xffa04b, 2);
  rim.position.set(4, 1, -2);
  scene.add(rim);
  const progress = { value: 0 };
  const origin = new T.Vector3();
  let active = false;
  let startScale = 0.05;
  let endScale = 1;
  const resize = () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    const bounds = logo.getBoundingClientRect();
    const px = bounds.left + bounds.width * INTRO_LOGO_PORTAL.x;
    const py = bounds.top + bounds.height * INTRO_LOGO_PORTAL.y;
    const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * 8;
    const halfWidth = halfHeight * camera.aspect;
    origin.set(
      ((px / host.clientWidth) * 2 - 1) * halfWidth,
      (1 - (py / host.clientHeight) * 2) * halfHeight,
      0,
    );
    startScale =
      (((bounds.width * INTRO_LOGO_PORTAL.radius * 1.7) / host.clientHeight) *
        halfHeight *
        2) /
      2.8;
    endScale = Math.min(halfWidth * 1.1, halfHeight * 0.9) / 2.8;
    layer.style.setProperty("--portal-x", `${px}px`);
    layer.style.setProperty("--portal-y", `${py}px`);
    layer.style.setProperty(
      "--portal-radius",
      `${bounds.width * INTRO_LOGO_PORTAL.radius}px`,
    );
  };
  timeline.call(
    () => {
      resize();
      active = true;
      host.dataset.stage = "bot-through-logo";
      layer.appendChild(renderer.domElement);
      renderer.setClearColor(0x000000, 0);
    },
    [],
    INTRO_TIMING.botEmerge,
  );
  timeline.to(
    progress,
    { value: 1, duration: 1.5, ease: "power2.inOut" },
    INTRO_TIMING.botEmerge,
  );
  timeline.to(
    layer,
    { opacity: 0, duration: 0.4, ease: "power2.in" },
    INTRO_TIMING.end - 0.4,
  );
  return {
    scene,
    prepare() {
      renderer.compile(scene, camera);
    },
    get active() {
      return active;
    },
    resize,
    render() {
      const p = progress.value;
      carrier.position.set(
        T.MathUtils.lerp(origin.x, 0, p),
        T.MathUtils.lerp(origin.y, -0.28, p),
        p * 1.6,
      );
      carrier.scale.setScalar(T.MathUtils.lerp(startScale, endScale, p));
      carrier.rotation.set(0, -p * 0.42, Math.sin(p * Math.PI) * -0.08);
      const expansion = Math.min(1, p * 2.5);
      layer.style.clipPath =
        expansion < 1
          ? `circle(calc(var(--portal-radius) + ${expansion * 100}vmax) at var(--portal-x) var(--portal-y))`
          : "none";
      bot.children
        .filter((child) => /tyre/.test(child.name))
        .forEach((wheel) => {
          wheel.rotation.z = -p * 8;
        });
      renderer.render(scene, camera);
    },
  };
}
