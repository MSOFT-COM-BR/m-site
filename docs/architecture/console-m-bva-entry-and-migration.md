# Arquitetura — Console M-BVA: entrada isolada e migração incremental

**Status:** Em andamento — entrada entregue; extração funcional depende de publicação e validação de integração

**Data:** 2026-08-20

**Escopo:** Registrar a superfície do Console M-BVA no `m-site` sem fundir autenticação, sessão, dados ou autorização com a MSoft.

## 1. Estado atual verificado

| Superfície | Evidência | Estado |
| --- | --- | --- |
| Entrada no ecossistema | `src/config/config.js` registra `appPages` com `studio-bva`; `src/pages/app/studio-bva/index.html` é a entrada em `/app/studio-bva`. | Entregue |
| Privacidade da rota | `src/config/seo.js` a marca `noindex`; `server.mjs` envia `X-Robots-Tag: noindex, nofollow` para o deep link. | Entregue |
| Handoff operacional | A entrada abre `https://studiobva.com.br/portal` em nova aba com `rel="noopener noreferrer"`. | Entregue |
| Console legado | `apps/m-bva/portal.html` é um documento completo com CSS, shell e mais de 5 mil linhas de lógica inline. | Mantido isolado |
| Sessão M-BVA | O portal usa exclusivamente `sessionStorage.bva_session`, com `user` e token BVA. | Mantido isolado |
| Sessão MSoft | `src/services/auth-service.js` usa `localStorage.msoft_auth_token` e `localStorage.msoft_user_data`. | Mantido isolado |

## 2. Fronteira obrigatória

A entrada `/app/studio-bva` não pode:

- incorporar o portal por iframe;
- ler, gravar, copiar ou encaminhar chaves de sessão/token BVA ou MSoft;
- chamar APIs BVA;
- usar o `auth-service` MSoft como autorização do Console BVA.

O portal permanece responsável por autenticação, RBAC e chamadas autenticadas à API BVA. Ocultar uma aba na UI não substitui autorização de servidor para CRM, estoque, Kardex, fabricação, vendas, uploads ou configurações.

## 3. Contrato e risco confirmado

O portal efetivo faz `POST /auth/login`, espera `json.success`, `json.user` e `json.token`, e envia `Authorization: Bearer <token>` nas chamadas protegidas (`apps/m-bva/portal.html:2170-2195`, `2253-2276`).

O OpenAPI local descreve uma forma histórica divergente, `data.accessToken` e `data.user` (`apps/m-bva/docs/openapi.json:146-155`). A fonte executável atual confirma a forma usada pelo portal: `success`, `token`, `refreshToken` e `user` (`apps/m-manage/src/routes/auth.ts:643-649`), e o teste de autenticação confirma `token` e `user` (`apps/m-manage/tests/auth.test.ts:117-135`). Uma futura extração deve seguir esse contrato ativo; a documentação OpenAPI precisa ser atualizada separadamente, antes de ser usada como contrato de cliente.

A origem de produção `https://studiobva.com.br` agora está registrada nas duas superfícies Elysia (`apps/m-manage/src/index.ts` e `apps/m-manage/src/app.ts`), com contrato estático em `apps/m-manage/tests/bva-cors-contract.test.ts`. A confirmação HTTP do deployment fica pendente até a publicação, pois a validação local não deve efetuar login nem operações persistentes.

O portal também contém operações mutáveis de CRM/ERP. Elas não devem ser exercitadas para validação deste trabalho, nem reimplementadas por cópia em uma página do `m-site`.

## 4. Fases de migração

1. **Entrada isolada — concluída.** A rota `/app/studio-bva` permite descoberta interna, permanece `noindex` no cliente e no servidor e faz handoff de topo para o portal.
2. **Contrato de autenticação — confirmado no código.** A forma de login e a origem CORS foram conferidas na fonte executável; publicar a alteração e confirmar o cabeçalho CORS sem autenticar.
3. **Extração por domínio — não iniciada.** Após publicar a fase 2, extrair módulos em aplicações/rotas BVA próprias, começando por uma leitura não mutável. Cada módulo deve manter sessão BVA e autorização de backend.
4. **Operações mutáveis — não iniciada.** CRM e ERP só podem avançar com contrato aprovado, testes com ambiente sem persistência e autorização explícita para validar escrita.

## 5. Critérios para liberar a fase 3

- A resposta atual de `POST /auth/login` está documentada de acordo com a fonte executável, incluindo token, usuário, expiração e tratamento de erro.
- A origem da aplicação BVA e o CORS do backend foram publicados e verificados por resposta HTTP para o destino escolhido.
- O armazenamento e o logout da sessão BVA permanecem independentes de `msoft_auth_token` e `msoft_user_data`.
- Uma primeira rota de leitura tem contrato de erro/401/403 e teste negativo de autorização no backend.
- Nenhum token, cookie ou credencial é copiado entre produtos.

## 6. Rollback

A entrada `/app/studio-bva` pode permanecer como handoff para `https://studiobva.com.br/portal`. A remoção de qualquer módulo futuro do `m-site` não altera a sessão nem os dados do portal BVA, que seguem em sua superfície independente.
