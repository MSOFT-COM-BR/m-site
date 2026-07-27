# Arquitetura Incremental — EPIC-12 Recuperação de Performance Mobile

**Status:** Planning
**Versão:** 1.0
**Data:** 2026-07-27
**Autor:** @architect
**Escopo inicial:** Story 12.1 do `EPIC-12`

## 1. Diagnóstico rastreável

O relatório PageSpeed Insights mobile fornecido para `https://mirandasoft.com.br/` registrou performance 48, FCP 2,6 s, LCP 5,2 s, TBT 60 ms, CLS 0,627 e Speed Index 6,5 s. O relatório também listou 249 KiB de JavaScript não utilizado, 43 KiB de CSS não utilizado, 570 ms de requests bloqueantes e payload total de 9.993 KiB.

A shell `index.html` sempre baixa os seguintes vendors, independentemente da rota:

| Asset | Tamanho local observado | Uso confirmado |
| --- | ---: | --- |
| `jquery-3.7.1.min.js` | 87.533 bytes | pré-requisito de Summernote. |
| `summernote-lite.min.js` | 164.908 bytes | `src/pages/admin.html`. |
| `summernote-lite.min.css` | 30.595 bytes | `src/pages/admin.html`. |
| `swiper-bundle.min.js` | 143.706 bytes | nenhum `new Swiper` encontrado em `src/`. |
| `papaparse.min.js` | 19.469 bytes | nenhum `Papa.` encontrado em `src/`. |
| `marked.min.js` | 39.903 bytes | nenhum `marked.` encontrado em `src/`. |

Esses achados autorizam a Story 12.1 a remover o carregamento global das dependências sem consumidor e a mover o editor administrativo para carregamento sob demanda. Não autorizam concluir que CSS global, imagens externas ou o CLS podem ser removidos/corrigidos sem medição adicional.

## 2. Arquitetura alvo para 12.1

A shell mantém somente dependências necessárias em todas as páginas públicas: Bootstrap JS para dropdown/modal já usados no header e rotas públicas, além dos scripts do core atual.

Uma nova função interna de carregamento de assets deve:

1. receber URL, tipo (`script` ou stylesheet) e uma chave de cache;
2. reutilizar uma Promise para impedir download duplicado;
3. resolver apenas após `load` e rejeitar em `error`;
4. carregar jQuery antes de Summernote;
5. ser chamada apenas pela inicialização de `/admin` ou por um módulo específico daquele fluxo;
6. comunicar falha de forma explícita em vez de inicializar parcialmente o editor.

O módulo não deve usar `innerHTML` com dados externos, criar nova dependência nem persistir estado. O cache de Promise dura somente a vida da página.

## 3. Limites de integração

| Superfície | Preservar | Mudança permitida |
| --- | --- | --- |
| `index.html` | shell, Bootstrap, core, consentimento, SEO e cache-busting | retirar assets globais selecionados e coordenar versão. |
| `src/pages/admin.html` | editor Summernote e operações administrativas atuais | chamar loader antes da inicialização do editor. |
| `src/core/` | roteador SPA e execução de scripts de páginas | expor loader mínimo apenas se não houver alternativa local mais restrita. |
| páginas públicas | render, menu e recursos atuais | não devem baixar vendors removidos do shell. |

## 4. Verificação e rollback

A story deve verificar:

- ausência dos scripts/CSS removidos na resposta da home;
- inexistência de referência a `Papa`, `marked` ou `Swiper` no código executável antes de remover esses bundles;
- carregamento ordenado de jQuery e Summernote em `/admin` em browser;
- navegação SPA nas rotas públicas principais e ausência de erro de console;
- `node --check`, testes existentes, `git diff --check` e PageSpeed/Lighthouse comparável quando disponível.

Rollback é a restauração das tags específicas de `index.html` e da versão anterior. Não restaurar todas as dependências globais se somente uma rota necessitar de uma delas.

## 5. CLS: decisão explicitamente adiada

O CLS de 0,627 é o maior desvio de Core Web Vitals, mas a evidência atual não especifica qual elemento desloca. A Story 12.2 deve coletar trace de Lighthouse/DevTools, identificar elementos e timestamps de shift e só então alterar: reserva de espaço de imagens, alturas mínimas de componentes, skeleton, banner de consentimento, fontes ou conteúdo assíncrono.

Qualquer correção sem essa evidência seria uma invenção arquitetural e está fora da Story 12.1.
