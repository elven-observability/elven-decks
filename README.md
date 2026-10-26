# Elven Decks

Padrão corporativo da Elven Works para **apresentações executivas e documentos
técnicos**, utilizável por Codex e Claude Code. Um pacote npm, uma identidade,
dois perfis de leitura e fontes editáveis para manutenção.

| Perfil | Quem usa | Formato | Entrega |
| --- | --- | --- | --- |
| Executivo (`executive` / `client-report`) | Diretoria e stakeholders | 16:9, 1280 × 720 px | HTML, PDF e preview PNG |
| Técnico (`technical-report`) | Engenharia, SRE e clientes técnicos | A4 vertical, 210 × 297 mm | Markdown, HTML, PDF e DOCX editável |
| Workshop (`workshop`) | Instrutor e turma | Slides 16:9 por dia | PDF, agenda, labs, speaker notes e script |

O tema executivo aprovado continua o mesmo. Técnico usa texto corrido, tabelas,
código e referências com paginação de documento. A4 é o padrão para impressão
e edição; 9:16 é formato de tela e não é usado como substituto de A4.

## Instalar em Codex e Claude

Requer **Node.js >=22.12**. Não há instalação silenciosa de skills via postinstall.

```sh
npm install -g @elven-observability/decks-skill
decks-skill install --target both
decks-skill doctor
```

Sem instalar a CLI global:

```sh
npx --yes @elven-observability/decks-skill@latest install --target both
```

- Codex: `~/.agents/skills/elven-decks-skill/` (reutiliza instalação legada
  encontrada em `~/.codex/skills/` para evitar duplicação).
- Claude Code: `~/.claude/skills/decks-skill/`.
- Projeto: acrescente `--project .` para instalar em `.agents/skills/` e
  `.claude/skills/` do repositório. Útil para equipes e ambientes cloud.
- Use `--target codex` ou `--target claude` para instalar em um agente apenas.

Codex: invoque `$elven-decks-skill`. Claude Code: invoque a skill pelo seletor
ou `/decks-skill`, conforme a descoberta do cliente. A skill também pode ser
selecionada pelo agente quando o pedido corresponde à sua descrição.
Em cloud/remoto, instale Node, pacote e Chromium no próprio ambiente; uma
instalação local não é transmitida automaticamente.

O Puppeteer utiliza Chromium (~200 MB no primeiro download). Se o gerenciador
npm bloquear scripts de instalação, habilite o script confiável do Puppeteer
conforme a política do ambiente ou execute `npx puppeteer browsers install chrome`.
`doctor` informa se o executável está disponível. Em container que exige modo
sem sandbox, use `DECKS_NO_SANDBOX=1` apenas naquele ambiente.

## Atualizar em um comando

```sh
npx --yes @elven-observability/decks-skill@latest update --target both
```

Busca a versão publicada e sincroniza as skills dos dois agentes, com backup
da instalação anterior fora da pasta de descoberta. Não reescreve materiais
já criados. Para uma versão fixa, use `decks-skill update --version 0.2.0`.
Para copiar a versão local sem rede: `decks-skill update --from-installed`.
Uma CLI global antiga pode ser atualizada com `npm install -g ...@latest`;
o comando com `npx @latest` já executa a nova CLI.

`install` recusa sobrescrever uma instalação existente sem `--force`.
Atualização usa staging e preserva backups. Para restaurar uma versão publicada:

```sh
npx --yes @elven-observability/decks-skill@0.2.0 install --target both --force
```

## Criar um executivo

```sh
decks-skill new executive relatorio-cliente
# Edite relatorio-cliente/deck.html e source-notes.md.
decks-skill lint relatorio-cliente/deck.html
decks-skill check relatorio-cliente/deck.html
decks-skill preview relatorio-cliente/deck.html
decks-skill render relatorio-cliente/deck.html
```

O alias `new client-report` e os comandos antigos continuam disponíveis.
Cada slide usa `.slide` (variantes `cover`/`dark`), `.logo`, `.content` e `.kicker`.
Componha os componentes do tema, mantendo proporções e tipografia. As receitas
estão em [slide-recipes](skill/reference/slide-recipes.md). O scaffold inclui
tema, motor SVG e fontes locais com licença; não depende de Google Fonts.

`lint` verifica 10 regras de estrutura por DOM, inclusive os elementos dentro de
cada slide, os dois eixos do canvas e CSS existente. `check` abre Chromium e
verifica assets, scripts, canvas e conteúdo fora dos limites. `preview` gera
um PNG por slide e contact sheet. `render` gera uma página de PDF por slide,
sem as margens de tela. Faça a revisão visual antes de entregar.

## Criar um técnico

```sh
decks-skill new technical-report analise-cliente
# Edite report.json, report.md, source-notes.md e qa-notes.md.
decks-skill lint analise-cliente/report.json
decks-skill build analise-cliente/report.json
```

Saídas em `analise-cliente/dist/`:

- `report.html`: autônomo e responsivo, com fontes e figuras incorporadas.
- `report.pdf`: A4 com fontes incorporadas, sumário navegável e páginas numeradas.
- `report.docx`: texto, tabelas e código editáveis, estilos de títulos, links
  internos, figuras e cabeçalhos de tabela repetidos.
- `manifest.json`: versão do gerador e SHA-256 das fontes, figuras e saídas.

Metadados e texto têm uma fonte compartilhada. Escolha `kind: analysis`,
`runbook` ou `rfc`; o lint exige as seções adequadas. Troque o conteúdo de
exemplo antes de marcar `status: final`. Não é uma análise real de cliente.

```sh
decks-skill build analise-cliente/report.json --format docx
decks-skill build analise-cliente/report.json --format pdf --out-dir entrega
```

Suporta Markdown GFM, tabelas, listas, código e PNG/JPEG locais com descrição.
HTML bruto, links inseguros e assets fora da pasta são rejeitados. Exporte
diagramas para PNG. Detalhes em [guia técnico](skill/reference/technical-report.md)
e [schema v1](skill/reference/report.schema.json).

PDF e DOCX podem ter paginação diferente. O DOCX incorpora Inter e IBM Plex Mono com licença OFL. Diferenças entre
viewers ainda podem alterar a paginação. Revise todas as páginas
em um renderer disponível e reconcilie na fonte qualquer edição feita no Word.
`.docx` é o formato Word suportado; `.doc` legado não é gerado.

## Comandos

```text
decks-skill install [--target both|codex|claude] [--force] [--project <pasta>]
decks-skill update [--target ...] [--project <pasta>] [--version <versão>] [--from-installed]
decks-skill doctor [--target ...] [--project <pasta>]
decks-skill new <executive|client-report|workshop|technical-report> <pasta>
decks-skill lint <deck.html|report.json> [...]
decks-skill check <deck.html>
decks-skill preview <deck.html> [--out-dir <pasta>]
decks-skill render <deck.html> [--out <arquivo.pdf>]
decks-skill build <report.json> [--format all|html|pdf|docx] [--out-dir <pasta>]
decks-skill --version | --help
```

Em npx, substitua `decks-skill` por
`npx --yes @elven-observability/decks-skill@0.2.0` para reprodução exata.

## Qualidade e manutenção

O lint não valida fatos, causalidade ou aprovação. Relatórios devem declarar
fontes, janela, fuso e limites de evidência. Material técnico também precisa
explicar pré-requisitos, reprodução, validação e rollback quando aplicáveis.
Nenhum comando escrito no documento é executado pelo gerador.

O código canônico fica em `skill/themes/`, `skill/templates/`, `skill/reference/`
e `lib/`. Para alterar marca/fontes, execute `npm run sync:assets`; `prepack`
reprova cópias divergentes. As fontes são redistribuídas com licenças OFL.

```sh
npm ci
npm test
npm run release:check
```

CI verifica Node 22/24, instalação por agente, backup, metadados, assets,
renderização e pacote. O processo completo de publicação e rollback está em
[manutenção](skill/reference/maintenance.md). Veja [CHANGELOG](CHANGELOG.md)
para migração da versão 0.1.2.

Locais de instalação seguem a documentação de
[Codex](https://learn.chatgpt.com/docs/build-skills) e
[Claude Code](https://code.claude.com/docs/en/skills), consultada em 26/10/2026.

[MIT](LICENSE) © 2026 Elven Works.
