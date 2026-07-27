---
id: "PRD-CERP-001"
title: "Controlador ERP Generico Multitenant"
status: "Draft"
owner: "@po"
created: "2026-07-26"
source: "Solicitacao do produto em 2026-07-26"
---

# PRD — Controlador ERP Generico Multitenant

## 1. Problema e visao

Empresas de segmentos distintos precisam controlar receitas e despesas sem que o produto assuma fluxos, estoque, fiscal, producao ou regras proprias de um unico ramo. O produto proposto e um controlador ERP financeiro de nucleo generico: uma mesma pessoa usuaria pode administrar mais de uma empresa, e cada empresa pode operar com matriz e filiais.

O primeiro objetivo e dar visibilidade financeira segura por empresa, unidade e consolidado, preservando isolamento entre organizacoes. O Controlador ERP e um produto do ecossistema SaaS da Miranda Soft: sua comercializacao ocorre por assinatura e seu acesso nao concede visibilidade automatica a outros produtos do portfolio. O m-site continua sendo a vitrine e camada de descoberta; a operacao autenticada do produto requer evolucao no backend/aplicacao do ecossistema, atualmente em `apps/m-manage`.

O MVP deve validar esse nucleo com o menor numero de componentes operacionais que preserve os limites de dominio. A evolucao esperada e um monolito modular com produtos delimitados e, quando houver base de uso e necessidade operacional comprovadas, o isolamento seletivo de cada produto para seu crescimento independente. A estrategia transversal esta registrada em `docs/architecture/adr-010-estrategia-ecossistema-saas.md`.

## 2. Requisitos fornecidos pelo negocio

| ID | Requisito |
| --- | --- |
| FR-001 | O produto deve atender ao maximo de tipos de negocio sem acoplamento inicial a um segmento. |
| FR-002 | O produto deve controlar despesas e receitas das empresas. |
| FR-003 | Todos os dados do produto devem ser multitenant. |
| FR-004 | Uma pessoa usuaria pode ter acesso a mais de uma empresa. |
| FR-005 | Uma empresa pode ter matriz e filiais. |
| FR-006 | O controle financeiro deve permitir leitura por empresa/unidade e leitura consolidada quando a pessoa tiver permissao. |

## 3. Modelo de dominio alvo

A hierarquia minima e deliberadamente separada da conta de acesso:

```text
Pessoa usuaria
  └─ Vinculo de acesso a uma ou mais Organizacoes (empresas)
       └─ Organizacao
            ├─ Unidade matriz
            └─ Unidades filiais
                 └─ Lancamentos financeiros (receita ou despesa)
```

- **Pessoa usuaria:** identidade autenticada; nao e sinônimo de empresa.
- **Organizacao:** fronteira principal de tenant e agrupamento empresarial acessado por uma ou mais pessoas.
- **Unidade:** matriz ou filial pertencente a uma unica organizacao. A matriz e uma unidade, nao uma permissao especial.
- **Vinculo de acesso:** associa pessoa, organizacao e papel. O acesso pode ser limitado a unidades especificas se o papel exigir.
- **Lancamento financeiro:** registro de receita ou despesa pertencente a uma organizacao e, quando aplicavel, a uma unidade. Nao pode ser movido entre organizacoes por edicao comum.

## 4. Escopo do primeiro produto

### Incluido

- Cadastro e selecao de contexto organizacional para uma pessoa com varias empresas.
- Estrutura de matriz e filiais dentro de cada organizacao.
- Registro de receitas e despesas com identificacao de organizacao e unidade.
- Consulta financeira por unidade, por organizacao e consolidada apenas no escopo autorizado.
- Categorias e classificacoes configuraveis pela organizacao, sem lista de categorias imposta por setor.
- Papeis e permissoes delimitados por organizacao e, quando requerido, por unidade.
- Rastreabilidade de criacao, alteracao, cancelamento e liquidacao de lancamentos.
- Isolamento de dados no backend, nas consultas, exportacoes e logs operacionais.

### Explicitamente fora do primeiro nucleo

- Fiscal, emissao de nota, contabilidade oficial, folha, estoque, producao, CRM, e-commerce, conciliacao bancaria automatica e integracoes externas.
- Regras comerciais, categorias ou telas exclusivas de industria, servicos, varejo, saude, alimentacao ou qualquer outro segmento.
- Consolidacao entre organizacoes distintas sem uma relacao societaria e autorizacao de acesso explicitamente definidas.

Esses itens podem ser modulos posteriores, mas nao devem contaminar o modelo financeiro generico inicial.

## 5. Regras de negocio obrigatorias

1. Cada registro financeiro deve carregar `organizationId`, o identificador da organizacao, de forma obrigatoria e imutavel apos criacao.
2. Toda consulta deve ser filtrada no servidor pelo escopo organizacional autorizado, nunca apenas pelo contexto informado pelo cliente.
3. Uma filial nao pode pertencer a mais de uma organizacao.
4. A soma consolidada deve incluir somente unidades para as quais o vinculo da pessoa permite leitura.
5. Receita e despesa sao naturezas distintas; seus valores nao podem ser confundidos por sinal implicito no cliente.
6. Lancamentos financeiros devem conservar historico auditavel. Correcao financeira deve preservar referencia ao evento anterior em vez de apagar o fato sem rastreabilidade.
7. Categorias, centros de resultado e marcadores do primeiro nucleo sao configuracoes do tenant, nao valores globais compartilhados entre clientes.
8. Identificadores de organizacao e unidade devem ser validados em toda escrita, leitura, agregacao, exportacao e job assíncrono.

## 6. Requisitos nao funcionais

| ID | Requisito |
| --- | --- |
| NFR-001 | Isolamento multitenant deve ser aplicado no backend como controle de seguranca, inclusive em agregacoes e exportacoes. |
| NFR-002 | A autorizacao deve verificar identidade ativa, vinculo organizacional e papel antes de acesso a dados financeiros. |
| NFR-003 | Operacoes financeiras relevantes devem produzir trilha de auditoria sem armazenar dados pessoais desnecessarios. |
| NFR-004 | O produto deve suportar crescimento de empresas e unidades sem depender de `appKey` como identificador de tenant financeiro. |
| NFR-005 | A interface deve exibir de forma clara a organizacao e unidade ativas para evitar lancamento no contexto errado. |
| NFR-006 | Valores monetarios, datas, moedas, fuso horario, retencao e regras de exclusao precisam de contrato explicito antes de implementacao financeira definitiva. |

## 7. Evidencias do estado atual e impacto

O backend existente em `apps/m-manage` possui acesso por aplicacao em `src/models/mAppAccess.ts` e `src/middleware/tenantPlugin.ts`, usando `appKey`. O modelo ERP existente em `src/models/mErp.ts` tambem indexa dados por `appKey` e contem estruturas especificas de fabricacao. Isso e insuficiente para representar organizacao, matriz, filial, vinculo por pessoa e segregacao financeira generica.

Portanto, o Controlador ERP nao deve reutilizar `appKey` como tenant empresarial nem estender o documento ERP especifico de fabricacao como modelo financeiro universal. A migracao e a convivencia com dados atuais precisam de uma decisao arquitetural e de rollout proprio.

## 8. Gates de decisao

| Gate | Decisao necessaria | Impacto |
| --- | --- | --- |
| DG-CERP-01 | Definir se uma organizacao representa uma empresa juridica, um grupo empresarial ou ambos. | Modelo de organizacao e consolidacao. |
| DG-CERP-02 | Definir moeda, fuso horario, competencia, vencimento e estados de liquidacao. | Contrato de lancamento financeiro. |
| DG-CERP-03 | Definir papéis, quem pode convidar pessoas e se permissao pode ser limitada por unidade. | Autorizacao e auditoria. |
| DG-CERP-04 | Definir politica de retencao, cancelamento, correcao e exportacao de dados financeiros. | Imutabilidade, LGPD e operacao. |
| DG-CERP-05 | Definir se consolidacao entre organizacoes do mesmo grupo faz parte da primeira versao. | Relacao societaria e consultas consolidadas. |
| DG-CERP-06 | Definir integracoes futuras prioritarias e responsabilidade por dados sincronizados. | Adaptadores e consistencia. |
| DG-CERP-07 | Definir como a assinatura concede acesso ao produto e quais servicos de plataforma sao compartilhados no MVP. | Entitlement, autenticacao e fronteira entre produtos. |

## 9. Criterios de sucesso do nucleo

- Uma pessoa com permissao consegue alternar entre duas ou mais organizacoes sem visualizar dados da outra organizacao fora do seu escopo.
- Uma organizacao consegue cadastrar matriz e filiais e consultar receitas/despesas no recorte correto.
- Uma consulta consolidada respeita o mesmo filtro de autorizacao aplicado aos lancamentos individuais.
- Nenhuma funcionalidade do nucleo exige uma regra ou taxonomia de segmento especifico.
- Tentativas de leitura ou escrita fora do tenant retornam erro seguro e sao auditaveis sem expor dados financeiros.

## 10. Riscos

| Risco | Mitigacao |
| --- | --- |
| Tratar `appKey` como empresa e misturar acesso a produto com isolamento financeiro. | Separar os agregados Organizacao, Unidade e Vinculo de Acesso do mecanismo atual de apps. |
| Criar ERP generico com requisitos de um unico segmento embutidos. | Limitar o primeiro nucleo a eventos financeiros, hierarquia e classificacoes configuraveis. |
| Vazamento entre empresas em consultas agregadas ou exportacoes. | Impor escopo organizacional no repositorio/servico e testar cenarios cross-tenant. |
| Apagar ou editar fatos financeiros sem trilha. | Definir ciclo de vida e auditoria antes de liberar operacao financeira. |
| Iniciar implementacao fiscal/contabil sem responsabilidade regulatoria definida. | Manter esses modulos fora do nucleo ate decisao formal. |

## 11. Rastreabilidade

O trabalho inicial e de definicao de produto e arquitetura. As stories do `EPIC-10` detalham implementacao somente para requisitos cujo contrato esteja suficientemente definido. Nenhuma pagina publica, endpoint, banco, integracao ou claim comercial novo e autorizado por este PRD isoladamente.
