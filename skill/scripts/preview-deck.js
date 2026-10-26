#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
async function main() {
  const { values, positionals } = parseArgs({options:{"out-dir":{type:"string"}},allowPositionals:true});
  if (positionals.length!==1) throw new Error("Uso: decks-skill preview <deck.html> [--out-dir <pasta>]");
  const input = path.resolve(positionals[0]);
  require("../../lib/deck-lint").lintDeck(input);
  const out = path.resolve(values["out-dir"] || path.join(path.dirname(input),"preview"));
  fs.mkdirSync(out,{recursive:true});
  await require("../../lib/browser").withPage(input, async page => {
    const slides = await page.$$(".slide");
    const images = [];
    for (let i=0;i<slides.length;i++) {
      const file = path.join(out,`slide-${String(i+1).padStart(2,"0")}.png`);
      const png = await slides[i].screenshot({path:file});
      images.push(`<figure><img src="data:image/png;base64,${Buffer.from(png).toString("base64")}"><figcaption>${String(i+1).padStart(2,"0")}</figcaption></figure>`);
    }
    await page.setViewport({width:1280,height:1,deviceScaleFactor:1});
    await page.setContent(`<!DOCTYPE html><html><head><style>body{margin:0;padding:16px;background:#0b1220;font:12px Arial;color:#d4dfe3;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0}img{width:100%;display:block}figcaption{padding:6px}</style></head><body>${images.join("")}</body></html>`);
    await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
    const sheet = path.join(path.dirname(out),"contact-sheet.png");
    await page.screenshot({path:sheet,fullPage:true});
    console.log(`${slides.length} slides em ${out}\nContact sheet: ${sheet}`);
  });
}
main().catch(error=>{console.error(`Preview failed: ${error.message}`);process.exitCode=1;});
