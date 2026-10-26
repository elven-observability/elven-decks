#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
async function main() {
  const { values, positionals } = parseArgs({ options:{out:{type:"string"}},allowPositionals:true });
  if (positionals.length!==1 || !/\.html?$/i.test(positionals[0])) throw new Error("Uso: decks-skill render <deck.html> [--out <arquivo.pdf>]");
  const input = path.resolve(positionals[0]);
  const out = path.resolve(values.out || input.replace(/\.html?$/i,".pdf"));
  if (!/\.pdf$/i.test(out) || out===input) throw new Error("A saída deve ser um PDF distinto da fonte");
  require("../../lib/deck-lint").lintDeck(input);
  await require("../../lib/browser").withPage(input, async page => {
    await page.emulateMediaType("print");
    // Screen gaps must not create extra PDF pages.
    await page.addStyleTag({content:"html,body{margin:0!important;padding:0!important}.slide{margin:0!important;break-after:page}.slide:last-child{break-after:auto}"});
    fs.mkdirSync(path.dirname(out),{recursive:true});
    await page.pdf({path:out,width:"1280px",height:"720px",printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
  });
  console.log(`PDF: ${out} (${fs.statSync(out).size} bytes)`);
}
main().catch(error=>{console.error(`Render failed: ${error.message}`);process.exitCode=1;});
