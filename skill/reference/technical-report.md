# Perfil técnico A4

O leitor técnico precisa entender a conclusão, avaliar a evidência e reproduzir
os passos. Use texto corrido, títulos hierárquicos e tabelas somente quando
facilitarem consulta. A identidade Elven aparece no logo, Inter/IBM Plex Mono,
cores e ritmo tipográfico; o documento não herda tamanhos ou cards de slides.

## Contrato de fonte

- `report.json`: metadados, `schemaVersion: 1`, `profile: technical-report`,
  `kind`, título, cliente, autor, emissão (`YYYY-MM-DD`), versão, classificação,
  estado (`draft`/`final`) e caminho relativo para `report.md`.
- `report.md`: fonte editorial única. Título principal vem do JSON. Use H2–H4,
  sem saltar níveis e sem repetir títulos (as âncoras devem ser únicas).
- `source-notes.md`: consultas, origem, janela/fuso, coleta, versão e limitações,
  identificadas pelos mesmos IDs citados no relatório.
- `qa-notes.md`: revisão editorial e visual. Inclua anexos sanitizados quando
  necessários à reprodução; o build não incorpora anexos arbitrários ao DOCX.
- `report.schema.json` em `reference/`: contrato para editores e integrações.

Seções comuns obrigatórias: **Resumo técnico**, **Contexto e escopo**,
**Evidências**, **Validação**, **Próximos passos**, **Referências**.

| kind | Seções adicionais | Conteúdo que muda |
| --- | --- | --- |
| `analysis` | Análise | Método, achados, hipótese, contraevidência, limites e conclusão |
| `runbook` | Procedimento, Rollback | Pré-requisitos, acesso, etapas, resultados esperados, interrupção e reversão |
| `rfc` | Proposta, Alternativas | Decisão solicitada, opções, tradeoffs, riscos, implantação e aceite |

A ordem pode acompanhar a narrativa. Acrescente seções úteis sem encher o
material de seções vazias. Se um item não se aplica, explique por quê. O lint
não avalia se uma frase como “não se aplica” é tecnicamente suficiente.

## Markdown suportado

Parágrafos, H2–H4, negrito, itálico, tachado, links http/https/mailto, âncoras
locais, listas numeradas e de bullets, checkboxes, blocos de código, citações,
tabelas GFM e imagens locais PNG/JPEG com descrição alternativa. Listas aninhadas
são renderizadas, mas mantenha pouca profundidade para facilitar consulta.

HTML bruto é rejeitado para preservar paridade com o DOCX. Exporte Mermaid ou
SVG para PNG antes de inserir. Imagens remotas, arquivos fora da pasta do
relatório (inclusive por symlink) e âncoras inexistentes são rejeitados. Imagens
são incorporadas ao HTML e ao DOCX; os textos alternativos viram legendas.
Evite tabelas com muitas colunas e linhas maiores que uma página. Divida figuras
altas; um diagrama de página inteira exige legenda que ainda caiba na página.

## Formatos e leitura

A4 vertical: 210 × 297 mm, margens de 20 mm, corpo de 11 pt, código de 9 pt,
títulos com níveis semânticos, cabeçalhos de tabela repetidos e numeração de
página. O PDF usa Chromium e incorpora as fontes WOFF2 locais. O HTML é autônomo,
com fontes e figuras incorporadas, responsivo em tela e pronto para impressão.

DOCX é OOXML editável, com estilos Title/Heading, sumário de links internos,
listas semânticas, tabelas editáveis e figuras incorporadas. Use `.docx`; o
formato binário legado `.doc` não faz parte deste fluxo. As fontes Inter e IBM Plex Mono são incorporadas como TrueType com licença
OFL. Diferenças entre versões de Word/LibreOffice ainda podem mudar a paginação. O DOCX não é uma imagem do PDF.

```sh
decks-skill build analise/report.json                       # HTML + PDF + DOCX
decks-skill build analise/report.json --format docx          # apenas DOCX
decks-skill build analise/report.json --format pdf           # PDF + HTML de origem
decks-skill build analise/report.json --out-dir entrega
```

Cada build escreve `manifest.json` com versão do pacote, SHA-256 das fontes,
figuras e saídas geradas naquela execução. Arquivos antigos da pasta de saída
não são incluídos automaticamente no manifesto. Para um pacote limpo, use uma
nova pasta de saída; não entregue versões obsoletas que sobraram de outro build.

`status: final` bloqueia placeholders óbvios como TODO/TBD e `{{...}}`; conteúdo
factual, completude e aprovação continuam sendo responsabilidade da revisão.
O gerador não executa comandos do Markdown nem altera ambientes descritos.

## Revisão visual e editorial

Revise todas as páginas dos dois formatos. Verifique títulos isolados, palavras
ou código cortados, tabelas partidas, legendas distantes das figuras, sumário,
links e fontes. Após qualquer alteração, regenere e repita a revisão afetada.
Se editar o DOCX no Word, reconcilie a fonte Markdown antes de regenerar.

Para incidente ou análise, não conclua recuperação comercial por readiness,
HTTP 200 ou telemetria parcial. Preserve janela, universo, limites e UNKNOWN.
Para runbook, descreva efeito, autorização necessária e rollback por etapa
relevante; a criação do documento não equivale a autorização de execução.
