import * as T from "three";
import type { gsap } from "gsap";
import type { createRobot } from "./robot";

/** Camera-space hardware lets the celebration fill both portrait and wide screens. */
export function createComponentCloud(
  scene: T.Scene,
  camera: T.PerspectiveCamera,
  robot: ReturnType<typeof createRobot>,
  timeline: gsap.core.Timeline,
  start: number,
) {
  const cloud = new T.Group();
  cloud.visible = false;
  camera.add(cloud);
  scene.add(camera);
  const fill = new T.PointLight(0xe4f3ff, 8, 18, 2);
  fill.position.set(-2, 3, 1);
  camera.add(fill);
  // The four key components get clear, separate foreground positions.
  const featuredNames = [/microcontroller/, /tyre/, /Battery/, /MOSFET/];
  const featured = featuredNames.map((pattern) =>
    robot.parts.find((part) => pattern.test(part.mesh.name))!,
  );
  const ordered = [
    ...featured,
    ...robot.parts.filter((part) => !featured.includes(part)),
  ];
  const placements = [
    [-0.48, 0.48],
    [0.54, 0.4],
    [-0.5, -0.43],
    [0.5, -0.47],
  ];
  const instances = ordered.map((part, index) => {
    const model = part.mesh.clone(true);
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(model);
    const center = bounds.getCenter(new T.Vector3());
    const size = bounds.getSize(new T.Vector3());
    model.position.sub(center);
    const display = new T.Group();
    display.name = part.mesh.name;
    display.add(model);
    cloud.add(display);
    const hero = index < 4;
    const angle = index * 2.39996;
    const depth = hero ? 3.5 + index * 0.15 : 5.4 + (index % 4) * 0.65;
    const halfHeight =
      Math.tan(T.MathUtils.degToRad(camera.getEffectiveFOV()) / 2) * depth;
    const halfWidth = halfHeight * camera.aspect;
    const [nx, ny] = hero
      ? placements[index]
      : [Math.cos(angle) * (0.75 + (index % 3) * 0.16), Math.sin(angle) * 0.91];
    const target = new T.Vector3(nx * halfWidth, ny * halfHeight, -depth);
    const diameter = Math.max(size.x, size.y, size.z);
    const scale =
      Math.min(
        halfWidth * (hero ? 0.64 : 0.23),
        halfHeight * (hero ? 0.52 : 0.22),
      ) / Math.max(0.08, diameter);
    const rotation = /tyre/.test(part.mesh.name)
      ? { x: 0.15, y: -0.35, z: -0.18 }
      : /microcontroller|MOSFET/.test(part.mesh.name)
        ? { x: 1.12, y: -0.18, z: index === 0 ? -0.22 : 0.25 }
        : { x: 0.6, y: 0.5, z: angle * 0.16 };
    return { part, display, center, target, scale, rotation, hero, index };
  });

  timeline.call(
    () => {
      camera.updateMatrixWorld(true);
      robot.root.updateMatrixWorld(true);
      const inverseRotation = camera
        .getWorldQuaternion(new T.Quaternion())
        .invert();
      instances.forEach(({ part, display, center }) => {
        display.position.copy(
          camera.worldToLocal(part.mesh.localToWorld(center.clone())),
        );
        display.quaternion.copy(
          inverseRotation
            .clone()
            .multiply(part.mesh.getWorldQuaternion(new T.Quaternion())),
        );
      });
      robot.root.visible = false;
      cloud.visible = true;
    },
    [],
    start,
  );
  instances.forEach(({ display, target, scale, rotation, hero, index }) => {
    timeline
      .to(
        display.position,
        {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: 0.95,
          ease: "power3.out",
        },
        start,
      )
      .to(
        display.rotation,
        { ...rotation, duration: 1.05, ease: "power2.out" },
        start,
      )
      .to(
        display.scale,
        { x: scale, y: scale, z: scale, duration: 0.95, ease: "power2.out" },
        start,
      )
      // A slow drift and perspective push gives time to see the close-up hardware.
      .to(
        display.position,
        {
          z: target.z + (hero ? 0.6 : 0.85),
          x: target.x * 1.09,
          y: target.y * 1.08,
          duration: 1.5,
          ease: "sine.inOut",
        },
        start + 0.95,
      )
      .to(
        display.rotation,
        {
          y: rotation.y + (index % 2 ? 0.25 : -0.25),
          z: rotation.z + 0.12,
          duration: 1.5,
          ease: "sine.inOut",
        },
        start + 0.95,
      );
  });
  return { cloud, fill };
}
