#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseArgs } = require("node:util");
const pkg = require("../package.json");
const root = path.resolve(__dirname, "..");
const help = `Elven Decks ${pkg.version} — executivo 16:9 e técnico A4

  install [--target both|codex|claude] [--force] [--project <pasta>]
  update  [--target both|codex|claude] [--version <versão>] [--project <pasta>]
          [--from-installed]  (offline: aplica a versão desta CLI)
  doctor  [--target both|codex|claude] [--project <pasta>]
  new <executive|client-report|workshop|technical-report> <pasta>
  lint <deck.html|report.json> [...]
  check <deck.html>  (assets, canvas e overflow em Chromium)
  preview <deck.html> [--out-dir <pasta>]
  render <deck.html> [--out <arquivo.pdf>]
  build <report.json> [--out-dir <pasta>] [--format all|html|pdf|docx]
  --version | --help

Atualização em um comando, sem instalação global:
  npx --yes @elven-observability/decks-skill@latest update --target both

Guia: https://github.com/elven-observability/elven-decks
`;
function run(script, args) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "skill/scripts", script), ...args],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || ["help", "--help", "-h"].includes(command))
    return console.log(help);
  if (["version", "--version", "-v"].includes(command))
    return console.log(pkg.version);
  if (["install", "update", "doctor"].includes(command)) {
    const { values, positionals } = parseArgs({
      args,
      allowPositionals: true,
      options: {
        target: { type: "string", default: "both" },
        force: { type: "boolean", default: false },
        project: { type: "string" },
        version: { type: "string" },
        "from-installed": { type: "boolean" },
      },
    });
    if (positionals.length)
      throw new Error(`Argumentos inesperados: ${positionals.join(" ")}`);
    const installer = require("../lib/install");
    if (command === "doctor") return installer.doctor(values);
    if (command === "update" && !values["from-installed"])
      return installer.update(values);
    return installer.install({
      ...values,
      force: values.force || command === "update",
    });
  }
  if (command === "new") {
    if (args.length !== 2 || args.some((a) => a.startsWith("--")))
      throw new Error(
        "Uso: decks-skill new <executive|client-report|workshop|technical-report> <pasta>",
      );
    const types = {
      executive: "client-report-deck",
      "client-report": "client-report-deck",
      workshop: "workshop-mentorship-deck",
      "technical-report": "technical-report",
    };
    if (!types[args[0]]) throw new Error(`Tipo desconhecido: ${args[0]}`);
    const dest = path.resolve(args[1]);
    if (fs.existsSync(dest)) throw new Error(`Pasta já existe: ${dest}`);
    fs.cpSync(path.join(root, "skill/templates", types[args[0]]), dest, {
      recursive: true,
    });
    const themeDir =
      args[0] === "workshop" ? path.join(dest, "html-slides") : dest;
    if (args[0] !== "technical-report") {
      for (const file of [
        "elven-deck.css",
        "elven-deck-charts.js",
        "fonts.css",
      ])
        fs.copyFileSync(
          path.join(root, "skill/themes", file),
          path.join(themeDir, file),
        );
      fs.cpSync(
        path.join(root, "skill/themes/fonts"),
        path.join(themeDir, "fonts"),
        { recursive: true },
      );
    }
    console.log(
      `Criado: ${dest}\n${args[0] === "technical-report" ? "Edite report.json e report.md; depois: decks-skill build report.json" : "Edite o HTML; depois: decks-skill lint, check, preview e render"}`,
    );
    return;
  }
  if (command === "lint") {
    if (!args.length || args.some((a) => a.startsWith("--")))
      throw new Error("Uso: decks-skill lint <deck.html|report.json> [...]");
    let failures = 0;
    for (const file of args) {
      try {
        if (path.extname(file) === ".json")
          require("../lib/technical").loadReport(file);
        else require("../lib/deck-lint").lintDeck(file);
        console.log(
          `PASS ${file}${path.extname(file) === ".json" ? " (técnico)" : " (10/10)"}`,
        );
      } catch (error) {
        failures++;
        console.error(`FAIL ${file}: ${error.message}`);
      }
    }
    process.exitCode = failures ? 1 : 0;
    return;
  }
  if (command === "build") {
    const { values, positionals } = parseArgs({
      args,
      allowPositionals: true,
      options: {
        "out-dir": { type: "string" },
        format: { type: "string", default: "all" },
      },
    });
    if (positionals.length !== 1)
      throw new Error(
        "Uso: decks-skill build <report.json> [--out-dir <pasta>] [--format all|html|pdf|docx]",
      );
    return require("../lib/technical").buildReport(positionals[0], values);
  }
  if (command === "check") {
    if (args.length !== 1)
      throw new Error("Uso: decks-skill check <deck.html>");
    require("../lib/deck-lint").lintDeck(args[0]);
    return require("../lib/browser").checkDeck(args[0]);
  }
  if (command === "render") return run("render-deck.js", args);
  if (command === "preview") return run("preview-deck.js", args);
  throw new Error(`Comando desconhecido: ${command}\nUse decks-skill --help.`);
}
main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
