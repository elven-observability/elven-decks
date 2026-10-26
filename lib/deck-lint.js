"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("parse5");
function descendants(node) {
  return (node.childNodes || []).flatMap((n) => [n, ...descendants(n)]);
}
function attr(node, name) {
  return node.attrs?.find((a) => a.name === name)?.value || "";
}
function has(node, name) {
  return attr(node, "class").split(/\s+/).includes(name);
}
function text(node) {
  return node.nodeName === "#text"
    ? node.value
    : (node.childNodes || [])
        .filter((n) => !["script", "style", "pre", "code"].includes(n.tagName))
        .map(text)
        .join("");
}
function lintDeck(file) {
  const input = fs.readFileSync(file, "utf8");
  const nodes = descendants(parse(input));
  const slides = nodes.filter((n) => has(n, "slide"));
  const errors = [];
  const check = (ok, rule, why) => {
    if (!ok) errors.push(`${rule}: ${why}`);
  };
  check(
    /<!doctype html>/i.test(input) &&
      nodes.some(
        (n) =>
          n.tagName === "html" && attr(n, "lang").toLowerCase() === "pt-br",
      ),
    "L1",
    "DOCTYPE e lang=pt-BR obrigatórios",
  );
  check(
    nodes.some((n) => n.tagName === "title" && text(n).trim()),
    "L2",
    "title vazio ou ausente",
  );
  const cssLinks = nodes.filter(
    (n) =>
      n.tagName === "link" &&
      attr(n, "rel") === "stylesheet" &&
      /(?:^|\/)elven-deck\.css$/.test(attr(n, "href")),
  );
  const styles = nodes
    .filter((n) => n.tagName === "style")
    .map((n) => n.childNodes.map((n) => n.value || "").join(""))
    .join("\n");
  check(
    cssLinks.length || /--teal:\s*#00bfa5/i.test(styles),
    "L3",
    "tema elven-deck.css ou tokens canônicos ausentes",
  );
  check(slides.length > 0, "L4", "nenhum .slide");
  const css =
    cssLinks
      .map((n) =>
        fs.readFileSync(
          path.resolve(path.dirname(file), attr(n, "href")),
          "utf8",
        ),
      )
      .join("\n") +
    "\n" +
    styles;
  const sizes = Object.fromEntries(
    [...css.matchAll(/--([wh])\s*:\s*(\d+)px/g)].map((m) => [
      m[1],
      Number(m[2]),
    ]),
  );
  check(
    sizes.w === 1280 && sizes.h === 720,
    "L5",
    "canvas deve declarar --w:1280px e --h:720px",
  );
  check(
    slides.length && has(slides[0], "cover"),
    "L6",
    "primeiro slide deve ter variante cover",
  );
  for (const [rule, name] of [
    ["L7", "content"],
    ["L8", "kicker"],
    ["L9", "logo"],
  ])
    check(
      slides.every((s) => descendants(s).some((n) => has(n, name))),
      rule,
      `todo slide precisa de .${name}`,
    );
  const body = nodes.find((n) => n.tagName === "body");
  check(
    !/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(body ? text(body) : ""),
    "L10",
    "emoji no texto visível",
  );
  if (errors.length)
    throw new Error(`(${10 - errors.length}/10)\n  ${errors.join("\n  ")}`);
  return slides.length;
}
module.exports = { lintDeck };
