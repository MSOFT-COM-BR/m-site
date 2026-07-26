---
id: "EPIC-9"
title: "Aquisicao Organica e Leads B2B"
status: "Draft"
owner: "@pm"
created: "2026-07-26"
source_prd: "docs/PRD/organic-acquisition-and-b2b-lead-generation.md"
tracking: "local-only"
---

# EPIC-9: Aquisicao Organica e Leads B2B

| Field | Value |
| --- | --- |
| Status | Draft / aguardando decisoes de stakeholders |
| Owner | @pm |
| Source of truth | `docs/PRD/organic-acquisition-and-b2b-lead-generation.md`, `docs/research/organic-growth-ecosystem-2026.md` e o estado atual verificado do repositorio. |
| Tracking | Local-only. Nenhum adaptador de PM esta configurado neste workspace. |

## Goal

Executar o primeiro incremento viavel da iniciativa de aquisicao organica e leads B2B sem inventar portfolio, metricas ou prova comercial, preparando o m-site para operar com arquitetura de conteudo confiavel, paginas comerciais basicas e captacao mensuravel.

## Business Value

Este incremento reduz o risco de o m-site continuar atraindo ou confundindo visitantes com narrativa legada, enquanto cria a base minima para que futuras decisoes de SEO, conteudo e conversao sejam feitas com mais confianca operacional.

## Link com o PRD

Este epic implementa apenas o primeiro incremento executavel do PRD draft em [docs/PRD/organic-acquisition-and-b2b-lead-generation.md](/Users/brenossan/development/m-setup/apps/m-site/docs/PRD/organic-acquisition-and-b2b-lead-generation.md).

## Existing System Context

- O m-site e uma SPA em JavaScript vanilla com carregamento de paginas por `config.routes.validPages`.
- O repositorio ainda contem superficies publicas legadas em `blog`, `materials`, `support` e `terms`.
- O fluxo de contato atual simula envio, e a mensuracao ainda depende de placeholders de Search Console e GA4.
- O PRD atual do produto (`docs/PRD/m-site.md`) reconhece o site como vitrine digital e camada publica de descoberta, nao como substituto do processo comercial.

## Increment Scope

### In Scope

- Validar decisoes comerciais e de mensuracao que bloqueiam implementacao segura.
- Restaurar confiabilidade minima da arquitetura publica de conteudo.
- Planejar e, apos gates, implementar paginas de servico realmente suportadas.
- Planejar e, apos gates, substituir captacao fake por fluxo real mensuravel.
- Preparar rollout editorial inicial apenas depois da base estrutural.

### Out of Scope

- Criar stories individuais nesta etapa.
- Publicar cases, depoimentos, metricas ou claims sem aprovacao.
- Assumir CRM, backend ou automacao comercial nao decididos.
- Expandir rotas perifericas como se fossem pilares confirmados do negocio.
- Reescrever a stack ou introduzir build step.

## Blockers and Business-Dependent Work

Os itens abaixo ficam explicitamente bloqueados ate decisao de stakeholder:

- definicao do portfolio comercial prioritario;
- definicao do CTA principal por tipo de pagina;
- definicao do destino real do lead e do criterio operacional de qualificacao;
- validacao de Search Console, GA4 e IDs reais;
- aprovacao de cases/provas e da jornada do MCredential.

## Story Proposal (high level only)

| ID | Title | Priority | Status | Predicted Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| 9.1 | Validar decisoes comerciais e de mensuracao da iniciativa | Critical | Draft | @pm | @po |
| 9.2 | Restaurar arquitetura de conteudo confiavel nas superficies publicas | Critical | Planned apos 9.1 | @dev | @qa |
| 9.3 | Estruturar paginas de servico aprovadas e metadados comerciais minimos | High | Blocked por DG-01 | @ux-design-expert + @dev | @architect |
| 9.4 | Implantar captacao real de lead e instrumentacao consentida | High | Blocked por DG-02 e DG-05 | @dev | @qa |
| 9.5 | Iniciar rollout editorial orientado por arquitetura e backlog validado | Medium | Blocked por 9.2-9.4 | @dev | @pm |

### Story 9.1

Consolidar as decisoes que hoje impedem implementacao segura: portfolio prioritario, politica para superficies legadas, CTA principal, destino do lead, baseline de mensuracao e prioridade do MCredential.

### Story 9.2

Eliminar contradicoes mais graves de confianca publica e reorganizar a arquitetura de conteudo para que blog, materiais, suporte, termos e rotas perifericas deixem de competir contra a narrativa B2B.

### Story 9.3

Criar a primeira camada de paginas de servico apenas para ofertas aprovadas pelo negocio, com metadados minimos, links internos e compatibilidade com a SPA existente.

### Story 9.4

Substituir o formulario fake e os CTAs nao auditaveis por um fluxo real de lead, com instrumentacao minima e respeito a consentimento.

### Story 9.5

Executar um rollout editorial inicial de forma sustentavel, ancorado em paginas comerciais e governanca de conteudo ja estabilizadas.

## Success Criteria

- [ ] As decisoes bloqueantes do incremento estao registradas, aprovadas ou explicitamente marcadas como pendentes com impacto visivel.
- [ ] Nenhuma superficie publica critica usada para aquisicao continua publicando narrativa legada sem plano aprovado de correcao, restricao ou desindexacao.
- [ ] O site passa a ter uma arquitetura publica coerente entre servico, conteudo e contato, mesmo antes de existir baseline numerica.
- [ ] Qualquer captacao implementada neste epic aponta para destino real e auditavel.
- [ ] O rollout editorial so comeca depois que arquitetura, servicos e captacao minima estiverem em estado confiavel.

## Compatibility Requirements

- Preservar `config.routes.validPages`, `src/core/core.js` e o fallback SPA para `index.html`.
- Nao quebrar o comportamento atual de consentimento ao adicionar ou revisar analytics.
- Nao depender de backend ou CRM nao aprovados para publicar as etapas estruturais anteriores ao fluxo real de lead.
- Preservar responsividade e padroes visuais existentes do m-site.
- Tratar remocao, `noindex` ou retirada de navegacao como mudancas controladas, sem apagar arbitrariamente superficies existentes.

## QA Strategy

- 9.1: revisao de completude de decisoes, rastreabilidade ao PRD e ao backlog `RES/CON/TEC/CVR`.
- 9.2: review de conteudo, SEO semantico, links, navegacao e risco de regressao nas rotas publicas.
- 9.3: review de UX, arquitetura de pagina, metadados, schema e compatibilidade SPA.
- 9.4: review de privacidade, consentimento, comportamento do formulario, CTA e instrumentacao.
- 9.5: review editorial e de coerencia de linking antes de ampliar volume.

## Decision Gates

| Gate | Story impactada | Descricao |
| --- | --- | --- |
| DG-01 | 9.3 | Portfolio comercial prioritario aprovado |
| DG-02 | 9.4 | Search Console e GA4 definidos com IDs e responsabilidade operacional |
| DG-03 | 9.5 | Cases/provas e criterio editorial aprovados |
| DG-04 | 9.3, 9.5 | Jornada e prioridade do MCredential aprovadas |
| DG-05 | 9.4 | CTA principal, destino real do lead e criterio minimo de qualificacao aprovados |
| DG-06 | 9.2 | Politica para `materials`, `support`, `terms` e rotas perifericas aprovada |

## Risks and Mitigations

| Risk | Impact | Mitigation | Rollback |
| --- | --- | --- | --- |
| Produzir paginas de servico sem oferta validada | Alto | bloquear 9.3 por DG-01 | remover pagina nova da navegacao e manter apenas superfícies aprovadas |
| Corrigir conteudo sem resolver rotas perifericas indexaveis | Medio | tratar rotas perifericas como decisao explicita em 9.2 | aplicar `noindex`, retirar da navegacao ou restaurar estado anterior de forma controlada |
| Ativar captura sem destino operacional | Alto | bloquear 9.4 por DG-05 | voltar para contato manual aprovado ate decisao formal |
| Instrumentar analytics com placeholders ou sem governanca | Alto | bloquear 9.4 por DG-02 | desativar eventos e manter configuracao segura |
| Escalar editorial antes da base comercial | Medio | manter 9.5 dependente de 9.2-9.4 | pausar novas publicacoes e preservar apenas conteudo estrutural |

## Rollback Strategy

- Reverter por superficies ou fluxos, nunca por reescrita ampla da SPA.
- Se 9.2 falhar, restaurar apenas a navegacao/conteudo afetados e aplicar restricao temporaria de indexacao.
- Se 9.3 falhar, retirar paginas de servico novas da navegacao sem afetar rotas existentes.
- Se 9.4 falhar, desabilitar o fluxo real de lead e voltar para o canal manual aprovado pelo negocio.
- Se 9.5 falhar, congelar novas publicacoes e manter somente as paginas estruturais confiaveis.

## Definition of Done for this Epic Draft

- [ ] O primeiro incremento esta delimitado sem invadir trabalho de story creation.
- [ ] Os bloqueios de negocio estao visiveis e separados do trabalho executavel.
- [ ] A ordem proposta respeita a sequencia: decisoes -> arquitetura confiavel -> paginas de servico -> lead real/instrumentacao -> rollout editorial.
- [ ] O epic permanece rastreavel ao PRD draft e ao research do Analyst.

## Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-26 | 0.1 | Epic draft criado para o primeiro incremento de aquisicao organica e leads B2B, aguardando decisoes de stakeholders. | @pm / Codex |
