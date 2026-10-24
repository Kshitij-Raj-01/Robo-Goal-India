import * as T from "three";

/** Quiet atmosphere around the action; bounded particle counts and no network assets. */
export function createAtmosphere(scene: T.Scene) {
  const group = new T.Group();
  scene.add(group);
  const uniforms = { time: { value: 0 }, strength: { value: 0 } };
  const dustGeometry = new T.BufferGeometry();
  const positions: number[] = [];
  for (let i = 0; i < 160; i++) {
    positions.push(
      Math.sin(i * 7.13) * 7,
      0.12 + (((i * 37) % 100) / 100) * 3.6,
      Math.cos(i * 3.71) * 6,
    );
  }
  dustGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(positions, 3),
  );
  const dustMaterial = new T.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    vertexShader: `uniform float time; varying float fade;
      void main(){ vec3 p=position; p.x+=sin(time*.3+p.z)*.15; p.y+=sin(time*.4+p.x)*.09;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(13./-mv.z,1.,3.); fade=.15+.2*sin(p.x*9.); }`,
    fragmentShader: `uniform float strength; varying float fade;
      void main(){ float a=1.-smoothstep(.1,.5,length(gl_PointCoord-.5));
      gl_FragColor=vec4(.69,.84,1.,a*fade*strength); }`,
  });
  group.add(new T.Points(dustGeometry, dustMaterial));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(180,204,225,0.2)");
  gradient.addColorStop(0.4, "rgba(130,158,180,0.1)");
  gradient.addColorStop(1, "rgba(90,120,150,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new T.CanvasTexture(canvas);
  const smoke: T.Sprite[] = [];
  for (let i = 0; i < 9; i++) {
    const sprite = new T.Sprite(
      new T.SpriteMaterial({
        map: texture,
        color: i % 2 ? 0x2db8ef : 0xe69a65,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    sprite.position.set((i - 4) * 1.7, 0.32, -2.8 - (i % 3));
    sprite.scale.set(4.5, 1.4, 1);
    group.add(sprite);
    smoke.push(sprite);
  }
  // Light columns use smooth radial falloff, fading before reaching the turf.
  const beamGeometry = new T.ConeGeometry(1.7, 6, 32, 1, true);
  const beams: T.Mesh[] = [];
  for (const side of [-1, 1]) {
    const material = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      uniforms: {
        strength: uniforms.strength,
        tint: { value: new T.Color(side < 0 ? 0xff9a63 : 0x6bd9ff) },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform vec3 tint; uniform float strength;
      void main(){float a=pow(vUv.y,2.)*.022*strength;gl_FragColor=vec4(tint,a);}`,
    });
    const beam = new T.Mesh(beamGeometry, material);
    beam.position.set(side * 4.6, 3, -3);
    beam.rotation.z = side * 0.28;
    group.add(beam);
    beams.push(beam);
  }
  return {
    update(time: number) {
      uniforms.time.value = time;
      uniforms.strength.value = Math.min(1, time * 2);
      smoke.forEach((s, i) => {
        s.position.x = (i - 4) * 1.7 + Math.sin(time * 0.2 + i) * 0.35;
        s.material.opacity = Math.min(0.4, time * 0.18);
      });
    },
    dispose() {
      dustGeometry.dispose();
      dustMaterial.dispose();
      texture.dispose();
      smoke.forEach((s) => s.material.dispose());
      beamGeometry.dispose();
      beams.forEach((b) => (b.material as T.Material).dispose());
      scene.remove(group);
    },
  };
}
