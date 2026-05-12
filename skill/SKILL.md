---
name: elven-decks-skill
description: |
  Padroniza criação, revisão e renderização (PDF + preview PNG) de apresentações
  16:9 da Elven Works. Cobre 2 tipos canônicos: client-report-deck (kontik-style,
  cliente lê PDF sem presenter) e workshop-mentorship-deck (mentoria multi-dia
  com speaker notes + labs + agenda). Aplica 12 layouts canônicos, paleta e
  fontes locked do brand Elven, lint binário 10/10, e render Puppeteer.
  Use SEMPRE que o usuário pedir "criar deck", "fazer apresentação cliente",
  "workshop multi-dia", "report visual incidente", ou quando for redigir/revisar
  HTML de slide Elven. NÃO use para docs flowing (use @elven-observability/docs-skill),
  talk/keynote curto single-session (v0.2+), internal demo, ou brand não-Elven.
---

# Elven Decks Skill

Skill que produz decks Elven Works no padrão da casa — identidade visual idêntica ao PDF `kontik-zupper-incident-24h.pdf` — sem improvisar em cor, fonte ou layout.

---

## Antes de começar — checagem rápida

Pare e responda:

1. **Tipo do deck ∈ {`client-report-deck`, `workshop-mentorship-deck`}?** Se for talk/keynote curto single-session, internal demo (all-hands, sprint), ou outro tipo, **PARE — out of scope v0.1**. Resposta ao usuário: "Esse tipo ainda não tem template canônico no decks-skill. Abre issue em https://github.com/elven-observability/elven-decks; por enquanto escreve sem skill ou, se o material couber em flowing, usa `@elven-observability/docs-skill`."
2. **É pt-BR?** Se en-US/es-LA, **PARE** — v0.1 é pt-BR-only.
3. **Brand é Elven Works?** Se cliente exige brand próprio (logo, paleta), **PARE** e escale — v0.1 tem só Elven theme; multi-theme é v0.2+.

Se passou nas 3 verificações, siga abaixo.

---

## Workflow (12 passos)

### Passo 1 — Identificar o tipo

Árvore binária. Pergunta única: **"Quem vai consumir o deck?"**

- **a)** Cliente lendo PDF assincronamente, sem presenter → **`client-report-deck`**
  - Exemplo canônico: `kontik-zupper-incident-2026-05-08/kontik-zupper-incident-24h.pdf`
- **b)** Turma em sala + instrutor ao vivo, multi-dia, com labs hands-on → **`workshop-mentorship-deck`**
  - Exemplo canônico: "Observability: From Zero to Hero" (3 dias) em `Mentoring/`
- **c)** Nenhum dos dois → **PARE**. Não improvise tipo.

### Passo 2 — Scaffold

```bash
# Para client report
decks-skill new client-report kontik-zupper-incident-2026-05-08

# Para workshop multi-dia
decks-skill new workshop curso-observabilidade-2026
```

Cria pasta com placeholders preenchidos em pt-BR. Edite a partir daí.

### Passo 3 — Metadata e cabeça

No HTML deck:

- `<html lang="pt-BR">` (lint L1 exige)
- `<title>` descritivo (`Cliente | Tipo | Período` por convenção client-report; `Curso — Dia X` por convenção workshop)
- `<link rel="stylesheet" href="elven-deck.css">` (ou caminho equivalente)

Para workshop, preencha também `README.md`, `agenda/day-X.md`, e cada cabeçalho de `materials/speaker-notes/day-X/NN-*.md`.

### Passo 4 — Estruturar narrativa

**Workshop**: esboce em `slides/day-X.md` (markdown narrativo, planning, opcional mas recomendado): um `## Slide NN — título` por slide, com 1-2 parágrafos do que ele ensina. Esse markdown não vai ser renderizado — é só sua mapeação da história.

**Client-report**: esboce direto na ordem do HTML. Sempre slide 01 = `cover`, slide 02 = `executive-summary` OU `thesis-evidence`, slide final = `closing`.

### Passo 5 — Escolher layouts

Cada slide recebe **uma e apenas uma** classe da library de 12. Catálogo em `reference/layout-catalog.md`. **Não invente layouts novos** — se faltar algo, abra issue.

| # | Classe | Quando usar |
|---|---|---|
| 01 | `.layout-cover` | sempre slide 01 (cliente\|evento, headline, KPIs opcionais) |
| 02 | `.layout-section-opener` | abertura de bloco/seção (big number + section title) |
| 03 | `.layout-executive-summary` | TL;DR com 3 cards + leitura final |
| 04 | `.layout-thesis-evidence` | tese forte + 3 cards numerados de evidência |
| 05 | `.layout-kpi-row` | abertura com 4 números-chave |
| 06 | `.layout-chart-and-cards` | gráfico esquerda + 3 blocos direita |
| 07 | `.layout-chart-full` | gráfico full-width + footnote |
| 08 | `.layout-code-and-callout` | trecho de código + interpretação teal |
| 09 | `.layout-bullets-3` | 3 colunas de bullets (comparação, dimensões) |
| 10 | `.layout-timeline` | linha do tempo com 3-5 marcos |
| 11 | `.layout-architecture` | diagrama de arquitetura SVG (dark bg, workshop-only) |
| 12 | `.layout-closing` | sempre último slide (takeaways + próximos passos) |

### Passo 6 — Preencher conteúdo

- **Eyebrow** (sempre): `<span class="eyebrow">` — small caps, 12-30 chars. Traço esquerdo teal é automático.
- **Headline**: Inter bold, até 3 linhas. Em headline-tese estilo kontik, termina sem ponto final ou com ponto final apenas se for declaração concreta.
- **Body**: cards `.card-fact / .card-info / .card-compare / .card-step / .card-kpi`.
- **Callouts**: SEMPRE `.callout-banner` com `<span class="label">` tipado: `Leitura final:`, `Interpretação:`, `Atenção:`, `Importante:`.
- **Código**: SEMPRE em `<pre class="code-panel">` (fundo dark, fonte IBM Plex Mono). Código inline: `<code>` (background sutil automático).
- **Variáveis e nomes técnicos**: sempre em `<code>` (`NODE_OPTIONS`, `payment_form_id`, `MYSQL-SERVER-01`).
- **Sem emojis**. Use texto: `<span class="pill-chip is-good">OK</span>` / `is-bad`/`is-warn`.

### Passo 7 — (Workshop only) Speaker notes

Cada slide vira **um arquivo** `materials/speaker-notes/day-X/NN-slug.md` com **4 seções obrigatórias na ordem exata**:

```markdown
# Slide NN — Título do slide

## Objetivo do slide

(1-2 frases: o que esse slide precisa fazer na cabeça da plateia)

## Fala pronta

(parágrafos em pt-BR, primeira pessoa, ritmo de fala real. Sem meta-comentário tipo "esse slide serve pra...". Quem lê deve poder falar isso.)

## Interação opcional

(uma pergunta pra plateia, ou um momento de pausa proposital. Pode ficar vazia se o slide não pede.)

## Versão curta

(1 frase resumindo tudo, pra quando o tempo está apertado.)
```

E um `materials/speaker-notes/day-X-script.md` teleprompter contínuo costurando tudo, sem meta-comentário.

Spec completa: `reference/speaker-notes-spec.md`.

### Passo 8 — (Workshop only) Labs

Cada dia: `labs/day-X/lab.md` com seções obrigatórias:

```markdown
# Lab do Dia X — Título

## O que se prova
## Pré-requisitos
## Execução
## Sucesso
## Falhas esperadas
## Debrief
```

E `labs/shared-scenario.md` se houver cenário compartilhado entre dias.

### Passo 9 — Lint binário

```bash
# Para client-report:
decks-skill lint kontik-zupper-incident-24h.html

# Para workshop:
decks-skill lint html-slides/day-1.html
```

Esperado: `exit 0` com `10/10`. Resolver TODOS os warnings antes de prosseguir. Gate de entrega é 10/10.

10 regras:

| # | Regra |
|---|---|
| L1 | DOCTYPE + `<html lang="pt-BR">` |
| L2 | `<title>` presente e não-vazio |
| L3 | Theme CSS importado (link OU tokens canônicos inline) |
| L4 | Elementos `.slide` presentes |
| L5 | Canvas 1280×720 declarado |
| L6 | Cada slide tem classe `.layout-*` canônica (1 dos 12) |
| L7 | Primeiro slide é `.layout-cover` |
| L8 | Último slide é `.layout-closing` |
| L9 | Numeração via CSS counter (presente no theme) |
| L10 | Sem emoji em texto visível do deck |

### Passo 10 — Preview visual

```bash
decks-skill preview kontik-zupper-incident-24h.html
```

Gera:

- `preview/slide-NN.png` (um por slide, 1280×720 @2x)
- `contact-sheet.png` (grid 4 colunas com todos os slides)

**Abra o contact-sheet** e bata `checklists/visual-qa.md` item a item: overflow, contraste, alinhamento, banner cobrindo card, headline >3 linhas, eyebrow >30 chars. **Resolva todos antes do PDF final.**

### Passo 11 — Render PDF

```bash
decks-skill render kontik-zupper-incident-24h.html --out kontik-zupper-incident-24h.pdf
```

PDF saída: 1280×720, 1 página por slide, fundo preservado, margem zero. Abra em `Preview.app` (macOS) ou Adobe Reader pra checar que está print-clean.

### Passo 12 — Pre-deliver

Abra `checklists/pre-deliver.md` e bata item a item. Cobre o que o lint não pega: conteúdo verificado contra `source-notes.md`, cliente/data no cover, speaker notes prontas pra fala, PDF abre limpo em viewer externo.

Só mande quando 100% bate.

---

## Triggers explícitos

### Use ESTE skill quando o usuário diz

- "criar deck pra cliente sobre \<X\>"
- "fazer apresentação de incidente \<Y\>"
- "preparar mentoria/workshop multi-dia sobre \<Z\>"
- "atualizar slides do workshop de observabilidade"
- "gerar PDF deck do report \<W\>"
- "lintar deck antes de mandar"
- "preview/contact-sheet do deck \<V\>"
- "client report visual"
- "novo dia de workshop"

### NÃO use ESTE skill quando

- O material é **doc flowing** (relatório de texto contínuo, guia técnico) → use **`@elven-observability/docs-skill`**.
- É **talk/keynote single-session curto** sem labs → out of scope v0.1, abrir issue.
- É **internal demo casual** (all-hands, sprint demo, planning) → out of scope v0.1.
- Brand é **não-Elven** (paleta do cliente substituindo) → escale; v0.2+.
- Material é **en-US/es-LA** → pt-BR only em v0.1.
- Quer **animação/transição** entre slides → não está no roadmap; decks são print/PDF.

Se ambíguo, **pergunte ao usuário em vez de improvisar**.

---

## Personas alvo (declaradas no frontmatter ou audience metadata)

| Persona | Quem é |
|---|---|
| `cliente-stakeholder` | C-level ou líder de área no cliente, lendo PDF report sem contexto técnico profundo |
| `cliente-eng` | Engenheiro do cliente, lendo análise técnica e seguindo runbook |
| `cliente-sre` | SRE do cliente operando incident response |
| `turma-mentoria` | Engenheiros em treinamento multi-dia, todos pt-BR |
| `instrutor-elven` | Engenheiro Elven entregando a mentoria ao vivo |
| `agente-ia` | Sentinel, Claude Code, ou outro AI redigindo/revisando deck |

Matriz template × audience: `checklists/persona-coverage.md`.

---

## Recursos do skill

- **Templates**: `templates/{client-report-deck,workshop-mentorship-deck}/`
- **Layouts canônicos (HTML)**: `layouts/01-cover.html` … `12-closing.html`
- **Catálogo de layouts**: `reference/layout-catalog.md`
- **Catálogo de componentes atômicos**: `reference/component-catalog.md`
- **Tema CSS**: `themes/elven-deck.css` + `themes/elven-deck.print.css`
- **Brand tokens (locked)**: `reference/brand-tokens.md`
- **Voz editorial**: `reference/editorial-voice.md`
- **Spec de speaker notes**: `reference/speaker-notes-spec.md`
- **Quality gates**: `reference/quality-gate.md`
- **Artifact contract**: `reference/artifact-contract.md`
- **Glossário**: `reference/glossary.md`
- **Checklists**: `checklists/pre-deliver.md`, `visual-qa.md`, `persona-coverage.md`
- **Scripts**: `scripts/lint.sh`, `render-deck.js`, `preview-deck.js`
- **Exemplos vivos**: `examples/`

---

## O que esse skill DELIBERADAMENTE não faz

- **Não inventa layout pra slide que não cabe nos 12.** Abra issue no repo.
- **Não migra decks legados automaticamente.** Migração visual é PR humano-supervisionado.
- **Não traduz pt→en.** v0.1 é pt-BR-only.
- **Não converte markdown narrativo → HTML deck.** O fluxo direto é editar HTML; markdown em `slides/day-X.md` é só planning auxiliar.
- **Não anima.** Slides são print/PDF; live deck também é estático.
- **Não suporta brand não-Elven.** Multi-theme é v0.2+ quando algum cliente pedir.
- **Não lintha prosa.** Lint v0.1 é estrutural (regras 10/10). Vale/markdownlint pra prosa é roadmap pós-v0.1.
- **Não substitui review humano.** Lint + checklist + visual QA são guard-rails; review final é seu.
