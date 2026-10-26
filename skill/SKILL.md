---
name: elven-decks-skill
description: Cria e revisa materiais Elven Works em dois perfis — apresentações executivas 16:9 com PDF e relatórios técnicos A4 com PDF e DOCX editável — além de workshops com slides, labs e speaker notes. Use para relatórios de cliente, análises técnicas, runbooks, RFCs e apresentações Elven; não substitui a identidade visual de outras marcas.
---

# Elven Decks

Produza material que o leitor consiga usar: decisão e impacto no executivo;
evidência, reprodução e execução no técnico. O tema executivo aprovado permanece
o padrão dos slides. O perfil técnico compartilha a marca com tipografia e
paginação próprias de um documento A4.

## Escolha o perfil pelo pedido

| Pedido e leitor | Perfil / scaffold | Entrega |
| --- | --- | --- |
| Diretoria, decisão, status, impacto, cliente lendo apresentação | `executive` (alias `client-report`) | HTML 16:9, PDF, preview |
| Engenharia, RCA, investigação, runbook, RFC, arquitetura detalhada | `technical-report` | Markdown + metadados, HTML, PDF A4, DOCX |
| Mentoria com instrutor, agenda e prática | `workshop` | Slides 16:9 por dia, PDF, labs e speaker notes |

Quando o pedido já define o leitor ou formato, prossiga sem perguntar. Se pedir
ambos, produza um executivo curto e um técnico detalhado a partir das mesmas
fontes, preservando IDs de evidência, janela, números e limites da conclusão.
Um relatório técnico continua sendo documento corrido; não comprima texto em
slides verticais. A4 vertical (210 × 297 mm) é o padrão técnico. 9:16 é um
formato de tela e requer pedido específico e adaptação fora deste template.

Idioma padrão: pt-BR. O tema e os scaffolds desta versão são Elven; respeite
uma solicitação explícita de outro idioma, avisando que os gates automáticos
atuais foram validados em pt-BR. Para outra marca ou formato sem template,
explique o limite e adapte somente dentro do escopo autorizado.

## Ferramentas e ambiente

Use a CLI do pacote `@elven-observability/decks-skill`. Se `decks-skill` não
estiver no PATH, execute `npx --yes @elven-observability/decks-skill@latest` com
os mesmos argumentos. Para reproduzir um trabalho, fixe a versão no comando.
Os scripts copiados para a pasta da skill são recursos do pacote; renderização
e build devem ser executados pela CLI para resolver as dependências corretamente.

```sh
decks-skill --version
decks-skill doctor
```

Em Codex ou Claude num ambiente remoto/cloud, os mesmos comandos precisam de
Node.js >=22.12, dependências npm e Chromium disponíveis nesse ambiente. Não
presuma que a instalação da máquina local exista no ambiente remoto.

## Executivo e workshop

Leia [fluxo executivo](reference/executive-workflow.md) e apenas as referências
necessárias à composição. Para workshop, leia também o contrato correspondente
em [artifact-contract](reference/artifact-contract.md) e
[speaker-notes-spec](reference/speaker-notes-spec.md).

```sh
decks-skill new executive relatorio-cliente
# ou: decks-skill new workshop curso-observabilidade
```

Mantenha o frame 1280 × 720, tema canônico, logo, `.content` e `.kicker` por slide.
Componha os componentes de [component-catalog](reference/component-catalog.md)
e as [receitas testadas](reference/slide-recipes.md). Não exija classes de uma
antiga biblioteca de 12 layouts: o modelo vigente é composição de componentes.

## Técnico

Leia o [guia técnico](reference/technical-report.md) antes de escrever.

```sh
decks-skill new technical-report analise-cliente
# Edite report.json, report.md, source-notes.md e qa-notes.md.
decks-skill lint analise-cliente/report.json
decks-skill build analise-cliente/report.json
```

A fonte editorial é `report.md`; `report.json` contém metadados e o tipo
`analysis`, `runbook` ou `rfc`. Edite a fonte e regenere todas as saídas após
alterações. Se o cliente editar o DOCX, incorpore as alterações à fonte antes
da próxima geração. Não mantenha versões divergentes do mesmo conteúdo.

## Conteúdo e evidências

- Identifique destinatário, cliente, objetivo, período, fuso e versão relevantes.
- Sustente métricas e conclusões com origem verificável em `source-notes.md` e
  referências legíveis. Não transforme exemplos do template em fatos do cliente.
- Separe observação, hipótese, mecanismo, causa confirmada e recomendação.
  Use UNKNOWN para lacunas; preserve limites da amostra e temporalidade.
- Comandos devem declarar ambiente, pré-requisitos, efeito e saída esperada.
  Registrar uma proposta no documento não autoriza executar mudanças.
- Use nomes técnicos exatos, unidades, legendas e texto alternativo em figuras.
  Tabelas extensas devem ser legíveis e repetir cabeçalhos.
- Remova credenciais, links que concedem acesso e dados pessoais desnecessários.
  Não invente links, evidências, responsáveis, aprovações ou critérios atendidos.
- Para um material final, substitua o conteúdo de demonstração, revise o
  destinatário e marque `status: final` no técnico. Rascunho deve ser identificado.

## Gates de entrega

1. **Estrutura:** `lint` aprovado; técnico também valida metadados, seções e assets.
2. **Renderização:** no executivo, rode `check`, `preview` e `render`; no técnico,
   `build` gera `dist/report.html`, `report.pdf`, `report.docx` e `manifest.json`.
3. **Revisão visual:** abra o contact sheet e cada slide problemático. No técnico,
   renderize e inspecione todas as páginas do PDF e do DOCX num renderer disponível
   (Word/LibreOffice ou ferramenta de documento do ambiente). Corrija cortes,
   tabelas, títulos órfãos, links e fontes antes de regenerar. Se não houver
   renderer DOCX, informe essa limitação; não declare revisão que não ocorreu.
4. **Revisão editorial:** confronte conclusões e números com as fontes e aplique
   [pre-deliver](checklists/pre-deliver.md) ou o checklist técnico do scaffold.
5. **Entrega:** forneça os artefatos pedidos e as fontes editáveis. O manifesto
   registra versão e hashes, mas `visualReview: pending` não certifica revisão.
   Notificar clientes ou participantes exige autorização própria do pedido.

Lint valida estrutura; `check` detecta parte dos defeitos geométricos e de assets.
Nenhum deles confirma causalidade, exatidão de conteúdo ou aprovação humana.

## Manutenção

[Manutenção e release](reference/maintenance.md) descreve fontes canônicas,
testes e publicação. Atualizar a skill não reescreve materiais já criados.

```sh
npx --yes @elven-observability/decks-skill@latest update --target both
# Versão fixa / rollback da skill:
npx --yes @elven-observability/decks-skill@0.2.0 install --target both --force
```
