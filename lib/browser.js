"use strict";
const { pathToFileURL } = require("node:url");
async function withPage(input, work) {
  const browser = await require("puppeteer").launch({
    headless: true,
    args: [
      "--font-render-hinting=none",
      ...(process.env.DECKS_NO_SANDBOX === "1" || process.getuid?.() === 0
        ? ["--no-sandbox"]
        : []),
    ],
  });
  try {
    const page = await browser.newPage();
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("requestfailed", (request) =>
      failures.push(`${request.url()}: ${request.failure()?.errorText}`),
    );
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1.5,
    });
    await page.goto(pathToFileURL(input).href, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode()));
      if (typeof window.renderCharts === "function") window.renderCharts();
    });
    if (failures.length)
      throw new Error(`Falha ao carregar documento:\n${failures.join("\n")}`);
    return await work(page);
  } finally {
    await browser.close();
  }
}
async function checkPage(page) {
  const problems = await page.evaluate(() => {
    const errors = [];
    const slides = [...document.querySelectorAll(".slide")];
    slides.forEach((slide, index) => {
      const frame = slide.getBoundingClientRect();
      if (Math.abs(frame.width - 1280) > 1 || Math.abs(frame.height - 720) > 1)
        errors.push(
          `slide ${index + 1}: canvas ${frame.width}x${frame.height}`,
        );
      for (const element of slide.querySelectorAll(
        ".content *, .metric-rail, .logo, .source",
      )) {
        const box = element.getBoundingClientRect();
        if (
          !box.width ||
          !box.height ||
          getComputedStyle(element).visibility === "hidden"
        )
          continue;
        if (
          box.left < frame.left - 1 ||
          box.top < frame.top - 1 ||
          box.right > frame.right + 1 ||
          box.bottom > frame.bottom - 12
        )
          errors.push(
            `slide ${index + 1}: ${element.tagName.toLowerCase()}.${element.className?.baseVal ?? element.className} fora do canvas`,
          );
      }
      for (const chart of slide.querySelectorAll(".chart[data-chart]"))
        if (!chart.querySelector("svg"))
          errors.push(
            `slide ${index + 1}: gráfico vazio (${chart.dataset.chart})`,
          );
    });
    if (!slides.length) errors.push("nenhum slide");
    return [...new Set(errors)];
  });
  if (problems.length) throw new Error(`QA falhou:\n${problems.join("\n")}`);
}
async function checkDeck(input) {
  await withPage(require("node:path").resolve(input), checkPage);
  console.log(`PASS ${input}: assets, scripts e geometria`);
}
module.exports = { withPage, checkPage, checkDeck };
