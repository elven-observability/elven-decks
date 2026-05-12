# Glossário — decks-skill

Termos usados pelo skill, na voz da casa.

---

**Agenda** — Plano de tempo do dia/sessão. Em workshop, vive em `agenda/day-X.md`.

**Brand tokens** — Variáveis CSS imutáveis (`--teal`, `--paper`, etc) que definem a identidade Elven. Locked em v0.1.0.

**Callout banner** — Bloco com left bar teal grossa, label bold tipado ("Leitura final:", "Interpretação:"). Componente `.callout-banner`.

**Card** — Container de informação reutilizável. Família: `.card-fact`, `.card-info`, `.card-compare`, `.card-step`, `.card-kpi`.

**Client-report-deck** — Tipo canônico. Deck consumido em PDF pelo cliente, sem presenter. Exemplo: kontik incident report.

**Closing** — Último slide do deck. Layout `.layout-closing`. Takeaways + bloco "Próximo".

**Code panel** — Bloco de código com fundo escuro e fonte IBM Plex Mono. Componente `.code-panel`.

**Contact-sheet** — Grid 4-col com todos os slides em miniatura. Gerado por `decks-skill preview`. Usado para QA visual rápido.

**Cover** — Primeiro slide. Sempre `.layout-cover` com gradient teal/blue.

**CSS counter** — Mecanismo que numera slides automaticamente (`01, 02, …`). Locked em `themes/elven-deck.css`.

**Day script (teleprompter)** — Script contínuo do dia, em `materials/speaker-notes/day-X-script.md`. Reúne todas as speaker notes.

**Deck** — Apresentação de slides. Em arquivo: um HTML com vários `<section class="slide">`.

**Eyebrow** — Etiqueta small caps no topo do slide, traço esquerdo teal. Identifica a seção. Componente `.eyebrow`.

**Fala pronta** — Seção da speaker note com o texto real a ser dito em voz alta. Não é meta-comentário.

**Fixture** — Arquivo HTML de teste (`tests/fixtures/`). Existe pra lint e render: `pass-*.html` (deve passar) e `fail-*.html` (deve falhar regra específica).

**Footer-meta** — Texto muted no canto inferior esquerdo do slide. Usado pra fonte de dados, autor, janela. Componente `.footer-meta`.

**Frame** — O canvas do slide. Sempre 1280×720 px (16:9).

**Hands-on** — Bloco prático do workshop com execução pelos alunos. Diferente de demo (instrutor faz, plateia olha).

**Headline** — Tese principal do slide. Inter bold 44-56px. Componente `.headline`.

**IBM Plex Mono** — Fonte monoespaçada canônica pra código.

**Inter** — Fonte sans canônica pra todo texto não-código.

**Interação opcional** — Seção da speaker note declarando a pausa/pergunta proposta pra plateia.

**KPI band** — Faixa de 4 KPIs no cover (`.kpi-band`).

**Lab** — Roteiro hands-on do workshop, em `labs/day-X/lab.md`.

**Layout** — Composição de slide, definida por classe CSS `.layout-*`. v0.1.0 tem 12 layouts canônicos.

**Lint binário** — Verificação 10/10 de regras estruturais sobre o HTML do deck. `decks-skill lint`.

**Logo block** — Logo Elven no canto superior direito. Componente `.logo-block`.

**MTTD / MTTR** — Mean time to detect / to recover. Métricas comuns em incident reports.

**Numeração** — Page number no canto inferior direito, format `01, 02, …` via CSS counter `decimal-leading-zero`.

**Objetivo do slide** — Seção da speaker note declarando o que o slide precisa instalar na plateia.

**Paper** — Cor de fundo do slide light (`#f4f7f8`). Token `--paper`.

**Persona** — Audiência alvo (cliente-stakeholder, turma-mentoria, instrutor-elven, etc).

**Pill chip** — Badge pill teal. Substitui emoji como indicador de status. Componente `.pill-chip`.

**Preview** — Conjunto de PNGs por slide gerado por `decks-skill preview`. Inclui `contact-sheet.png`.

**Print CSS** — `themes/elven-deck.print.css`. Ajustes pra Puppeteer headless Chromium gerar PDF clean.

**Read-only inspection** — Inspeção de código sem editar. Padrão em PS report quando o engenheiro Elven analisa repo do cliente.

**Render** — Conversão HTML → PDF via Puppeteer. `decks-skill render`.

**Scaffold** — Pasta inicial criada por `decks-skill new`. Tem placeholders preenchidos.

**Section opener** — Slide que abre um bloco/seção. Layout `.layout-section-opener`. Big number + section title.

**Slide** — Unidade do deck. Em HTML: `<section class="slide …">`. Sempre 1280×720.

**Source-notes.md** — Anotações de origem dos dados em client-report-deck. Garante rastreabilidade.

**Speaker note** — Markdown com 4 seções (Objetivo / Fala pronta / Interação / Versão curta) acompanhando um slide em workshop.

**Subhead** — Subtítulo do slide. Componente `.subhead`. 18px, muted-strong.

**Takeaway** — Item de fechamento. Aparece no `.layout-closing` com bullet teal.

**Teal** — Cor accent primária (`#00bfa5`). Token `--teal`.

**Template** — Pasta inicial em `skill/templates/<tipo>/` que `decks-skill new` copia.

**Theme** — `themes/elven-deck.css`. Define tokens, frame, layouts, componentes.

**Thesis-evidence** — Layout com tese + 3 cards de evidência colorida. `.layout-thesis-evidence`.

**Timeline** — Layout com 3-5 marcos cronológicos. `.layout-timeline`.

**Token** — Variável CSS canônica em `:root`. Mudar quebra o brand.

**Tone** — Editorial voice. Definido em `editorial-voice.md`.

**Versão curta** — Seção da speaker note com 1 frase resumindo o slide pra quando o tempo aperta.

**Visual QA** — Inspeção do contact-sheet pra problemas que lint não pega.

**Workshop-mentorship-deck** — Tipo canônico. Pacote multi-dia com agenda + slides + labs + speaker notes + script.
