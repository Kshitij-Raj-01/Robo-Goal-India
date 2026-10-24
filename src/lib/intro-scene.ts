import * as T from "three";
import { gsap } from "gsap";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createAtmosphere } from "./cinematic/atmosphere";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createRobot } from "./cinematic/robot";
import { createFootball } from "./cinematic/football";

export function startScene(
  host: HTMLDivElement,
  onPhase?: (phase: string) => void,
  onComplete?: () => void,
) {
  const scene = new T.Scene();
  scene.background = new T.Color(0x030910);
  scene.fog = new T.FogExp2(0x06101b, 0.045);
  const camera = new T.PerspectiveCamera(
    42,
    host.clientWidth / host.clientHeight,
    0.05,
    80,
  );
  // A ground-level tracking shot opens into an overhead engineering orbit.
  const cameraTarget = new T.Vector3(2.6, 0.48, 0);
  camera.position.set(-3.8, 0.85, 5.2);
  camera.lookAt(cameraTarget);
  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);
  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.38;
  room.dispose();
  pmrem.dispose();
  scene.add(new T.HemisphereLight(0x8eadd1, 0x07170f, 0.6));
  const key = new T.SpotLight(0xffecd9, 0, 35, Math.PI / 5, 0.65, 1.2);
  key.position.set(-3, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new T.PointLight(0x25baff, 0, 25, 1.5);
  rim.position.set(3, 4, -3);
  scene.add(rim);
  const warm = new T.PointLight(0xff510a, 0, 20, 1.5);
  warm.position.set(-4, 2, -2);
  scene.add(warm);
  const turf = document.createElement("canvas");
  turf.width = turf.height = 256;
  const ctx = turf.getContext("2d")!;
  ctx.fillStyle = "#103328";
  ctx.fillRect(0, 0, 256, 256);
  let seed = 17;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 6500; i++) {
    ctx.strokeStyle = `rgba(${30 + random() * 40},${55 + random() * 55},${25 + random() * 30},.6)`;
    const x = random() * 256,
      y = random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + random() * 2, y + 2 + random() * 4);
    ctx.stroke();
  }
  const texture = new T.CanvasTexture(turf);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(18, 18);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const floor = new T.Mesh(
    new T.PlaneGeometry(50, 50),
    new T.MeshStandardMaterial({
      map: texture,
      roughness: 1,
      bumpMap: texture,
      bumpScale: 0.015,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.012;
  floor.receiveShadow = true;
  scene.add(floor);
  const lineMaterial = new T.MeshStandardMaterial({
    color: 0xb2c8c3,
    roughness: 1,
  });
  const ring = new T.Mesh(new T.RingGeometry(2.95, 2.99, 96), lineMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.003;
  scene.add(ring);
  function bar(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: T.Material,
  ) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    scene.add(m);
    return m;
  }
  bar(0.035, 0.008, 19, 0, 0, 0, lineMaterial);
  for (const x of [-11, 11]) bar(0.04, 0.008, 19, x, 0, 0, lineMaterial);
  for (const z of [-9.5, 9.5]) bar(22, 0.008, 0.04, 0, 0, z, lineMaterial);
  const tier = new T.MeshStandardMaterial({
    color: 0x101a29,
    roughness: 0.8,
    metalness: 0.3,
  });
  for (let i = 0; i < 5; i++) {
    bar(32, 0.5, 0.9, 0, 0.3 + i * 0.55, -11 - i * 0.8, tier);
    bar(0.9, 0.5, 32, 12 + i * 0.8, 0.3 + i * 0.55, 0, tier);
  }
  for (const color of [0xff6726, 0x41d6ff]) {
    const side = color === 0xff6726 ? -1 : 1;
    const glow = new T.MeshBasicMaterial({ color });
    bar(0.05, 0.06, 24, side * 10, 0.65, 0, glow);
    for (let j = 0; j < 7; j++) {
      bar(0.58, 0.12, 0.12, side * 9, 5, -8 + j * 2.5, glow);
    }
  }
  // Goal frame and a lightweight real geometric net behind the robot.
  const frameMat = new T.MeshStandardMaterial({
    color: 0xb8c5d2,
    metalness: 0.75,
    roughness: 0.3,
  });
  for (const x of [-2.6, 2.6]) bar(0.065, 2.1, 0.065, x, 1.05, -8, frameMat);
  bar(5.25, 0.065, 0.065, 0, 2.1, -8, frameMat);
  const net: number[] = [];
  for (let x = -2.6; x <= 2.6; x += 0.2) net.push(x, 0, -8.7, x, 2.1, -8.7);
  for (let y = 0; y <= 2.1; y += 0.2) net.push(-2.6, y, -8.7, 2.6, y, -8.7);
  const netGeometry = new T.BufferGeometry();
  netGeometry.setAttribute("position", new T.Float32BufferAttribute(net, 3));
  scene.add(
    new T.LineSegments(
      netGeometry,
      new T.LineBasicMaterial({
        color: 0x6e8593,
        transparent: true,
        opacity: 0.35,
      }),
    ),
  );
  const atmosphere = createAtmosphere(scene);
  // Bloom is reserved for stronger devices; direct rendering remains the fallback.
  let composer: EffectComposer | undefined;
  let bloom: UnrealBloomPass | undefined;
  let output: OutputPass | undefined;
  let renderPass: RenderPass | undefined;
  if (navigator.hardwareConcurrency >= 8) {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderPass = new RenderPass(scene, camera);
    bloom = new UnrealBloomPass(
      new T.Vector2(host.clientWidth, host.clientHeight),
      0.24,
      0.45,
      1.25,
    );
    output = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloom);
    composer.addPass(output);
  }
  const { root: robot, parts, wheels, kicker } = createRobot();
  scene.add(robot);
  const ball = createFootball();
  ball.position.set(-2, 0.37, 0.1);
  ball.visible = false;
  scene.add(ball);
  robot.position.x = 9;
  const timeline = gsap.timeline({ onComplete });
  const kick = { progress: 0 };
  const kickStart = ball.position.clone();
  const kickEnd = new T.Vector3(-4.75, 1.62, 4.35);
  timeline
    .call(() => onPhase?.("01 / ENTER THE ARENA"), [], 0)
    .to(key, { intensity: 150, duration: 0.28 }, 0.08)
    .to(rim, { intensity: 120, duration: 0.35 }, 0.2)
    .to(warm, { intensity: 65, duration: 0.35 }, 0.32)
    .to(robot.position, { x: 0, duration: 0.86, ease: "power3.out" }, 0.22)
    .to(
      cameraTarget,
      { x: 0, y: 0.7, duration: 0.85, ease: "power2.out" },
      0.22,
    )
    .to(
      camera.position,
      { x: -4.3, y: 1.15, z: 4.6, duration: 0.85, ease: "sine.inOut" },
      0.22,
    )
    .to(
      robot.rotation,
      { z: -0.065, duration: 0.13, yoyo: true, repeat: 1 },
      0.88,
    );
  wheels.forEach((w) =>
    timeline.to(
      w.rotation,
      { z: -Math.PI * 8, duration: 0.86, ease: "power3.out" },
      0.22,
    ),
  );
  timeline
    .call(() => onPhase?.("02 / EVERY COMPONENT. ONE PURPOSE."), [], 1.18)
    .to(
      camera.position,
      { x: -3.1, y: 3.6, z: 6.1, duration: 1.3, ease: "sine.inOut" },
      1.12,
    )
    .to(cameraTarget, { y: 1.45, duration: 0.7, ease: "sine.inOut" }, 1.2);
  parts.forEach((p, i) => {
    const angle = i * 2.399;
    const start = 1.2 + i * 0.005;
    const apex = new T.Vector3(
      Math.cos(angle) * (1.65 + (i % 3) * 0.22),
      1.3 + (i % 5) * 0.32,
      Math.sin(angle) * 1.5,
    );
    // Heavy assemblies travel less; cables remain grouped rather than exploding into fragments.
    const heavy = /chassis|deck|Battery/.test(p.mesh.name);
    if (heavy) {
      apex.x *= 0.55;
      apex.z *= 0.55;
      apex.y *= 0.8;
    }
    timeline
      .to(
        p.mesh.position,
        { x: apex.x, z: apex.z, duration: 0.68, ease: "power2.out" },
        start,
      )
      .to(
        p.mesh.position,
        { y: apex.y, duration: 0.5, ease: "power2.out" },
        start,
      )
      .to(
        p.mesh.position,
        { y: apex.y - 0.23, duration: 0.5, ease: "power2.in" },
        start + 0.5,
      )
      .to(
        p.mesh.rotation,
        {
          x: heavy ? 0.15 : 0.4 + (i % 3) * 0.4,
          y: heavy ? -0.15 : angle * 0.12,
          z: p.rotation.z + (heavy ? 0.06 : 0.5),
          duration: 0.8,
          ease: "power2.out",
        },
        start,
      )
      .to(
        p.mesh.position,
        {
          x: p.target.x,
          y: p.target.y,
          z: p.target.z,
          duration: 0.62,
          ease: "power3.inOut",
        },
        2.48 + i * 0.009,
      )
      .to(
        p.mesh.rotation,
        {
          x: p.rotation.x,
          y: p.rotation.y,
          z: p.rotation.z,
          duration: 0.62,
          ease: "power3.inOut",
        },
        2.48 + i * 0.009,
      );
  });
  timeline
    .to(
      camera.position,
      { x: -4.8, y: 1.65, z: 4.4, duration: 1.05, ease: "sine.inOut" },
      2.65,
    )
    .to(
      cameraTarget,
      { x: -0.55, y: 0.57, z: 0, duration: 0.9, ease: "sine.inOut" },
      2.75,
    )
    .call(() => onPhase?.("03 / BUILT TO COMPETE"), [], 3.35)
    .to(
      kicker.scale,
      { x: 1, y: 1, z: 1, duration: 0.25, ease: "power2.out" },
      3.27,
    )
    .call(
      () => {
        ball.visible = true;
      },
      [],
      3.4,
    )
    .fromTo(
      ball.position,
      { x: -2.55 },
      { x: -2, duration: 0.4, ease: "power2.out" },
      3.4,
    )
    .to(ball.rotation, { z: -1.5, duration: 0.4, ease: "power2.out" }, 3.4)
    .to(robot.position, { x: -0.38, duration: 0.36, ease: "power2.in" }, 3.68)
    .to(kicker.position, { x: -0.74, duration: 0.16, ease: "power2.in" }, 3.78)
    .to(kicker.position, { x: -1.2, duration: 0.09, ease: "power3.in" }, 4.04)
    .to(robot.position, { x: -0.29, duration: 0.18, ease: "power2.out" }, 4.13)
    .to(
      robot.rotation,
      { z: 0.035, duration: 0.08, yoyo: true, repeat: 1 },
      4.13,
    )
    .call(() => onPhase?.("04 / THE FUTURE IS IN PLAY"), [], 4.15)
    .to(
      kick,
      {
        progress: 1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          // Constant forward velocity with a shallow ballistic arc, not an artificial scale-up.
          ball.position.lerpVectors(kickStart, kickEnd, kick.progress);
          ball.position.y += Math.sin(kick.progress * Math.PI) * 0.42;
        },
      },
      4.15,
    )
    .to(ball.rotation, { z: -8, x: 4, duration: 1, ease: "none" }, 4.15)
    .to(host, { opacity: 0, duration: 0.18 }, 5.06);
  // Prewarm shaders before the first visible motion frame.
  renderer.compile(scene, camera);
  let frame = 0;
  const render = () => {
    frame = requestAnimationFrame(render);
    if (!document.hidden) {
      camera.lookAt(cameraTarget);
      atmosphere.update(timeline.time());
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }
  };
  render();
  const resize = () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
    composer?.setSize(host.clientWidth, host.clientHeight);
  };
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(frame);
    timeline.kill();
    atmosphere.dispose();
    bloom?.dispose();
    output?.dispose();
    renderPass?.dispose();
    composer?.dispose();
    window.removeEventListener("resize", resize);
    scene.traverse((o) => {
      if (o instanceof T.Mesh || o instanceof T.LineSegments) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          m.dispose(),
        );
      }
    });
    texture.dispose();
    env.dispose();
    key.shadow.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    host.style.opacity = "1";
  };
}
