# Arquitetura — EPIC-10: Controlador ERP Generico Multitenant

**Status:** Draft — decisao de negocio e arquitetura pendentes
**Versao:** 0.1
**Data:** 2026-07-26
**Escopo:** Nucleo financeiro multitenant definido em `docs/PRD/controlador-erp-multitenant.md`

## 1. Decisao arquitetural central

O tenant financeiro sera uma **Organizacao**, e nao `appKey`, pessoa usuaria, navegador ou unidade. Todo dado financeiro pertence a uma organizacao. Matriz e filiais sao Unidades subordinadas a essa organizacao. A pessoa autenticada recebe Vinculos de Acesso, que definem em quais organizacoes e unidades ela pode agir.

`appKey` continua sendo mecanismo de acesso a aplicacao no estado atual, mas nao prova autorizacao financeira. A aplicacao do Controlador ERP pode continuar exigindo acesso ao app e, adicionalmente, deve exigir vinculo organizacional.

## 2. Estrategia de portfolio e evolucao

O Controlador ERP e um produto SaaS do portfolio, comercializado por assinatura e isolado dos demais produtos por padrao. A estrategia do ecossistema e iniciar o MVP com um **monolito modular**: poucos componentes operacionais, mas modulos, contratos, autorizacao e dados delimitados por produto. O acesso ao ERP deve exigir entitlement de assinatura aprovado e vinculo organizacional; nem o entitlement nem o acesso a outro produto conferem acesso aos seus dados financeiros.

Com uso, base de clientes e necessidade operacional comprovados, o modulo do ERP pode ser isolado para escalar e evoluir independentemente. Essa extracao deve preservar contratos e ser acompanhada de plano de dados, observabilidade, ownership e rollback; nao e uma reescrita nem uma separacao antecipada. A decisao transversal completa esta em `docs/architecture/adr-010-estrategia-ecossistema-saas.md`.

## 3. Estado atual verificado

| Superficie | Evidencia | Limite para o novo produto |
| --- | --- | --- |
| Acesso por aplicacao | `apps/m-manage/src/models/mAppAccess.ts` define `userId`, `appKey` e `role`. | Nao representa empresa, filial ou escopo financeiro. |
| Guard atual | `apps/m-manage/src/middleware/tenantPlugin.ts` recupera `appKey` da requisicao e valida `mAppAccess`. | Permite acesso ao app, nao tenant empresarial. |
| ERP existente | `apps/m-manage/src/models/mErp.ts` usa `appKey`, dados mistos e tipos de fabricacao. | Nao modela receitas/despesas ou hierarquia organizacional. |
| m-site | SPA publica com API configuravel. | Nao deve decidir nem aplicar isolamento financeiro no browser. |

## 4. Agregados e contratos conceituais

| Agregado | Campos minimos de contrato | Invariantes |
| --- | --- | --- |
| Organizacao | `id`, `nome`, `status`, `createdAt` | E a fronteira de tenant. |
| Unidade | `id`, `organizationId`, `nome`, `tipo: matriz|filial`, `status` | Pertence a uma unica organizacao; deve existir no maximo uma matriz ativa conforme regra aprovada. |
| Membership | `id`, `userId`, `organizationId`, `role`, `unitScope` | Nao concede acesso fora da organizacao; `unitScope` e avaliado no servidor. |
| LancamentoFinanceiro | `id`, `organizationId`, `unitId?`, `natureza: receita|despesa`, `valor`, `data`, `status`, `categoriaId?`, `auditRef` | Nunca muda de organizacao; unidade, se presente, pertence a mesma organizacao. |
| CategoriaFinanceira | `id`, `organizationId`, `nome`, `naturezasPermitidas` | Nunca e compartilhada implicitamente entre organizacoes. |
| AuditoriaFinanceira | `id`, `organizationId`, `actorId`, `acao`, `entityRef`, `occurredAt` | Nao substitui o evento financeiro e nao deve registrar dados pessoais excessivos. |

Campos como moeda, vencimento, competencia, recorrencia, contrapartida, anexos, centro de custo e estados detalhados dependem dos gates do PRD; nao fazem parte deste contrato inicial como fato decidido.

## 5. Fluxos obrigatorios

### 5.1 Resolucao de contexto

1. A API autentica a pessoa usuaria.
2. A rota identifica a organizacao alvo por parametro de rota ou contexto explicitamente selecionado.
3. Um guard central busca o Membership ativo para `userId + organizationId`.
4. Se houver unidade alvo, o guard confirma que ela pertence a organizacao e esta em `unitScope` quando houver limitacao.
5. Servicos e repositorios recebem um `TenantContext` validado, sem aceitar `organizationId` arbitrario como unico controle.

### 5.2 Escrita financeira

1. O servico recebe `TenantContext` e dados do lancamento.
2. Valida natureza, organizacao e unidade no mesmo contexto.
3. Persiste o lancamento com `organizationId` obrigatorio.
4. Grava evento de auditoria correlacionado.
5. Retorna somente dados pertencentes ao contexto resolvido.

### 5.3 Consulta e consolidacao

- Consulta por unidade: filtro obrigatório de `organizationId` e `unitId` validado.
- Consulta organizacional: filtro obrigatório de `organizationId`; inclui somente unidades da organizacao.
- Consolidacao: agregacao inicia com o mesmo filtro de organizacao e, se houver escopo de unidade, aplica-o antes de somar.
- Nenhuma agregacao, exportacao ou job pode montar filtro a partir de ID fornecido pelo cliente sem `TenantContext`.

## 6. Autorizacao

Os nomes e privilegios finais de papéis dependem de DG-CERP-03. A arquitetura exige ao menos separacao entre leitura, criacao/edicao e administracao de acesso. A verificacao de papel deve ocorrer depois da resolucao da organizacao e antes da consulta/escrita. Esconder controles na UI nao e autorizacao.

O bypass de administrador global atualmente existente em `tenantPlugin.ts` nao deve conceder por si so acesso operacional irrestrito aos dados financeiros sem politica, trilha de auditoria e escopo aprovados.

## 7. Persistencia, indices e migracao

- Usar colecoes/entidades especificas para o novo nucleo; nao sobrecarregar `mErp.data` de fabricacao.
- Todo documento com visibilidade financeira deve ter `organizationId` indexado.
- Consultas por unidade devem usar indice composto iniciado por `organizationId` e `unitId` conforme padrao de acesso aprovado.
- Lancamentos nao devem ser migrados a partir de dados atuais sem mapeamento, responsavel, backup e validacao por tenant.
- A convivência inicial deve manter o ERP fabril existente isolado. Qualquer integracao futura ocorre por adaptador/versionamento, nao por conversao implicita.

## 8. Seguranca, privacidade e observabilidade

- ID de tenant deve ser aplicado na camada de acesso aos dados, nao apenas nos controladores HTTP.
- Logs devem usar ID de correlacao e referencias tecnicas; valores financeiros e PII so podem ser registrados quando houver necessidade operacional, politica de retencao e acesso definido.
- Falhas de autorizacao retornam mensagem segura e evento de auditoria/seguranca sem revelar se outra organizacao existe.
- Testes precisam provar casos negativos: troca manual de `organizationId`, `unitId` de outra organizacao, consolidacao parcial e exportacao cross-tenant.

## 9. Ponto de integracao e sequencia

| Fase | Superficie prevista | Precondicao |
| --- | --- | --- |
| Entitlement | Plataforma de assinatura — contrato de acesso ao produto | DG-CERP-07 |
| Dominio | `apps/m-manage` — novos modelos/servicos do controlador | DG-CERP-01 e DG-CERP-03 |
| Guard | `apps/m-manage` — middleware/servico de `TenantContext` | Dominio de Membership definido |
| Financeiro | `apps/m-manage` — rotas e repositorios financeiros | DG-CERP-02 e DG-CERP-04 |
| Interface autenticada | Aplicacao do ecossistema que consome a API | Contrato de API e permissao aprovados |
| Vitrine | `apps/m-site` — somente se uma story comercial aprovar rota/copy/CTA | Decisao comercial independente |

## 10. Rollback

O rollout deve ser por rota e por novo agregado. Em caso de falha: interromper rotas do novo controlador, preservar registros e auditoria para analise, revogar memberships afetados e manter o ERP fabril atual inalterado. Nao executar migracao destrutiva nem reutilizar IDs de tenant entre os dois domínios.

## 11. Validacao arquitetural antes de codigo

- [ ] Contratos de Organizacao, Unidade, Membership e Lancamento aprovados.
- [ ] Gates DG-CERP-01 a DG-CERP-04 resolvidos ou a story correspondente mantida bloqueada.
- [ ] O contrato de entitlement por assinatura e os servicos compartilhados do MVP foram decididos em DG-CERP-07.
- [ ] Ponto unico de `TenantContext` definido e aplicado a leitura, escrita, agregacao, exportacao e jobs.
- [ ] Indices e estrategia de migracao revisados com volume/dados reais antes de rollout.
- [ ] Casos cross-tenant descritos em testes de autorizacao.
- [ ] Nenhuma alteracao no m-site e tratada como controle de seguranca do ERP.
