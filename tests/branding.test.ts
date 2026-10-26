import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import sharp from "sharp";

test("dark-theme wordmarks have genuine transparent backgrounds", async () => {
  for (const name of ["robo-goal-india-logo-dark", "robotic-sir-logo-dark"]) {
    const asset = sharp(`public/images/${name}.webp`);
    const metadata = await asset.metadata();
    assert.equal(metadata.hasAlpha, true, name);
    const { data, info } = await asset
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.channels, 4);
    assert.equal(data[3], 0, `${name}: top-left background is transparent`);
    const stats = await sharp(`public/images/${name}.webp`).stats();
    assert.equal(stats.channels[3].min, 0);
    assert.equal(stats.channels[3].max, 255);
  }
});

test("hero is a local CGI illustration with bounded, reduced-motion-safe movement", async () => {
  const hero = await sharp("public/images/robo-goal-hero-cgi.webp").metadata();
  assert.ok(hero.width! >= 1600);
  const page = readFileSync("src/app/page.tsx", "utf8");
  assert.match(page, /robo-goal-hero-cgi\.webp/);
  assert.match(page, /className="hero-artwork"/);
  assert.match(
    page,
    /CGI illustration inspired by Robo Goal India event photos/,
  );
  const styles = readFileSync("src/app/globals.css", "utf8");
  assert.match(styles, /animation: hero-camera-drift 5s ease-out both/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
