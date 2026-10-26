"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
function command(bin, args, cwd) {
  const r = spawnSync(bin, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
  });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || r.error);
  return r.stdout;
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "elven-package-"));
const packed = JSON.parse(
  command("npm", ["pack", "--json", "--pack-destination", temp], root),
)[0];
const tarball = path.join(temp, packed.filename);
fs.writeFileSync(path.join(temp, "package.json"), '{"private":true}');
command("npm", ["install", "--omit=dev", "--ignore-scripts", tarball], temp);
const cli = path.join(
  temp,
  "node_modules/@elven-observability/decks-skill/bin/decks-skill.js",
);
for (const args of [
  ["install", "--project", path.join(temp, "workspace")],
  ["new", "technical-report", path.join(temp, "technical")],
  ["build", path.join(temp, "technical/report.json")],
  ["new", "executive", path.join(temp, "executive")],
  ["check", path.join(temp, "executive/deck.html")],
  ["render", path.join(temp, "executive/deck.html")],
])
  console.log(command(process.execPath, [cli, ...args], temp).trim());
console.log(`Production-only tarball smoke passed: ${tarball}`);
