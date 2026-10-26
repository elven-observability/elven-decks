"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const fontDir = path.join(root, "skill/themes/fonts");
fs.mkdirSync(fontDir, { recursive: true });
const faces = [];
for (const [name, family, weights] of [
  ["inter", "Inter", [400, 600, 700, 800, 900]],
  ["ibm-plex-mono", "IBM Plex Mono", [400, 600, 700]],
]) {
  const dir = path.join(root, "node_modules/@fontsource", name);
  for (const weight of weights) {
    const file = `${name}-latin-${weight}-normal.woff2`;
    fs.copyFileSync(path.join(dir, "files", file), path.join(fontDir, file));
    faces.push(
      `@font-face { font-family:"${family}"; font-style:normal; font-weight:${weight}; font-display:block; src:url("fonts/${file}") format("woff2"); }`,
    );
  }
  if (name === "inter")
    for (const weight of [400, 700]) {
      const file = `${name}-latin-${weight}-italic.woff2`;
      fs.copyFileSync(path.join(dir, "files", file), path.join(fontDir, file));
      faces.push(
        `@font-face { font-family:"${family}"; font-style:italic; font-weight:${weight}; font-display:block; src:url("fonts/${file}") format("woff2"); }`,
      );
    }
  fs.copyFileSync(
    path.join(dir, "LICENSE"),
    path.join(fontDir, `${name}-LICENSE.txt`),
  );
}
fs.writeFileSync(
  path.join(root, "skill/themes/fonts.css"),
  faces.join("\n") + "\n",
);
const theme = path.join(root, "skill/themes/elven-deck.css");
let css = fs.readFileSync(theme, "utf8");
if (!css.startsWith('@import url("fonts.css");'))
  fs.writeFileSync(theme, '@import url("fonts.css");\n' + css);
// Keep shipped examples and legacy templates in sync with the canonical theme.
for (const rel of [
  "skill/templates/client-report-deck",
  "skill/templates/workshop-mentorship-deck/html-slides",
  "tests/fixtures",
]) {
  const dest = path.join(root, rel);
  for (const file of ["elven-deck.css", "elven-deck-charts.js", "fonts.css"])
    fs.copyFileSync(
      path.join(root, "skill/themes", file),
      path.join(dest, file),
    );
  fs.cpSync(fontDir, path.join(dest, "fonts"), {
    recursive: true,
    filter: (src) =>
      !src.endsWith(".ttf") && !src.endsWith("embedded-fonts.json"),
  });
}
