# PRD — m-site (Miranda Soft)

**Versão do documento:** 1.0  
**Produto:** Site institucional e vitrine digital da **Miranda Soft** (`mirandasoft.com.br`).  
**Stack (estado atual):** SPA em JavaScript vanilla, HTML/CSS, componentes carregados dinamicamente, assets estáticos; integração com API backend.

---

## 1. Visão

Site público que apresenta a empresa, serviços e produtos digitais, com navegação fluida (SPA), conteúdo institucional e áreas temáticas (blog, marketplace, credenciais, etc.), preparado para SEO e monetização opcional (anúncios).

## 2. Objetivos de negócio

| Objetivo | Indicador sugerido |
|----------|-------------------|
| Gerar contato qualificado (leads) | Envios / cliques em CTAs de contato |
| Reforçar credibilidade da marca | Tempo na página, páginas por sessão |
| Divulgar ofertas e conteúdo | Visitas em blog, marketplace, materiais |
| Suportar jornadas de produto (marketplace, apps, credenciais) | Uso das rotas dedicadas e conversões definidas pelo negócio |

## 3. Público-alvo

- **Decisores de TI e negócio** à procura de fábrica de software, apps e consultoria.  
- **Usuários finais** em jornadas específicas (ex.: credenciais, suporte).  
- **Visitantes** buscando conteúdo (blog) e transparência (LGPD, termos, privacidade).

## 4. Escopo funcional (alto nível)

### 4.1 Core do site

- **Home** com proposta de valor, soluções, CTAs e navegação para áreas principais.  
- **Rotas SPA** definidas em configuração (`validPages`): home, sobre, contato, expertise, apps, materiais, suporte, FAQ, políticas (privacidade, termos, LGPD, cookies), 404.  
- **Consulta pública de mercado:** rota informativa distinta da cotação comercial, para dólar, euro e bitcoin em BRL quando a fonte externa estiver disponível; sem negociação, recomendação financeira ou persistência de preços.
- **Blog** (incl. variantes review, ads, conteúdo custom) com conteúdo suportado por serviços/CMS no front.  
- **Marketplace**, **games**, **premium**, **materiais**, **mcredential**, **profile** conforme implementação atual nas páginas e serviços.
- **Internacionalização inicial da navegação:** português do Brasil como padrão e seletor de espanhol e inglês na camada global, sem tradução automática ou alteração de contratos de conteúdo nesta primeira etapa.

### 4.2 Conta e áreas restritas

- Rotas `login`, `admin`, `profile`: comportamento e regras de autorização devem estar alinhados à API e à política de segurança (detalhes operacionais fora deste PRD se forem só backend).

### 4.4 Integrações

- **API** (`api.mirandasoft.com.br` em produção; em desenvolvimento, base configurável para host local). Resolução de URL documentada no código (`resolveApiBaseUrl` / override global).  
- **Google AdSense** (script no `index.html`): monetização opcional; requer conformidade com políticas do Google e páginas legais acessíveis.

### 4.5 SEO e descoberta

- Meta tags, Open Graph e Twitter Cards no `index.html`.  
- `sitemap.xml`, `robots.txt`, `ads.txt` presentes no projeto.  
- URLs amigáveis via roteamento SPA (servidor deve servir `index.html` nas rotas, conforme deploy).

## 5. Requisitos não funcionais

| Área | Requisito |
|------|-----------|
| Performance | Carregamento lazy de componentes onde aplicável; vendors (Bootstrap, Swiper, etc.) já empacotados localmente. |
| UX | Tema escuro, layout responsivo, skeleton de loading nas áreas configuradas. |
| Internacionalização | A escolha explícita de idioma deve ser acessível, persistir no navegador sem depender de API e preservar português do Brasil como fallback seguro. |
| Acessibilidade | Skip link para conteúdo; uso de `main`, `role`; meta `theme-color`. Evolução contínua (auditorias WCAG recomendadas). |
| Segurança | Não expor tokens ou segredos em repositório público; credenciais apenas via backend/variáveis de ambiente no deploy. CORS e headers descritos na config devem refletir produção. |
| Manutenção | Versão da app em `config.js`; comentários de versão em HTML onde existirem. |

## 6. Arquitetura (resumo)

- **Entrada:** `index.html` → núcleo SPA (`core.js` / rotas).  
- **Componentes:** HTML parciais em `src/components/`.  
- **Páginas:** `src/pages/*.html`.  
- **Serviços:** autenticação, conteúdo, auditoria, etc., consumindo a API.  
- **Deploy:** estático + regras de servidor para SPA; `Dockerfile` e `serve.json` disponíveis para ambientes compatíveis.

## 7. Fora de escopo (neste PRD)

- Especificação completa da API e modelos de dados.  
- Design system detalhado pixel a pixel (há `design-system.css` no repo).  
- Processos internos de vendas e suporte.

## 8. Roadmap sugerido (produto)

1. Alinhar **README** do repositório ao produto **Miranda Soft** (hoje descreve landing pessoal legada).  
2. Revisão de **segredos**: mover tokens da config de client-side para práticas seguras em produção.  
3. **Analytics**: ativar e documentar IDs reais quando houver decisão de métricas.  
4. Testes automatizados críticos (smoke E2E nas rotas principais) conforme prioridade.

## 9. Riscos e dependências

- **Dependência da API:** indisponibilidade ou mudança de contrato impacta login, conteúdo dinâmico e áreas logadas.  
- **AdSense / LGPD:** textos legais e consentimento devem estar atualizados.  
- **SPA em hospedagem estática:** servidor precisa fallback para `index.html` em deep links.

## 10. Glossário

- **SPA:** Single Page Application — navegação sem recarregar o documento completo.  
- **PRD:** Product Requirements Document — este documento.

---

*Aprovador de negócio: _a preencher_. Última revisão alinhada ao código em `index.html`, `src/config/config.js` e estrutura de rotas.*
