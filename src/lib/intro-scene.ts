import * as T from "three";
import { gsap } from "gsap";
import { createRobot } from "./cinematic/robot";
import { createFootball } from "./cinematic/football";
import { createGoalCelebration } from "./cinematic/celebration";
import { addCurtainReveal } from "./cinematic/curtain";
import { INTRO_TIMING } from "./intro-config";
import { createCrowd } from "./cinematic/crowd";
import { createComponentCloud } from "./cinematic/component-cloud";
import { createScoredBallFlight } from "./cinematic/scored-ball";

export function startScene(
  host: HTMLDivElement,
  onComplete?: () => void,
  onReady?: () => void,
) {
  const preparationStarted = performance.now();
  let disposed = false;
  const scene = new T.Scene();
  scene.background = new T.Color(0x030910);
  scene.fog = new T.FogExp2(0x06101b, 0.045);
  const camera = new T.PerspectiveCamera(
    42,
    host.clientWidth / host.clientHeight,
    0.05,
    80,
  );
  // The shot opens behind the striker, with the goal and ball in the same frame.
  const cameraTarget = new T.Vector3(0, 0.65, -2.6);
  const portrait = camera.aspect < 0.8;
  camera.position.set(portrait ? 1.2 : 5.4, 3.3, portrait ? 10 : 8);
  camera.zoom = Math.min(1, Math.max(0.5, camera.aspect / 1.35));
  camera.updateProjectionMatrix();
  camera.lookAt(cameraTarget);
  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  host.appendChild(renderer.domElement);
  // Direct stadium rendering: no reflection bake, bloom or shadow maps.
  scene.add(new T.HemisphereLight(0xc5dcf1, 0x193023, 2.1));
  const key = new T.DirectionalLight(0xffecd9, 3);
  key.position.set(-3, 7, 4);
  scene.add(key);
  const rim = new T.DirectionalLight(0x49b7df, 1.2);
  rim.position.set(3, 4, -3);
  scene.add(rim);
  const warm = new T.DirectionalLight(0xff8f4c, 0.8);
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
  // Full goal frame and a net that flexes as the ball scores.
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
        opacity: 0.65,
      }),
    ),
  );
  const robotData = createRobot({ assembledOnly: true });
  const { root: robot, wheels, kicker } = robotData;
  robot.rotation.y = -Math.PI / 2;
  robot.position.set(0, 0, 3.35);
  scene.add(robot);
  const ball = createFootball();
  ball.scale.setScalar(1.15);
  ball.position.set(0, 0.43, 0.5);
  scene.add(ball);
  const goalTime = INTRO_TIMING.goal;
  const crowd = createCrowd(scene, goalTime);
  const celebration = createGoalCelebration(scene, goalTime);
  const netRest = new Float32Array(netGeometry.attributes.position.array);
  const timeline = gsap.timeline({ paused: true, onComplete });
  const shot = { progress: 0 };
  const shotStart = ball.position.clone();
  const shotEnd = new T.Vector3(0.65, 0.62, -8.4);
  host.dataset.stage = "run-up";
  timeline
    .to(robot.position, { z: 2.55, duration: 0.8, ease: "power2.out" }, 0)
    .to(robot.position, { z: 2.28, duration: 1.9, ease: "none" }, 0.8)
    .to(
      camera.position,
      {
        x: portrait ? 0.9 : 4.3,
        y: 2.8,
        z: portrait ? 8.5 : 6.2,
        duration: 2.4,
        ease: "sine.inOut",
      },
      0,
    )
    .to(
      cameraTarget,
      { x: 0.1, y: 0.8, z: -3.4, duration: 2.4, ease: "sine.inOut" },
      0,
    )
    .to(kicker.position, { x: -0.7, duration: 0.2, ease: "power2.in" }, 0.6)
    .to(kicker.position, { x: -1.16, duration: 0.2, ease: "power3.in" }, 0.8)
    .call(
      () => {
        host.dataset.stage = "shot";
      },
      [],
      1,
    )
    .to(kicker.position, { x: -0.88, duration: 0.35, ease: "power2.out" }, 1.05)
    .to(
      shot,
      {
        progress: 1,
        duration: goalTime - 1,
        ease: "none",
        onUpdate: () => {
          ball.position.lerpVectors(shotStart, shotEnd, shot.progress);
          ball.position.y += Math.sin(shot.progress * Math.PI) * 0.8;
        },
      },
      1,
    )
    .to(ball.rotation, { x: -15, z: 1.3, duration: 1, ease: "none" }, 1)
    .call(
      () => {
        host.dataset.stage = "goal";
      },
      [],
      goalTime,
    )
    .to(
      ball.position,
      { z: -7.85, y: 0.43, x: 0.72, duration: 0.45, ease: "power2.out" },
      goalTime,
    )
    .to(
      ball.rotation,
      { x: -16.2, duration: 0.45, ease: "power2.out" },
      goalTime,
    )
    .call(
      () => {
        host.dataset.stage = "celebration";
      },
      [],
      goalTime + 0.05,
    );
  wheels.forEach((wheel) => {
    timeline.to(
      wheel.rotation,
      { z: Math.PI * 3.2, duration: 2.7, ease: "power1.out" },
      0,
    );
  });
  const components = createComponentCloud(
    scene,
    camera,
    robotData,
    timeline,
    INTRO_TIMING.parts,
  );
  timeline.call(
    () => {
      host.dataset.stage = "parts-scatter";
    },
    [],
    INTRO_TIMING.parts,
  );
  const scoredBall = createScoredBallFlight(
    host,
    scene,
    camera,
    ball,
    timeline,
  );
  addCurtainReveal(host, timeline);
  timeline.call(
    () => {
      host.dataset.stage = "complete";
    },
    [],
    INTRO_TIMING.end,
  );
  // Without an environment map, retain diffuse metal detail rather than black reflections.
  scene.traverse((object) => {
    if (!(object instanceof T.Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      if (material instanceof T.MeshStandardMaterial)
        material.metalness = Math.min(material.metalness, 0.25);
    }
  });
  let lastCrowdUpdate = -1;
  const render = () => {
    if (disposed || document.hidden) return;
    scoredBall.render();
    // Stop the stadium behind closed fabric; only the two-mesh ball stays live.
    if (
      !disposed &&
      !document.hidden &&
      timeline.time() < INTRO_TIMING.curtainDown + 1
    ) {
      camera.lookAt(cameraTarget);
      celebration.update(timeline.time());
      if (timeline.time() - lastCrowdUpdate >= 1 / 30) {
        crowd.update(timeline.time());
        lastCrowdUpdate = timeline.time();
      }
      const age = timeline.time() - goalTime;
      if (age >= 0 && age < 1.3) {
        const positions = netGeometry.attributes.position;
        for (let index = 0; index < positions.count; index++) {
          const x = netRest[index * 3];
          const y = netRest[index * 3 + 1];
          const distance = Math.hypot(x - shotEnd.x, y - shotEnd.y);
          const wave = Math.sin(age * 15 - distance * 2) * Math.exp(-age * 3.5);
          positions.setZ(
            index,
            netRest[index * 3 + 2] -
              Math.max(0, 1 - distance / 2.5) * 0.35 * wave,
          );
        }
        positions.needsUpdate = true;
      }
      renderer.render(scene, camera);
    }
  };
  // One animation clock, not competing GSAP and requestAnimationFrame loops.
  timeline.eventCallback("onUpdate", render);
  crowd.update(0);
  host.dataset.sceneSetupMs = String(
    Math.round(performance.now() - preparationStarted),
  );
  // Compile the otherwise-hidden cloud too, after its local artwork loads.
  Promise.all([components.ready, scoredBall.ready])
    .then(() => {
      if (disposed) return;
      components.cloud.visible = true;
      return renderer.compileAsync(scene, camera).finally(() => {
        components.cloud.visible = false;
      });
    })
    .then(() => {
      if (disposed) return;
      render();
      host.dataset.sceneReadyMs = String(
        Math.round(performance.now() - preparationStarted),
      );
      onReady?.();
      timeline.play(0);
    })
    .catch(() => {
      if (!disposed) onComplete?.();
    });
  const onVisibilityChange = () => {
    if (document.hidden) timeline.pause();
    else if (host.parentElement?.classList.contains("intro-ready"))
      timeline.resume();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  const resize = () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.zoom = Math.min(1, Math.max(0.5, camera.aspect / 1.35));
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
    scoredBall.resize();
  };
  window.addEventListener("resize", resize);
  return () => {
    disposed = true;
    timeline.kill();
    scoredBall.dispose();
    celebration.dispose();
    crowd.dispose();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", resize);
    const geometries = new Set<T.BufferGeometry>();
    const materials = new Set<T.Material>();
    const maps = new Set<T.Texture>();
    scene.traverse((object) => {
      if (object instanceof T.Mesh || object instanceof T.LineSegments) {
        geometries.add(object.geometry);
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((material) => {
          materials.add(material);
          if ("map" in material && material.map instanceof T.Texture)
            maps.add(material.map);
        });
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    maps.forEach((map) => map.dispose());
    texture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    host.style.opacity = "1";
  };
}
