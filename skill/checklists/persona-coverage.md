# Persona coverage — matriz tipo × persona

Sanity-check: o deck está endereçando o **leitor certo**? Use antes do pre-deliver.

## Matriz

| Persona | client-report-deck | workshop-mentorship-deck |
|---|---|---|
| `cliente-stakeholder` (C-level, líder de área) | ✅ leitor primário | ❌ |
| `cliente-eng` (engenheiro lendo análise técnica) | ✅ leitor secundário | ❌ |
| `cliente-sre` (SRE op runbook) | ✅ ocasional | ❌ |
| `turma-mentoria` (engenheiros em workshop) | ❌ | ✅ leitor primário |
| `instrutor-elven` (apresentador) | ❌ | ✅ leitor secundário (via speaker notes) |
| `agente-ia` (Claude/Sentinel redigindo) | ✅ consumindo padrão | ✅ consumindo padrão |

## Checks por persona

### `cliente-stakeholder`

- [ ] Slide 01 e 02 entendíveis sem contexto técnico profundo?
- [ ] Métricas têm fonte declarada (não só "vimos que...")?
- [ ] Conclusão clara no slide de fechamento?
- [ ] Linguagem em pt-BR direto, sem jargão SRE excessivo?

### `cliente-eng`

- [ ] Trechos de código (read-only) declarados como tal?
- [ ] Comandos/queries reproduzíveis?
- [ ] Nomes técnicos exatos (variável, classe, env var)?
- [ ] Diagrama de arquitetura (se houver) explicativo, não decorativo?

### `cliente-sre`

- [ ] Linha do tempo do incidente clara?
- [ ] MTTD / MTTR ou métricas equivalentes presentes?
- [ ] Próximos passos operacionais no `.next` do closing?

### `turma-mentoria`

- [ ] Sequência narrativa do dia tem ritmo (framing → modelo → prática → fechamento)?
- [ ] Hands-on balanceado (não tudo no fim)?
- [ ] Code panels didáticos, não dumps?
- [ ] Closing fecha com ponte pro próximo dia?

### `instrutor-elven`

- [ ] Speaker notes completas, 4 seções, fala real?
- [ ] Day script teleprompter pode ser lido em voz alta sem refraseamento?
- [ ] Interações opcionais propõem momentos de pausa?
- [ ] Versão curta de cada slide existe pra quando o tempo aperta?

### `agente-ia`

- [ ] HTML segue padrão lintável (10/10)?
- [ ] Composição usa componentes e receitas canônicas?
- [ ] Componentes atômicos usam vocabulário do `component-catalog.md`?
- [ ] Sem emoji no body, sem layout inventado?

## Perfil técnico

`technical-report` atende primariamente `cliente-eng` e `cliente-sre`. Use
`kind: analysis`, `runbook` ou `rfc` conforme a tarefa. Para stakeholders, gere
um executivo companheiro se solicitado. O técnico deve permitir localizar a
conclusão, verificar a evidência, reproduzir os passos e acompanhar as ações.
PDF e DOCX precisam de revisão visual em todas as páginas.
