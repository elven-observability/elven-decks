"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
for (const file of [
  "bin/decks-skill.js",
  "lib/technical.js",
  "skill/SKILL.md",
  "skill/themes/fonts.css",
  "skill/agents/openai.yaml",
  "skill/templates/technical-report/report.json",
]) {
  if (!fs.statSync(path.join(root, file)).size)
    throw new Error(`Missing package resource: ${file}`);
}
for (const rel of [
  "skill/templates/client-report-deck",
  "skill/templates/workshop-mentorship-deck/html-slides",
  "tests/fixtures",
]) {
  if (!fs.existsSync(path.join(root, rel))) continue;
  for (const file of ["elven-deck.css", "elven-deck-charts.js", "fonts.css"]) {
    if (
      !fs
        .readFileSync(path.join(root, rel, file))
        .equals(fs.readFileSync(path.join(root, "skill/themes", file)))
    )
      throw new Error(`Asset drift: ${rel}/${file}. Run npm run sync:assets`);
  }
}
fs.chmodSync(path.join(root, "bin/decks-skill.js"), 0o755);
fs.chmodSync(path.join(root, "skill/scripts/lint.sh"), 0o755);
const crypto = require("node:crypto");
const fonts = path.join(root, "skill/themes/fonts");
for (const face of JSON.parse(
  fs.readFileSync(path.join(fonts, "embedded-fonts.json")),
)) {
  for (const [file, expected] of [
    [face.source, face.sourceSha256],
    [face.file, face.sha256],
  ]) {
    const actual = crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(fonts, file)))
      .digest("hex");
    if (actual !== expected)
      throw new Error(
        `Font drift: ${file}; run scripts/prepare-fonts.py after sync:assets`,
      );
  }
}
console.error("Package resources and embedded font checksums verified");
