import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documents } from "../src/lib/content";
const read = (path: string) => readFileSync(path, "utf8");

test("publishing uses runtime server data and media bypasses the local image optimizer", () => {
  assert.match(read("src/lib/cms.ts"), /import "server-only"/);
  assert.match(read("src/lib/cms.ts"), /cache: "no-store"/);
  assert.match(read("src/app/layout.tsx"), /dynamic = "force-dynamic"/);
  assert.match(read("src/app/sitemap.ts"), /dynamic = "force-dynamic"/);
  assert.match(
    read("src/components/experience.tsx"),
    /unoptimized=\{m.src.startsWith\("\/media\/"\)\}/,
  );
  assert.match(
    read("src/components/experience.tsx"),
    /const \{ events \} = useContent\(\)/,
  );
  assert.match(
    read("src/components/shell.tsx"),
    /const \{ site \} = useContent\(\)/,
  );
});

test("policy routes exclude refunds, blog is linked, and stage buttons align from the top", () => {
  assert.deepEqual(
    documents.map((doc) => doc.slug),
    ["rules", "privacy", "terms"],
  );
  assert.ok(
    documents
      .filter((doc) => ["privacy", "terms"].includes(doc.slug))
      .every((doc) => doc.body.length > 1500),
  );
  assert.match(read("src/components/shell.tsx"), /href="\/blog"/);
  assert.doesNotMatch(read("src/components/shell.tsx"), /Refund Policy/);
  const css = read("src/app/globals.css");
  assert.match(
    css,
    /\.journey-stages button \{\s*display: flex;\s*flex-direction: column;\s*align-items: flex-start;\s*justify-content: flex-start;/,
  );
  assert.match(css, /\.race \.race-photo \{/);
  assert.match(read("src/app/page.tsx"), /discipline-photo race-photo/);
});

test("intro only plays when the first-document gate is pending and does not manipulate history", () => {
  const intro = read("src/components/intro.tsx");
  assert.match(intro, /document.documentElement.dataset.intro !== "pending"/);
  assert.doesNotMatch(
    intro,
    /history\.(pushState|replaceState|go|back)|router\.(push|replace)/,
  );
});
