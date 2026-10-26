import * as T from "three";

/** Instanced spectators: waving, clapping and jumping, with a bigger goal reaction. */
export function createCrowd(scene: T.Scene, goalTime: number) {
  const group = new T.Group();
  group.name = "Animated stadium audience";
  scene.add(group);
  const spectators: {
    x: number;
    y: number;
    z: number;
    facing: number;
    height: number;
  }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 29; column++) {
      spectators.push({
        x: -10 + column * 0.7,
        y: 0.58 + row * 0.55,
        z: -11 - row * 0.8,
        facing: 0,
        height: 0.88 + ((column * 7 + row * 3) % 9) * 0.026,
      });
    }
    for (let column = 0; column < 21; column++) {
      spectators.push({
        x: 12 + row * 0.8,
        y: 0.58 + row * 0.55,
        z: -9 + column * 0.75,
        facing: -Math.PI / 2,
        height: 0.9 + ((column * 3 + row) % 7) * 0.028,
      });
    }
  }
  const count = spectators.length;
  const fabric = new T.MeshStandardMaterial({
    roughness: 1,
    emissive: 0x302b27,
    emissiveIntensity: 0.18,
  });
  const skin = new T.MeshStandardMaterial({ roughness: 0.95 });
  const trousers = new T.MeshStandardMaterial({
    color: 0x202a3a,
    roughness: 1,
  });
  const torsos = new T.InstancedMesh(
    new T.BoxGeometry(0.25, 0.35, 0.16),
    fabric,
    count,
  );
  const heads = new T.InstancedMesh(
    new T.SphereGeometry(0.088, 8, 6),
    skin,
    count,
  );
  const arms = new T.InstancedMesh(
    new T.CapsuleGeometry(0.035, 0.24, 2, 6),
    fabric,
    count * 2,
  );
  const legs = new T.InstancedMesh(
    new T.CapsuleGeometry(0.043, 0.23, 2, 6),
    trousers,
    count * 2,
  );
  const flags = new T.InstancedMesh(
    new T.PlaneGeometry(0.36, 0.22),
    new T.MeshStandardMaterial({ side: T.DoubleSide, roughness: 1 }),
    Math.ceil(count / 13),
  );
  const meshes = [torsos, heads, arms, legs, flags];
  meshes.forEach((mesh) => {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    group.add(mesh);
  });
  const palette = [0xf18537, 0xd9e2de, 0x2c788c, 0x3b526b, 0xb84d31, 0xe2b968];
  const complexions = [0x9d694c, 0xb77f57, 0x774b35, 0xc99674, 0x5f3c2a];
  spectators.forEach((_, index) => {
    const color = new T.Color(palette[(index * 7) % palette.length]);
    torsos.setColorAt(index, color);
    arms.setColorAt(index * 2, color);
    arms.setColorAt(index * 2 + 1, color);
    heads.setColorAt(
      index,
      new T.Color(complexions[index % complexions.length]),
    );
  });
  for (let index = 0; index < flags.count; index++)
    flags.setColorAt(index, new T.Color(index % 2 ? 0xffe5cb : 0xf88337));
  const wash = new T.PointLight(0xffe7cf, 55, 35, 1.6);
  wash.position.set(0, 5, -9.5);
  group.add(wash);
  const dummy = new T.Object3D();
  const facing = new T.Quaternion();
  const origin = new T.Vector3();
  const from = new T.Vector3();
  const to = new T.Vector3();
  const direction = new T.Vector3();
  const up = new T.Vector3(0, 1, 0);
  const place = (
    mesh: T.InstancedMesh,
    index: number,
    x: number,
    y: number,
    z: number,
    scale: number,
  ) => {
    dummy.position.set(x, y, z).applyQuaternion(facing).add(origin);
    dummy.quaternion.copy(facing);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  };
  return {
    spectatorCount: count,
    update(time: number) {
      const reaction =
        time < goalTime ? 0.22 : Math.min(1, (time - goalTime) * 5);
      let flagIndex = 0;
      spectators.forEach((spectator, index) => {
        const phase = index * 1.47;
        const bounce =
          Math.max(0, Math.sin(time * 7 + phase)) * 0.105 * reaction;
        origin.set(spectator.x, spectator.y + bounce, spectator.z);
        facing.setFromAxisAngle(up, spectator.facing);
        const height = spectator.height;
        place(torsos, index, 0, 0.45 * height, 0, height);
        place(heads, index, 0, 0.73 * height, 0, height);
        for (const side of [-1, 1]) {
          const limbIndex = index * 2 + (side === -1 ? 0 : 1);
          place(
            legs,
            limbIndex,
            side * 0.072 * height,
            0.15 * height,
            0,
            height,
          );
          const clap = index % 3 === 0;
          from.set(side * 0.16, 0.57, 0);
          to.set(
            clap
              ? side * (0.04 + Math.abs(Math.sin(time * 8 + phase)) * 0.14)
              : side * (0.24 + Math.sin(time * 5 + phase) * 0.06),
            clap
              ? 0.74
              : 0.69 + reaction * 0.23 + Math.sin(time * 6 + phase) * 0.04,
            clap ? 0.13 : 0,
          );
          direction.subVectors(to, from);
          const armLength = direction.length();
          dummy.position
            .copy(from)
            .add(to)
            .multiplyScalar(0.5 * height)
            .applyQuaternion(facing)
            .add(origin);
          dummy.quaternion
            .setFromUnitVectors(up, direction.normalize())
            .premultiply(facing);
          dummy.scale.set(height, (armLength * height) / 0.31, height);
          dummy.updateMatrix();
          arms.setMatrixAt(limbIndex, dummy.matrix);
        }
        if (index % 13 === 0) {
          place(
            flags,
            flagIndex++,
            0.36,
            0.98 + Math.sin(time * 7 + phase) * 0.05,
            0.04,
            height,
          );
        }
      });
      meshes.forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
      });
    },
    dispose() {
      scene.remove(group);
      meshes.forEach((mesh) => mesh.geometry.dispose());
      fabric.dispose();
      skin.dispose();
      trousers.dispose();
      (flags.material as T.Material).dispose();
    },
  };
}
