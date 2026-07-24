# Sprint: Estabilizacao e Release de Acessos

**Duracao:** 2 semanas a partir do kickoff  
**Objetivo:** publicar e validar em producao as jornadas de acesso por aplicacao, perfil e catalogo, eliminando a divergencia entre o frontend ja entregue e a API ainda nao publicada.

## Diagnostico de entrada

- As stories 3.1, 3.2, 3.4, 5.1, 5.2, 7.2 e 7.3 possuem implementacao local, mas varias dependem da branch `feat/dynamic-apps-marketplace` do `m-manage` chegar a `master` e ser publicada.
- Em 2026-07-24, `https://api.mirandasoft.com.br/health` respondeu `200`, enquanto `GET /auth/admin/users` e `PUT /auth/me` responderam `404`. Portanto, a API esta saudavel, mas ainda nao possui o contrato exigido pelo m-site atual.
- A story 3.2 deve permanecer bloqueada ate o deploy: seus criterios dependem de endpoints administrativos que a producao ainda nao expoe.
- O unico conjunto de testes do m-site cobre internacionalizacao. Nao ha smoke E2E automatizado para as jornadas autenticadas que esta sprint precisa liberar.
- Ha uma exclusao local preexistente de `src/pages/contact 2.html`; ela nao faz parte da sprint e precisa ser classificada pelo responsavel antes do merge/release.

## Compromisso

| Ordem | Item | Pontos remanescentes | Dependencia | Resultado verificavel |
| --- | --- | ---: | --- | --- |
| 1 | Story 3.3 - publicar backend de gestao por aplicacao | 3 | aprovacao do PR do `m-manage` | `master` contem a branch, `bun test` e `bun build` passam, e o deploy expoe os endpoints administrativos. |
| 2 | Validacao integrada de 3.1, 3.2 e 3.4 | 5 | item 1 | Admin Master cria, edita, desativa/reativa usuario e instala/remove app; usuario comum recebe `403`; nenhum dado sensivel aparece na UI ou nas respostas. |
| 3 | Validacao de perfil real - Story 7.2 | 2 | item 1 | `GET/PUT /auth/me` funciona em producao; troca de senha encerra a sessao; `/profile` mostra apenas dados reais. |
| 4 | Validacao do catalogo e instalacao - Stories 5.1 e 5.2 | 3 | item 1 e catalogo seedado | catalogo renderiza, app gratuito instala sem duplicacao, e aparece em `/premium`; visitante anonimo nao recebe falsa confirmacao. |
| 5 | Verificacao de isolamento e remocao do HealthTech - Stories 7.3 e 7.4 | 3 | item 1 | Backend: anonimo recebe `401`, usuario sem `healthtech_os_v1` recebe `403`; m-site: rotas `/healthtech-*` retornam 404 e nenhuma pagina publica referencia a aplicacao. |
| 6 | Story nova: smoke de release das jornadas criticas | 5 | itens 1-5 | roteiro repetivel automatizado ou scriptado para SPA, login, admin, perfil, marketplace/premium e verificacao de rotas removidas; executado antes do deploy e apos o deploy. |
| 7 | Remocao de paginas e componentes mortos - Story 7.5 | 2 | - | `faq`, `policy`, `my-apps`, `tutorial-caricatura` e `cta-tutorial` removidos; rotas retornam 404. |
| 8 | Correcao de SEO tecnico - Story 7.6 | 5 | - | Sitemap valido, robots.txt com sitemap, titulos e descriptions unicos por pagina, canonical tags, noindex em areas logadas. |
| 9 | Implementar Google Analytics 4 e banner LGPD - Story 7.7 | 5 | - | GA4 carregado com consentimento, eventos de conversao, banner LGPD funcional. |
| 10 | Adicionar Schema.org, OG image e performance - Story 7.8 | 5 | - | JSON-LD Organization/WebSite/LocalBusiness, OG image, preconnect/dns-prefetch. |
| 11 | Configurar Google Search Console - Story 7.9 | 2 | - | Meta tag de verificacao adicionada, sitemap pronto, documentacao de submissao. |

**Capacidade comprometida:** 40 pontos remanescentes. Nao iniciar item 6 antes de o contrato publicado dos itens 1-5 estar confirmado; ele deve automatizar a validacao que fecha as stories, nao competir com o release.

## Sequencia de execucao

1. Congelar o escopo do `m-manage`, revisar o diff da branch contra `master` e resolver a alteracao local nao relacionada em `src/middleware/requireAuth.ts` antes de abrir o PR.
2. Executar `bun test` e `bun build` no commit candidato; aprovar, mergear e publicar com plano de rollback para o commit anterior.
3. Executar o smoke autenticado em producao com contas de teste segregadas: Admin Master e usuario sem apps. A aplicacao HealthTech nao deve estar disponivel no m-site, mas seu backend deve continuar protegido por `requireAppAccess('healthtech_os_v1')`.
4. Fechar 3.3; desbloquear e fechar 3.2 somente com evidencia da validacao em producao. Fechar 3.1, 3.4, 5.1, 5.2, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8 e 7.9 quando seus fluxos forem aprovados.
5. Transformar o roteiro aprovado no item 6 em check obrigatorio de release e anexar suas evidencias as stories.

## Fora do escopo

- Stories 6.1 e 6.2 (tokens e toggle de tema): permanecem em Draft. O `index.html` ainda fixa o tema no `body` e nao tem script anti-FOUC; iniciar esse trabalho nesta sprint mistura uma alteracao transversal de UI com a liberacao de controles de acesso.
- Qualquer funcionalidade de HealthTech no m-site, mudancas de contrato nao descritas nas stories e redesign do portal.
- Auditoria completa de autorizacao de todos os modulos do `m-manage`; a story 7.3 identifica esse risco, mas cobre apenas HealthTech. Criar uma story propria para a auditoria na proxima sprint.

## Riscos e gates

| Risco | Mitigacao / gate |
| --- | --- |
| Merge ou deploy do backend introduzir regressao | `bun test` e `bun build` no commit de release; smoke das rotas existentes `/apps`, `/catalog` e `/credentials`; rollback definido antes da publicacao. |
| UI aprovada contra backend local, mas incompatível em producao | Nenhuma story dependente e fechada sem teste manual autenticado contra `api.mirandasoft.com.br`. |
| Dados de teste afetarem contas reais | Usar tres contas dedicadas e limpar os apps/acessos criados ao fim do smoke. |
| Cache servir shell antigo apos mudanca de core/config | Respeitar o bump sincronizado em `index.html` e `src/config/config.js`; registrar a versao publicada na evidencia do release. |
| Exposicao da aplicacao HealthTech no m-site ou falha de autorizacao expor dados | Confirmar que `/healthtech-*` retorna 404 no m-site; testar `401`, `403`, acesso autorizado e bypass de Admin Master no backend antes de considerar o deploy aprovado. |

## Definition of Done da sprint

- A API de producao deixa de responder `404` para `GET /auth/admin/users` e `PUT /auth/me`; respostas sem sessao/sem permissao usam os codigos esperados.
- Todas as stories comprometidas possuem evidencia de producao e status atualizado, sem manter "Ready for Review" para trabalho ja validado.
- O smoke de release pode ser repetido sem depender de conhecimento informal e cobre os caminhos de maior risco.
- Nenhuma alteracao local nao relacionada entra no release.

## Proxima sprint candidata

1. Executar 6.1 e 6.2 em sequencia: tokens primeiro, toggle depois.
2. Auditar todos os modulos autenticados do `m-manage` para substituir `requireAuth` generico por autorizacao por aplicacao quando aplicavel.
3. Ampliar a automacao de smoke para testes E2E em CI.
