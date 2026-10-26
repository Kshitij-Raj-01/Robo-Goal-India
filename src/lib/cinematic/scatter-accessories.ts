import * as T from "three";

/** Additional robotics hardware beyond the bot's own detachable assemblies. */
export function createScatterAccessories() {
  const metal = new T.MeshStandardMaterial({
    color: 0xa4abb0,
    metalness: 0.85,
    roughness: 0.35,
  });
  const dark = new T.MeshStandardMaterial({ color: 0x20242a, roughness: 0.6 });
  const gold = new T.MeshStandardMaterial({
    color: 0xb99b53,
    metalness: 0.8,
    roughness: 0.4,
  });
  const blue = new T.MeshStandardMaterial({ color: 0x164ba2, roughness: 0.45 });
  const pcb = new T.MeshStandardMaterial({ color: 0x128079, roughness: 0.6 });
  const nylon = new T.MeshStandardMaterial({ color: 0xe1e5d3, roughness: 0.8 });
  const items: T.Group[] = [];
  const item = (name: string) => {
    const group = new T.Group();
    group.name = name;
    items.push(group);
    return group;
  };
  const add = (
    group: T.Group,
    geometry: T.BufferGeometry,
    material: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };
  const esp32 = item("ESP32 development board");
  add(esp32, new T.BoxGeometry(0.7, 0.035, 0.35), dark);
  add(esp32, new T.BoxGeometry(0.3, 0.045, 0.29), metal, 0.12, 0.04);
  const servo = item("Micro servo and nylon horn");
  add(servo, new T.BoxGeometry(0.32, 0.4, 0.25), blue);
  add(servo, new T.CylinderGeometry(0.09, 0.09, 0.08, 16), dark, 0.07, 0.23);
  add(servo, new T.BoxGeometry(0.42, 0.035, 0.08), nylon, 0.07, 0.28);
  const sensor = item("Ultrasonic distance sensor");
  add(sensor, new T.BoxGeometry(0.65, 0.035, 0.25), pcb);
  for (const x of [-0.18, 0.18]) {
    add(sensor, new T.CylinderGeometry(0.105, 0.105, 0.12, 24), metal, x, 0.08);
    add(
      sensor,
      new T.CylinderGeometry(0.075, 0.075, 0.005, 24),
      dark,
      x,
      0.143,
    );
  }
  for (let index = 0; index < 3; index++) {
    const gear = item(index ? "Steel drive gear" : "Nylon reduction gear");
    const material = index ? metal : nylon;
    add(gear, new T.CylinderGeometry(0.19, 0.19, 0.07, 24), material);
    for (let tooth = 0; tooth < 16; tooth++) {
      const angle = (tooth * Math.PI) / 8;
      add(
        gear,
        new T.BoxGeometry(0.06, 0.07, 0.05),
        material,
        Math.sin(angle) * 0.195,
        0,
        Math.cos(angle) * 0.195,
      ).rotation.y = angle;
    }
    add(gear, new T.CylinderGeometry(0.035, 0.035, 0.09, 12), dark);
  }
  for (let index = 0; index < 3; index++) {
    const capacitor = item("Electrolytic capacitor");
    add(capacitor, new T.CylinderGeometry(0.09, 0.09, 0.25, 20), dark);
    add(
      capacitor,
      new T.CylinderGeometry(0.087, 0.087, 0.005, 20),
      metal,
      0,
      0.13,
    );
    for (const x of [-0.035, 0.035])
      add(
        capacitor,
        new T.CylinderGeometry(0.008, 0.008, 0.16, 6),
        metal,
        x,
        -0.19,
      );
  }
  for (let index = 0; index < 3; index++) {
    const mosfet = item("TO-220 MOSFET transistor");
    add(mosfet, new T.BoxGeometry(0.17, 0.21, 0.045), dark);
    add(mosfet, new T.BoxGeometry(0.17, 0.1, 0.025), metal, 0, 0.15);
    for (const x of [-0.055, 0, 0.055])
      add(mosfet, new T.BoxGeometry(0.012, 0.18, 0.012), metal, x, -0.18);
  }
  const connector = item("XT60 battery connector");
  add(
    connector,
    new T.BoxGeometry(0.22, 0.15, 0.19),
    new T.MeshStandardMaterial({ color: 0xeebc2d, roughness: 0.65 }),
  );
  for (const x of [-0.055, 0.055])
    add(
      connector,
      new T.CylinderGeometry(0.03, 0.03, 0.2, 12),
      gold,
      x,
    ).rotation.x = Math.PI / 2;
  return items.map((mesh) => ({
    mesh,
    target: new T.Vector3(),
    rotation: new T.Euler(),
    accessory: true,
  }));
}
