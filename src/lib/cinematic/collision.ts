import * as T from "three";

/** Brief, warm contact sparks and a low dust ring, all generated locally. */
export function createCollision(scene: T.Scene, origin: T.Vector3) {
  const count = 96;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities: T.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * 2.39996;
    const speed = 1.4 + (i % 9) * 0.38;
    velocities.push(
      new T.Vector3(
        Math.cos(angle) * speed,
        1.2 + (i % 7) * 0.35,
        Math.sin(angle) * speed,
      ),
    );
    const color = new T.Color(i % 3 ? 0xffa057 : 0xffdcb5);
    color.toArray(colors, i * 3);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
  const material = new T.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const sparks = new T.Points(geometry, material);
  sparks.frustumCulled = false;
  scene.add(sparks);
  const ringMaterial = new T.MeshBasicMaterial({
    color: 0xc7b99d,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ring = new T.Mesh(new T.RingGeometry(0.86, 1, 64), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(origin.x, 0.025, origin.z);
  scene.add(ring);
  return {
    update(time: number) {
      const age = time - 0.84;
      sparks.visible = ring.visible = age >= 0 && age < 1.2;
      if (age < 0) return;
      for (let i = 0; i < count; i++) {
        const velocity = velocities[i];
        positions[i * 3] = origin.x + velocity.x * age;
        positions[i * 3 + 1] = Math.max(
          0.025,
          origin.y + velocity.y * age - 5.5 * age * age,
        );
        positions[i * 3 + 2] = origin.z + velocity.z * age;
      }
      geometry.attributes.position.needsUpdate = true;
      material.opacity = Math.max(0, 0.8 - age * 1.5);
      ring.scale.setScalar(0.2 + age * 4.5);
      ringMaterial.opacity = Math.max(0, 0.12 - age * 0.16);
    },
    dispose() {
      scene.remove(sparks, ring);
      geometry.dispose();
      material.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
    },
  };
}
