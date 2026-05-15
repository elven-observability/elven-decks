# `@elven-observability/decks-skill`

**Apresentações da Elven Works, sempre no mesmo padrão visual — sem improviso.**

Um pacote npm que instala um *skill* no Claude Code. Depois de instalado, qualquer pessoa do time (ou o próprio agente de IA) gera decks 16:9 com **identidade visual idêntica**, **lint que reprova drift**, e **PDF pronto pra entregar** — tudo com 3 comandos.

> Skill irmã: **[`@elven-observability/docs-skill`](https://www.npmjs.com/package/@elven-observability/docs-skill)** faz documentação e relatórios em texto corrido. Este aqui faz **slides**.

---

## Índice

- [Comece em 60 segundos](#comece-em-60-segundos)
- [Por que esse skill existe](#por-que-esse-skill-existe)
- [Instalação](#instalação)
- [Seu primeiro deck, passo a passo](#seu-primeiro-deck-passo-a-passo)
- [Os 2 tipos de deck](#os-2-tipos-de-deck)
- [Os 12 layouts](#os-12-layouts)
- [Todos os comandos](#todos-os-comandos)
- [Como o lint funciona](#como-o-lint-funciona)
- [Usando com o Claude Code (agente IA)](#usando-com-o-claude-code-agente-ia)
- [Perguntas frequentes](#perguntas-frequentes)
- [O contrato visual](#o-contrato-visual)
- [Estrutura do pacote](#estrutura-do-pacote)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Comece em 60 segundos

```bash
# 1. Instala (uma vez por máquina)
npm install -g @elven-observability/decks-skill
decks-skill install

# 2. Cria um deck novo
decks-skill new client-report meu-primeiro-deck
cd meu-primeiro-deck

# 3. Edita o deck.html, depois:
decks-skill lint deck.html       # 10/10 obrigatório
decks-skill preview deck.html    # gera PNGs pra revisar
decks-skill render deck.html     # gera o PDF final
```

Pronto. Você tem um PDF 1280×720 no padrão visual da Elven, com paleta, fontes, logo, numeração e layout travados.

---

## Por que esse skill existe

Antes: cada pessoa montava deck do seu jeito. Cores diferentes, fontes diferentes, espaçamento torto, logo em lugar aleatório. Cliente recebia coisas que não pareciam da mesma empresa.

Depois: **um padrão, codificado em código.**

- A paleta, as fontes e o frame 16:9 vêm de um CSS único e travado (`elven-deck.css`), extraído de um deck real aprovado (o PDF de incidente do cliente kontik).
- Você escolhe entre **12 layouts canônicos** — e só. Sem inventar slide novo no meio do caminho.
- Um **lint binário** roda 10 verificações estruturais. Se algo fugiu do padrão, ele reprova **antes** de chegar no cliente.
- O **render** transforma o HTML em PDF com Puppeteer — mesma saída em qualquer máquina.

Resultado: qualquer engenheiro Elven, designer, ou agente de IA produz deck com a mesma qualidade. O padrão deixa de depender de quem fez.

---

## Instalação

### Recomendado — npm global

```bash
npm install -g @elven-observability/decks-skill
decks-skill install
```

O `decks-skill install` copia o conteúdo do skill para `~/.claude/skills/decks-skill/`. A instalação **não é automática de propósito** — você roda o comando conscientemente. Numa nova sessão do Claude Code, o skill aparece em `/skills`.

### Sem instalar nada global — npx

```bash
npx @elven-observability/decks-skill install
```

### Conferir que deu certo

```bash
decks-skill --version              # → 0.1.0
ls ~/.claude/skills/decks-skill/    # → SKILL.md, templates/, themes/, ...
```

### Requisitos

- **Node.js 18+**
- O primeiro `npm install` baixa o Chromium do Puppeteer (~200 MB) — usado pra gerar PDF e preview. Numa máquina sem internet liberada, isso pode falhar; nesse caso fale com o time de infra.

---

## Seu primeiro deck, passo a passo

### 1. Escolha o tipo

Pergunta única: **quem vai consumir o deck?**

- Cliente lendo um PDF sozinho, sem ninguém apresentando → **`client-report`**
- Turma numa sala, com instrutor ao vivo, multi-dia → **`workshop`**

### 2. Crie o scaffold

```bash
decks-skill new client-report kontik-incidente-2026-05-08
cd kontik-incidente-2026-05-08
```

Você recebe uma pasta já montada:

```
kontik-incidente-2026-05-08/
├── deck.html          ← seu deck (já passa no lint, com placeholders)
├── elven-deck.css     ← o tema (não edite)
├── source-notes.md    ← anote de onde vieram os dados
├── qa-notes.md        ← checklist antes de entregar
└── assets/            ← logo + gráficos
```

### 3. Edite o `deck.html`

Abra o `deck.html`. Ele já tem 3 slides válidos (capa, resumo executivo, fechamento) e, em comentários, os outros 9 layouts prontos pra descomentar. Cada slide é uma `<section class="slide layout-XXX">`.

Precisa saber qual layout usar? Veja [Os 12 layouts](#os-12-layouts) abaixo, ou abra `~/.claude/skills/decks-skill/reference/layout-catalog.md`.

### 4. Rode o lint

```bash
decks-skill lint deck.html
```

Saída esperada:

```
PASS deck.html (10/10)

Summary: 1 pass / 0 fail
```

Se reprovar, a mensagem diz exatamente qual regra (L1–L10) e por quê. Conserte e rode de novo.

### 5. Revise visualmente

```bash
decks-skill preview deck.html
```

Isso gera `preview/slide-01.png`, `slide-02.png`, … e um `contact-sheet.png` com todos os slides em grade. Abra o contact-sheet e procure: texto cortado, contraste ruim, card desalinhado. Conserte antes do PDF.

### 6. Gere o PDF

```bash
decks-skill render deck.html --out kontik-incidente-24h.pdf
```

PDF 1280×720, uma página por slide, pronto pra mandar.

### 7. Antes de entregar

Abra `qa-notes.md` (já veio na pasta) e bata item a item. É o último filtro.

---

## Os 2 tipos de deck

| | `client-report` | `workshop` |
|---|---|---|
| **Quem consome** | Cliente lendo um PDF | Turma + instrutor ao vivo |
| **Formato** | Um deck só | Multi-dia |
| **Vem com** | `deck.html`, `source-notes.md`, `qa-notes.md` | `agenda/`, `slides/`, `html-slides/`, `labs/`, `materials/` (speaker notes, scripts, guias) |
| **Speaker notes** | Não | Sim — 4 seções obrigatórias por slide |
| **Labs hands-on** | Não | Sim — um por dia |
| **Exemplo canônico** | Relatório de incidente kontik | "Observability: From Zero to Hero" (3 dias) |

Os dois usam **exatamente o mesmo contrato visual**. O que muda são os artefatos que acompanham.

---

## Os 12 layouts

Cada slide do seu deck recebe **uma** classe `.layout-*`. Não existe layout fora dessa lista.

| Layout | Pra que serve |
|---|---|
| `.layout-cover` | Capa. Sempre o slide 01. Gradiente teal/azul, headline grande, KPIs opcionais. |
| `.layout-section-opener` | Abre uma seção. Número grande + título da seção. |
| `.layout-executive-summary` | Resumo executivo. Headline + 3 cards + "Leitura final". |
| `.layout-thesis-evidence` | Tese + 3 evidências com tarja colorida (vermelho/amarelo/teal). |
| `.layout-kpi-row` | 4 números-chave lado a lado. |
| `.layout-chart-and-cards` | Gráfico à esquerda + 3 blocos à direita. |
| `.layout-chart-full` | Um gráfico grande ocupando o slide. |
| `.layout-code-and-callout` | Trecho de código + interpretação. |
| `.layout-bullets-3` | 3 colunas de bullets. |
| `.layout-timeline` | Linha do tempo com 3–5 marcos. |
| `.layout-architecture` | Diagrama de arquitetura (fundo escuro). Workshop. |
| `.layout-closing` | Fechamento. Sempre o último slide. Takeaways + próximos passos. |

Cada layout tem um exemplo HTML completo e renderizável em `~/.claude/skills/decks-skill/layouts/`. Abra qualquer um no navegador pra ver.

> **Regra de ouro:** o slide 01 é sempre `cover`, o último é sempre `closing`. O lint reprova se não for.

---

## Todos os comandos

```bash
decks-skill install [--force]
```
Copia o skill pra `~/.claude/skills/decks-skill/`. `--force` sobrescreve sem perguntar.

```bash
decks-skill update
```
Atualiza o skill instalado (igual a `install --force`). Use depois de `npm update -g`.

```bash
decks-skill new <client-report|workshop> <nome>
```
Cria uma pasta nova a partir do template. Ex: `decks-skill new workshop curso-otel-2026`.

```bash
decks-skill lint <arquivo.html> [<arquivo.html>...]
```
Roda as 10 verificações. Exit 0 = passou tudo; exit 1 = reprovou. Aceita vários arquivos.

```bash
decks-skill render <arquivo.html> [--out <saida.pdf>]
```
Gera o PDF (Puppeteer, 1280×720, uma página por slide). Sem `--out`, salva ao lado do `.html`.

```bash
decks-skill preview <arquivo.html> [--out-dir <pasta>]
```
Gera um PNG por slide + um `contact-sheet.png` com todos juntos. Pra QA visual.

```bash
decks-skill --version      # imprime a versão
decks-skill --help         # imprime a ajuda
```

---

## Como o lint funciona

O lint é **binário**: ou passa 10/10, ou reprova. Cada regra checa uma coisa estrutural do HTML:

| Regra | O que verifica |
|---|---|
| **L1** | `<!DOCTYPE html>` + `<html lang="pt-BR">` |
| **L2** | `<title>` presente e não-vazio |
| **L3** | Tema importado (`elven-deck.css` ou tokens inline) |
| **L4** | Existe pelo menos um elemento `.slide` |
| **L5** | Canvas declarado como 1280×720 |
| **L6** | Todo slide tem uma classe `.layout-*` canônica |
| **L7** | O primeiro slide é `.layout-cover` |
| **L8** | O último slide é `.layout-closing` |
| **L9** | Numeração de slides via CSS counter |
| **L10** | Nenhum emoji no texto visível (use `.pill-chip` no lugar) |

Quando reprova, a saída diz a regra e o motivo:

```
FAIL deck.html (9/10):
  - L7: first slide is not .layout-cover
```

Use o lint como **gate**: nada vai pro cliente sem 10/10.

---

## Usando com o Claude Code (agente IA)

Esse pacote é, antes de tudo, um *skill* de IA. Depois de `decks-skill install`, abra uma sessão do Claude Code e simplesmente peça:

```
cria um deck client-report sobre o incidente do cliente X usando o decks-skill
```

O agente carrega o skill, identifica o tipo, monta o scaffold, escolhe os layouts certos, preenche o conteúdo, roda o lint e gera o PDF — tudo no padrão da casa. Os 8 documentos de referência (`reference/`) e os 3 checklists guiam o agente passo a passo.

---

## Perguntas frequentes

**O PDF saiu com fonte errada / sem o visual certo.**
O tema usa Inter e IBM Plex Mono via fallback do sistema. Em máquina/CI sem essas fontes, o render cai numa fonte genérica. Instale as fontes localmente ou rode o render numa máquina que já as tenha. Self-host das fontes está no roadmap v0.2.

**Posso criar um layout novo?**
Não na v0.1. Os 12 layouts são o contrato. Se faltar algo de verdade, abra uma *issue* com um exemplo de deck real que precise dele — layouts entram com evidência, não por palpite.

**Posso usar a cor/logo de um cliente em vez da Elven?**
Ainda não. A v0.1 tem um tema só (Elven). Multi-tema é v0.2+, quando algum cliente realmente exigir.

**Funciona em inglês?**
A v0.1 é pt-BR apenas, igual à `docs-skill`. Tradução é roadmap futuro.

**`decks-skill: command not found` depois do install.**
O `npm install -g` instala num diretório que precisa estar no `PATH`. Rode `npm bin -g` pra ver onde, e confira seu `PATH`. Ou use `npx @elven-observability/decks-skill ...`.

**Preciso disso pra um relatório em texto corrido (não slides).**
Esse não é o skill certo. Use **[`@elven-observability/docs-skill`](https://www.npmjs.com/package/@elven-observability/docs-skill)**.

**O `render`/`preview` está lento.**
A primeira execução sobe o Chromium do Puppeteer. As seguintes são rápidas. Cada render leva poucos segundos.

---

## O contrato visual

Tudo abaixo é **travado** na v0.1 — mexer quebra o padrão e reprova no lint.

**Paleta** (extraída de um deck real aprovado):

| Token | Cor | Uso |
|---|---|---|
| `--teal` | `#00bfa5` | accent principal — eyebrow, callout, KPI positivo |
| `--paper` | `#f4f7f8` | fundo do slide |
| `--ink` | `#0f1923` | texto principal |
| `--red` | `#ff5252` | erro, KPI negativo |
| `--amber` | `#fbbf24` | atenção, warning |

**Tipografia:** Inter (texto) + IBM Plex Mono (código).
**Frame:** 1280×720 (16:9), numeração `01, 02, …` no canto inferior direito, logo Elven no canto superior direito.

Detalhes completos: `~/.claude/skills/decks-skill/reference/brand-tokens.md`.

---

## Estrutura do pacote

```
@elven-observability/decks-skill/
├── bin/decks-skill.js          # a CLI
└── skill/                      # o que é copiado pra ~/.claude/skills/
    ├── SKILL.md                # ponto de entrada do agente IA
    ├── templates/              # os 2 scaffolds (client-report, workshop)
    ├── layouts/                # 12 exemplos HTML, um por layout
    ├── themes/                 # elven-deck.css (o tema travado)
    ├── reference/              # 8 docs: brand, layouts, componentes, voz editorial, etc.
    ├── checklists/             # pre-deliver, visual-qa, persona-coverage
    ├── scripts/                # lint.sh, render-deck.js, preview-deck.js
    └── assets/                 # logo Elven + gráficos de exemplo
```

---

## Contribuindo

Bem-vindo:

- Fixtures de teste novas (`tests/fixtures/`).
- Mensagens de erro do lint mais claras.
- Layout novo — **com um deck real que precise dele** anexado à issue.

Não bem-vindo (abra issue antes):

- Tipos de deck sem caso real (talk curto, demo interna).
- Afrouxar regras L1–L10 sem evidência de drift.
- Dependências novas no CLI.
- Quebrar o contrato visual (paleta, fontes, frame).

Fluxo: fork → branch → `npm test` passando → atualizar `CHANGELOG.md` → PR. Versionamento segue [SemVer](https://semver.org/).

---

## Licença

[MIT](LICENSE) © 2026 Elven Works.
