---
id: "EPIC-2"
title: "Hub Central de Produtos, Servicos e Conteudo"
status: "Planning"
owner: "@pm"
created: "2026-07-19"
source_prd: "docs/PRD/m-site.md"
tracking: "local-only"
---

# EPIC-2: Hub Central de Produtos, Servicos e Conteudo

| Field | Value |
| --- | --- |
| Status | Planning |
| Owner | @pm |
| Source of truth | `docs/PRD/m-site.md` e a solicitacao de tornar o m-site a porta central da Miranda Soft. |
| Tracking | Local-only. Nenhum adaptador de PM esta configurado neste workspace. |

## Goal

Transformar o m-site em uma porta de descoberta unica para os servicos, produtos, ferramentas, conteudo e jornadas de conta da Miranda Soft, sem concentrar nele a logica de dominio das aplicacoes independentes.

## Business Value

Visitantes passam a entender rapidamente o ecossistema da Miranda Soft e encontram uma jornada clara para cada oferta. A empresa ganha uma camada central para descoberta, conversao, conteudo e encaminhamento para produtos especializados.

## Existing System Context

- A SPA em JavaScript vanilla ja possui paginas para solucoes, apps, marketplace, blog, materiais, mcredential, suporte e conta.
- O header atual expoe parte dessas areas como links independentes, mas nao apresenta um mapa unico do ecossistema.
- `src/core/core.js` carrega paginas HTML parciais a partir de `config.routes.validPages`; a primeira entrega deve respeitar esse padrao e nao criar uma nova aplicacao ou backend.
- `src/services/content-service.js` oferece uma base futura para conteudo administravel, mas o catalogo central inicial deve usar somente ofertas e rotas existentes.

## Scope

### In Scope

- Criar uma pagina central de ecossistema que agrupe as ofertas atuais por jornada do usuario.
- Reorganizar a navegacao primaria para direcionar visitantes ao hub, preservando todas as rotas existentes.
- Planejar a evolucao para um catalogo unificado e para uma camada editorial/SEO coerente.

### Out of Scope

- Migrar produtos para dentro do m-site ou alterar seus backends, contratos e regras de negocio.
- Inventar novas ofertas, precos, planos ou integracoes nao confirmadas no repositorio.
- Reestruturar autenticacao, autorizacao ou pagamentos neste epic.
- Trocar a stack vanilla ou introduzir build step por conveniencia.

## Stories

| ID | Title | Priority | Status | Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| [2.1](../stories/2.1.criar-portal-do-ecossistema-miranda-soft.md) | Criar portal do ecossistema Miranda Soft | High | Draft | @ux-design-expert | @dev |
| 2.2 | Unificar metadados do catalogo de ofertas | High | Planned | @dev | @architect |
| 2.3 | Consolidar descoberta editorial, SEO e metricas | Medium | Planned | @dev | @architect |

### Story 2.1

Entregar a primeira superficie navegavel do hub: uma rota de ecossistema e uma navegacao que leva o visitante a servicos, produtos, conteudo e conta por meio de rotas ja existentes.

### Story 2.2

Definir uma fonte unica de metadados para ofertas, permitindo que apps, marketplace e futuras paginas de produto compartilhem nome, categoria, destino, status e CTA sem duplicacao manual.

### Story 2.3

Conectar blog, materiais e paginas de oferta com descoberta interna, SEO tecnico e metricas de conversao aprovadas pelo negocio. Esta historia deve corrigir primeiro as divergencias conhecidas do PRD, inclusive a ausencia atual de `sitemap.xml`.

## Success Criteria

- [ ] Um visitante encontra todas as familias de oferta no hub em no maximo um nivel de navegacao a partir do header.
- [ ] Cada CTA do hub aponta apenas para uma rota existente ou para o fluxo de contato existente.
- [ ] As rotas atuais de apps, marketplace, blog e conta continuam acessiveis.
- [ ] O catalogo futuro tem uma fonte de dados definida, sem acoplamento de dominio ou duplicacao descontrolada.
- [ ] Conteudo e ofertas podem ser medidos e descobertos sem expor dados sensiveis no frontend.

## Compatibility Requirements

- Preservar `config.routes.validPages`, o carregamento de paginas em `src/core/core.js` e o fallback SPA para `index.html`.
- Nao alterar a resolucao de API, contratos do backend, storage de autenticacao ou paginas existentes fora do escopo de cada historia.
- Manter os componentes e tokens visuais ja usados pelo m-site, com comportamento responsivo em desktop e mobile.

## Risks and Mitigations

| Risk | Impact | Mitigation | Rollback |
| --- | --- | --- | --- |
| Navegacao nova esconder destinos importantes | Medio | Manter links e rotas existentes acessiveis pelo hub e validar cada CTA. | Restaurar o header anterior e remover a rota nova. |
| Catalogo exibir oferta inexistente ou desatualizada | Alto | Story 2.1 referencia somente paginas atuais; Story 2.2 cria fonte canonica antes de expandir. | Remover a entrada do catalogo sem afetar o runtime dos produtos. |
| Hub virar um monolito de produto | Alto | Limitar o site a descoberta, conteudo e encaminhamento; regras de negocio ficam nas aplicacoes. | Reverter integracoes de dominio e manter apenas links externos/internos. |
| Regressao do roteamento SPA | Medio | Testar home, nova rota, deep links e recursos estaticos com `serve -s`. | Reverter apenas os arquivos de rota/header da historia. |

## Quality Assurance Strategy

- Story 2.1: revisao de acessibilidade, design e componentes; smoke test manual de rotas e navegacao.
- Story 2.2: revisao arquitetural da fonte de dados, deduplicacao e compatibilidade de rotas.
- Story 2.3: revisao de SEO, privacidade, analytics e comportamento de conteudo sob falha de API.
- Nenhuma historia usa CodeRabbit como pre-requisito bloqueante se a CLI continuar indisponivel; a revisao manual deve ser registrada no gate.

## Definition of Done

- [ ] Todas as historias do epic atendem aos criterios de aceite.
- [ ] Cada entrega preserva as rotas e jornadas existentes.
- [ ] O hub referencia somente informacoes confirmadas no repositorio ou aprovadas pelo negocio.
- [ ] Documentacao, indice de historias e gates de QA foram atualizados.

## Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-19 | 1.0 | Epic criado para iniciar o hub central da Miranda Soft. | @pm / Codex |
