---
id: "EPIC-11"
title: "Cotações Financeiras Públicas"
status: "Ready for Dev"
owner: "@po"
created: "2026-07-27"
source_prd: "docs/PRD/m-site.md"
tracking: "local-only"
---

# EPIC-11: Cotações Financeiras Públicas

| Campo | Valor |
| --- | --- |
| Status | Ready for Dev |
| Owner | @po |
| Fonte de verdade | Solicitação do produto de disponibilizar dólar, euro e bitcoin como novo acesso no menu principal; estado real da SPA. |
| Tracking | Local-only; nenhum adaptador de PM está configurado neste workspace. |

## Objetivo

Disponibilizar uma rota pública de consulta informativa para dólar americano, euro e bitcoin cotados em reais brasileiros, acessível pelo menu principal sem conflitar com a rota comercial existente `/cotacoes`.

## Contexto e evidências

- `/cotacoes` já é uma página indexável de pedido comercial de cotação, registrada em `src/config/config.js`, `src/config/seo.js` e `sitemap.xml`; ela não representa câmbio ou criptoativos.
- A SPA carrega páginas parciais de `src/pages/` a partir de `config.routes.validPages`, atualiza SEO em runtime e é servida com fallback por `serve -s`.
- Em 2026-07-27, a consulta técnica ao endpoint público `https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL` retornou os três pares esperados. Um teste em navegador da origem local confirmou `fetch` CORS com HTTP 200.

## Escopo

### Incluído

- Rota pública `/mercado`, com entrada `Mercado` na navegação principal.
- Consulta de `USDBRL`, `EURBRL` e `BTCBRL` ao endpoint público validado da AwesomeAPI.
- Exibição de valor de compra, variação percentual e instante informado pela fonte para cada ativo.
- Estados explícitos de carregamento, indisponibilidade e atualização manual, sem apresentar valores inventados.
- Aviso de uso exclusivamente informativo, sem recomendação de investimento, compra ou venda.
- Registro da rota, SEO, sitemap, cache-busting e testes de contrato da SPA.

### Excluído

- Conversor de moedas, histórico, gráfico, alertas de preço, carteira, negociação, login ou coleta de dados.
- Backend, proxy, banco de dados, credencial, serviço pago ou dependência de build.
- Promessas de disponibilidade, precisão de mercado em tempo real ou aconselhamento financeiro.

## Requisitos

| ID | Requisito |
| --- | --- |
| FR-1101 | O menu principal deve oferecer o acesso `Mercado` para `/mercado`, preservando o CTA comercial `Pedir cotação` para `/cotacoes`. |
| FR-1102 | A página deve apresentar Dólar americano, Euro e Bitcoin em BRL a partir dos pares `USDBRL`, `EURBRL` e `BTCBRL`. |
| FR-1103 | A página deve carregar os valores ao abrir a rota e permitir atualização manual. |
| FR-1104 | Cada card deve revelar valor, variação percentual e data/hora fornecida pela fonte quando disponíveis. |
| FR-1105 | Em falha, a interface deve indicar indisponibilidade; não deve mostrar preço de exemplo nem alegar atualização concluída. |
| FR-1106 | A página deve identificar a fonte e informar que os valores são apenas informativos, não recomendação financeira. |
| NFR-1101 | A implementação deve manter a SPA vanilla existente, sem nova biblioteca, build step ou chamada ao backend. |
| NFR-1102 | A rota deve ser acessível por navegação interna e deep link no runtime `serve -s`; SEO, sitemap e cache-busting devem concordar com o slug. |
| NFR-1103 | A página deve ter semântica, foco visível, rótulos acessíveis e feedback por live region. |
| NFR-1104 | A atualização deve ter timeout, evitar requisições concorrentes e não fazer polling automático. |
| CON-1101 | Nenhum valor ou timestamp pode ser codificado como dado de mercado; a fonte é a única origem de valores. |
| CON-1102 | A rota `/cotacoes` comercial não pode ser reutilizada, renomeada ou ter seu comportamento alterado. |

## Stories

| ID | Título | Prioridade | Status | Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| [11.1](../stories/11.1-criar-pagina-de-cotacoes-financeiras.md) | Criar página pública de cotações financeiras | High | Ready for Dev | @dev | @qa |

## Critérios de sucesso

- [ ] O visitante alcança `/mercado` pelo menu sem perder o acesso a `/cotacoes` comercial.
- [ ] Os três pares são apresentados em BRL com estados honestos de carregamento e falha.
- [ ] A integração é realizada exclusivamente por `fetch` CORS ao endpoint validado, sem segredos no cliente.
- [ ] A nova URL está registrada no router, SEO e sitemap, com o mesmo versionamento dos scripts críticos.
- [ ] A rota e a navegação passam por validação local, revisão independente e testes de contrato.

## Riscos e rollback

| Risco | Mitigação | Rollback |
| --- | --- | --- |
| Fonte externa indisponível ou com contrato alterado | Validar forma dos três pares, usar timeout e mostrar indisponibilidade verdadeira. | Remover o link do menu e a rota nova sem afetar `/cotacoes`. |
| Confusão entre cotação comercial e financeira | Usar slug e rótulo `Mercado`; preservar CTA `Pedir cotação`. | Restaurar somente o header anterior. |
| Dados interpretados como recomendação | Aviso explícito de finalidade informativa e ausência de CTA de negociação. | Remover a página e sua entrada do sitemap. |
| Cache de configurações anteriores | Bump coordenado de versão e query strings de scripts críticos. | Reverter o conjunto de rota/SEO/versão da story. |

## Definition of Done

- [ ] A story 11.1 cumpre seus critérios de aceite e a file list está atualizada.
- [ ] A rota pública, SEO, sitemap e menu concordam com o mesmo slug.
- [ ] Testes de contrato, sintaxe, servidor local e revisão independente foram executados.
- [ ] Não há arquivos gerados, segredos ou mudanças fora do escopo no commit.
