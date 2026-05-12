# Layout catalog — 12 canonical layouts

Cada layout é uma classe CSS em `themes/elven-deck.css`. Cada slide do seu deck recebe **exatamente uma** classe `.layout-*`. Lint L6 falha o slide que não tem layout canônico ou usa layout não listado.

Para ver markup vivo, abra os arquivos em `layouts/NN-<nome>.html` — eles renderizam standalone no browser.

---

## 01 — `.layout-cover`

**Quando**: sempre slide 01. Único slide com gradient teal/blue. Anuncia cliente + evento + janela temporal + KPIs-âncora.

**Estrutura**:

```html
<section class="slide cover layout-cover">
  <div>
    <span class="eyebrow">CLIENTE | EVENTO — CONTEXTO</span>
    <h1 class="headline is-large">Headline tese principal.</h1>
    <p class="subhead">Subtítulo descritivo com janela temporal.</p>
  </div>
  <div class="kpi-band">
    <div class="item"><div class="value">…</div><div class="label">…</div></div>
    <!-- 4 items -->
  </div>
  <span class="footer-meta">Fonte: …</span>
  <img class="logo-block" src="…/elven-logo.png" alt="Elven" />
</section>
```

**Variantes**:

- Sem KPI band: omitir `.kpi-band` div. Headline ocupa mais espaço.

**Anti-patterns**: cover light (sempre dark gradient); cover sem eyebrow; cover com mais de 1 headline.

---

## 02 — `.layout-section-opener`

**Quando**: abrir uma seção/bloco grande dentro de um deck longo. Big number + section title.

**Estrutura**:

```html
<section class="slide layout-section-opener">
  <div class="big-number">02</div>
  <div>
    <span class="eyebrow">Bloco 2 — Teoria</span>
    <h2 class="section-title">Runtime suite fora do Kubernetes.</h2>
    <p class="framing">Frase curta de framing.</p>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

**Variantes**:

- `.slide.dark`: section opener escuro (em workshop, transição visual)
- `.slide.split-dark`: gradient 48/52 dark→paper (raro, mais premium)

---

## 03 — `.layout-executive-summary`

**Quando**: TL;DR do deck. Headline-tese + 3 cards explicando + leitura final teal.

**Estrutura**:

```html
<section class="slide layout-executive-summary">
  <span class="eyebrow">Resumo executivo</span>
  <h1 class="headline">Tese principal em 2-3 linhas.</h1>
  <div class="cards">
    <div class="card-info">
      <h3>1. Primeiro pilar</h3>
      <p>Explicação 2-3 linhas.</p>
    </div>
    <div class="card-info">
      <h3>2. Segundo pilar</h3><p>…</p>
    </div>
    <div class="card-info">
      <h3>3. Terceiro pilar</h3><p>…</p>
    </div>
  </div>
  <div class="callout-banner">
    <span class="label">Leitura final:</span>
    <p>Frase de fechamento da tese.</p>
  </div>
  <span class="footer-meta">Período analisado: …</span>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

**Quando NÃO usar**: se a tese fica melhor com 3 cards numerados de **evidência** (1, 2, 3 numerados explicitamente), use `.layout-thesis-evidence`.

---

## 04 — `.layout-thesis-evidence`

**Quando**: depois do executive-summary, quando quer aprofundar um ponto com 3 evidências numeradas/coloridas. Ou no kontik slide-05 estilo "headline + 3 colunas com top-accent colorido".

**Estrutura**:

```html
<section class="slide layout-thesis-evidence">
  <span class="eyebrow">Ponto de virada</span>
  <h1 class="headline">Tese declarativa.</h1>
  <div class="cards">
    <div class="card-compare is-bad">
      <h3>Identificador técnico</h3>
      <p>Descrição da evidência negativa.</p>
    </div>
    <div class="card-compare is-warn">
      <h3>13:50</h3>
      <p>Evidência de atenção.</p>
    </div>
    <div class="card-compare is-good">
      <h3>+31%</h3>
      <p>Evidência positiva.</p>
    </div>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

**Variantes de cor**: `is-good` (teal), `is-warn` (amber), `is-bad` (red), `is-info` (blue).

---

## 05 — `.layout-kpi-row`

**Quando**: abrir análise com 4 números-chave que ancoram tudo. Ou meio do deck com snapshot quantitativo.

**Estrutura**:

```html
<section class="slide layout-kpi-row">
  <span class="eyebrow">Métricas-chave</span>
  <h1 class="headline">Frase curta sobre o que os números mostram.</h1>
  <div class="cards">
    <div class="card-kpi">
      <div class="value">13:47</div>
      <div class="label">Último erro fatal</div>
      <div class="desc">Descrição em 1-2 linhas.</div>
    </div>
    <!-- 4 cards total -->
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

---

## 06 — `.layout-chart-and-cards`

**Quando**: slide com gráfico forte + 3 blocos contextuais ao lado. Padrão kontik slide-05/08.

**Estrutura**:

```html
<section class="slide layout-chart-and-cards">
  <div class="header">
    <span class="eyebrow">Categoria</span>
    <h1 class="headline">Headline contextualizando o que o gráfico mostra.</h1>
  </div>
  <div class="chart">
    <p class="chart-title">TÍTULO DO GRÁFICO</p>
    <img src="…/chart.svg" alt="…" />
    <p class="chart-caption">Caption explicando o que o gráfico mostra.</p>
  </div>
  <div class="right">
    <div class="card-compare is-bad">…</div>
    <div class="card-compare is-warn">…</div>
    <div class="card-compare is-good">…</div>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

A coluna direita aceita: `.card-compare`, `.card-info`, `.code-panel`, `.callout-banner`. Mix livre, mas mantenha 3 blocos pra equilíbrio visual.

---

## 07 — `.layout-chart-full`

**Quando**: o gráfico é o argumento, ele precisa ocupar a maior parte do slide.

**Estrutura**:

```html
<section class="slide layout-chart-full">
  <span class="eyebrow">Categoria</span>
  <h1 class="headline">Headline curto.</h1>
  <div class="chart">
    <img src="…/chart.svg" alt="…" />
  </div>
  <p class="footnote">Janela analisada + fontes.</p>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

---

## 08 — `.layout-code-and-callout`

**Quando**: mostrar trecho de código + interpretação. Padrão kontik slide-08.

**Estrutura**:

```html
<section class="slide layout-code-and-callout">
  <div class="header">
    <span class="eyebrow">Inspeção read-only</span>
    <h1 class="headline">O que o código faz, em uma frase.</h1>
  </div>
  <pre class="code-panel">trecho de código
  comentário inline
  retorno: x</pre>
  <div class="callout-banner">
    <span class="label">Interpretação:</span>
    <p>O que isso significa em termos operacionais.</p>
  </div>
  <span class="footer-meta">LogQL: …; arquivo: …</span>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

---

## 09 — `.layout-bullets-3`

**Quando**: 3 dimensões de uma comparação, sem gráfico. Cada coluna tem título + parágrafo.

**Estrutura**:

```html
<section class="slide layout-bullets-3">
  <span class="eyebrow">Três visões</span>
  <h1 class="headline">Frase contextualizando as 3 dimensões.</h1>
  <div class="cols">
    <div class="col">
      <h3>Dimensão A</h3>
      <p>Parágrafo 2-3 linhas.</p>
    </div>
    <div class="col">
      <h3>Dimensão B</h3>
      <p>…</p>
    </div>
    <div class="col">
      <h3>Dimensão C</h3>
      <p>…</p>
    </div>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

Bordas verticais entre colunas são automáticas (`.col + .col`).

---

## 10 — `.layout-timeline`

**Quando**: 3-5 marcos cronológicos. Linha horizontal, dots alternando above/below.

**Estrutura**:

```html
<section class="slide layout-timeline">
  <span class="eyebrow">Linha do tempo</span>
  <h1 class="headline">Frase resumindo a janela temporal.</h1>
  <div class="axis">
    <div class="marker is-above is-warn" style="left: 8%;">
      <div class="dot"></div>
      <div class="text">01:00 — Disco MySQL ~90%</div>
    </div>
    <div class="marker is-below is-warn" style="left: 33%;">…</div>
    <div class="marker is-above is-bad"  style="left: 62%;">…</div>
    <div class="marker is-below is-resolved" style="left: 88%;">…</div>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

**Variantes de cor de dot**: default teal, `is-warn` amber, `is-bad` red, `is-resolved` teal-2 (mais escuro).

**Posicionamento**: use `style="left: X%;"` percentual; calcule pra dar respiração nas pontas (5%–95%).

---

## 11 — `.layout-architecture` (workshop-only)

**Quando**: diagrama de arquitetura. Dark bg pra contraste com boxes. Use SVG inline (não PNG) pra escalar limpo.

**Estrutura**:

```html
<section class="slide dark layout-architecture">
  <span class="eyebrow">Arquitetura</span>
  <h1 class="headline" style="color: var(--white);">Frase descrevendo o diagrama.</h1>
  <div class="diagram">
    <svg viewBox="0 0 1100 380" width="1100" height="380" aria-label="…">
      <!-- rects, paths, arrows -->
    </svg>
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

**Convenção do SVG**:

- Boxes: `rect rx="10"` com `fill: rgba(0,191,165,.18)` (teal) ou `rgba(255,255,255,.06)` (neutral).
- Arrows: `<path>` com `marker-end="url(#arrow)"`. Defina o `<marker>` no `<defs>` do SVG.
- Texto interno do box: Inter bold 16px.
- Texto secundário (env var, etc): IBM Plex Mono 11px.

Reaproveite o arquivo `layouts/11-architecture.html` como ponto de partida.

---

## 12 — `.layout-closing`

**Quando**: sempre último slide. Headline + 4-5 takeaways em grid 2-col + bloco "Próximo".

**Estrutura**:

```html
<section class="slide layout-closing">
  <span class="eyebrow">Fechamento — Dia X / Cliente Y</span>
  <h1 class="headline is-large">Frase-chave de encerramento.</h1>
  <div class="takeaways">
    <div class="takeaway">Takeaway 1.</div>
    <div class="takeaway">Takeaway 2.</div>
    <!-- até 6 takeaways -->
  </div>
  <div class="next">
    <strong>Próximo:</strong> O que vem depois.
  </div>
  <img class="logo-block" src="…" alt="Elven" />
</section>
```

---

## Tabela rápida: layout por tipo de deck

| Layout | client-report-deck | workshop-mentorship-deck |
|---|---|---|
| 01 cover | ✅ obrigatório | ✅ obrigatório |
| 02 section-opener | opcional | ✅ comum (1 por bloco) |
| 03 executive-summary | ✅ típico slide 02 | opcional |
| 04 thesis-evidence | ✅ típico slide 02-04 | opcional |
| 05 kpi-row | ✅ comum | opcional |
| 06 chart-and-cards | ✅ frequente | opcional |
| 07 chart-full | ✅ frequente | opcional |
| 08 code-and-callout | ✅ frequente | ✅ frequente |
| 09 bullets-3 | opcional | ✅ comum |
| 10 timeline | ✅ comum (incident) | opcional |
| 11 architecture | raro | ✅ frequente |
| 12 closing | ✅ obrigatório | ✅ obrigatório (por dia) |
