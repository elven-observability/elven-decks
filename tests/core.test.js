"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin/decks-skill.js");
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), "elven-test-"));
function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    ...options,
  });
}
function scaffold() {
  const dir = path.join(temp(), "technical");
  const result = run(["new", "technical-report", dir]);
  assert.equal(result.status, 0, result.stderr);
  return {
    dir,
    file: path.join(dir, "report.json"),
    source: path.join(dir, "report.md"),
  };
}
function editConfig(f, change) {
  const c = JSON.parse(fs.readFileSync(f));
  change(c);
  fs.writeFileSync(f, JSON.stringify(c));
}

test("scaffold aliases preserve executive/workshop theme and refuse existing output", () => {
  const dir = temp();
  for (const type of ["executive", "client-report", "workshop"]) {
    const dest = path.join(dir, type);
    const r = run(["new", type, dest]);
    assert.equal(r.status, 0, r.stderr);
    const html = path.join(
      dest,
      type === "workshop" ? "html-slides/day-1.html" : "deck.html",
    );
    assert.equal(run(["lint", html]).status, 0);
    const cssDir = path.dirname(html);
    assert.deepEqual(
      fs.readFileSync(path.join(cssDir, "elven-deck.css")),
      fs.readFileSync(path.join(root, "skill/themes/elven-deck.css")),
    );
    assert.ok(fs.existsSync(path.join(cssDir, "fonts.css")));
    assert.notEqual(run(["new", type, dest]).status, 0);
  }
});

test("installs both agents, backs up custom modifications and updates offline", () => {
  const home = temp();
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  let r = run(["install", "--target", "both"], { env });
  assert.equal(r.status, 0, r.stderr);
  const codex = path.join(home, ".agents/skills/elven-decks-skill");
  const claude = path.join(home, ".claude/skills/decks-skill");
  assert.ok(fs.existsSync(path.join(codex, "SKILL.md")));
  assert.ok(fs.existsSync(path.join(claude, "SKILL.md")));
  fs.writeFileSync(path.join(codex, "custom.md"), "local edit");
  assert.notEqual(run(["install"], { env }).status, 0);
  r = run(["update", "--from-installed"], { env });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!fs.existsSync(path.join(codex, "custom.md")));
  const backups = path.join(home, ".agents/skill-backups");
  assert.equal(
    fs.readFileSync(
      path.join(backups, fs.readdirSync(backups)[0], "custom.md"),
      "utf8",
    ),
    "local edit",
  );
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(codex, ".elven-install.json")))
      .version,
    require("../package.json").version,
  );
});

test("legacy Codex path is reused, project installation stays scoped", () => {
  const home = temp();
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  const legacy = path.join(home, ".codex/skills/decks-skill");
  fs.mkdirSync(legacy, { recursive: true });
  assert.equal(
    run(["update", "--from-installed", "--target", "codex"], { env }).status,
    0,
  );
  assert.ok(fs.existsSync(path.join(legacy, "SKILL.md")));
  assert.ok(!fs.existsSync(path.join(home, ".agents/skills")));
  const project = temp();
  assert.equal(
    run(["install", "--target", "codex", "--project", project], { env }).status,
    0,
  );
  assert.ok(
    fs.existsSync(
      path.join(project, ".agents/skills/elven-decks-skill/SKILL.md"),
    ),
  );
  assert.ok(!fs.existsSync(path.join(project, ".claude")));
});

test("missing file and malformed CLI arguments fail without modifying sources", () => {
  assert.notEqual(run(["lint", path.join(temp(), "missing.html")]).status, 0);
  assert.notEqual(run(["install", "--target", "invalid"]).status, 0);
  assert.notEqual(run(["render"]).status, 0);
  assert.notEqual(run(["render", "input.html", "--out"]).status, 0);
  assert.notEqual(run(["build", "missing.json", "--format", "pptx"]).status, 0);
});

test("DOM lint validates each slide, not aggregate component counts", () => {
  const dir = temp();
  const file = path.join(dir, "deck.html");
  let html = fs.readFileSync(
    path.join(root, "skill/templates/client-report-deck/deck.html"),
    "utf8",
  );
  html = html.replace(
    'href="elven-deck.css"',
    `href="${path.join(root, "skill/themes/elven-deck.css")}"`,
  );
  // Move one kicker to another slide: total count stays constant.
  const kick = html.match(/<div class="kicker">[^<]*<\/div>/)[0];
  html = html
    .replace(kick, "")
    .replace(/(<div class="kicker">[^<]*<\/div>)/, `$1${kick}`);
  fs.writeFileSync(file, html);
  const r = run(["lint", file]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /L8/);
});

test("technical metadata, sections, links and final placeholders are validated", () => {
  const { loadReport } = require("../lib/technical");
  const s = scaffold();
  assert.equal(loadReport(s.file).config.profile, "technical-report");
  const original = fs.readFileSync(s.source, "utf8");
  for (const [bad, pattern] of [
    [original.replace("## Evidências", "## Outro título"), /Seções/],
    [original + "\n<script>alert(1)</script>\n", /HTML bruto/],
    [original + "\n[link](javascript:alert)\n", /Link inválido/],
    [original + "\n[link](#inexistente)\n", /Âncora/],
    [original.replace("## Análise", "## Análise\n\n## Análise"), /duplicado/],
  ]) {
    fs.writeFileSync(s.source, bad);
    assert.throws(() => loadReport(s.file), pattern);
  }
  fs.writeFileSync(s.source, original);
  editConfig(s.file, (c) => (c.date = "2026-02-30"));
  assert.throws(() => loadReport(s.file), /data válida/);
  editConfig(s.file, (c) => {
    c.date = "2026-10-26";
    c.status = "final";
  });
  fs.writeFileSync(s.source, original + "\nTODO preencher\n");
  assert.throws(() => loadReport(s.file), /placeholders/);
});

test("technical images cannot escape the source directory, including symlinks", () => {
  const { loadReport } = require("../lib/technical");
  const s = scaffold();
  const original = fs.readFileSync(s.source, "utf8");
  const outside = path.join(temp(), "logo.png");
  fs.copyFileSync(path.join(root, "skill/assets/elven-logo.png"), outside);
  fs.writeFileSync(s.source, original + `\n![Figura](${outside})\n`);
  assert.throws(() => loadReport(s.file), /relativo/);
  if (process.platform !== "win32") {
    fs.symlinkSync(outside, path.join(s.dir, "escape.png"));
    fs.writeFileSync(s.source, original + "\n![Figura](escape.png)\n");
    assert.throws(() => loadReport(s.file), /fora da pasta/);
  }
});

test("technical HTML and DOCX use the same content with semantic styles and A4", async () => {
  const {
    loadReport,
    htmlReport,
    docxReport,
    buildReport,
  } = require("../lib/technical");
  const s = scaffold();
  fs.copyFileSync(
    path.join(root, "skill/assets/elven-logo.png"),
    path.join(s.dir, "figure.png"),
  );
  fs.appendFileSync(
    s.source,
    "\n![Fluxo de referência](figure.png)\n\n[Voltar ao resumo](#resumo-tecnico)\n\n- [x] Revisado\n- Pendente\n\n3. Terceiro\n4. Quarto\n",
  );
  const r = loadReport(s.file),
    html = htmlReport(r);
  assert.match(html, /data:font\/woff2;base64/);
  assert.match(html, /Fluxo de referência/);
  assert.match(html, /id="resumo-tecnico"/);
  const docx = await docxReport(r);
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(docx);
  const xml = await zip.file("word/document.xml").async("string");
  assert.match(xml, /Fluxo de referência/);
  assert.match(xml, /w:tblHeader/);
  assert.match(xml, /w:pgSz w:w="11906" w:h="16838"/);
  assert.match(xml, /w:anchor="resumo-tecnico"/);
  assert.match(xml, /w:pStyle w:val="Title"/);
  assert.match(xml, /w:pStyle w:val="Heading1"/);
  assert.match(xml, /curl --fail --show-error/);
  assert.equal(
    Object.keys(zip.files).filter((f) => f.endsWith(".odttf")).length,
    6,
  );
  const fontTable = await zip.file("word/fontTable.xml").async("string");
  assert.match(fontTable, /w:embedRegular/);
  assert.match(fontTable, /w:embedBold/);
  const out = path.join(s.dir, "output");
  const manifest = await buildReport(s.file, {
    format: "docx",
    "out-dir": out,
  });
  assert.equal(manifest.artifacts.length, 1);
  assert.equal(manifest.artifacts[0].file, "report.docx");
  assert.equal(manifest.sources.length, 3);
  assert.equal(manifest.visualReview, "pending");
  assert.equal(fs.existsSync(path.join(out, "report.pdf")), false);
});

test("failed second-agent staging restores the first installation", () => {
  const installer = require("../lib/install");
  const project = temp();
  installer.install({ project, target: "both" });
  const codex = path.join(project, ".agents/skills/elven-decks-skill");
  const claude = path.join(project, ".claude/skills/decks-skill");
  fs.writeFileSync(path.join(codex, "local.md"), "codex original");
  fs.writeFileSync(path.join(claude, "local.md"), "claude original");
  const cp = fs.cpSync;
  let copies = 0;
  fs.cpSync = (...args) => {
    if (++copies === 2) throw new Error("simulated disk failure");
    return cp(...args);
  };
  try {
    assert.throws(
      () => installer.install({ project, target: "both", force: true }),
      /simulated disk failure/,
    );
  } finally {
    fs.cpSync = cp;
  }
  assert.equal(
    fs.readFileSync(path.join(codex, "local.md"), "utf8"),
    "codex original",
  );
  assert.equal(
    fs.readFileSync(path.join(claude, "local.md"), "utf8"),
    "claude original",
  );
});

test("runbook and RFC require their own operational or decision sections", () => {
  const { loadReport } = require("../lib/technical");
  const s = scaffold();
  const original = fs.readFileSync(s.source, "utf8");
  for (const [kind, sections] of [
    ["runbook", ["Procedimento", "Rollback"]],
    ["rfc", ["Proposta", "Alternativas"]],
  ]) {
    editConfig(s.file, (c) => (c.kind = kind));
    assert.throws(() => loadReport(s.file), /Seções obrigatórias/);
    fs.writeFileSync(
      s.source,
      original +
        sections
          .map((h) => `\n## ${h}\n\nConteúdo técnico de referência.\n`)
          .join(""),
    );
    assert.equal(loadReport(s.file).config.kind, kind);
    fs.writeFileSync(s.source, original);
  }
});
