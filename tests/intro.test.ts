import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import {
  INTRO_BOOT_SCRIPT,
  INTRO_CRITICAL_CSS,
  INTRO_PLAYBACK_TIMEOUT_MS,
  INTRO_TIMING,
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

test("goal, scatter, gold title and curtain reveal run in order before timeout", () => {
  const timings = Object.values(INTRO_TIMING);
  assert.ok(
    timings.every((time, index) => !index || time > timings[index - 1]),
  );
  assert.ok(INTRO_TIMING.title > INTRO_TIMING.curtainDown + 0.65);
  assert.ok(INTRO_TIMING.end * 1000 < INTRO_PLAYBACK_TIMEOUT_MS);
});
