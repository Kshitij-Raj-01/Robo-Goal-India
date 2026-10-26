import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import * as T from "three";
import { createCrowd } from "../src/lib/cinematic/crowd";
import { createScatterAccessories } from "../src/lib/cinematic/scatter-accessories";

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
