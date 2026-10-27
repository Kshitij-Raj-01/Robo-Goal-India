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

function boot(
  pathname = "/",
  reducedMotion = false,
  seen = false,
  back = false,
) {
  const dataset: Record<string, string> = {};
  const timers: (() => void)[] = [];
  runInNewContext(INTRO_BOOT_SCRIPT, {
    document: { documentElement: { dataset } },
    location: { pathname },
    matchMedia: () => ({ matches: reducedMotion }),
    sessionStorage: { getItem: () => (seen ? "1" : null), setItem: () => {} },
    performance: {
      getEntriesByType: () => [{ type: back ? "back_forward" : "navigate" }],
    },
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
  for (const result of [
    boot("/contact"),
    boot("/", true),
    boot("/", false, true),
    boot("/", false, false, true),
  ]) {
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

test("the slower sequence leaves time for full-screen hardware and a readable logo", () => {
  const timings = Object.values(INTRO_TIMING);
  assert.ok(
    timings.every((time, index) => !index || time > timings[index - 1]),
  );
  assert.ok(INTRO_TIMING.curtainDown - INTRO_TIMING.parts >= 2.8);
  assert.ok(INTRO_TIMING.football >= INTRO_TIMING.curtainDown + 1);
  assert.ok(INTRO_TIMING.assembled >= INTRO_TIMING.logo + 1 + 8 * 0.04);
  assert.ok(INTRO_TIMING.scatter - INTRO_TIMING.assembled >= 0.7);
  assert.ok(INTRO_TIMING.end >= 12 && INTRO_TIMING.end < 14);
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

test("hardware is prewarmed and the original scored ball travels into the wordmark", () => {
  const scene = readFileSync("src/lib/intro-scene.ts", "utf8");
  assert.doesNotMatch(
    scene,
    /createLogoPortal|EffectComposer|PMREMGenerator|renderer\.compile\(/,
  );
  assert.match(scene, /renderer\.compileAsync/);
  assert.match(scene, /createComponentCloud\(\s*scene/);
  assert.match(scene, /timeline\.eventCallback\("onUpdate", render\)/);
  assert.match(scene, /timeline\.time\(\) < INTRO_TIMING\.curtainDown \+ 1/);
  const intro = readFileSync("src/components/intro.tsx", "utf8");
  assert.doesNotMatch(intro, /images\/components|curtain-portal|botEmerge/);
  assert.doesNotMatch(intro, /intro-poster/);
  assert.doesNotMatch(intro, /intro-lead-in-ball|intro-standby/);
  assert.doesNotMatch(
    readFileSync("src/app/globals.css", "utf8"),
    /intro-football-roll/,
  );
  assert.match(scene, /host\.dataset\.stage = "run-up"/);
  const cloud = readFileSync("src/lib/cinematic/component-cloud.ts", "utf8");
  assert.match(cloud, /robot\.root\.visible = false/);
  assert.match(cloud, /cloud\.visible = true/);
  assert.match(cloud, /part\.mesh\.localToWorld\(center\.clone\(\)\)/);
  assert.match(intro, /intro-ball-flight/);
  assert.doesNotMatch(intro, /className="curtain-football"/);
  const flight = readFileSync("src/lib/cinematic/scored-ball.ts", "utf8");
  assert.match(flight, /flightCamera\.attach\(ball\)/);
  assert.match(flight, /flightCamera\.copy\(camera, false\)/);
  assert.doesNotMatch(flight, /createFootball/);
  assert.match(flight, /INTRO_LOGO_BALL\.radiusX/);
});

test("festive curtains use a bounded transform-only gold sweep with logo contrast", () => {
  const styles = readFileSync("src/app/globals.css", "utf8");
  assert.match(styles, /#040d25/);
  assert.match(styles, /#55d9ffcc/);
  assert.match(styles, /border-bottom: 8px solid #ffc65a/);
  assert.match(styles, /curtain-gold-sweep 5s ease-in-out both paused/);
  assert.match(styles, /\.curtain-lit \.curtain-panel::before/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /#02091dba/);
});
