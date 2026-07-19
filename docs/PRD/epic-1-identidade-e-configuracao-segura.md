---
id: "EPIC-1"
title: "Identidade do Produto e Configuracao Segura do Cliente"
status: "Planning"
owner: "@pm"
created: "2026-07-18"
source_prd: "docs/PRD/m-site.md"
tracking: "local-only"
---

# EPIC-1: Identidade do Produto e Configuracao Segura do Cliente

| Field | Value |
| --- | --- |
| Status | Planning |
| Owner | @pm |
| Source of truth | `docs/PRD/m-site.md` |
| Tracking | Local-only. No PM/ClickUp adapter is configured in this workspace. |

## Objective

Eliminar a divergencia entre a documentacao publica do repositorio e o produto Miranda Soft, preparando em seguida a configuracao client-side para nao reter valores sensiveis.

## Business Value

Contribuidores, operadores de deploy e usuarios tecnicos passam a ter instrucoes corretas para executar e publicar o site. A segunda historia atende ao risco de seguranca registrado no roadmap do PRD.

## Existing System Context

- O produto atual e uma SPA estatica em JavaScript vanilla, HTML e CSS, com componentes HTML carregados dinamicamente.
- `index.html`, `src/config/config.js`, `src/pages/` e `src/components/` ja usam a marca Miranda Soft e a API `api.mirandasoft.com.br`.
- O `README.md` ainda descreve uma landing page pessoal de Breno Miranda e indica um fluxo local que conflita com a porta local da API.
- A configuracao de producao e resolvida no navegador por `src/config/config.js`; o arquivo contem valores de token no cliente que precisam de revisao.

Sources: `docs/PRD/m-site.md#1. Visao`, `docs/PRD/m-site.md#6. Arquitetura`, `README.md`, `src/config/config.js`, `Dockerfile`.

## Scope

### In Scope

- Atualizar o README para representar o produto, a arquitetura e o fluxo operacional existentes.
- Remover valores sensiveis da configuracao exposta ao navegador, usando uma pratica segura definida para producao.
- Preservar a resolucao atual da URL da API para producao, desenvolvimento local e override global documentado.

### Out of Scope

- Especificacao detalhada da API ou mudancas de contrato no backend.
- Definicao de IDs reais de analytics ou de metricas de negocio.
- Criacao de uma suite automatizada de testes de rotas.
- Reprojeto visual do site ou das paginas existentes.

## Stories

| ID | Title | Priority | Status | Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| [1.1](../stories/1.1.alinhar-readme-ao-produto-miranda-soft.md) | Alinhar o README ao produto Miranda Soft | High | In Progress | @dev | @architect |
| 1.2 | Remover segredos da configuracao client-side | High | Planned | @devops | @architect |

### Story 1.1

Documentar corretamente a identidade do produto, a stack estatica, as rotas e as instrucoes locais/deploy que ja existem no repositorio.

### Story 1.2

Revisar os valores sensiveis expostos em `src/config/config.js` e mover o que for secreto para uma pratica segura de producao, sem alterar por suposicao o contrato da API. Esta historia depende de uma decisao validada pelo responsavel por backend/deploy sobre a entrega da credencial.

## Success Criteria

- [ ] O README nao descreve mais o projeto como landing pessoal ou aponta para o dominio legado.
- [ ] O README documenta somente comportamento e comandos confirmados no repositorio.
- [ ] Nenhum segredo necessario ao funcionamento em producao permanece embutido no bundle client-side apos a Story 1.2.
- [ ] A resolucao de URL da API permanece compativel com producao, localhost e `window.__MSOFT_API_BASE__`.

## Technical Requirements

- Manter o projeto como site estatico sem introduzir build step ou dependencia por conveniencia.
- Tratar `src/config/config.js` como codigo publico entregue ao navegador.
- Usar a porta `3000` somente para a API local; o servidor do site deve usar outra porta, conforme o comentario em `src/config/config.js` e o `Dockerfile`.
- Validar manualmente HTML/CSS/JS no navegador, conforme `AGENTS.md`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Documentacao continuar com dados da landing legada | Alto | Comparar cada afirmacao com PRD, configuracao e arquivos de deploy antes de publicar. |
| Segredo ainda ser necessario pela API | Alto | Nao remover nem substituir valores ate haver uma forma segura aprovada pelo responsavel de backend/deploy. |
| Mudanca de configuracao quebrar integracao existente | Alto | Preservar a logica de `resolveApiBaseUrl` e validar os cenarios local e producao. |
| Ausencia de arquitetura formal | Medio | Registrar referencias ao codigo real e criar uma arquitetura somente quando houver escopo para isso. |

## Dependencies

- Story 1.1 nao depende de historia anterior.
- Story 1.2 depende da conclusao da Story 1.1 e da definicao segura de entrega de credenciais pelo responsavel de backend/deploy.
- Nao ha integracao configurada com ClickUp; os documentos locais sao a fonte de verdade inicial.

## Follow-on Backlog

Os itens de analytics e smoke tests de rotas permanecem fora deste epic e devem ser planejados em epics posteriores, conforme `docs/PRD/m-site.md#8. Roadmap sugerido`.

## Definition of Done

- [ ] As historias do epic atendem aos criterios de aceite.
- [ ] A compatibilidade da SPA e da integracao com a API foi validada no escopo de cada historia.
- [ ] A documentacao relacionada foi atualizada.
- [ ] Nenhuma mudanca de runtime foi adicionada sem uma historia aprovada.

## Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-18 | 1.0 | Epic criado a partir do roadmap do PRD. | @pm / Codex |
