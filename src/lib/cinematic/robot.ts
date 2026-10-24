import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function createRobot() {
  const root = new T.Group();
  const parts: { mesh: T.Group; target: T.Vector3; rotation: T.Euler }[] = [];
  const wheels: T.Group[] = [];
  const metal = new T.MeshStandardMaterial({
    color: 0xaab7c1,
    metalness: 0.94,
    roughness: 0.24,
  });
  const dark = new T.MeshStandardMaterial({
    color: 0x111822,
    metalness: 0.55,
    roughness: 0.42,
  });
  const orange = new T.MeshPhysicalMaterial({
    color: 0xff570b,
    metalness: 0.45,
    roughness: 0.27,
    clearcoat: 1,
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
    color: 0xc89d46,
    metalness: 0.9,
    roughness: 0.3,
  });
  const led = new T.MeshStandardMaterial({
    color: 0x55eaff,
    emissive: 0x12cfee,
    emissiveIntensity: 3,
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
  const chassis = part("Machined aluminium chassis", 0, 0.46, 0);
  box(chassis, 2.15, 0.09, 1.37, metal);
  for (const z of [-0.64, 0.64]) {
    box(chassis, 2.05, 0.18, 0.055, dark, 0, 0.09, z);
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
  const shell = part("Orange race deck", 0, 0.72, 0);
  box(shell, 1.92, 0.075, 1.19, orange);
  for (const x of [-0.82, 0.82])
    for (const z of [-0.49, 0.49]) screw(shell, x, 0.05, z);
  for (let i = 0; i < 7; i++)
    box(shell, 0.3, 0.008, 0.022, dark, 0.55, 0.044, -0.3 + i * 0.1);
  for (const z of [-0.61, 0.61])
    box(shell, 1.35, 0.025, 0.015, led, 0, -0.01, z);
  for (const x of [-0.72, 0.72])
    for (const z of [-0.87, 0.87]) {
      const wheel = part("All-terrain tyre and alloy hub", x, 0.37, z);
      wheels.push(wheel);
      mesh(wheel, new T.TorusGeometry(0.267, 0.096, 12, 32), rubber);
      const hub = mesh(
        wheel,
        new T.CylinderGeometry(0.205, 0.205, 0.16, 32),
        metal,
      );
      hub.rotation.x = Math.PI / 2;
      const inset = mesh(
        wheel,
        new T.CylinderGeometry(0.158, 0.158, 0.172, 24),
        dark,
      );
      inset.rotation.x = Math.PI / 2;
      for (let j = 0; j < 8; j++) {
        const a = (j * Math.PI) / 4;
        const spoke = box(wheel, 0.04, 0.29, 0.18, metal);
        spoke.rotation.z = a;
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
          0.063,
          0.027,
          0.17,
          rubber,
          Math.sin(a) * 0.354,
          Math.cos(a) * 0.354,
          0,
        );
        tread.rotation.z = -a;
        tread.rotation.y = 0.2;
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
  const board = part("Arduino-style microcontroller", -0.24, 0.82, 0.1);
  box(board, 0.66, 0.035, 0.45, pcb);
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
  const battery = part("Battery pack", 0.55, 0.91, 0.08);
  box(battery, 0.48, 0.28, 0.48, dark);
  for (const x of [-0.13, 0.13]) box(battery, 0.055, 0.29, 0.49, rubber, x);
  box(battery, 0.23, 0.006, 0.23, orange, 0, 0.145, 0);
  const driver = part("MOSFET motor driver", -0.43, 0.84, -0.38);
  box(driver, 0.55, 0.025, 0.25, pcb);
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
  const sensor = part("Ultrasonic sensor assembly", -0.78, 1.01, 0);
  box(sensor, 0.08, 0.2, 0.59, pcb);
  for (const z of [-0.18, 0.18]) {
    const tube = mesh(
      sensor,
      new T.CylinderGeometry(0.094, 0.094, 0.12, 24),
      metal,
      -0.08,
      0,
      z,
    );
    tube.rotation.z = Math.PI / 2;
    const hole = mesh(
      sensor,
      new T.CylinderGeometry(0.073, 0.073, 0.125, 24),
      dark,
      -0.085,
      0,
      z,
    );
    hole.rotation.z = Math.PI / 2;
  }
  for (let i = 0; i < 5; i++) {
    const wire = part("Insulated cable", 0, 0, 0);
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(-0.4, 0.87, -0.23 + i * 0.075),
      new T.Vector3(-0.1, 1.12, -0.23 + i * 0.075),
      new T.Vector3(0.35, 1.06, -0.23 + i * 0.075),
    ]);
    mesh(
      wire,
      new T.TubeGeometry(curve, 16, 0.013, 6, false),
      new T.MeshStandardMaterial({
        color: [0xe93b20, 0x171a20, 0xf4c23c, 0x23bce5, 0xe8e9e5][i],
        roughness: 0.6,
      }),
    );
  }
  const kicker = part("Soccer kicker module", -0.88, 0.35, 0);
  for (const z of [-0.47, 0.47])
    box(kicker, 0.55, 0.07, 0.08, metal, -0.22, 0, z);
  box(kicker, 0.1, 0.21, 1.12, orange, -0.5, 0, 0);
  const roller = mesh(
    kicker,
    new T.CylinderGeometry(0.075, 0.075, 0.95, 24),
    rubber,
    -0.58,
    -0.025,
    0,
  );
  roller.rotation.x = Math.PI / 2;
  kicker.scale.setScalar(0.01);
  return { root, parts, wheels, kicker };
}
