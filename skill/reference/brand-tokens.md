# Brand tokens (locked, v0.1.0)

Esses tokens são **imutáveis** na v0.1.0 do skill. Vivem em `themes/elven-deck.css` no `:root`. Qualquer drift falha o lint (regra L3).

**Fonte canônica de cor**: extraído do HTML `kontik-zupper-incident-24h.html` (8 maio 2026). Eu não inventei nada — espelha o brand que já foi usado em deck real, aprovado, entregue ao cliente.

---

## Paleta

| Token | Valor | Uso operacional |
|---|---|---|
| `--ink` | `#0f1923` | texto principal sobre paper, fundo de cards dark |
| `--ink-2` | `#142638` | variante mais clara do ink (raro) |
| `--paper` | `#f4f7f8` | bg do slide light (padrão) |
| `--white` | `#ffffff` | bg de card sobre paper, texto sobre dark |
| `--muted` | `#64748b` | metadata, footer, page number, support |
| `--muted-strong` | `#475569` | subhead, secondary text com mais contraste |
| `--teal` | `#00bfa5` | accent primário — eyebrow, callout bar, KPI positivo, pill |
| `--teal-2` | `#00897b` | accent escuro — gradient cover, hover, "resolvido" timeline |
| `--cyan` | `#00e5ff` | accent secundário — radial cover, badges raros |
| `--blue` | `#0d47a1` | gradient cover, citação raríssima |
| `--lime` | `#d7ff63` | highlight raro (cover radial) |
| `--red` | `#ff5252` | alerta, erro, KPI negativo, top-accent card "is-bad" |
| `--amber` | `#fbbf24` | warning, KPI atenção, top-accent card "is-warn" |
| `--violet` | `#7c3aed` | accent extra (raro, secondary line em chart) |
| `--line` | `rgba(15,25,35,0.14)` | borda fina padrão de card |
| `--line-strong` | `rgba(15,25,35,0.22)` | borda mais visível (raro) |

**Regra de uso**: teal é o accent. Vermelho e amarelo são reservados para semântica negativa/atenção em KPIs e cards `is-bad`/`is-warn`. Não use vermelho/amarelo decorativo.

---

## Tipografia

```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace;
```

System fallback intencional — **sem `@font-face`** em v0.1.0. Inter e IBM Plex Mono são fontes free; se cliente exige lockdown de internet, self-host vira v0.2 (issue aberta).

**Pesos usados**:

- Headline: **800** (bold)
- Subhead, body: **400** (regular)
- Eyebrow, labels, pill-chip: **600** (semibold)
- Card titles (h3): **700**

**Tamanhos canônicos** (em `.css`, não improvise):

| Token visual | Tamanho | Linha-altura |
|---|---|---|
| `.headline.is-large` | 56px | 1.12 |
| `.headline` (default) | 44px | 1.12 |
| `.headline.is-small` | 36px | 1.12 |
| `.subhead` | 18px | 1.5 |
| Card `h3` | 17-18px | 1.3 |
| Card body | 13px | 1.5 |
| `.eyebrow` | 12px | normal, letter-spacing 0.18em |
| `.footer-meta`, `.page-number` | 11px | normal |
| Code panel | 13px | 1.55 |
| Section big-number | 168px | 1 |

---

## Frame

- Slide canvas: **1280×720** exato (16:9). Hard-coded em `.slide { width: var(--w); height: var(--h); }`.
- Padding interno default: **64px vertical / 72px horizontal** (`--pad-y`, `--pad-x`).
- Layout `cover` usa 80/88 (overrides) por respiração.

**Numeração de páginas**:

```css
body { counter-reset: slide; }
.slide { counter-increment: slide; }
.slide::after { content: counter(slide, decimal-leading-zero); }
```

Format: `01, 02, 03 … 99`. Posição: bottom-right do slide, cor `--muted` em light, branco 60% em dark/cover.

**Page break**: cada `.slide` força `page-break-after: always` e `break-after: page` pra PDF print clean.

---

## Variantes de fundo (`.slide` modifiers)

| Class | Background | Texto | Quando usar |
|---|---|---|---|
| `.slide` (default) | `--paper` `#f4f7f8` | `--ink` | maioria absoluta dos slides |
| `.slide.dark` | `#0f1923` | branco | layouts `architecture`, `flow`; section openers temáticos |
| `.slide.cover` | gradient teal→blue + radials | branco | slide 01 SEMPRE |
| `.slide.split-dark` | gradient 48/52 dark→paper | dark side branco / paper side ink | section opener premium (raro) |

---

## Logo

- Sempre canto superior direito.
- Classe `.logo-block`.
- Largura: 92px.
- Arquivo canônico: `skill/assets/elven-logo.png`.
- Em variantes `.dark` e `.cover`, o logo é o mesmo PNG; ele tem branco semitransparente integrado.

---

## Layouts que **não** podem ser alterados

Os 12 layouts em `themes/elven-deck.css` (`.layout-*`) são parte deste contrato. Não duplicar, não improvisar variações. Se um deck precisa de algo novo, abre issue antes.
