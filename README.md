# `@elven-observability/decks-skill`

Anthropic skill-creator pack que codifica o **padrão de apresentações slides da Elven Works**. Distribuído via npm para instalação one-shot. Renderiza HTML deck → PDF temado via Puppeteer.

> **Status:** v0.1.0. Cobre 2 tipos canônicos: `client-report-deck` (kontik-style) e `workshop-mentorship-deck` ("Observability: From Zero to Hero" style). 12 layouts locked, lint binário 10/10, render + preview Puppeteer.

---

## Sumário

- [O que esse skill faz](#o-que-esse-skill-faz)
- [Quando usar](#quando-usar)
- [Quando NÃO usar](#quando-não-usar)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura](#estrutura)
- [Tipos canônicos](#tipos-canônicos)
- [Layouts canônicos](#layouts-canônicos)
- [Decisões de padronização](#decisões-de-padronização)
- [Lint binário](#lint-binário)
- [Render PDF + Preview](#render-pdf--preview)
- [Sibling skill — docs vs decks](#sibling-skill--docs-vs-decks)
- [Contribuindo](#contribuindo)
- [License](#license)

---

## O que esse skill faz

1. **Identifica** o tipo de deck que você quer criar (2 templates canônicos).
2. **Gera scaffold** com placeholders preenchidos: HTML deck, source-notes, qa-notes, e (workshop) agenda + labs + speaker notes + scripts.
3. **Aplica brand visual locked**: paleta, fontes, frame 16:9, numeração — todos extraídos do PDF `kontik-zupper-incident-24h.pdf`.
4. **Codifica 12 layouts canônicos** — cover, executive-summary, thesis-evidence, kpi-row, chart-and-cards, chart-full, code-and-callout, bullets-3, timeline, architecture, section-opener, closing.
5. **Lint binário 10/10** — regras estruturais sobre o HTML do deck.
6. **Renderiza PDF** (`decks-skill render`) via Puppeteer: 1280×720, 1 página/slide, print backgrounds.
7. **Gera preview** (`decks-skill preview`): 1 PNG por slide + contact-sheet pra QA visual.
8. **Recusa-se a inventar** layouts ou tipos que não existem no repo.

## Quando usar

- Vai criar um **client report** em formato slide (incident review, comparativo, spike).
- Vai criar um **workshop/mentoria** multi-dia com speaker notes + labs.
- Vai revisar/normalizar um deck existente nos padrões Elven.
- Antes de mandar PDF ao cliente (gate de lint + visual QA).
- Você é um **agente IA** (Claude Code, Sentinel) e precisa redigir deck no padrão da casa.

## Quando NÃO usar

- Doc flowing (relatório de texto contínuo, guia técnico) → use **[`@elven-observability/docs-skill`](https://www.npmjs.com/package/@elven-observability/docs-skill)**.
- Talk/keynote curto **single-session** sem labs → out of scope v0.1.
- Internal demo casual (all-hands, sprint demo, planning) → out of scope v0.1.
- Brand não-Elven (paleta de cliente substituindo) → escale; v0.2+.
- Material em en-US/es-LA → pt-BR only em v0.1.
- Precisa de animação/transição → out of roadmap; decks são print/PDF.

---

## Instalação

### Via npm global (recomendado)

```bash
npm install -g @elven-observability/decks-skill
decks-skill install
```

A instalação **não é automática** (sem `postinstall` mágico). Você roda `decks-skill install` explicitamente. Filosofia: instalação é ato consciente, audível, reversível.

O comando copia `skill/*` pra `~/.claude/skills/decks-skill/`. Em sessões Claude Code subsequentes, o skill aparece em `/skills` e pode ser invocado por nome ou por trigger semântico.

### Via npx (sem instalação global)

```bash
npx @elven-observability/decks-skill install
```

### Verificar instalação

```bash
decks-skill --version
ls ~/.claude/skills/decks-skill/SKILL.md
```

---

## Uso

### Pelo agente IA (Claude Code)

Em sessão nova, basta pedir:

```
use o skill decks-skill pra criar um deck client report sobre o incidente kontik
```

O agente carrega o skill, identifica o tipo (`client-report-deck`), copia o template, preenche placeholders, e gera o HTML deck no padrão.

### Manualmente

```bash
# 1. Scaffold
decks-skill new client-report kontik-zupper-incident-2026-05-08
cd kontik-zupper-incident-2026-05-08/

# 2. Edite deck.html + source-notes.md + qa-notes.md

# 3. Lint binário (10/10 obrigatório)
decks-skill lint deck.html

# 4. Preview visual (gera 1 PNG/slide + contact-sheet.png)
decks-skill preview deck.html

# 5. Render PDF final
decks-skill render deck.html --out kontik-zupper-incident-24h.pdf
```

### Workshop (multi-dia)

```bash
decks-skill new workshop observability-from-zero-to-hero
cd observability-from-zero-to-hero/

# Pra cada dia:
# - edite agenda/day-N.md (objetivo + agenda 90min + fechamento)
# - edite slides/day-N.md (narrativa source, planning)
# - edite html-slides/day-N.html (deck real)
# - escreva labs/day-N/lab.md (6 seções)
# - escreva materials/speaker-notes/day-N/NN-*.md (4 seções cada)
# - escreva materials/speaker-notes/day-N-script.md (teleprompter)

decks-skill lint html-slides/day-1.html
decks-skill preview html-slides/day-1.html
decks-skill render html-slides/day-1.html
```

### Lint contra deck existente

```bash
decks-skill lint html-slides/day-1.html
# → PASS html-slides/day-1.html (10/10)
# ou FAIL com mensagem específica por regra violada
```

---

## Estrutura

```
@elven-observability/decks-skill/
├── bin/decks-skill.js              # CLI (install, update, lint, render, preview, new, --version)
├── skill/                          # conteúdo distribuído (copiado pra ~/.claude/skills/)
│   ├── SKILL.md                    # entry point Anthropic
│   ├── templates/                  # 2 scaffolds canônicos
│   │   ├── client-report-deck/
│   │   └── workshop-mentorship-deck/
│   ├── layouts/                    # 12 HTML fragmentos exemplo (1 por layout)
│   ├── themes/                     # elven-deck.css + elven-deck.print.css
│   ├── reference/                  # 8 docs: brand-tokens, layout-catalog, component-catalog, editorial-voice, artifact-contract, quality-gate, speaker-notes-spec, glossary
│   ├── checklists/                 # pre-deliver, visual-qa, persona-coverage
│   ├── scripts/                    # lint.sh, render-deck.js, preview-deck.js
│   └── assets/                     # Elven logo + sample charts
└── tests/                          # fixtures pass+fail + test runners
```

---

## Tipos canônicos

| Template | Quando usar | Personas alvo | Companion artifacts |
|---|---|---|---|
| `client-report-deck` | Slide-style report consumido em PDF pelo cliente, sem presenter (incident review, comparativo, spike) | cliente-stakeholder, cliente-eng, cliente-sre | source-notes.md, qa-notes.md, preview/, contact-sheet.png |
| `workshop-mentorship-deck` | Mentoria/workshop multi-dia ao vivo com hands-on | turma-mentoria, instrutor-elven, onboarding | agenda/day-X.md, slides/day-X.md, labs/day-X/lab.md, materials/speaker-notes/day-X/NN-*.md, day-X-script.md, instructor-guide, participant-pack |

---

## Layouts canônicos

12 layouts. Cada slide do seu deck recebe **exatamente uma** classe `.layout-*`.

| # | Classe | Estrutura | Universal/Type-only |
|---|---|---|---|
| 01 | `.layout-cover` | gradient teal/blue, eyebrow, headline, KPI band opcional, logo | universal |
| 02 | `.layout-section-opener` | big number "0X" + section title + framing | universal |
| 03 | `.layout-executive-summary` | eyebrow, headline, 3 cards info, callout teal | universal |
| 04 | `.layout-thesis-evidence` | eyebrow, headline, 3 cards top-accent (red/amber/teal) | universal |
| 05 | `.layout-kpi-row` | 4 cards horizontais com number grande + label + desc | universal |
| 06 | `.layout-chart-and-cards` | chart esquerda (60%) + 3 blocos stack direita (40%) | universal |
| 07 | `.layout-chart-full` | chart full-width + footnote | universal |
| 08 | `.layout-code-and-callout` | code-panel + callout teal lado a lado | universal |
| 09 | `.layout-bullets-3` | 3 colunas de bullets com label bold | universal |
| 10 | `.layout-timeline` | linha horizontal com 3-5 markers alternando above/below | universal |
| 11 | `.layout-architecture` | dark bg, SVG diagram (boxes + arrows) | workshop-only |
| 12 | `.layout-closing` | takeaways grid 2-col + bloco "Próximo" | universal |

Catálogo completo em `skill/reference/layout-catalog.md` (após `decks-skill install`).

---

## Decisões de padronização

Resolvidas pelo skill com fonte canônica (PDF `kontik-zupper-incident-24h.pdf`, 8 maio 2026):

| # | Decisão | Por quê |
|---|---|---|
| D1 | Canvas 1280×720 (16:9) exato | Padrão presentation deck moderno |
| D2 | Paleta locked: teal `#00bfa5` accent, paper `#f4f7f8` bg, ink `#0f1923` text | Extraída do PDF kontik |
| D3 | Fonte: Inter (sans) + IBM Plex Mono (code), system fallback | Free, system fallback até v0.2 self-host |
| D4 | Numeração de slide `01, 02, …` via CSS counter `decimal-leading-zero` | Bottom-right, cor muted |
| D5 | Logo Elven canto superior direito, 92px | Brand consistency |
| D6 | Slide 01 SEMPRE `.layout-cover`; último SEMPRE `.layout-closing` | Convenção universal |
| D7 | Sem emojis em texto visível; use `.pill-chip` pra badge | WCAG 2.2 SC 1.1.1, espelha docs-skill E6 |
| D8 | 12 layouts canônicos, sem improvisação | Mesma filosofia "não inventa template" do docs-skill |
| D9 | pt-BR only em v0.1 | Espelha docs-skill |
| D10 | Single Elven theme em v0.1; multi-theme é v0.2+ | YAGNI até cliente pedir |

---

## Lint binário

10 itens automatizados em `skill/scripts/lint.sh`:

1. **L1** — DOCTYPE `<!DOCTYPE html>` + `<html lang="pt-BR">`
2. **L2** — `<title>` presente e não-vazio
3. **L3** — Theme CSS importado (`elven-deck.css` ou tokens canônicos inline)
4. **L4** — Elementos `.slide` presentes
5. **L5** — Canvas 1280×720 declarado (`--w/--h` ou hard-coded ou via theme link)
6. **L6** — Cada slide tem classe `.layout-*` canônica (1 de 12)
7. **L7** — Primeiro slide é `.layout-cover`
8. **L8** — Último slide é `.layout-closing`
9. **L9** — Numeração via CSS counter presente
10. **L10** — Sem emoji em texto visível (regex unicode ranges, skip `<pre>`/`<code>`)

PR (ou commit individual) só mergeia se 10/10 passarem.

Smoke-test em fixtures: `npm test:lint`.

---

## Render PDF + Preview

### Render PDF

```bash
decks-skill render deck.html --out output.pdf
```

Puppeteer headless Chromium → PDF 1280×720, 1 página/slide, `printBackground: true`, `margin: 0`. `deviceScaleFactor: 2` pra crispness.

### Preview PNG + contact-sheet

```bash
decks-skill preview deck.html
# default out-dir: ./preview/ + ./contact-sheet.png
```

Gera:

- `preview/slide-01.png`, `preview/slide-02.png`, … (1280×720 @2x cada)
- `contact-sheet.png` (grid 4 colunas com todas as miniaturas)

Use o contact-sheet pra QA visual rápido — bate `checklists/visual-qa.md` item a item antes do PDF final.

---

## Sibling skill — docs vs decks

`@elven-observability/decks-skill` tem um irmão: **[`@elven-observability/docs-skill`](https://www.npmjs.com/package/@elven-observability/docs-skill)**.

| Eixo | `docs-skill` | `decks-skill` |
|---|---|---|
| **Output** | `.md` + PDF flowing | HTML deck 16:9 + PDF slides |
| **Lint** | 10 regras estruturais sobre Markdown | 10 regras estruturais sobre HTML |
| **Templates** | 9 (5 docs + 4 PS reports) | 2 (client-report + workshop) |
| **Quando** | doc técnico, guia, report flowing | apresentação slides, mentoria, client deck |
| **Filosofia** | mesma: install não-automático, dependency-free CLI, lint binário, render Puppeteer |
| **Brand** | mesmo tokens Elven, codificados em cada skill |

Filosofia: skills separados por **forma de saída + consumidor**, não por brand. Os tokens vivem duplicados (mesma cor teal em ambos) até atingir regra-do-três pra extrair `@elven-observability/brand-tokens`.

---

## Contribuindo

PRs bem-vindos para:

- Fixtures adicionais (`tests/fixtures/`).
- Refinamento de mensagens de erro do `lint.sh`.
- Layouts novos — **mas apenas com fixture real** (≥1 deck Elven real usando o layout).
- Atualizar `reference/*.md` quando ajustar padrão.

PRs **NÃO** bem-vindos para:

- Adicionar templates de tipos sem fixture real (talk/keynote curto, internal demo) — abra issue primeiro.
- Suavizar L1-L10 sem evidência de drift real.
- Adicionar dependências runtime no CLI (mantenha dep-leve; Puppeteer/marked OK porque docs-skill já depende).
- Quebrar o brand contract (paleta, fontes, frame, numeração).

Workflow:

1. Fork → branch.
2. `npm test` deve passar localmente.
3. Atualizar `CHANGELOG.md` em `[Unreleased]`.
4. Bump de versão segue semver:
   - **patch (0.1.x)**: bugfix no lint, fixture nova, mensagem de erro
   - **minor (0.x.0)**: layout novo, template novo, decisão de padronização nova
   - **major (x.0.0)**: mudança quebrante em layout class, lint rule, ou brand token

---

## License

[MIT](LICENSE) © 2026 Elven Works.
