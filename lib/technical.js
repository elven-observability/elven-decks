"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { marked } = require("marked");
const { imageSize } = require("image-size");
const { decodeHTML } = require("entities");
const themeRoot = path.resolve(__dirname, "../skill/themes");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const headings = {
  common: [
    "Resumo técnico",
    "Contexto e escopo",
    "Evidências",
    "Validação",
    "Próximos passos",
    "Referências",
  ],
  analysis: ["Análise"],
  runbook: ["Procedimento", "Rollback"],
  rfc: ["Proposta", "Alternativas"],
};
function localFile(root, relative) {
  if (
    typeof relative !== "string" ||
    !relative ||
    path.isAbsolute(relative) ||
    /^(?:[a-z]+:|\/\/)/i.test(relative)
  )
    throw new Error(`Use arquivo local relativo: ${relative}`);
  const file = fs.realpathSync(path.resolve(root, relative));
  const rel = path.relative(fs.realpathSync(root), file);
  if (
    rel.startsWith("..") ||
    path.isAbsolute(rel) ||
    !fs.statSync(file).isFile()
  )
    throw new Error(`Arquivo fora da pasta do relatório: ${relative}`);
  return file;
}
function safeLink(href) {
  if (
    !/^(?:https?:\/\/|mailto:|#[a-z\d_-]+)/i.test(href) ||
    /[\s\x00-\x1f]/.test(href)
  )
    throw new Error(
      `Link inválido: ${href}. Use https, http, mailto ou âncora.`,
    );
  return href;
}
function loadReport(file) {
  file = path.resolve(file);
  const root = path.dirname(file);
  const config = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!config || typeof config !== "object" || Array.isArray(config))
    throw new Error("report.json deve ser um objeto de metadados");
  const allowed = [
    "$schema",
    "schemaVersion",
    "profile",
    "kind",
    "title",
    "subtitle",
    "client",
    "author",
    "date",
    "version",
    "classification",
    "status",
    "source",
  ];
  for (const key of Object.keys(config))
    if (!allowed.includes(key)) throw new Error(`Campo desconhecido: ${key}`);
  if (config.schemaVersion !== 1 || config.profile !== "technical-report")
    throw new Error("schemaVersion:1 e profile:technical-report obrigatórios");
  for (const key of ["title", "client", "author", "date", "version", "source"])
    if (typeof config[key] !== "string" || !config[key].trim())
      throw new Error(`Campo obrigatório: ${key}`);
  if (config.subtitle !== undefined && typeof config.subtitle !== "string")
    throw new Error("subtitle deve ser texto");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(config.date) ||
    Number.isNaN(Date.parse(config.date)) ||
    new Date(config.date).toISOString().slice(0, 10) !== config.date
  )
    throw new Error("date deve ser uma data válida YYYY-MM-DD");
  if (!["analysis", "runbook", "rfc"].includes(config.kind))
    throw new Error("kind deve ser analysis, runbook ou rfc");
  if (!["draft", "final"].includes(config.status))
    throw new Error("status deve ser draft ou final");
  if (!["public", "internal", "confidential"].includes(config.classification))
    throw new Error("classification deve ser public, internal ou confidential");
  const source = localFile(root, config.source);
  const markdown = fs.readFileSync(source, "utf8");
  const tokens = marked.lexer(markdown, { gfm: true });
  const required = [...headings.common, ...headings[config.kind]];
  const present = tokens
    .filter((t) => t.type === "heading" && t.depth === 2)
    .map((t) => t.text);
  const missing = required.filter((h) => !present.includes(h));
  if (missing.length)
    throw new Error(`Seções obrigatórias ausentes: ${missing.join(", ")}`);
  let lastDepth = 1;
  const ids = new Set();
  const images = new Map();
  marked.walkTokens(tokens, (token) => {
    if (token.type === "html")
      throw new Error(
        "HTML bruto não é suportado no técnico; use Markdown para preservar paridade com DOCX",
      );
    if (token.type === "heading") {
      if (token.depth < 2 || token.depth > 4 || token.depth > lastDepth + 1)
        throw new Error(
          "Use títulos H2–H4 sem pular níveis; o título H1 vem de report.json",
        );
      lastDepth = token.depth;
      const id = slug(token.text);
      if (ids.has(id)) throw new Error(`Título duplicado: ${token.text}`);
      ids.add(id);
    }
    if (token.type === "link") safeLink(token.href);
    if (token.type === "image") {
      if (!token.text?.trim())
        throw new Error("Toda figura precisa de descrição alternativa");
      const image = localFile(root, decodeURIComponent(token.href));
      const data = fs.readFileSync(image);
      const dimensions = imageSize(data);
      if (!["png", "jpg"].includes(dimensions.type))
        throw new Error(
          "Figuras técnicas devem ser PNG ou JPEG (exporte diagramas antes do build)",
        );
      images.set(token.href, { file: image, data, ...dimensions });
    }
    if (token.type === "code" && /\r/.test(token.text))
      token.text = token.text.replace(/\r/g, "");
  });
  marked.walkTokens(tokens, (token) => {
    if (
      token.type === "link" &&
      token.href.startsWith("#") &&
      !ids.has(token.href.slice(1))
    )
      throw new Error(`Âncora inexistente: ${token.href}`);
  });
  const plain = tokens
    .filter((t) => t.type !== "code")
    .map((t) => t.raw)
    .join("\n");
  if (
    config.status === "final" &&
    /\{\{|\b(?:TODO|TBD|PREENCHER)\b/i.test(JSON.stringify(config) + plain)
  )
    throw new Error(
      "Relatório final contém placeholders; preencha o conteúdo ou use status draft",
    );
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "heading" && tokens[i].depth === 2) {
      const next = tokens.slice(i + 1).find((t) => t.type !== "space");
      if (!next || next.type === "heading")
        throw new Error(`Seção vazia: ${tokens[i].text}`);
    }
  }
  return { file, root, source, config, markdown, tokens, images };
}
function slug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\d]+/g, "-")
    .replace(/^-|-$/g, "");
}
function dataURI(image) {
  return `data:image/${image.type === "jpg" ? "jpeg" : "png"};base64,${image.data.toString("base64")}`;
}
function fontsCSS() {
  return fs
    .readFileSync(path.join(themeRoot, "fonts.css"), "utf8")
    .replace(
      /url\("fonts\/([^"/]+)"\)/g,
      (_, name) =>
        `url("data:font/woff2;base64,${fs.readFileSync(path.join(themeRoot, "fonts", name)).toString("base64")}")`,
    );
}
function htmlReport(report) {
  const renderer = new marked.Renderer();
  renderer.heading = (token) =>
    `<h${token.depth} id="${slug(token.text)}">${renderer.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
  renderer.image = (token) =>
    `<figure><img src="${dataURI(report.images.get(token.href))}" alt="${escape(token.text)}"><figcaption>${escape(token.text)}</figcaption></figure>`;
  const content = marked.parser(report.tokens, { renderer });
  const c = report.config;
  const toc = report.tokens
    .filter((t) => t.type === "heading" && t.depth === 2)
    .map((t) => `<li><a href="#${slug(t.text)}">${escape(t.text)}</a></li>`)
    .join("");
  const logo = fs
    .readFileSync(path.resolve(__dirname, "../skill/assets/elven-logo.png"))
    .toString("base64");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(c.title)}</title><style>${fontsCSS()}\n${fs.readFileSync(path.join(themeRoot, "elven-technical.css"), "utf8")}</style></head><body><main><header class="report-header"><img src="data:image/png;base64,${logo}" alt="Elven Works"><p class="eyebrow">${escape(c.kind)} / ${escape(c.status === "draft" ? "Rascunho" : "Final")}</p><h1>${escape(c.title)}</h1>${c.subtitle ? `<p class="subtitle">${escape(c.subtitle)}</p>` : ""}<dl><div><dt>Cliente</dt><dd>${escape(c.client)}</dd></div><div><dt>Responsável</dt><dd>${escape(c.author)}</dd></div><div><dt>Emissão / versão</dt><dd>${escape(c.date)} / ${escape(c.version)}</dd></div><div><dt>Classificação</dt><dd>${escape(c.classification)}</dd></div></dl></header><nav aria-label="Sumário"><p class="eyebrow">Neste documento</p><ol>${toc}</ol></nav><article>${content}</article></main></body></html>`;
}
async function docxReport(report) {
  const d = require("docx");
  const c = report.config;
  function inline(tokens, style = {}) {
    return (tokens || []).flatMap((t) => {
      if (t.type === "strong")
        return inline(t.tokens, { ...style, bold: true });
      if (t.type === "em") return inline(t.tokens, { ...style, italics: true });
      if (t.type === "del") return inline(t.tokens, { ...style, strike: true });
      if (t.type === "link")
        return [
          t.href.startsWith("#")
            ? new d.InternalHyperlink({
                anchor: t.href.slice(1),
                children: inline(t.tokens, {
                  ...style,
                  color: "00695C",
                  underline: { type: d.UnderlineType.SINGLE },
                }),
              })
            : new d.ExternalHyperlink({
                link: safeLink(t.href),
                children: inline(t.tokens, {
                  ...style,
                  color: "00695C",
                  underline: { type: d.UnderlineType.SINGLE },
                }),
              }),
        ];
      if (t.type === "image") {
        const img = report.images.get(t.href);
        const width = Math.min(600, img.width),
          height = (width * img.height) / img.width;
        if (height > 780)
          throw new Error(
            `Figura alta demais para A4: ${t.href}; divida em figuras menores`,
          );
        return [
          new d.ImageRun({
            type: img.type,
            data: img.data,
            transformation: { width, height },
            altText: { title: t.text, description: t.text, name: t.text },
          }),
        ];
      }
      if (t.type === "br") return [new d.TextRun({ break: 1 })];
      if (t.tokens) return inline(t.tokens, style);
      return [
        new d.TextRun({
          text:
            t.type === "codespan" ? t.text : decodeHTML(t.text ?? t.raw ?? ""),
          ...style,
          ...(t.type === "codespan"
            ? { font: "IBM Plex Mono", size: 19, shading: { fill: "EFF3F5" } }
            : {}),
        }),
      ];
    });
  }
  function blocks(tokens, options = {}, depth = 0) {
    return tokens.flatMap((t) => {
      if (t.type === "space" || t.type === "def" || t.type === "checkbox")
        return [];
      if (t.type === "heading")
        return [
          new d.Paragraph({
            heading: d.HeadingLevel[`HEADING_${t.depth - 1}`],
            children: [
              new d.Bookmark({ id: slug(t.text), children: inline(t.tokens) }),
            ],
          }),
        ];
      if (t.type === "paragraph" || t.type === "text") {
        const hasImage = t.tokens?.some((t) => t.type === "image");
        const paragraph = new d.Paragraph({
          children: inline(t.tokens || [{ type: "text", text: t.text }]),
          ...options,
          ...(hasImage ? { keepNext: true } : {}),
        });
        return hasImage
          ? [
              paragraph,
              new d.Paragraph({
                style: "Caption",
                children: [
                  new d.TextRun(
                    t.tokens
                      .filter((t) => t.type === "image")
                      .map((t) => t.text)
                      .join("; "),
                  ),
                ],
              }),
            ]
          : [paragraph];
      }
      if (t.type === "code")
        return t.text.split("\n").map(
          (line, index, lines) =>
            new d.Paragraph({
              style: "Code",
              indent: { left: 140, right: 140 },
              spacing: {
                before: index === 0 ? 100 : 0,
                after: index === lines.length - 1 ? 140 : 0,
              },
              keepNext: lines.length < 20 && index < lines.length - 1,
              children: [
                new d.TextRun({
                  text: line || " ",
                  font: "IBM Plex Mono",
                  size: 18,
                }),
              ],
            }),
        );
      if (t.type === "blockquote")
        return blocks(t.tokens, {
          indent: { left: 280 },
          shading: { fill: "EAF7F4" },
        });
      if (t.type === "hr")
        return [new d.Paragraph({ text: "", spacing: { after: 160 } })];
      if (t.type === "list") {
        const reference = `list-${listIndex++}`;
        if (t.ordered)
          numbering.push({
            reference,
            levels: [
              {
                level: 0,
                format: d.LevelFormat.DECIMAL,
                text: "%1.",
                start: Number(t.start) || 1,
                alignment: d.AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 360 * (depth + 1), hanging: 260 },
                  },
                },
              },
            ],
          });
        return t.items.flatMap((item, itemIndex) => {
          const listBlocks = blocks(item.tokens, options, depth + 1);
          let first = true;
          return listBlocks.map((block) => {
            if (first && block instanceof d.Paragraph) {
              first = false;
              // Rebuild the first paragraph from its Markdown text so numbering
              // stays semantic and restarts independently for each ordered list.
              const token = item.tokens.find(
                (t) => t.type !== "space" && t.type !== "checkbox",
              );
              if (token?.type === "text" || token?.type === "paragraph")
                return new d.Paragraph({
                  keepNext:
                    t.items.length <= 5 && itemIndex < t.items.length - 1,
                  children: [
                    ...(item.task
                      ? [new d.TextRun(item.checked ? "[x] " : "[ ] ")]
                      : []),
                    ...inline(
                      token.tokens || [{ type: "text", text: token.text }],
                    ),
                  ],
                  ...(t.ordered
                    ? { numbering: { reference, level: 0 } }
                    : { bullet: { level: Math.min(depth, 8) } }),
                  ...options,
                });
            }
            return block;
          });
        });
      }
      if (t.type === "table") {
        const width = Math.floor(9638 / t.header.length);
        const row = (cells, header) =>
          new d.TableRow({
            tableHeader: header,
            cantSplit: true,
            children: cells.map(
              (cell) =>
                new d.TableCell({
                  width: { size: width, type: d.WidthType.DXA },
                  shading: { fill: header ? "EAF7F4" : "FFFFFF" },
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  children: [
                    new d.Paragraph({
                      children: inline(cell.tokens, { bold: header }),
                      spacing: { after: 0 },
                    }),
                  ],
                }),
            ),
          });
        return [
          new d.Table({
            width: { size: 9638, type: d.WidthType.DXA },
            columnWidths: t.header.map(() => width),
            rows: [
              row(t.header, true),
              ...t.rows.map((cells) => row(cells, false)),
            ],
          }),
          new d.Paragraph({ text: "", spacing: { after: 80 } }),
        ];
      }
      throw new Error(`Markdown não suportado no DOCX: ${t.type}`);
    });
  }
  let listIndex = 0;
  const numbering = [];
  const body = blocks(report.tokens);
  const meta = [
    c.client,
    c.author,
    `${c.date} / v${c.version}`,
    c.classification,
    c.status === "draft" ? "Rascunho" : "Final",
  ].join(" | ");
  const logo = fs.readFileSync(
    path.resolve(__dirname, "../skill/assets/elven-logo.png"),
  );
  const embedded = (name) =>
    fs.readFileSync(path.join(themeRoot, "fonts", name + ".ttf"));
  const doc = new d.Document({
    fonts: [
      {
        name: "Inter",
        data: embedded("inter-latin-400-normal"),
        bold: embedded("inter-latin-700-normal"),
        italic: embedded("inter-latin-400-italic"),
        boldItalic: embedded("inter-latin-700-italic"),
      },
      {
        name: "IBM Plex Mono",
        data: embedded("ibm-plex-mono-latin-400-normal"),
        bold: embedded("ibm-plex-mono-latin-700-normal"),
      },
    ],
    theme: { fonts: { headings: "Inter", body: "Inter" } },
    creator: c.author,
    title: c.title,
    subject: c.subtitle || c.title,
    description: `${c.kind} — ${c.client}`,
    numbering: { config: numbering },
    styles: {
      default: {
        document: {
          run: {
            font: "Inter",
            size: 22,
            color: "0F1923",
            language: { value: "pt-BR" },
          },
          paragraph: { spacing: { after: 150, line: 300 } },
        },
      },
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          run: { font: "Inter", size: 52, bold: true, color: "0F1923" },
          paragraph: { spacing: { before: 260, after: 200 }, keepNext: true },
        },
        {
          id: "Heading1",
          name: "heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, color: "00695C" },
          paragraph: { spacing: { before: 320, after: 140 }, keepNext: true },
        },
        {
          id: "Heading2",
          name: "heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 25, bold: true },
          paragraph: { spacing: { before: 240, after: 100 }, keepNext: true },
        },
        {
          id: "Heading3",
          name: "heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 22, bold: true },
          paragraph: { spacing: { before: 180, after: 80 }, keepNext: true },
        },
        {
          id: "Code",
          name: "Code",
          basedOn: "Normal",
          run: { font: "IBM Plex Mono", size: 18 },
          paragraph: {
            spacing: { before: 0, after: 0, line: 240 },
            shading: { fill: "EFF3F5" },
          },
        },
        {
          id: "Caption",
          name: "Caption",
          basedOn: "Normal",
          run: { size: 18, color: "526273" },
          paragraph: { spacing: { after: 180 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1134,
              right: 1134,
              footer: 560,
              header: 560,
            },
          },
        },
        footers: {
          default: new d.Footer({
            children: [
              new d.Paragraph({
                alignment: d.AlignmentType.RIGHT,
                children: [
                  new d.TextRun({
                    text: `Elven Works | ${c.classification} | `,
                    size: 16,
                    color: "526273",
                  }),
                  new d.TextRun({ children: [d.PageNumber.CURRENT], size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: [
          new d.Paragraph({
            children: [
              new d.ImageRun({
                type: "png",
                data: logo,
                transformation: {
                  width: 110,
                  height: Math.round(
                    (110 * imageSize(logo).height) / imageSize(logo).width,
                  ),
                },
              }),
            ],
          }),
          new d.Paragraph({ text: c.title, style: "Title" }),
          ...(c.subtitle ? [new d.Paragraph({ text: c.subtitle })] : []),
          new d.Paragraph({
            children: [
              new d.TextRun({ text: meta, size: 18, color: "526273" }),
            ],
            spacing: { after: 300 },
          }),
          new d.Paragraph({
            text: "Neste documento",
            heading: d.HeadingLevel.HEADING_1,
          }),
          ...report.tokens
            .filter((t) => t.type === "heading" && t.depth === 2)
            .map(
              (t) =>
                new d.Paragraph({
                  children: [
                    new d.InternalHyperlink({
                      anchor: slug(t.text),
                      children: [
                        new d.TextRun({ text: t.text, color: "00695C" }),
                      ],
                    }),
                  ],
                  spacing: { after: 60 },
                }),
            ),
          ...body,
        ],
      },
    ],
  });
  return d.Packer.toBuffer(doc);
}
async function buildReport(file, options = {}) {
  const format = options.format || "all";
  if (!["all", "html", "pdf", "docx"].includes(format))
    throw new Error("--format deve ser all, html, pdf ou docx");
  const report = loadReport(file);
  const out = path.resolve(
    options["out-dir"] || path.join(report.root, "dist"),
  );
  const outputFiles = [
    "report.html",
    "report.pdf",
    "report.docx",
    "manifest.json",
  ].map((f) => path.join(out, f));
  if (outputFiles.includes(report.file) || outputFiles.includes(report.source))
    throw new Error("Pasta de saída sobrescreveria a fonte");
  fs.mkdirSync(out, { recursive: true });
  const artifacts = [];
  const html = htmlReport(report);
  const htmlPath = path.join(out, "report.html");
  if (format !== "docx") {
    fs.writeFileSync(htmlPath, html);
    artifacts.push(htmlPath);
  }
  if (format === "all" || format === "docx") {
    const f = path.join(out, "report.docx");
    fs.writeFileSync(f, await docxReport(report));
    artifacts.push(f);
  }
  if (format === "all" || format === "pdf") {
    await require("./browser").withPage(htmlPath, async (page) => {
      await page.emulateMediaType("print");
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll("article *")]
          .filter(
            (e) =>
              e.scrollWidth > e.clientWidth + 2 &&
              getComputedStyle(e).display !== "inline",
          )
          .map((e) => e.tagName),
      );
      if (overflow.length)
        throw new Error(
          `Conteúdo técnico excede a largura: ${[...new Set(overflow)].join(", ")}`,
        );
      const f = path.join(out, "report.pdf");
      await page.pdf({
        path: f,
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate: `<div style="font:8px Arial;color:#526273;width:100%;padding:0 20mm;text-align:right">Elven Works | ${escape(report.config.classification)} | <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
        margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
      });
      artifacts.push(f);
    });
  }
  const digest = (f) =>
    crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
  const manifest = {
    package: require("../package.json").name,
    version: require("../package.json").version,
    builtAt: new Date().toISOString(),
    profile: report.config.profile,
    status: report.config.status,
    format: "A4 portrait",
    sources: [
      report.file,
      report.source,
      ...[...report.images.values()].map((i) => i.file),
    ].map((f) => ({ file: path.relative(report.root, f), sha256: digest(f) })),
    artifacts: artifacts.map((f) => ({
      file: path.basename(f),
      sha256: digest(f),
    })),
    visualReview: "pending",
  };
  fs.writeFileSync(
    path.join(out, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  for (const f of artifacts) console.log(`Gerado: ${f}`);
  console.log(
    `Manifesto: ${path.join(out, "manifest.json")}\nRevise visualmente PDF e DOCX antes de entregar; lint não valida conclusões ou paginação.`,
  );
  return manifest;
}
module.exports = { loadReport, htmlReport, docxReport, buildReport, localFile };
