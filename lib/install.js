"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const pkg = require("../package.json");
const source = path.resolve(__dirname, "../skill");
function destinations({ target = "both", project } = {}) {
  if (!["codex", "claude", "both"].includes(target))
    throw new Error("--target deve ser both, codex ou claude");
  const base = project ? path.resolve(project) : os.homedir();
  let codex = path.join(base, ".agents/skills/elven-decks-skill");
  if (!project && !fs.existsSync(codex)) {
    const legacy = ["decks-skill", "elven-decks-skill"].map((name) =>
      path.join(base, ".codex/skills", name),
    );
    codex = legacy.find((p) => fs.existsSync(p)) || codex;
  }
  return [
    target !== "claude" && codex,
    target !== "codex" && path.join(base, ".claude/skills/decks-skill"),
  ].filter(Boolean);
}
function install(options = {}) {
  const targets = destinations(options);
  for (const dest of targets) {
    if (fs.existsSync(dest) && !options.force)
      throw new Error(
        `${dest} já existe. Use update ou install --force; a versão anterior será preservada em backup.`,
      );
    if (fs.existsSync(dest) && fs.lstatSync(dest).isSymbolicLink())
      throw new Error(
        `Instalação por symlink: ${dest}. Atualize a origem ou use outro escopo.`,
      );
  }
  const operations = [];
  try {
    for (const dest of targets) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const stage = fs.mkdtempSync(
        path.join(path.dirname(dest), ".elven-install-"),
      );
      const operation = { dest, stage, backup: null, installed: false };
      operations.push(operation);
      fs.cpSync(source, stage, { recursive: true });
      fs.writeFileSync(
        path.join(stage, ".elven-install.json"),
        JSON.stringify(
          {
            package: pkg.name,
            version: pkg.version,
            installedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      if (fs.existsSync(dest)) {
        const backupRoot = path.join(
          path.dirname(path.dirname(dest)),
          "skill-backups",
        );
        fs.mkdirSync(backupRoot, { recursive: true });
        const backup = fs.mkdtempSync(path.join(backupRoot, "elven-decks-"));
        fs.rmdirSync(backup);
        fs.renameSync(dest, backup);
        operation.backup = backup;
      }
      fs.renameSync(stage, dest);
      operation.installed = true;
    }
  } catch (error) {
    for (const op of operations.reverse()) {
      if (op.installed) fs.rmSync(op.dest, { recursive: true, force: true });
      if (op.backup) fs.renameSync(op.backup, op.dest);
      fs.rmSync(op.stage, { recursive: true, force: true });
    }
    throw error;
  }
  for (const op of operations)
    console.log(
      `Instalado ${pkg.version}: ${op.dest}${op.backup ? `\nBackup: ${op.backup}` : ""}`,
    );
  console.log(
    "Recarregue a sessão do agente se a atualização ainda não aparecer.",
  );
}
function npm(args, capture = false) {
  const npmCli =
    process.env.npm_execpath ||
    path.join(
      path.dirname(process.execPath),
      "node_modules/npm/bin/npm-cli.js",
    );
  const windows = process.platform === "win32";
  const result = spawnSync(
    windows ? process.execPath : "npm",
    windows ? [npmCli, ...args] : args,
    {
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      encoding: "utf8",
      shell: false,
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      capture
        ? `npm falhou: ${result.stderr.trim()}`
        : `npm encerrou com código ${result.status}`,
    );
  return result.stdout;
}
function update(options) {
  destinations(options);
  const version =
    options.version ||
    JSON.parse(npm(["view", `${pkg.name}@latest`, "version", "--json"], true));
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version))
    throw new Error("Versão inválida; informe SemVer exata, por exemplo 0.2.0");
  const args = [
    "exec",
    "--yes",
    `--package=${pkg.name}@${version}`,
    "--",
    "decks-skill",
    "install",
    "--force",
    "--target",
    options.target,
  ];
  if (options.project) args.push("--project", path.resolve(options.project));
  npm(args);
  console.log(
    `Skills atualizadas para ${version}. Para atualizar também uma CLI global: npm install -g ${pkg.name}@${version}`,
  );
}
async function doctor(options) {
  let incomplete = false;
  console.log(
    `CLI ${pkg.version} | Node ${process.version} | ${process.platform}/${process.arch}`,
  );
  for (const dest of destinations(options)) {
    const receipt = path.join(dest, ".elven-install.json");
    const installed = fs.existsSync(receipt)
      ? JSON.parse(fs.readFileSync(receipt, "utf8")).version
      : null;
    const exists = fs.existsSync(path.join(dest, "SKILL.md"));
    console.log(
      `${exists ? "OK" : "AUSENTE"} ${dest} | versão ${installed || "sem recibo (legada)"}`,
    );
    if (!exists || installed !== pkg.version) incomplete = true;
  }
  const executable = await require("puppeteer").executablePath();
  console.log(
    `${fs.existsSync(executable) ? "OK" : "AUSENTE"} Chromium: ${executable}`,
  );
  if (!fs.existsSync(executable)) incomplete = true;
  if (incomplete)
    console.log(
      "Instalação incompleta ou versão divergente: execute update. Para Chromium ausente, use npx puppeteer browsers install chrome",
    );
  process.exitCode = incomplete ? 1 : 0;
}
module.exports = { destinations, install, update, doctor };
