---
id: "EPIC-12"
title: "Recuperação de Performance Mobile"
status: "Planning"
owner: "@po"
created: "2026-07-27"
source_prd: "docs/PRD/m-site.md"
tracking: "local-only"
---

# EPIC-12: Recuperação de Performance Mobile

| Campo | Valor |
| --- | --- |
| Status | Planning |
| Fonte de verdade | Relatório PageSpeed Insights mobile fornecido pelo produto e evidências no repositório. |
| URL analisada | `https://mirandasoft.com.br/` |
| Relatório | 2026-07-26 23:34:25, conforme página fornecida. |

## Objetivo

Reduzir de forma incremental o custo de carregamento e a instabilidade visual da home mobile, preservando a SPA, o conteúdo, a navegação, as rotas administrativas e os comportamentos existentes.

## Baseline observada

O PageSpeed Insights mobile reportou:

| Métrica | Resultado |
| --- | --- |
| Performance | 48 |
| Accessibility | 95 |
| Best Practices | 92 |
| SEO | 100 |
| First Contentful Paint | 2,6 s |
| Largest Contentful Paint | 5,2 s |
| Total Blocking Time | 60 ms |
| Cumulative Layout Shift | 0,627 |
| Speed Index | 6,5 s |

Auditorias com oportunidade reportada: cache eficiente (economia estimada de 293 KiB), requests bloqueantes de renderização (economia estimada de 570 ms), JavaScript não utilizado (249 KiB), CSS não utilizado (43 KiB), payload total de 9.993 KiB, trabalho na main thread de 2,7 s e quatro tarefas longas.

## Evidências do código atual

- `index.html` faz o carregamento global de jQuery, Bootstrap, Swiper, Papa Parse, Marked e Summernote em todas as rotas.
- O editor Summernote e seu CSS são usados pela superfície administrativa em `src/pages/admin.html`; não há evidência de uso em páginas públicas.
- A busca no código não encontrou consumo de `Papa`, `marked` ou instanciação de `Swiper` em `src/` fora dos arquivos vendor/configuração.
- CSS Bootstrap e Bootstrap Icons bloqueiam renderização, conforme o relatório; os CSS do shell local também pertencem ao caminho crítico atual.
- O relatório identifica CLS alto, mas não atribui nesta evidência uma causa única; mudanças de layout exigem medição antes de uma correção dirigida.

## Escopo

### Incluído

- Medir e otimizar o carregamento de bibliotecas globais que são exclusivamente administrativas ou sem consumidor confirmado.
- Carregar dependências de editor somente na rota que precisa delas, respeitando ordem jQuery → Summernote.
- Manter cada comportamento de rota pública e admin verificável após redução de payload.
- Diagnosticar e estabilizar o maior contribuinte de CLS antes de alterar alturas, skeletons, imagens ou componentes do shell.
- Reexecutar PageSpeed mobile e comparar métricas e auditorias com este baseline.

### Excluído

- Reescrever a SPA, adotar framework, build step, CDN externo, compressão no servidor, troca de hospedagem ou alteração de regras de negócio.
- Prometer uma pontuação fixa: a nota do Lighthouse varia por rede, CPU e conteúdo externo; o objetivo é melhoria mensurável sem regressão funcional.
- Alterar conteúdo editorial, APIs, autenticação, consentimento ou rotas comerciais sem story própria.

## Stories

| ID | Título | Prioridade | Status | Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| [12.1](../stories/12.1-carregar-vendors-sob-demanda.md) | Carregar vendors globais sob demanda por rota | High | Ready for Dev | @dev | @qa |
| 12.2 | Diagnosticar e estabilizar o layout acima da dobra | Critical | Planned | @dev | @qa |
| 12.3 | Reavaliar CSS crítico, imagens e cache após baseline local | High | Planned | @dev | @qa |

## Critérios de sucesso

- [ ] A home não baixa nem executa o editor administrativo ou dependências sem consumidor público confirmado.
- [ ] `/admin` mantém o editor funcionando com carregamento ordenado e erro honesto se uma dependência falhar.
- [ ] A próxima execução PageSpeed mobile reduz as oportunidades de JavaScript não utilizado e requests bloqueantes sem piorar TBT, SEO, acessibilidade ou rotas.
- [ ] A causa e a correção de CLS são rastreáveis a uma medição, não a suposição.
- [ ] Toda mudança tem testes de rota, browser e rollback documentado.

## Riscos e rollback

| Risco | Mitigação | Rollback |
| --- | --- | --- |
| Admin inicia antes de jQuery/Summernote | Loader com Promise, cache por URL, ordem explícita e estado de falha. | Restaurar as tags globais afetadas. |
| Dependência aparentemente ociosa é usada em rota indireta | Mapear referências antes de remover e validar todas as rotas que a carregam. | Reintroduzir a dependência na rota específica, não no shell inteiro. |
| Otimização de CSS quebra aparência ou CLS | Separar diagnóstico de CLS em story própria e fazer inspeção browser antes/depois. | Reverter só a alteração de CSS/layout da story. |
| Métrica externa oscila | Registrar data, estratégia mobile, URL e oportunidades; avaliar tendência e não uma nota isolada. | Não aplicável. |
