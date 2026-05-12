# Changelog

All notable changes to `@elven-observability/decks-skill` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.0] — 2026-05-12

### Added

- Two canonical templates: `client-report-deck` (kontik-style — slides PDF entregues ao cliente, sem presenter) and `workshop-mentorship-deck` ("Observability: From Zero to Hero" style — mentoria multi-dia com speaker notes + labs + agenda).
- 12 locked layout classes: `layout-cover`, `layout-section-opener`, `layout-executive-summary`, `layout-thesis-evidence`, `layout-kpi-row`, `layout-chart-and-cards`, `layout-chart-full`, `layout-code-and-callout`, `layout-bullets-3`, `layout-timeline`, `layout-architecture`, `layout-closing`.
- Single `themes/elven-deck.css` com brand tokens extraídos do PDF `kontik-zupper-incident-24h.pdf` (8 maio 2026): paleta (teal `#00bfa5`, paper `#f4f7f8`, ink `#0f1923`, ...), tipografia (Inter + IBM Plex Mono via system fallback), frame 1280×720, numeração CSS counter `decimal-leading-zero`.
- Atomic components: `.eyebrow`, `.headline`, `.subhead`, `.callout-banner`, `.code-panel`, `.pill-chip`, `.card-{fact,info,compare,step,kpi}`, `.logo-block`, `.footer-meta`.
- Binary lint with 10 rules (`decks-skill lint`): DOCTYPE+lang, `<title>`, theme imported, `.slide` markup, canvas 1280×720, canonical layout class per slide, cover-first, closing-last, CSS counter, no emoji in visible body.
- Puppeteer render to PDF (`decks-skill render`): 1280×720, 1 page per slide, print backgrounds, no margins.
- Puppeteer preview to PNGs + contact-sheet (`decks-skill preview`).
- Scaffold command (`decks-skill new client-report|workshop <slug>`).
- Install flow parity with `@elven-observability/docs-skill`: `npm i -g … && decks-skill install` copies `skill/*` to `~/.claude/skills/decks-skill/`.
- 8 reference docs: `brand-tokens`, `layout-catalog`, `component-catalog`, `editorial-voice`, `artifact-contract`, `quality-gate`, `speaker-notes-spec`, `glossary`.
- 3 checklists: `pre-deliver`, `visual-qa`, `persona-coverage`.
- 8 lint fixtures (2 pass + 6 fail) com mensagens de erro específicas.
- Tests: `lint.test.sh`, `render-pdf.test.sh`, `preview.test.sh`.

### Not in scope (deferred to v0.2+)

- Talk/keynote single-session template (sem fixture real).
- Internal company decks (all-hands, sprint demo).
- Multi-theme (paleta cliente substituindo Elven).
- Self-hosted fonts (Inter + IBM Plex Mono via @font-face).
- Markdown narrativo → HTML deck (conversão automática).
- pt → en translation.
- Animação/transição em slides (deck é print/PDF).
