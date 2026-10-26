import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function createRobot() {
  const root = new T.Group();
  const parts: { mesh: T.Group; target: T.Vector3; rotation: T.Euler }[] = [];
  const wheels: T.Group[] = [];
  // Workshop-finished sheet metal, based on the organizer's event photographs.
  const surface = document.createElement("canvas");
  surface.width = surface.height = 256;
  const finish = surface.getContext("2d")!;
  finish.fillStyle = "#a9ada8";
  finish.fillRect(0, 0, 256, 256);
  let seed = 29;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 1500; i++) {
    finish.strokeStyle = `rgba(${random() > 0.5 ? "245,247,240" : "35,42,39"},${random() * 0.19})`;
    const x = random() * 256;
    const y = random() * 256;
    finish.beginPath();
    finish.moveTo(x, y);
    finish.lineTo(x + 8 + random() * 45, y + random() * 2);
    finish.stroke();
  }
  const brushed = new T.CanvasTexture(surface);
  brushed.colorSpace = T.SRGBColorSpace;
  brushed.wrapS = brushed.wrapT = T.RepeatWrapping;
  const metal = new T.MeshStandardMaterial({
    color: 0xc6c8bf,
    map: brushed,
    bumpMap: brushed,
    bumpScale: 0.008,
    metalness: 0.8,
    roughness: 0.48,
  });
  const dark = new T.MeshStandardMaterial({
    color: 0x151a17,
    metalness: 0.3,
    roughness: 0.72,
  });
  const tape = new T.MeshStandardMaterial({
    color: 0xa3a8a5,
    map: brushed,
    roughness: 0.8,
    metalness: 0.22,
  });
  const rubber = new T.MeshStandardMaterial({
    color: 0x141516,
    roughness: 0.95,
  });
  const pcb = new T.MeshStandardMaterial({
    color: 0x076b61,
    metalness: 0.25,
    roughness: 0.55,
  });
  const gold = new T.MeshStandardMaterial({
    color: 0x9a8754,
    metalness: 0.8,
    roughness: 0.5,
  });
  const led = new T.MeshStandardMaterial({
    color: 0xc32d20,
    emissive: 0x8c160b,
    emissiveIntensity: 0.35,
  });
  const wheelRubber = new T.MeshStandardMaterial({
    color: 0xd7762c,
    roughness: 0.92,
  });
  const nylon = new T.MeshStandardMaterial({
    color: 0xdbdfc5,
    roughness: 0.75,
  });
  const perforation = new T.MeshStandardMaterial({
    color: 0x4d2e17,
    roughness: 1,
  });
  function mesh(
    parent: T.Object3D,
    g: T.BufferGeometry,
    m: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  const box = (
    p: T.Object3D,
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) =>
    mesh(
      p,
      new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.16),
      m,
      x,
      y,
      z,
    );
  function part(name: string, x: number, y: number, z: number) {
    const g = new T.Group();
    g.name = name;
    g.position.set(x, y, z);
    root.add(g);
    parts.push({
      mesh: g,
      target: g.position.clone(),
      rotation: g.rotation.clone(),
    });
    return g;
  }
  function screw(p: T.Object3D, x: number, y: number, z: number) {
    const s = mesh(
      p,
      new T.CylinderGeometry(0.025, 0.025, 0.025, 6),
      metal,
      x,
      y,
      z,
    );
    box(s, 0.027, 0.005, 0.006, dark, 0, 0.014, 0);
  }
  function silkscreen(
    parent: T.Object3D,
    text: string,
    width: number,
    x: number,
    y: number,
    z: number,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#eef8f2";
    context.font = "bold 66px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 48);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    const label = mesh(
      parent,
      new T.PlaneGeometry(width, (width * 96) / 512),
      new T.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
      x,
      y,
      z,
    );
    label.rotation.x = -Math.PI / 2;
  }
  const chassis = part("Workshop-built sheet metal chassis", 0, 0.46, 0);
  box(chassis, 2.15, 0.07, 1.37, dark);
  for (const z of [-0.64, 0.64]) {
    box(chassis, 2.05, 0.18, 0.055, metal, 0, 0.09, z);
    for (let x = -0.85; x <= 0.9; x += 0.28) screw(chassis, x, 0.19, z);
  }
  for (const x of [-0.85, 0.85])
    for (const z of [-0.48, 0.48])
      mesh(
        chassis,
        new T.CylinderGeometry(0.045, 0.045, 0.19, 12),
        gold,
        x,
        0.12,
        z,
      );
  const shell = part("Open electronics mounting tray", 0.5, 0.65, 0);
  box(shell, 0.92, 0.035, 1.19, dark);
  for (const z of [-0.49, 0.49]) {
    const panel = part("Folded aluminium mounting rail", -0.47, 0.65, z);
    box(panel, 0.97, 0.035, 0.17, metal);
    box(panel, 0.97, 0.1, 0.025, metal, 0, -0.035, Math.sign(z) * 0.07);
    screw(panel, -0.32, 0.025, 0);
  }
  for (const x of [-0.82, 0.82])
    for (const z of [-0.49, 0.49]) {
      const bolt = part("Deck fastening bolt", x, 0.69, z);
      screw(bolt, 0, 0, 0);
    }
  for (const x of [-0.15, 0.15]) {
    const strap = part("Silver battery retaining tape", 0.48 + x, 0.89, 0.04);
    box(strap, 0.12, 0.016, 0.7, tape);
    box(strap, 0.12, 0.23, 0.018, tape, 0, -0.11, -0.34);
    box(strap, 0.12, 0.23, 0.018, tape, 0, -0.11, 0.34);
  }
  for (const x of [-0.72, 0.72])
    for (const z of [-0.87, 0.87]) {
      const wheel = part("Perforated rubber tyre and nylon hub", x, 0.37, z);
      wheels.push(wheel);
      const tyre = mesh(
        wheel,
        new T.CylinderGeometry(0.36, 0.36, 0.23, 48),
        wheelRubber,
      );
      tyre.rotation.x = Math.PI / 2;
      const hub = mesh(
        wheel,
        new T.CylinderGeometry(0.27, 0.27, 0.245, 40),
        nylon,
      );
      hub.rotation.x = Math.PI / 2;
      const inset = mesh(
        wheel,
        new T.CylinderGeometry(0.065, 0.065, 0.26, 24),
        dark,
      );
      inset.rotation.x = Math.PI / 2;
      for (let j = 0; j < 12; j++) {
        const a = (j * Math.PI) / 6;
        for (const side of [-1, 1]) {
          const hole = mesh(
            wheel,
            new T.CylinderGeometry(0.018, 0.018, 0.003, 8),
            dark,
            Math.sin(a) * 0.205,
            Math.cos(a) * 0.205,
            side * 0.124,
          );
          hole.rotation.x = Math.PI / 2;
        }
      }
      const axle = mesh(
        wheel,
        new T.CylinderGeometry(0.055, 0.055, 0.2, 6),
        gold,
      );
      axle.rotation.x = Math.PI / 2;
      for (let j = 0; j < 28; j++) {
        const a = (j * Math.PI) / 14;
        const tread = box(
          wheel,
          0.046,
          0.012,
          0.21,
          wheelRubber,
          Math.sin(a) * 0.354,
          Math.cos(a) * 0.354,
          0,
        );
        tread.rotation.z = -a;
        for (const side of [-1, 1]) {
          const dimple = mesh(
            wheel,
            new T.CylinderGeometry(0.014, 0.014, 0.005, 6),
            perforation,
            Math.sin(a) * 0.318,
            Math.cos(a) * 0.318,
            side * 0.117,
          );
          dimple.rotation.x = Math.PI / 2;
        }
      }
      const motor = part("DC motor and reduction gearbox", x, 0.43, z * 0.58);
      const body = mesh(
        motor,
        new T.CylinderGeometry(0.12, 0.12, 0.3, 24),
        metal,
      );
      body.rotation.x = Math.PI / 2;
      box(motor, 0.22, 0.24, 0.14, gold, 0, 0, Math.sign(z) * 0.16);
      const gear = mesh(
        motor,
        new T.CylinderGeometry(0.1, 0.1, 0.035, 24),
        dark,
        0,
        0,
        Math.sign(z) * 0.25,
      );
      gear.rotation.x = Math.PI / 2;
      for (let j = 0; j < 12; j++) {
        const a = (j * Math.PI) / 6;
        const tooth = box(
          motor,
          0.04,
          0.04,
          0.035,
          metal,
          Math.sin(a) * 0.1,
          Math.cos(a) * 0.1,
          Math.sign(z) * 0.25,
        );
        tooth.rotation.z = -a;
      }
    }
  const board = part("Arduino-style microcontroller", -0.24, 0.69, 0.1);
  box(board, 0.66, 0.035, 0.45, pcb);
  silkscreen(board, "ARDUINO", 0.35, -0.02, 0.024, 0.12);
  box(board, 0.25, 0.035, 0.17, dark, 0, 0.04, 0);
  box(board, 0.12, 0.11, 0.13, metal, 0.3, 0.06, -0.12);
  for (const z of [-0.18, 0.18]) {
    box(board, 0.48, 0.055, 0.045, dark, -0.03, 0.045, z);
    for (let i = 0; i < 12; i++)
      box(board, 0.012, 0.08, 0.012, gold, -0.25 + i * 0.04, 0.06, z);
  }
  for (let i = 0; i < 9; i++) {
    box(board, 0.12, 0.002, 0.007, gold, -0.23 + i * 0.055, 0.02, -0.08);
  }
  const battery = part("Battery pack", 0.55, 0.77, 0.08);
  box(battery, 0.77, 0.2, 0.48, metal);
  box(battery, 0.62, 0.006, 0.35, dark, 0, 0.105, 0);
  silkscreen(battery, "12V LI-ION", 0.48, 0, 0.112, 0);
  const driver = part("MOSFET motor driver", -0.43, 0.71, -0.38);
  box(driver, 0.55, 0.025, 0.25, pcb);
  silkscreen(driver, "MOSFET", 0.22, -0.08, 0.017, 0.105);
  for (let i = 0; i < 5; i++)
    box(driver, 0.035, 0.14, 0.22, metal, -0.08 + i * 0.055, 0.08, 0);
  for (const x of [-0.22, 0.22]) {
    mesh(
      driver,
      new T.CylinderGeometry(0.035, 0.035, 0.11, 12),
      dark,
      x,
      0.07,
      0,
    );
    box(driver, 0.08, 0.055, 0.08, led, x, 0.04, 0.1);
  }
  for (let i = 0; i < 8; i++) {
    const wire = part("Insulated cable", 0, 0, 0);
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(-0.4, 0.74, -0.23 + i * 0.055),
      new T.Vector3(-0.1 + i * 0.035, 0.9 + (i % 3) * 0.025, -0.3 + i * 0.075),
      new T.Vector3(0.65, 0.84, -0.23 + i * 0.055),
    ]);
    mesh(
      wire,
      new T.TubeGeometry(curve, 16, 0.013, 6, false),
      new T.MeshStandardMaterial({
        color: [0x9f2116, 0x171a20, 0xcfa82b, 0x245455, 0xb5b5a7][i % 5],
        roughness: 0.6,
      }),
    );
  }
  const kicker = part("Sheet metal soccer scoop and kicker", -0.88, 0.28, 0);
  for (const z of [-0.47, 0.47])
    box(kicker, 0.9, 0.045, 0.29, metal, -0.33, -0.03, z).rotation.z = 0.35;
  box(kicker, 0.035, 0.23, 1.12, metal, 0.02, 0.06, 0);
  box(kicker, 0.1, 0.13, 0.58, rubber, -0.5, -0.04, 0);
  // Merge the fine hardware per material inside each detachable assembly.
  // The complete bot keeps its detail without hundreds of draw calls per frame.
  root.updateMatrixWorld(true);
  for (const assembly of parts) {
    const inverse = assembly.mesh.matrixWorld.clone().invert();
    const batches = new Map<T.Material, T.BufferGeometry[]>();
    const originals = new Set<T.BufferGeometry>();
    assembly.mesh.traverse((object) => {
      if (!(object instanceof T.Mesh) || Array.isArray(object.material)) return;
      const geometry = object.geometry
        .clone()
        .applyMatrix4(
          new T.Matrix4().multiplyMatrices(inverse, object.matrixWorld),
        );
      const flat = geometry.index ? geometry.toNonIndexed() : geometry;
      if (flat !== geometry) geometry.dispose();
      const batch = batches.get(object.material) || [];
      batch.push(flat);
      batches.set(object.material, batch);
      originals.add(object.geometry);
    });
    assembly.mesh.clear();
    for (const [material, geometries] of batches) {
      const merged = mergeGeometries(geometries);
      geometries.forEach((geometry) => geometry.dispose());
      if (merged) mesh(assembly.mesh, merged, material);
    }
    originals.forEach((geometry) => geometry.dispose());
  }
  return { root, parts, wheels, kicker };
}
