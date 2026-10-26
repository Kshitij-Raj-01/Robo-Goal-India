import * as T from "three";

/** A stadium celebration starts only after the ball crosses the goal line. */
export function createGoalCelebration(scene: T.Scene, goalTime: number) {
  const count = 180;
  const material = new T.MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.2,
    side: T.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const confetti = new T.InstancedMesh(
    new T.PlaneGeometry(0.09, 0.19),
    material,
    count,
  );
  confetti.frustumCulled = false;
  confetti.instanceMatrix.setUsage(T.DynamicDrawUsage);
  const dummy = new T.Object3D();
  for (let i = 0; i < count; i++) {
    confetti.setColorAt(
      i,
      new T.Color([0xff792f, 0x63d8f4, 0xffd475, 0xffffff][i % 4]),
    );
  }
  scene.add(confetti);

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 190px Arial";
  ctx.fillStyle = "#ffd786";
  ctx.fillText("GOAL!", 512, 130);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const sign = new T.Sprite(
    new T.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  sign.position.set(0, 3.2, -8);
  sign.scale.set(5, 1.25, 1);
  scene.add(sign);
  const light = new T.PointLight(0xffa03b, 0, 14, 2);
  light.position.set(0, 2.3, -6.6);
  scene.add(light);

  return {
    update(time: number) {
      const age = time - goalTime;
      confetti.visible = sign.visible = age >= 0;
      if (age < 0) return;
      const fade =
        Math.min(1, age * 7) * Math.max(0, 1 - Math.max(0, age - 0.7) / 1.8);
      material.opacity = fade;
      sign.material.opacity = fade;
      light.intensity = 18 * Math.min(1, age * 6) * Math.exp(-age * 1.1);
      for (let i = 0; i < count; i++) {
        const angle = i * 2.39996;
        const speed = 1.3 + (i % 11) * 0.24;
        const side = i % 2 ? -1 : 1;
        dummy.position.set(
          side * 2.6 + Math.cos(angle) * speed * age,
          0.3 + (3.8 + (i % 7) * 0.34) * age - 2.1 * age * age,
          -7.5 + Math.sin(angle) * speed * age,
        );
        dummy.rotation.set(
          age * (2 + (i % 4)),
          angle + age * 2,
          angle + age * 3,
        );
        dummy.updateMatrix();
        confetti.setMatrixAt(i, dummy.matrix);
      }
      confetti.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      scene.remove(confetti, sign, light);
      confetti.geometry.dispose();
      material.dispose();
      sign.material.dispose();
      texture.dispose();
    },
  };
}
