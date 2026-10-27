import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Truncated icosahedron: twelve pentagons and twenty hexagons, projected onto a sphere.
export function createFootball() {
  const root = new T.Group();
  const ico = new T.IcosahedronGeometry(1, 0);
  const pos = ico.getAttribute("position");
  const vertices: T.Vector3[] = [];
  const faces: number[][] = [];
  for (let i = 0; i < pos.count; i += 3) {
    const face: number[] = [];
    for (let j = 0; j < 3; j++) {
      const v = new T.Vector3().fromBufferAttribute(pos, i + j).normalize();
      let n = vertices.findIndex((p) => p.distanceTo(v) < 0.001);
      if (n < 0) {
        n = vertices.length;
        vertices.push(v);
      }
      face.push(n);
    }
    faces.push(face);
  }
  ico.dispose();
  const white = new T.MeshStandardMaterial({
    side: T.DoubleSide,
    color: 0xf1eee7,
    roughness: 0.72,
  });
  const black = new T.MeshStandardMaterial({
    side: T.DoubleSide,
    color: 0x10151c,
    roughness: 0.68,
  });
  const edge = (a: number, b: number) =>
    vertices[a].clone().multiplyScalar(2).add(vertices[b]).normalize();
  function panel(points: T.Vector3[], material: T.Material) {
    const center = points
      .reduce((a, b) => a.add(b), new T.Vector3())
      .normalize();
    const p = points.map((v) => v.clone().lerp(center, 0.018).normalize());
    const data: number[] = [];
    function triangle(a: T.Vector3, b: T.Vector3, c: T.Vector3, depth: number) {
      if (depth) {
        const ab = a.clone().add(b).normalize(),
          bc = b.clone().add(c).normalize(),
          ca = c.clone().add(a).normalize();
        triangle(a, ab, ca, depth - 1);
        triangle(ab, b, bc, depth - 1);
        triangle(ca, bc, c, depth - 1);
        triangle(ab, bc, ca, depth - 1);
      } else {
        for (const v of [a, b, c])
          data.push(v.x * 0.37, v.y * 0.37, v.z * 0.37);
      }
    }
    for (let i = 0; i < p.length; i++)
      triangle(center, p[i], p[(i + 1) % p.length], 2);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(data, 3));
    g.computeVertexNormals();
    // Winding differs between the pentagon and hexagon construction.
    const mesh = new T.Mesh(g, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
  }
  for (const [a, b, c] of faces)
    panel(
      [edge(a, b), edge(b, a), edge(b, c), edge(c, b), edge(c, a), edge(a, c)],
      white,
    );
  vertices.forEach((v, i) => {
    const neighbors = new Set<number>();
    faces
      .filter((f) => f.includes(i))
      .forEach((f) =>
        f.forEach((n) => {
          if (n !== i) neighbors.add(n);
        }),
      );
    const points = [...neighbors].map((n) => edge(i, n));
    const u = points[0]
      .clone()
      .sub(v.clone().multiplyScalar(points[0].dot(v)))
      .normalize();
    const w = new T.Vector3().crossVectors(v, u);
    points.sort(
      (a, b) => Math.atan2(a.dot(w), a.dot(u)) - Math.atan2(b.dot(w), b.dot(u)),
    );
    panel(points, black);
  });
  const core = new T.Mesh(new T.SphereGeometry(0.368, 32, 24), black);
  core.geometry.deleteAttribute("uv");
  root.add(core);
  // The 32 stitched panels retain their geometry but need only two draw calls.
  const panels = [...root.children] as T.Mesh[];
  root.clear();
  for (const material of [white, black]) {
    const geometries = panels
      .filter((panel) => panel.material === material)
      .map((panel) =>
        panel.geometry.index ? panel.geometry.toNonIndexed() : panel.geometry,
      );
    const merged = mergeGeometries(geometries);
    geometries.forEach((geometry) => geometry.dispose());
    if (merged) root.add(new T.Mesh(merged, material));
  }
  panels.forEach((panel) => panel.geometry.dispose());
  return root;
}
