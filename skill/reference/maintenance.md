# Manutenção e distribuição

## Fontes canônicas

- `skill/SKILL.md`: roteamento e regras comuns; mantenha curto e independente do agente.
- `skill/reference/`: contratos condicionais. Não replique o guia técnico no executivo.
- `skill/themes/`: tema executivo preservado e tema técnico separado.
- `skill/templates/`: scaffolds de executivo, workshop e técnico.
- `lib/`: parser, renderização técnica, lint DOM, navegador e instalação.
- `scripts/sync-assets.js`: sincroniza fontes licenciadas e cópias dos temas.

Mude temas na fonte canônica, execute `npm run sync:assets` e revise o diff.
`prepack` verifica sincronização e checksums das fontes incorporadas; não precisa
baixar fontes durante instalação. Para atualizar essas fontes, instale
`fonttools` e `brotli` num ambiente de desenvolvimento Python e execute
`python scripts/prepare-fonts.py` depois de `npm run sync:assets`. Usuários da
skill precisam apenas de Node; os arquivos TrueType já vêm no pacote.
O pacote inclui fontes com licenças OFL e não baixa assets em runtime. O Chromium
continua sendo uma dependência instalada pelo Puppeteer/cache do ambiente.

## Instalar e atualizar

```sh
npm install -g @elven-observability/decks-skill
decks-skill install --target both
# Ou, sem CLI global:
npx --yes @elven-observability/decks-skill@latest install --target both
```

Codex: `~/.agents/skills/elven-decks-skill/`; se uma instalação legada já existir
em `~/.codex/skills/decks-skill/` ou `elven-decks-skill/`, ela é reutilizada.
Claude Code: `~/.claude/skills/decks-skill/`. `--project <pasta>` usa `.agents`
e `.claude` dentro do projeto, inclusive para ambientes cloud que clonam o repo.
Não instale simultaneamente em escopos diferentes sem necessidade: nomes iguais
podem aparecer duplicados no seletor do agente.

```sh
npx --yes @elven-observability/decks-skill@latest update --target both
decks-skill update --version 0.2.0 --target codex
# Offline: apenas copiar a versão já instalada nesta CLI.
decks-skill update --from-installed --target both
decks-skill doctor
```

`update` consulta o npm e executa o instalador da versão selecionada. Atualiza
as skills; uma CLI global antiga deve ser atualizada com `npm install -g`.
O caminho por `npx @latest` já executa a CLI mais recente sem escrita global.
A instalação preserva a versão anterior em `skill-backups/`, fora da pasta
varrida pelo agente. Cópia passa por staging e, se falhar, tenta restaurar o
estado anterior. Symlinks de instalação exigem atualizar a origem.

Materiais existentes nunca são migrados pelo updater. Para adotar um novo tema,
revise o material e suas saídas num trabalho separado. Para voltar uma skill,
instale uma versão publicada exata com `install --force` ou restaure o backup.

## Testar e publicar

Requisitos: Node.js >=22.12 e npm. CI cobre Node 22/24 em Linux e smoke no Windows.

```sh
npm ci
npm test
npm run release:check
npm pack
```

Valide também o tarball em pasta temporária com instalação apenas de dependências
de produção, scaffold e build dos dois perfis. Confira PDF: contagem e tamanho
físico das páginas; DOCX: estilos, cabeçalhos repetidos, links, tabelas e código.
Renderize os artefatos para inspeção de todas as páginas. Os testes automatizados
não certificam aparência em todas as versões de Word ou todos os viewers.

Antes do release, atualize `package.json` e `package-lock.json` juntos e registre
mudanças e migração no `CHANGELOG.md`. Com o commit revisado e CI verde:

```sh
npm login
npm publish --access public
```

Autentique apenas próximo da publicação. Não salve tokens no repositório. Após
publicar, leia `npm view @elven-observability/decks-skill version dist.integrity`
e teste a versão publicada via `npx`. Registre a tag Git `v<versão>` apontando
para o commit publicado; publique GitHub Release com o resumo e o tarball.
A publicação npm exige credenciais/2FA válidos do mantenedor. Não anuncie release
publicado a partir de `npm pack` ou `publish --dry-run`.

Para automação futura sem token permanente, configure um trusted publisher no
npm vinculado ao workflow do GitHub e só então ative publicação OIDC. Referência:
[Trusted publishing npm](https://docs.npmjs.com/trusted-publishers/).

Locais dos agentes conferidos em 26/10/2026:
[Codex skills](https://learn.chatgpt.com/docs/build-skills) e
[Claude Code skills](https://code.claude.com/docs/en/skills).
