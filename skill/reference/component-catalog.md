# Component catalog — atomic components

Os componentes atômicos vivem em `themes/elven-deck.css` e podem ser usados em qualquer layout. Cada um tem markup curto + props/modifiers + exemplo + anti-pattern.

---

## `.eyebrow`

**O que é**: small caps + traço esquerdo teal. Identifica seção/categoria do slide.

```html
<span class="eyebrow">Resumo executivo</span>
```

- **Tamanho**: 12-30 chars. Acima disso, vira título — vai pra `.headline`.
- **Cor**: teal automática em light; branco em `.slide.dark` / `.slide.cover` (override automático).

**Anti-pattern**: eyebrow com 50+ chars; eyebrow sem traço (não esquecer a classe).

---

## `.headline`

**O que é**: Inter bold 44px, line-height 1.12. A tese principal do slide.

```html
<h1 class="headline">Tese principal em 2-3 linhas.</h1>
```

**Modifiers**:

- `.headline.is-large` — 56px (covers e closing)
- `.headline.is-small` — 36px (raro)

**Anti-pattern**: headline >3 linhas (= ideia confusa); headline acabando em "que…", "para…" (continuação suspensa, fica fraco); duas headlines no mesmo slide.

---

## `.subhead`

**O que é**: parágrafo descritivo 18px, line-height 1.5, cor muted-strong.

```html
<p class="subhead">Janela temporal, fonte, ou framing do headline.</p>
```

**Quando usar**: só em cover e em layouts onde o headline precisa de contexto técnico curto.

---

## `.callout-banner`

**O que é**: blockquote com left bar teal grossa. Tipado por label bold.

```html
<div class="callout-banner">
  <span class="label">Leitura final:</span>
  <p>Conteúdo do callout em 1-3 linhas.</p>
</div>
```

**Labels canônicos** (sempre com `:` no final, sempre teal por padrão):

- `Leitura final:` — fechamento de tese (executive-summary)
- `Interpretação:` — análise técnica (code-and-callout)
- `Atenção:` — ponto de cuidado operacional
- `Importante:` — destaque que muda decisão
- `Próximo:` — usado no `.layout-closing > .next`

**Anti-pattern**: callout sem label; callout no meio do parágrafo (deve viver standalone após cards).

---

## `.code-panel`

**O que é**: bloco preto-azulado (`#0b1220`) com fonte mono, 13px, line-height 1.55, white-space preservado.

```html
<pre class="code-panel">shouldAllowAnotherRequeue(orderId)
  se deadline ausente -&gt; cria janela
  retorno: true</pre>
```

**Inline code**: use `<code>` (background sutil automático). Variáveis, nomes de arquivo, IDs.

**Anti-pattern**: code-panel com 20+ linhas (corta narrativa); code-panel sem `<pre>` (perde whitespace).

---

## `.pill-chip`

**O que é**: chip teal-12% pill. Pra label categórico curto.

```html
<span class="pill-chip">OK</span>
<span class="pill-chip is-amber">Atenção</span>
<span class="pill-chip is-red">Crítico</span>
<span class="pill-chip is-light">Neutro</span>
```

**Quando**: badges em cards, status, severidade. Substitui emoji (`✅` → `<span class="pill-chip">OK</span>`).

---

## `.card-fact`

**O que é**: card branco com number/string grande + label + desc.

```html
<div class="card-fact">
  <div class="value">13:47</div>
  <div class="label">Último erro fatal</div>
  <div class="desc">Contexto em 1-2 linhas.</div>
</div>
```

---

## `.card-info`

**O que é**: card branco com título bold + parágrafo. Layout flexível.

```html
<div class="card-info">
  <h3>Título do card</h3>
  <p>Conteúdo em 2-4 linhas.</p>
</div>
```

**Quando**: cards do `layout-executive-summary`, blocos secundários.

---

## `.card-compare`

**O que é**: card com **top-accent bar colorida** indicando semântica.

```html
<div class="card-compare is-good"><h3>+31%</h3><p>…</p></div>
<div class="card-compare is-warn"><h3>13:50</h3><p>…</p></div>
<div class="card-compare is-bad"><h3>payment_form_id</h3><p>…</p></div>
<div class="card-compare is-info"><h3>Contexto</h3><p>…</p></div>
```

**Variantes**:

- `is-good` — teal
- `is-warn` — amber
- `is-bad` — red
- `is-info` — blue

**Quando**: `layout-thesis-evidence`, `layout-chart-and-cards` right column.

---

## `.card-step`

**O que é**: card numerado com `data-step` attribute. Renderiza número pequeno teal mono no topo.

```html
<div class="card-step" data-step="01.">
  <h3>Identificar tipo</h3>
  <p>Descrição do passo.</p>
</div>
```

**Quando**: roteiros passo-a-passo (raro em deck, mais comum em printable).

---

## `.card-kpi`

**O que é**: card com número grande (36px) + label small caps + desc.

```html
<div class="card-kpi">
  <div class="value">+92%</div>
  <div class="label">Throughput pós-14h</div>
  <div class="desc">Reservas voltam ao nível pré-incidente.</div>
</div>
```

**Quando**: `layout-kpi-row` (4 cards lado a lado).

---

## `.logo-block`

```html
<img class="logo-block" src="../assets/elven-logo.png" alt="Elven" />
```

Posiciona automaticamente no canto superior direito. Largura 92px. **Sempre presente** em todo slide.

---

## `.footer-meta`

```html
<span class="footer-meta">Período analisado: 07/05 20:00 a 08/05 20:00 BRT.</span>
```

Texto muted no canto inferior esquerdo. Usado pra fontes, janela temporal, autor. Não compete com numeração de página (canto inferior direito).
