import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import * as T from "three";
import { createCrowd } from "../src/lib/cinematic/crowd";
import { createScatterAccessories } from "../src/lib/cinematic/scatter-accessories";
import { createFootball } from "../src/lib/cinematic/football";
import { createRobot } from "../src/lib/cinematic/robot";

test("assembled-shot robot keeps its bounds and moving parts with a smaller geometry budget", () => {
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          fillRect() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          stroke() {},
          fillText() {},
        }),
      }),
    },
  });
  const roots: T.Group[] = [];
  try {
    const detailed = createRobot();
    const assembled = createRobot({ assembledOnly: true });
    roots.push(detailed.root, assembled.root);
    assert.equal(assembled.wheels.length, 4);
    assert.ok(assembled.root.getObjectByName("Assembled robot body"));
    assert.ok(assembled.root.children.includes(assembled.kicker));
    const detailedBounds = new T.Box3().setFromObject(detailed.root);
    const assembledBounds = new T.Box3().setFromObject(assembled.root);
    assert.ok(detailedBounds.min.distanceTo(assembledBounds.min) < 0.02);
    assert.ok(detailedBounds.max.distanceTo(assembledBounds.max) < 0.02);
    const countVertices = (root: T.Group) => {
      let count = 0;
      root.traverse((object) => {
        if (object instanceof T.Mesh)
          count += object.geometry.attributes.position.count;
      });
      return count;
    };
    assert.ok(
      countVertices(assembled.root) < countVertices(detailed.root) * 0.5,
    );
  } finally {
    if (previousDocument)
      Object.defineProperty(globalThis, "document", previousDocument);
    else Reflect.deleteProperty(globalThis, "document");
    const materials = new Set<T.Material>();
    const maps = new Set<T.Texture>();
    roots.forEach((root) =>
      root.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        object.geometry.dispose();
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          if ("map" in material && material.map instanceof T.Texture)
            maps.add(material.map);
        }
      }),
    );
    maps.forEach((map) => map.dispose());
    materials.forEach((material) => material.dispose());
  }
});

test("the detailed stitched football is batched into two meshes", () => {
  const football = createFootball();
  assert.equal(football.children.length, 2);
  football.children.forEach((object) => {
    const mesh = object as T.Mesh<T.BufferGeometry, T.Material>;
    assert.ok(mesh.geometry.attributes.position.count > 100);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
});

test("animated crowd uses bounded instancing and reacts to the goal", () => {
  const scene = new T.Scene();
  const crowd = createCrowd(scene, 1.65);
  assert.equal(crowd.spectatorCount, 250);
  const audience = scene.getObjectByName("Animated stadium audience")!;
  const meshes = audience.children.filter(
    (child) => child instanceof T.InstancedMesh,
  );
  assert.equal(meshes.length, 5);
  crowd.update(0);
  const before = [...(meshes[2] as T.InstancedMesh).instanceMatrix.array];
  crowd.update(2.1);
  assert.notDeepEqual(
    [...(meshes[2] as T.InstancedMesh).instanceMatrix.array],
    before,
  );
  crowd.dispose();
  assert.equal(scene.children.length, 0);
});

test("scatter includes additional recognisable robotics hardware", () => {
  const accessories = createScatterAccessories();
  const names = accessories.map((part) => part.mesh.name).join(" ");
  for (const kind of [
    "ESP32",
    "servo",
    "sensor",
    "gear",
    "capacitor",
    "MOSFET",
    "connector",
  ])
    assert.match(names, new RegExp(kind, "i"));
  const geometries = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  accessories.forEach(({ mesh }) =>
    mesh.traverse((object) => {
      if (object instanceof T.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material])
          materials.add(material);
      }
    }),
  );
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
});

test("rendered component assets and supplied logo are bundled locally", () => {
  for (const path of [
    "public/images/robo-goal-india-logo.png",
    ...["esp32", "arduino-uno", "battery-pack", "motor-driver"].map(
      (name) => `public/images/components/${name}.webp`,
    ),
  ]) {
    assert.ok(existsSync(path), path);
    assert.ok(statSync(path).size > 1000, path);
  }
});
