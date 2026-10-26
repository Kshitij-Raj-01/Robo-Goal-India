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
import { createCollision } from "./cinematic/collision";

export function startScene(host: HTMLDivElement, onComplete?: () => void) {
  const scene = new T.Scene();
  scene.background = new T.Color(0x030910);
  scene.fog = new T.FogExp2(0x06101b, 0.045);
  const camera = new T.PerspectiveCamera(
    42,
    host.clientWidth / host.clientHeight,
    0.05,
    80,
  );
  // Track both subjects, then pull back as the collision scatters the hardware.
  const cameraTarget = new T.Vector3(0, 0.55, 0);
  camera.position.set(-3.8, 2.25, 6.4);
  camera.zoom = Math.min(1, Math.max(0.5, camera.aspect / 1.35));
  camera.updateProjectionMatrix();
  camera.lookAt(cameraTarget);
  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  host.appendChild(renderer.domElement);
  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.65;
  room.dispose();
  pmrem.dispose();
  scene.add(new T.HemisphereLight(0x8eadd1, 0x07170f, 0.6));
  const key = new T.SpotLight(0xffecd9, 80, 35, Math.PI / 5, 0.65, 1.2);
  key.position.set(-3, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new T.PointLight(0x25baff, 45, 25, 1.5);
  rim.position.set(3, 4, -3);
  scene.add(rim);
  const warm = new T.PointLight(0xff510a, 25, 20, 1.5);
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
  const { root: robot, parts, wheels } = createRobot();
  scene.add(robot);
  const ball = createFootball();
  ball.scale.setScalar(1.3);
  ball.position.set(-3.3, 0.49, 0);
  scene.add(ball);
  robot.position.x = 3.4;
  const collision = createCollision(scene, new T.Vector3(-1.02, 0.48, 0));
  host.dataset.stage = "approach";
  const timeline = gsap.timeline({ paused: true, onComplete });
  timeline
    .to(robot.position, { x: 0.65, duration: 0.84, ease: "power1.in" }, 0)
    .to(ball.position, { x: -1.22, duration: 0.84, ease: "power1.in" }, 0)
    .to(ball.rotation, { z: -4.3, duration: 0.84, ease: "power1.in" }, 0)
    .to(
      camera.position,
      { x: -3.1, y: 1.6, z: 5.9, duration: 0.84, ease: "sine.inOut" },
      0,
    )
    .call(
      () => {
        host.dataset.stage = "impact";
      },
      [],
      0.84,
    )
    .to(
      ball.position,
      { x: -2.7, y: 1.2, z: 1.1, duration: 0.5, ease: "power2.out" },
      0.84,
    )
    .to(
      ball.position,
      { x: -3.8, y: 0.49, z: 1.8, duration: 0.85, ease: "power2.in" },
      1.34,
    )
    .to(
      ball.rotation,
      { z: -12, x: 2.5, duration: 1.5, ease: "power1.out" },
      0.84,
    )
    .to(
      camera.position,
      { x: -2.65, y: 3.4, z: 7.5, duration: 1.65, ease: "power2.out" },
      0.86,
    )
    .to(
      cameraTarget,
      { x: 0.5, y: 0.55, z: 0, duration: 1.5, ease: "sine.out" },
      0.86,
    )
    .call(
      () => {
        host.dataset.stage = "debris";
      },
      [],
      1.05,
    );

  wheels.forEach((wheel) => {
    timeline.to(
      wheel.rotation,
      { z: Math.PI * 6, duration: 0.84, ease: "power1.in" },
      0,
    );
  });

  // Independent ballistic paths: the impact tears the bot apart; it never reassembles.
  // Mass and contact height give heavy chassis pieces less travel than loose hardware.
  parts.forEach((part, index) => {
    const angle = index * 2.39996;
    const heavy = /chassis|deck|Battery/.test(part.mesh.name);
    const wheel = wheels.includes(part.mesh);
    const speed = heavy ? 1.8 : 3.6 + (index % 5) * 0.65;
    const vx = (0.6 + Math.cos(angle) * 0.85) * speed;
    const vz = Math.sin(angle) * speed;
    const vy = heavy ? 2.1 : 3.4 + (index % 4) * 0.6;
    const floorY = wheel ? 0.37 : /cable/.test(part.mesh.name) ? -0.7 : 0.13;
    const gravity = 11;
    const hitTime =
      (vy +
        Math.sqrt(
          vy * vy + 2 * gravity * Math.max(0, part.target.y - floorY),
        )) /
      gravity;
    const flight = { time: 0 };
    const spin = heavy ? 0.55 : 1.8 + (index % 3);
    timeline.to(
      flight,
      {
        time: 1.95,
        duration: 1.95,
        ease: "none",
        onUpdate: () => {
          const time = flight.time;
          const travel = (1 - Math.exp(-1.1 * time)) / 1.1;
          part.mesh.position.x = part.target.x + vx * travel;
          part.mesh.position.z = part.target.z + vz * travel;
          if (time <= hitTime) {
            part.mesh.position.y =
              part.target.y + vy * time - (gravity * time * time) / 2;
          } else {
            const bounce = time - hitTime;
            part.mesh.position.y =
              floorY +
              Math.max(0, 1.1 * bounce - (gravity * bounce * bounce) / 2);
          }
          const roll = Math.min(time, hitTime + 0.2);
          part.mesh.rotation.set(
            part.rotation.x + Math.cos(angle) * roll * spin,
            part.rotation.y + Math.sin(angle) * roll * spin,
            part.rotation.z + (wheel ? Math.PI * 6 : 0) + roll * spin * 0.6,
          );
        },
      },
      0.84,
    );
  });
  timeline
    .call(
      () => {
        host.dataset.stage = "reveal";
      },
      [],
      2.8,
    )
    .to(
      host.parentElement ?? host,
      { opacity: 0, duration: 0.22, ease: "power2.in" },
      2.8,
    );
  // Prewarm shaders before the first visible motion frame.
  renderer.compile(scene, camera);
  let frame = 0;
  const render = () => {
    frame = requestAnimationFrame(render);
    if (!document.hidden) {
      camera.lookAt(cameraTarget);
      atmosphere.update(timeline.time());
      collision.update(timeline.time());
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }
  };
  render();
  timeline.play(0);
  const resize = () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.zoom = Math.min(1, Math.max(0.5, camera.aspect / 1.35));
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
    composer?.setSize(host.clientWidth, host.clientHeight);
  };
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(frame);
    timeline.kill();
    atmosphere.dispose();
    collision.dispose();
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
