"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin/decks-skill.js");
const run = (...args) => {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r;
};

test("technical PDF and executive PDF have the requested media boxes and pages", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elven-render-"));
  const technical = path.join(dir, "technical"),
    executive = path.join(dir, "executive"),
    workshop = path.join(dir, "workshop");
  run("new", "technical-report", technical);
  run("new", "executive", executive);
  run("new", "workshop", workshop);
  run("build", path.join(technical, "report.json"));
  run("check", path.join(executive, "deck.html"));
  run("check", path.join(workshop, "html-slides/day-1.html"));
  run("render", path.join(executive, "deck.html"));
  const { withPage } = require("../lib/browser");
  // Chromium reads its generated PDFs through PDF.js is unnecessary here;
  // inspect page dictionaries with pdf-lib, a development-only parser.
  const { PDFDocument } = require("pdf-lib");
  const technicalPdf = await PDFDocument.load(
    fs.readFileSync(path.join(technical, "dist/report.pdf")),
  );
  assert.ok(technicalPdf.getPageCount() >= 2);
  for (const page of technicalPdf.getPages()) {
    assert.ok(Math.abs(page.getWidth() - 595.28) < 1);
    assert.ok(Math.abs(page.getHeight() - 841.89) < 1);
  }
  const executivePdf = await PDFDocument.load(
    fs.readFileSync(path.join(executive, "deck.pdf")),
  );
  assert.equal(executivePdf.getPageCount(), 5);
  for (const page of executivePdf.getPages()) {
    assert.equal(page.getWidth(), 960);
    assert.equal(page.getHeight(), 540);
  }
  const html = path.join(technical, "dist/report.html");
  await withPage(html, async (page) => {
    const result = await page.evaluate(() => ({
      heading: document.querySelector("h1").textContent,
      hasTOC: !!document.querySelector('nav a[href="#resumo-tecnico"]'),
      fonts: document.fonts.check("11pt Inter"),
    }));
    assert.equal(
      result.heading,
      JSON.parse(fs.readFileSync(path.join(technical, "report.json"))).title,
    );
    assert.ok(result.hasTOC && result.fonts);
  });
  // The same check must catch an intentionally overfilled slide.
  const broken = path.join(executive, "deck.html");
  fs.appendFileSync(broken, "<style>.content{top:690px!important}</style>");
  const bad = spawnSync(process.execPath, [cli, "check", broken], {
    encoding: "utf8",
  });
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /fora do canvas/);
});
