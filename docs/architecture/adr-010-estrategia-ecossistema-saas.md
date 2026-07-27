# ADR-010 — Estrategia de evolucao do ecossistema SaaS

**Status:** Aceita
**Data:** 2026-07-26
**Decisao de negocio:** Produtos digitais por assinatura, com isolamento por produto e evolucao guiada por validacao de mercado.

## Contexto

A Miranda Soft quer operar um ecossistema de produtos SaaS: cada produto e vendido por assinatura, e uma pessoa usuaria consome os produtos para os quais possui acesso. O Controlador ERP e o primeiro produto em especificacao, mas nao deve ser tratado como um sistema que absorve todo o portfolio.

No inicio, a prioridade e colocar um MVP utilizavel no mercado, aprender com uso real e obter uma base consistente. A arquitetura nao pode antecipar microservicos, infraestrutura distribuida ou compartilhamento indiscriminado de dados sem evidencia de necessidade.

## Decisao

1. Cada oferta comercial e um **produto de portfolio** com assinatura, ciclo de vida, dados e backlog proprios.
2. Um produto pode usar servicos de plataforma compartilhados — por exemplo, identidade, cobranca, notificacao e observabilidade — somente por contratos explicitos. Acesso a um produto nao equivale a acesso aos dados de outro produto.
3. O MVP deve iniciar com o menor numero de componentes operacionais que preserve limites de dominio e seguranca. A forma preferencial e um **monolito modular**, e nao uma rede de microservicos prematura.
4. No monolito modular, cada produto deve possuir modulo, contratos, persistencia e autorizacao com fronteiras claras. O Controlador ERP continua isolado por `organizationId` dentro do proprio dominio.
5. Quando houver validacao de mercado, volume ou necessidades operacionais comprovadas, um produto pode ser isolado para evoluir e escalar de forma independente. A extracao e uma evolucao planejada de um limite ja existente, nao uma reescrita.
6. Nenhum dado financeiro de um produto pode ser compartilhado, consultado ou consolidado por outro produto sem autorizacao, contrato e finalidade definidos.

## Fases

| Fase | Objetivo | Forma de entrega | Criterio de passagem |
| --- | --- | --- | --- |
| MVP validavel | Resolver um problema central e obter uso real. | Modulos delimitados no menor numero de deploys necessario. | Uso recorrente, feedback e base operacional suficientes para medir demanda. |
| Produto consolidado | Tornar operacao, seguranca e indicadores repetiveis. | Monolito modular com contratos, observabilidade e ownership por produto. | Limites de desempenho, confiabilidade, equipe ou release justificam autonomia. |
| Isolamento seletivo | Escalar um produto sem acoplar o restante do portfolio. | Extracao por produto/modulo com API, dados e deploy independentes. | Plano de migracao, rollback, ownership e custo operacional aprovados. |

Os criterios de passagem devem ser definidos com dados reais; nao ha limiar numerico inventado neste ADR.

## Consequencias

### Positivas

- Menor tempo para validar cada produto por assinatura.
- Reducao do custo e da complexidade operacional no inicio.
- Limites preparados para separar produtos sem misturar clientes ou dominios.
- Cada produto pode ganhar ritmo de evolucao e escala proprios quando justificar.

### Riscos e protecoes

| Risco | Protecao obrigatoria |
| --- | --- |
| Um produto virar um "super sistema" acoplado ao portfolio inteiro. | Backlog e fronteira de dominio por produto; novos modulos exigem decisao de portfolio. |
| Compartilhamento informal de dados entre produtos. | Contrato, autorizacao, auditoria e finalidade explicitos antes de qualquer integracao. |
| Extracao precoce criar custo operacional sem retorno. | Manter monolito modular ate haver evidencia mensuravel. |
| Extracao tardia bloquear escala de um produto. | Instrumentar desempenho, disponibilidade, releases e carga por modulo desde a fase consolidada. |

## Aplicacao ao Controlador ERP

O ERP e um produto de assinatura do portfolio. Seu tenant financeiro e `Organizacao`, separado da identificacao de produto. Ele pode compartilhar identidade e entitlement de assinatura com a plataforma, mas suas unidades, lancamentos e auditoria nao podem ser visiveis a outros produtos por padrao.

## Decisoes futuras

- Definir o responsavel e o modelo de entitlement/assinatura por produto.
- Definir quais servicos de plataforma sao realmente compartilhados no MVP.
- Definir indicadores operacionais que justificam isolamento de um produto.
- Criar ADR de extracao antes de separar qualquer modulo em novo deploy ou repositorio.
