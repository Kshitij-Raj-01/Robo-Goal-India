import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { readFileSync } from "node:fs";
import {
  INTRO_BOOT_SCRIPT,
  INTRO_CRITICAL_CSS,
  INTRO_PLAYBACK_TIMEOUT_MS,
  INTRO_TIMING,
  INTRO_LOGO_BALL,
  INTRO_LOGO_PIECES,
} from "../src/lib/intro-config";

function boot(pathname = "/", reducedMotion = false) {
  const dataset: Record<string, string> = {};
  const timers: (() => void)[] = [];
  runInNewContext(INTRO_BOOT_SCRIPT, {
    document: { documentElement: { dataset } },
    location: { pathname },
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout: (callback: () => void) => timers.push(callback),
  });
  return { dataset, timers };
}

test("homepage is gated synchronously before hydration, with a failure escape", () => {
  const { dataset, timers } = boot();
  assert.equal(dataset.intro, "pending");
  assert.equal(timers.length, 1);
  assert.match(
    INTRO_CRITICAL_CSS,
    /#main>:not\(\.intro\)\{visibility:hidden\}/,
  );
  assert.match(INTRO_CRITICAL_CSS, /z-index:2147483000/);
  timers[0]();
  assert.equal(dataset.intro, undefined);
});

test("other pages and reduced-motion users are not gated", () => {
  for (const result of [boot("/contact"), boot("/", true)]) {
    assert.equal(result.dataset.intro, undefined);
    assert.equal(result.timers.length, 0);
  }
});

test("the head failsafe never interrupts the curtain reveal", () => {
  const { dataset, timers } = boot();
  dataset.intro = "revealing";
  timers[0]();
  assert.equal(dataset.intro, "revealing");
});

test("goal, curtains, football O, logo assembly and scatter run in order without long holds", () => {
  const timings = Object.values(INTRO_TIMING);
  assert.ok(
    timings.every((time, index) => !index || time > timings[index - 1]),
  );
  assert.ok(INTRO_TIMING.football >= INTRO_TIMING.curtainDown + 0.42);
  assert.ok(INTRO_TIMING.logo >= INTRO_TIMING.football + 0.55);
  assert.ok(INTRO_TIMING.assembled >= INTRO_TIMING.logo + 0.52 + 8 * 0.025);
  assert.ok(INTRO_TIMING.scatter - INTRO_TIMING.assembled <= 0.3);
  assert.ok(INTRO_TIMING.end < 5);
  assert.ok(INTRO_TIMING.end * 1000 < INTRO_PLAYBACK_TIMEOUT_MS);
});

test("the football O and contiguous fragments reconstruct the existing logo", () => {
  assert.equal(INTRO_LOGO_BALL.x, 757 / 1440);
  assert.equal(INTRO_LOGO_BALL.y, 140 / 271);
  assert.equal(INTRO_LOGO_PIECES[0].left, 0);
  assert.equal(INTRO_LOGO_PIECES.at(-1)!.right, 100);
  INTRO_LOGO_PIECES.forEach((piece, index) => {
    assert.ok(piece.right > piece.left);
    if (index) assert.equal(piece.left, INTRO_LOGO_PIECES[index - 1].right);
  });
  const footballPiece = INTRO_LOGO_PIECES.find(
    (piece) => piece.id === "goal-o",
  )!;
  assert.ok(
    (INTRO_LOGO_BALL.x - INTRO_LOGO_BALL.radiusX) * 100 > footballPiece.left,
  );
  assert.ok(
    (INTRO_LOGO_BALL.x + INTRO_LOGO_BALL.radiusX) * 100 < footballPiece.right,
  );
});

test("opening avoids the expensive scatter, second renderer scene and synchronous shader setup", () => {
  const scene = readFileSync("src/lib/intro-scene.ts", "utf8");
  assert.doesNotMatch(
    scene,
    /createComponentCloud|createLogoPortal|EffectComposer|PMREMGenerator|renderer\.compile\(/,
  );
  assert.match(scene, /renderer\s*\.compileAsync/);
  assert.match(scene, /timeline\.eventCallback\("onUpdate", render\)/);
  assert.match(
    scene,
    /timeline\.time\(\) < INTRO_TIMING\.curtainDown \+ 0\.42/,
  );
  const intro = readFileSync("src/components/intro.tsx", "utf8");
  assert.doesNotMatch(intro, /images\/components|curtain-portal|botEmerge/);
  assert.doesNotMatch(intro, /intro-poster/);
  assert.match(intro, /intro-lead-in-ball/);
});

test("festive curtains use a bounded transform-only gold sweep with logo contrast", () => {
  const styles = readFileSync("src/app/globals.css", "utf8");
  assert.match(styles, /#ff5634/);
  assert.match(styles, /border-bottom: 8px solid #ffc65a/);
  assert.match(styles, /curtain-gold-sweep 1\.8s ease-in-out both paused/);
  assert.match(styles, /\.curtain-lit \.curtain-panel::before/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /#26051dba/);
});
