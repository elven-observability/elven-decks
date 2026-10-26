# Fluxo executivo e workshop

O contrato visual do deck aprovado está em `themes/elven-deck.css`. Preserve
paleta, proporções, tipografia e composição. As fontes Inter e IBM Plex Mono
são locais; o scaffold copia o tema e as fontes canônicas do pacote.

1. Crie `new executive <pasta>` (`client-report` continua válido) ou
   `new workshop <pasta>`. Faça o esboço da narrativa a partir das fontes.
2. Na capa, identifique cliente, assunto, data/período e conclusão de maior
   relevância. Não use métrica decorativa ou conclusão sem suporte.
3. No executivo, a sequência deve permitir ler só os títulos e compreender
   resultado, evidência, risco e decisão. Detalhes extensos pertencem ao técnico.
4. Use `.slide` com variantes `cover`, `dark` ou light padrão; a primeira é
   `cover`. Cada slide contém `.logo`, `.content` e `.kicker`. O último fecha
   com síntese e próximos passos, responsável/prazo quando conhecidos.
5. Componha `.two-col`, `.three-col`, `.panel`, `.chart-card`, `.timeline`,
   `.evidence`, `.callout`, `.matrix`, `.diagram` e `.takeaways` conforme
   `slide-recipes.md` e `component-catalog.md`. Não reduza toda a tipografia
   para acomodar excesso de texto; divida o argumento em mais slides.
6. Declare fontes em `.source` e `source-notes.md`. Em gráficos, inclua unidade,
   janela, população, escala, legenda e limite de inferência; preserve a base
   de comparação. O motor `elven-deck-charts.js` produz SVG local.
7. Para workshop, alinhe agenda, teoria, labs, README, notas e script contínuo.
   Cada nota tem Objetivo do slide, Fala pronta, Interação opcional e Versão curta.
8. Execute `lint`, `check`, `preview` e `render` no HTML. `check` verifica
   geometria e assets; a revisão humana/visual continua necessária.

```sh
decks-skill lint relatorio/deck.html
decks-skill check relatorio/deck.html
decks-skill preview relatorio/deck.html
decks-skill render relatorio/deck.html --out relatorio/relatorio.pdf
```

PDF: uma página 1280 × 720 px por slide, sem margens ou intervalos entre páginas.
Preview: um PNG por slide em 1,5× e contact sheet. Revise cabeçalhos, fontes,
contraste, gráficos e rodapés em `checklists/visual-qa.md`. Para verificar fontes
ou ambiente, use `doctor`. Não alegue compatibilidade visual em viewers que não
foram utilizados na revisão.
