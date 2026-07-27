---
id: "EPIC-10"
title: "Nucleo do Controlador ERP Generico Multitenant"
status: "Draft"
owner: "@po"
created: "2026-07-26"
source_prd: "docs/PRD/controlador-erp-multitenant.md"
tracking: "local-only"
---

# EPIC-10: Nucleo do Controlador ERP Generico Multitenant

## Goal

Criar o nucleo de dominio que permite a uma pessoa administrar receitas e despesas em mais de uma organizacao, com matriz e filiais, sem acoplamento inicial a um segmento de negocio.

## Contexto existente

- `apps/m-site` e uma SPA institucional; ela e a superficie de vitrine e documentacao, nao o local adequado para aplicar isolamento financeiro.
- `apps/m-manage` ja autentica pessoas e concede acesso por `appKey`, mas ainda nao representa organizacao, unidade ou acesso financeiro por empresa.
- O ERP atual no backend e orientado a fabricacao e utiliza `appKey`; ele nao deve ser convertido implicitamente em tenant financeiro generico.
- O ERP sera um produto SaaS por assinatura do portfolio. O MVP deve preservar limites de produto em um monolito modular; isolamento em deploy/servico proprio somente ocorre quando uso e necessidade operacional o justificarem, conforme `docs/architecture/adr-010-estrategia-ecossistema-saas.md`.

## Escopo incremental

1. Especificar e materializar a fronteira de tenant `Organizacao` e suas unidades.
2. Vincular uma pessoa a varias organizacoes com papeis verificaveis.
3. Registrar receitas e despesas com escopo obrigatorio de organizacao/unidade.
4. Disponibilizar leituras segmentadas e consolidadas dentro do escopo autorizado.
5. Proteger todo acesso financeiro com verificacao server-side e auditoria.

## Fora do escopo

Fiscal, contabilidade oficial, estoque, producao, folha, CRM, conciliacao bancaria automatica e integracoes externas. Nenhuma experiencia comercial publica no m-site sera publicada sem story e decisao de portfolio propria.

## Stories

| ID | Story | Prioridade | Estado | Dependencia |
| --- | --- | --- | --- | --- |
| 10.1 | Delimitar organizacao, matriz, filial e vinculos de acesso | Critical | Draft | DG-CERP-01, DG-CERP-03 |
| 10.2 | Proteger o contexto financeiro multitenant no backend | Critical | Draft | 10.1 |
| 10.3 | Registrar receitas e despesas genericas com trilha auditavel | Critical | Draft | 10.1, DG-CERP-02, DG-CERP-04 |
| 10.4 | Consultar financeiro por unidade e consolidado autorizado | High | Draft | 10.2, 10.3, DG-CERP-05 |
| 10.5 | Configurar classificacoes genericas por organizacao | High | Draft | 10.1 |

## Criterios de aceite do epic

- [ ] O modelo separa pessoa, organizacao, unidade e vinculo de acesso.
- [ ] Nenhum fluxo financeiro usa apenas `appKey` como prova de escopo empresarial.
- [ ] Uma pessoa pode acessar mais de uma organizacao sem mistura de dados.
- [ ] Matriz e filial pertencem a uma unica organizacao e podem ser filtradas nas leituras financeiras.
- [ ] Receita e despesa possuem historico e escopo obrigatorio.
- [ ] Consolidacoes sao autorizadas no servidor e nao incluem unidades fora do vinculo da pessoa.
- [ ] As dependencias de regulacao, moeda, ciclo de vida, retencao e integracao permanecem visiveis como gates.
- [ ] O acesso por assinatura e a fronteira do ERP em relacao aos demais produtos foram definidos antes de implementacao, conforme DG-CERP-07.

## Riscos e rollback

| Risco | Mitigacao | Rollback |
| --- | --- | --- |
| Mistura de dados legados e do novo nucleo | Novas colecoes/contratos e migracao versionada; nao reutilizar documento fabril como financeiro universal. | Desabilitar somente as rotas do novo nucleo; preservar dados legados. |
| Vazamento cross-tenant | Guard central de escopo, filtros obrigatorios e testes negativos. | Revogar acesso e bloquear endpoints afetados; preservar logs de auditoria. |
| Taxonomia setorial embutida | Classificacoes configuraveis por organizacao. | Remover configuracao do tenant sem alterar outros tenants. |

## Definition of Done

- [ ] Arquitetura e contratos de dominio aprovados pelo @architect.
- [ ] Cada story tem criterios de aceite, pontos de integracao, validacao e rollback.
- [ ] Nenhuma story dependente de gate pendente esta marcada como pronta para desenvolvimento.
- [ ] A implementacao posterior tem cobertura de autorizacao e isolamento multitenant.
