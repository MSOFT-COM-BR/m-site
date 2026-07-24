# m-site | Miranda Soft

Site institucional e vitrine digital da Miranda Soft. O projeto apresenta a empresa, suas solucoes, produtos e conteudo, com jornadas publicas e areas de conta.

O runtime e uma SPA estatica: JavaScript vanilla, HTML e CSS, com paginas e componentes HTML carregados dinamicamente no navegador. A aplicacao integra com a API da Miranda Soft quando a jornada exige conteudo ou autenticacao.

## Principais Areas

| Area | Rotas principais |
| --- | --- |
| Institucional | `/`, `/about`, `/expertise`, `/contact`, `/support` |
| Conteudo | `/blog`, `/blog-ads`, `/blog-review`, `/materials` |
| Produtos | `/apps`, `/marketplace`, `/games`, `/premium`, `/mcredential` |
| Conta | `/login`, `/admin`, `/profile` |
| Legal | `/privacy`, `/terms`, `/lgpd`, `/cookies` |

As rotas validas sao definidas em `src/config/config.js`. O roteador SPA usa o historico do navegador, por isso o servidor de producao precisa redirecionar deep links para `index.html`.

## Arquitetura

```text
index.html
├── src/config/config.js     Configuracao publica e resolucao da API
├── src/core/                Router SPA, carregamento de componentes e helpers
├── src/components/          Partiais HTML reutilizaveis
├── src/pages/               Paginas carregadas pela SPA
├── src/data/                Conteudo local do frontend
├── src/services/            Integracoes de conteudo, autenticacao e auditoria
└── src/assets/              CSS, imagens, favicons e dependencias locais

Dockerfile                   Servidor estatico na porta 8080
serve.json                   Headers e cache para o servidor estatico
```

O projeto nao possui etapa de build para executar o site. Os componentes e as paginas sao buscados por HTTP, portanto nao use `file://` para testar a aplicacao.

## Execucao Local

### 1. Inicie a API local, quando necessaria

A SPA usa `http://localhost:3000` ou `http://127.0.0.1:3000` como API em ambiente local. Essa porta e reservada para a API, nao para o site.

### 2. Sirva o site em outra porta

```bash
npx serve -s . -l 8082
```

O modo `-s` fornece o fallback de SPA. Abra [http://localhost:8082](http://localhost:8082) e navegue normalmente pelas rotas; um deep link como `/about` tambem deve retornar o `index.html`.

## Configuracao da API

`src/config/config.js` resolve a URL base automaticamente:

| Ambiente | URL padrao |
| --- | --- |
| Producao | `https://api.mirandasoft.com.br` |
| `localhost` ou `127.0.0.1` | `http://<hostname>:3000` |

Em ambientes especiais, defina `window.__MSOFT_API_BASE__` antes de carregar `src/config/config.js`. O valor remove barras finais automaticamente.

```html
<script>
  window.__MSOFT_API_BASE__ = 'http://localhost:3000';
</script>
<script src="/src/config/config.js"></script>
```

`src/config/config.js` e entregue ao navegador. Nao adicione tokens, chaves de API ou qualquer segredo a esse arquivo, ao README ou a outros assets publicos.

## Deploy

O projeto pode ser publicado em qualquer hospedagem de arquivos estaticos que suporte fallback de SPA para `index.html`.

### Docker

```bash
docker build -t m-site .
docker run --rm -p 8080:8080 m-site
```

O `Dockerfile` usa `serve -s` e expoe a porta `8080`. Em outra plataforma, replique esse fallback e aplique os headers definidos em `serve.json` quando a hospedagem os suportar.

## SEO e Analytics

- `index.html` concentra metatags, Open Graph, Twitter Cards, JSON-LD (Schema.org) e a verificacao do Google Search Console.
- `robots.txt` e `ads.txt` ficam na raiz do projeto; `robots.txt` aponta para `sitemap.xml`.
- `sitemap.xml` contem as URLs publicas do site e deve ser submetido ao Google Search Console apos o deploy.
- Titulo, meta description e canonical tag sao atualizados dinamicamente pelo roteador SPA (`src/core/core.js` e `src/config/seo.js`).
- Analytics (Google Analytics 4) esta desabilitado por padrao em `src/config/config.js`; configure `ga4MeasurementId` com o ID real da propriedade e ative `analytics.enabled`.
- O banner de consentimento de cookies (LGPD) so carrega o GA4 apos aceite explicito do usuario.

### Checklist pos-deploy

1. Acesse [Google Search Console](https://search.google.com/search-console) e verifique a propriedade `mirandasoft.com.br`.
2. Submeta o sitemap: `https://mirandasoft.com.br/sitemap.xml`.
3. Configure o ID de medicao do GA4 em `src/config/config.js` e ative `analytics.enabled`.
4. Valide a tag de verificacao do Search Console em `index.html` (meta `google-site-verification`).

## Operacao e Qualidade

- O tema e escuro e responsivo; a SPA usa skeletons durante os carregamentos configurados.
- `index.html` concentra metatags, Open Graph, Twitter Cards e o script de AdSense.
- `robots.txt` e `ads.txt` ficam na raiz do projeto.
- Para validar uma alteracao, sirva o site localmente, navegue pela home e por uma rota principal, e confirme que os recursos em `src/pages/` e `src/components/` continuam carregando.

## Desenvolvimento

- Mantenha o projeto em HTML, CSS e JavaScript vanilla, sem adicionar dependencias ou build step sem uma necessidade aprovada.
- Atualize o versionamento em `src/config/config.js` quando uma mudanca de produto exigir isso.
- Preserve a compatibilidade entre o fallback de producao e o roteamento SPA.
- **Sempre que `src/config/config.js` ou qualquer arquivo em `src/core/` mudar** (nova rota em `validPages`, config de API, etc.), bump a versao em tres lugares e mantenha-os iguais: o comentario `<!-- Version: VX.Y.Z -->` no topo de `index.html`, `app.version` em `src/config/config.js`, e a query string `?v=X.Y.Z` nos `<script src>` desses arquivos no `index.html`. Sem isso, CDNs (Cloudflare, etc.) podem continuar servindo uma copia em cache do arquivo antigo por horas/dias apos o deploy, mesmo com o servidor de origem correto — foi a causa de `/ecossistema` retornar 404 por meses com o codigo ja correto em producao.
- Documente requisitos novos em `docs/` e trabalhe por historias em `docs/stories/`.
