# Ecossistema Sustentável de Aquisição Orgânica 2026 — Miranda Soft

Data: 2026-07-26
Escopo: pesquisa e brief para `mirandasoft.com.br`
Premissas: sem alteração de código de produção nesta fase; recomendações limitadas ao que foi verificado no repositório e em fontes externas confiáveis.

## 1. Resumo executivo e hipótese de crescimento

### Resumo executivo

O m-site já possui uma base técnica de SEO melhor do que o estágio médio de um SPA estático: há `sitemap.xml`, `robots.txt`, atualização dinâmica de title/description/canonical/noindex no runtime SPA, schema base de `Organization`, `WebSite` e `LocalBusiness`, e infraestrutura inicial de blog. Isso reduz o risco de um redesenho técnico total.

O principal bloqueio de crescimento orgânico hoje não é técnico; é semântico, editorial e de conversão. O site mistura posicionamento Miranda Soft com conteúdo legado de um framework/demo, possui páginas críticas sem aderência à proposta B2B atual, e ainda não fecha o ciclo de mensuração e captura de demanda qualificada.

### Hipótese de crescimento

Se a Miranda Soft:

1. alinhar o site a uma narrativa única de marca e oferta B2B;
2. transformar `expertise`, `blog`, `materials` e `contact` em um funil coerente por intenção de busca;
3. publicar páginas evergreen e conteúdo de prova para dores reais de compra de software no Brasil;
4. ativar mensuração orientada a lead com Search Console e GA4;

então o crescimento orgânico sustentável tende a vir menos de “posts de topo de funil em massa” e mais de um ecossistema enxuto com:

- páginas de serviço fortes para intenção comercial;
- artigos de consideração com profundidade técnica e prova;
- páginas de produto e segurança para intenção mista;
- CTAs mensuráveis que encaminhem para briefing, WhatsApp consultivo ou diagnóstico.

Em termos práticos: a oportunidade prioritária é capturar buscas não-branded de alta intenção ligadas a desenvolvimento sob medida, apps para empresas, modernização e consultoria, enquanto o conteúdo editorial constrói confiança e acelera conversão.

## 2. Auditoria de lacunas atuais

### 2.1 Conteúdo

#### O que já existe

- Home, about, expertise, ecossistema, blog, materials, support e contact.
- Posicionamento institucional B2B já aparece em trechos da home e de `about`.

#### Lacunas verificadas no repo

- O blog está semanticamente desalinhado da Miranda Soft. `src/data/blog-posts.js` ainda publica artigos sobre “Framework Frontend”, com autoria “Equipe Framework” e temas internos de framework, não dores de compra B2B da Miranda Soft.
- A página de materiais é quase totalmente legada e descreve um “Framework Frontend”, com links placeholder de GitHub e foco em snippets, não em materiais de geração de demanda B2B. Ver `src/pages/materials.html`.
- A página de suporte também está orientada a fluxos genéricos de produto/assinatura e contém links `href="#"`, sem base de conhecimento real ou journey coerente com os serviços B2B atuais. Ver `src/pages/support.html`.
- A página de termos ainda trata de “vanilla JavaScript framework” e exibe contato legado externo à Miranda Soft. Ver `src/pages/terms.html`.
- Há rotas temáticas indexáveis que podem diluir foco editorial se não houver intenção clara aprovada pelo negócio, como `games`, `blog-ads`, `blog-review`, `blogs`, `blog-custom`, `marketplace` e `apps`.

#### Impacto

- Reduz relevância temática para buscas de intenção comercial.
- Enfraquece sinais de confiança e E-E-A-T.
- Cria conflito de entendimento para usuário e para mecanismos de busca sobre o propósito principal do domínio.

### 2.2 Arquitetura informacional

#### Pontos fortes

- A arquitetura SPA já suporta rotas públicas relevantes via `config.routes.validPages`.
- Existe uma rota `ecossistema` que pode virar hub editorial/comercial.

#### Lacunas

- Não existe, no estado atual, uma árvore de páginas orientada por intenção de busca para serviços principais. Há uma página agregadora `expertise`, mas não foram encontrados URLs dedicados por oferta principal.
- Não há evidência no repositório de páginas de cases, depoimentos estruturados, comparativos, páginas de indústria, nem templates evergreen por problema.
- O blog existe, mas a ligação entre conteúdo, serviço, material e contato ainda é fraca.
- Não há sinal de “thank you pages” ou páginas intermediárias de conversão.

#### Consequência

Sem URLs dedicadas por oferta, o domínio tende a competir mal por queries comerciais específicas e também desperdiça oportunidades de internal linking.

### 2.3 SEO técnico e semântico

#### O que já existe

- `sitemap.xml` e `robots.txt` corretos.
- SEO dinâmico via `src/core/core.js` para `title`, `meta description`, `canonical`, `robots`, OG e Twitter.
- JSON-LD base de `Organization`, `WebSite` e `LocalBusiness` em `index.html`.
- No detalhe do blog, há geração de `Article` JSON-LD e canonical por slug em `src/pages/blog.html`.

#### Lacunas

- O Search Console ainda não está validado: a meta tag em `index.html` continua com placeholder `SUBSTITUIR_PELO_CODIGO_DO_SEARCH_CONSOLE`.
- O GA4 continua desativado em `src/config/config.js`, com measurement ID placeholder `G-XXXXXXXXXX`; sem isso, não há baseline confiável de comportamento orgânico.
- O site depende de renderização JavaScript em rotas SPA. O Google processa JavaScript, mas isso adiciona risco operacional e de tempo de renderização/indexação para conteúdo crítico, especialmente em páginas que dependem de fetch posterior.
- Não foi encontrada implementação de `Service` schema nas páginas de oferta, apesar de a taxonomia de serviços ser central para a aquisição B2B.
- Não foi encontrada estratégia de sitemap para URLs de artigos individuais do blog; como o detalhe do blog é dinâmico por slug, a descoberta orgânica desses conteúdos pode depender mais de links internos e crawling do que de submissão explícita.
- Não foi encontrada evidência de páginas de autor, revisão editorial, política editorial ou prova de expertise em artigos.
- A imagem `src/assets/images/logo.png` aparenta estar incorretamente armazenada como HTML, o que merece validação técnica antes de usar como ativo canônico de marca.

### 2.4 Conversão

#### O que já existe

- Página de contato com formulário, WhatsApp e e-mail.
- Eventos básicos previstos em stories e parte do runtime.

#### Lacunas

- O formulário de contato atual apenas simula envio com `setTimeout`; não há geração real de lead nem integração explícita com backend/CRM. Ver `src/pages/contact.html`.
- Não há sinal de evento `generate_lead` recomendado pelo GA4, nem de funil claro `form_start` -> `form_submit` -> lead qualificado.
- Não há CTA segmentado por intenção, por exemplo: “falar com especialista”, “pedir diagnóstico”, “solicitar orçamento”, “ver case”, “baixar material”.
- Não há material rico real com captura progressiva.
- Não há campos ou lógica visíveis de qualificação mínima do lead no front atual.

### 2.5 Mensuração

#### O que já existe

- Estrutura condicional para consentimento LGPD e `trackEvent`.
- Page view no SPA e alguns eventos previstos em código/stories.

#### Lacunas

- Sem Search Console validado e sem GA4 ativo, não há base confiável para priorização por query, CTR, landing pages, branded vs non-branded ou taxa de conversão orgânica.
- Não há evidência de rotina operacional documentada para Search Console e GA4.
- Não há mapeamento claro entre evento digital e estágio comercial real, como `qualify_lead` ou `close_convert_lead`.

## 3. ICP/personas, jobs-to-be-done e clusters de intenção de busca

Observação: os perfis abaixo derivam do PRD atual, das rotas existentes e do objetivo informado pelo negócio. Onde faltam dados proprietários, a lacuna é explicitada.

### 3.1 ICPs prioritários

#### ICP 1 — PME e média empresa com demanda por software sob medida

- Decisor: fundador, diretor de operações, gestor de inovação ou tecnologia.
- Dor principal: processo manual, retrabalho, falta de integração, software legado, necessidade de app ou portal próprio.
- Sinal de compra: busca por fornecedor, orçamento, escopo, prazo, modernização.

#### ICP 2 — Gestor de TI/Produto precisando ampliar capacidade de entrega

- Decisor: CTO, tech lead, gerente de produto, gerente de TI.
- Dor principal: backlog represado, time interno pequeno, legado travando roadmap, necessidade de squad externo ou consultoria.
- Sinal de compra: busca por fábrica de software, outsourcing, squad dedicado, discovery, arquitetura.

#### ICP 3 — Empresa buscando solução/produto validado do ecossistema

- Decisor: gestor administrativo/TI/segurança.
- Artefato confirmado no repo: `mcredential`.
- Dor principal: organização de credenciais, segurança operacional, governança básica.
- Sinal de compra: busca por gerenciador de senhas corporativo, política de senhas, controle de acessos.

### 3.2 Jobs-to-be-done

#### Serviços B2B

- “Quando preciso digitalizar ou automatizar um processo crítico, quero encontrar um parceiro confiável para desenhar e entregar a solução certa sem aumentar risco operacional.”
- “Quando meu sistema atual trava crescimento, quero entender o caminho de modernização para reduzir retrabalho e aumentar previsibilidade.”
- “Quando meu time não consegue entregar sozinho, quero complementar capacidade com uma software house/squad que entenda negócio e execução.”

#### Produto/ecossistema

- “Quando preciso melhorar gestão de credenciais e acessos, quero uma solução simples de entender e segura o bastante para o contexto da empresa.”

### 3.3 Clusters temáticos por intenção

#### Intenção comercial

- `fábrica de software`
- `desenvolvimento de software sob medida`
- `empresa de desenvolvimento de software`
- `desenvolvimento de aplicativos para empresas`
- `consultoria em transformação digital`
- `modernização de sistemas legados`
- `outsourcing de desenvolvimento`
- `squad de desenvolvimento`
- `descoberta de produto digital`
- `gerenciador de senhas corporativo`

#### Intenção informacional

- `como modernizar sistema legado`
- `quando criar software sob medida`
- `quanto custa desenvolver um aplicativo`
- `como escolher software house`
- `como priorizar backlog de transformação digital`
- `o que avaliar em consultoria de software`
- `política de senhas corporativas`
- `erros em projetos de software sob medida`

#### Intenção navegacional

- `Miranda Soft`
- `Miranda Soft contato`
- `Miranda Soft blog`
- `Miranda Soft mcredential`
- `mirandasoft.com.br`

## 4. Estratégia de tópicos

### 4.1 Estrutura recomendada de hubs/pilares

#### Hub 1 — Desenvolvimento de Software Sob Medida

Função: capturar demanda comercial principal.
Tipos de página:

- pilar de software sob medida;
- subpáginas por problema: automação, portal, integrações, modernização;
- comparativos: sob medida vs SaaS vs legado remendado;
- cases.

#### Hub 2 — Desenvolvimento de Apps para Empresas

Função: capturar demanda por mobile corporativo e apps de operação/vendas/atendimento.
Tipos:

- página pilar de apps;
- artigo de custo, escopo, prazo, trade-offs;
- case de app operacional/comercial.

#### Hub 3 — Consultoria e Modernização

Função: capturar intenção de consideração alta.
Tipos:

- página de consultoria;
- diagnóstico de legado;
- arquitetura, discovery, roadmap de modernização;
- conteúdo de “como decidir”.

#### Hub 4 — Segurança e Produtos do Ecossistema

Função: apoiar produto confirmado no repo e ampliar confiança.
Tipos:

- página evergreen do `MCredential`;
- conteúdos sobre credenciais, acessos, política de senhas;
- páginas comparativas e operacionais.

### 4.2 Páginas mínimas recomendadas

Prioridade 1:

- página de serviço: desenvolvimento de software sob medida;
- página de serviço: desenvolvimento de aplicativos para empresas;
- página de serviço: consultoria e modernização de sistemas;
- página de produto: MCredential;
- página de cases;
- página de materiais com oferta real;
- página de contato orientada a diagnóstico/orçamento.

Prioridade 2:

- páginas de subintenção por problema;
- comparativos;
- FAQ por serviço;
- páginas por etapa da jornada.

### 4.3 Calendário editorial inicial de 90 dias

Observação: sem dados proprietários de Search Console e sem fonte verificável de volume nesta fase, a priorização abaixo usa aderência à intenção comercial, proximidade com a oferta e potencial de internal linking.

| Prioridade | Pauta | Keyword foco | Motivo | Intenção | CTA | Métrica principal |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Como escolher uma fábrica de software sem aumentar risco do projeto | fábrica de software | Alta aderência à compra e à confiança | Comercial/informacional | Solicitar diagnóstico | Cliques em CTA + leads |
| 2 | Quando vale a pena desenvolver software sob medida | software sob medida | Forte ponte entre dor e oferta | Comercial/informacional | Falar com especialista | Leads por landing |
| 3 | Modernização de sistemas legados: sinais de que adiar custa mais caro | modernização de sistemas legados | Capta demanda de transformação | Comercial/informacional | Agendar avaliação técnica | Leads qualificados |
| 4 | Quanto custa desenvolver um aplicativo para empresa em 2026 | custo de aplicativo para empresa | Query recorrente de consideração | Comercial/informacional | Pedir estimativa | CTR + leads |
| 5 | Discovery de produto digital: o que validar antes de investir em desenvolvimento | discovery de produto digital | Filtra demanda mais madura | Informacional/comercial | Solicitar workshop | Sessões engajadas + leads |
| 6 | 7 erros que atrasam projetos de software sob medida | erros em projetos de software sob medida | Ajuda a construir autoridade | Informacional | Ver página de serviço | Tempo engajado + cliques internos |
| 7 | Squad externo ou software house: como decidir | squad de desenvolvimento | Boa intenção comparativa | Comercial/informacional | Conversar sobre capacidade | Leads assistidos |
| 8 | Integração de sistemas: quando o problema não é “mais um software” | integração de sistemas | Aproxima consultoria de negócio | Informacional/comercial | Pedir diagnóstico de integração | Cliques para contato |
| 9 | Como montar um roadmap realista de transformação digital em PME | roadmap de transformação digital | Amplia topo/médio com aderência B2B | Informacional | Baixar checklist | Geração de leads de material |
| 10 | Política de senhas corporativas: o mínimo viável para reduzir risco operacional | política de senhas corporativas | Apoia a jornada do MCredential | Informacional/comercial | Conhecer MCredential | Cliques para produto |
| 11 | Gerenciador de senhas corporativo: o que avaliar antes de escolher | gerenciador de senhas corporativo | Conteúdo de consideração para produto | Comercial/informacional | Solicitar demonstração/contato | Cliques em CTA produto |
| 12 | Case template: antes e depois de um processo automatizado com software sob medida | automação com software sob medida | Prova social e apoio a conversão | Comercial | Pedir projeto semelhante | Taxa de conversão da página |

### 4.4 Materiais ricos iniciais

- Checklist de descoberta para projeto de software.
- Guia de briefing para orçamento de app/portal.
- Checklist de modernização de legado.
- Template de política de senhas corporativas.

Observação: nenhum desses materiais deve ser publicado antes de validação humana sobre escopo, promessa e capacidade comercial de atendimento.

## 5. Internal linking, páginas evergreen, qualidade e E-E-A-T

### 5.1 Modelo de internal linking

#### Fluxo recomendado

- Home -> páginas de serviço prioritárias -> cases -> contato.
- Hub `ecossistema` -> serviços, produto, materiais, blog e contato.
- Artigos de blog -> página de serviço relacionada -> case -> CTA de contato/material.
- Página de produto -> conteúdos de problema/segurança -> contato/demo.
- Cases -> serviço correspondente -> contato.

#### Regras práticas

- Todo artigo deve linkar ao menos para 1 página de serviço, 1 conteúdo relacionado e 1 CTA de conversão.
- Toda página de serviço deve linkar para 2 a 4 artigos de consideração e ao menos 1 case.
- Materiais devem ter links de retorno para página de serviço e contato.
- FAQs não devem ficar isoladas; devem reforçar cluster e CTA.

### 5.2 Requisitos mínimos de páginas evergreen

- H1 único orientado à intenção.
- Introdução que responde a dor principal sem enrolação.
- Blocos de prova: processo, critérios, riscos, exemplos, quando não contratar.
- FAQ com perguntas reais de compra ou implementação.
- CTA coerente com estágio da intenção.
- Metadados únicos e consistentes.
- Estrutura de links internos.
- Evidência de autoria/revisão e data de atualização.

### 5.3 Critérios de qualidade editorial

Baseados nas orientações do Google para conteúdo útil, confiável e people-first:

- escrever para a audiência real da Miranda Soft, não para “pegar tráfego” genérico;
- demonstrar experiência prática, não só reescrever conceitos;
- deixar claro quem escreveu, revisou e por quê aquela pessoa tem credibilidade;
- citar fontes quando houver dados, benchmark ou alegações de mercado;
- evitar promessas vagas, generalidades e volume excessivo de conteúdo sem profundidade;
- atualizar apenas quando houver mudança substantiva.

### 5.4 E-E-A-T aplicado ao contexto Miranda Soft

#### Experience

- assinar conteúdos por quem executa ou revisa projetos;
- incluir aprendizados de implementação, erros comuns e critérios técnicos reais.

#### Expertise

- páginas de autor/revisor com função e área de domínio;
- explicitar método de discovery, arquitetura, priorização, segurança ou delivery.

#### Authoritativeness

- consolidar uma taxonomia clara de serviços;
- publicar cases, provas e materiais proprietários;
- alinhar toda a narrativa ao mesmo posicionamento.

#### Trust

- corrigir imediatamente páginas legais e institucionais legadas;
- remover placeholders e links quebrados;
- não publicar claims comerciais sem validação humana.

## 6. Plano de mensuração

### 6.1 Eventos e funis recomendados

#### Camada base

- `page_view`
- `scroll`
- `view_search_results` ou `search`
- `click_contact_cta`
- `click_whatsapp`
- `click_email`

#### Camada de lead

- `form_start`
- `form_submit`
- `generate_lead`
- `download_material`
- `view_case`
- `view_service_page`

#### Camada comercial avançada

- `qualify_lead`
- `working_lead`
- `close_convert_lead`
- `close_unconvert_lead`

Observação: os quatro últimos dependem de integração com CRM ou processo manual consistente; não foi encontrada essa integração no repo atual.

### 6.2 Funis mínimos

#### Funil 1 — Serviço

Landing de serviço -> clique em CTA -> início do formulário/WhatsApp -> envio -> lead qualificado

#### Funil 2 — Conteúdo

Artigo -> clique para serviço/material -> geração de lead -> qualificação

#### Funil 3 — Produto

Página do MCredential -> clique em CTA -> contato/demo -> lead

### 6.3 Métricas leading

- páginas indexadas válidas;
- impressões não-branded;
- CTR orgânico por landing page;
- sessões orgânicas engajadas;
- cliques em CTA por página;
- taxa `form_start` / `form_submit`;
- distribuição de tráfego entre hubs.

### 6.4 Métricas lagging

- leads orgânicos gerados;
- leads qualificados orgânicos;
- taxa de conversão orgânica por landing page;
- oportunidades originadas do orgânico;
- receita atribuída ao orgânico, quando houver CRM confiável.

### 6.5 Rotina Search Console e GA4

#### Semanal

- Search Console: novas queries, páginas com alta impressão e baixo CTR, erros de indexação, branded vs non-branded quando disponível.
- GA4: landing pages orgânicas, eventos de CTA, abandono de formulário, top conteúdos assistidos.

#### Quinzenal

- priorizar atualização de títulos/descriptions em páginas com impressão e CTR baixo;
- decidir novos conteúdos com base em queries emergentes do Search Console;
- revisar links internos de páginas que recebem tráfego mas não assistem conversão.

#### Mensal

- revisar páginas indexadas vs sitemap;
- comparar clusters por geração de leads;
- revisar quais conteúdos geraram tráfego sem intenção e quais geraram pipeline.

### 6.6 Critérios de sucesso

Nesta fase não há baseline validado; portanto, os critérios precisam começar como operacionais antes de virar metas numéricas:

- Search Console validado e recebendo dados.
- GA4 ativo com consentimento e eventos auditados.
- pelo menos 3 páginas de serviço e 1 página de produto com mensuração consistente.
- backlog editorial de 90 dias em execução.
- primeiros relatórios separados entre branded e non-branded assim que o volume permitir.

## 7. Roadmap em ondas

### Onda 0-30 dias

- corrigir páginas legadas críticas que ferem confiança: blog seed, materials, support, terms;
- validar Search Console e GA4;
- definir arquitetura de serviços, produto e cases;
- escolher CTAs principais e modelo de captação;
- publicar ou preparar as 3 páginas de serviço prioritárias.

### Onda 31-60 dias

- publicar 4 a 6 conteúdos prioritários do calendário;
- implementar fluxo de lead real;
- lançar página de cases inicial mesmo que com formato enxuto;
- revisar internal linking do cluster principal;
- começar rotina semanal Search Console/GA4.

### Onda 61-90 dias

- completar as 12 pautas prioritárias ou a maior parte com qualidade;
- lançar material rico real e captura associada;
- introduzir métricas de qualificação;
- otimizar títulos, descriptions e CTAs com base nas primeiras evidências.

### Riscos

- falta de validação comercial do posicionamento e das ofertas prioritárias;
- produção de conteúdo sem dono editorial/técnico;
- mensuração incompleta por ausência de integração com CRM;
- priorização excessiva de páginas periféricas ao invés dos serviços centrais;
- confiança prejudicada por páginas legais, assets ou claims desatualizados.

### Dependências

- acesso humano ao Search Console e GA4;
- decisão sobre CRM/form backend;
- disponibilidade de especialistas internos para revisar conteúdo;
- definição do portfólio prioritário real da Miranda Soft.

## 8. Backlog proposto

### 8.1 Pesquisa

- `RES-001` Validar portfólio comercial prioritário da Miranda Soft.
  - Depende de decisão humana: sim.
- `RES-002` Levantar base real de queries, páginas e CTR via Search Console após verificação.
  - Depende de decisão humana: acesso.
- `RES-003` Mapear 5 a 10 cases/provas utilizáveis sem risco contratual.
  - Depende de decisão humana: aprovação de uso.
- `RES-004` Confirmar oferta e jornada comercial do MCredential.
  - Depende de decisão humana: sim.
- `RES-005` Definir ICPs prioritários por segmento/porte, se houver foco vertical real.
  - Depende de decisão humana: sim.

### 8.2 Conteúdo

- `CON-001` Reescrever seed editorial do blog para Miranda Soft.
- `CON-002` Transformar `materials` em hub de materiais reais ou desindexar/retirar da navegação até haver oferta válida.
- `CON-003` Corrigir `terms` para narrativa jurídica da Miranda Soft.
- `CON-004` Reposicionar `support` para base de ajuda coerente ou restringir indexação se continuar irrelevante para aquisição.
- `CON-005` Criar página pilar de desenvolvimento de software sob medida.
- `CON-006` Criar página pilar de desenvolvimento de apps para empresas.
- `CON-007` Criar página pilar de consultoria/modernização.
- `CON-008` Criar página evergreen do MCredential.
- `CON-009` Criar template de case e publicar ao menos 1 case.
- `CON-010` Publicar calendário editorial de 90 dias em ritmo sustentável.

### 8.3 Técnica

- `TEC-001` Validar Search Console substituindo o placeholder de verificação.
- `TEC-002` Ativar GA4 com measurement ID real e auditar eventos.
- `TEC-003` Implementar eventos recomendados de lead (`generate_lead`) e funil de formulário.
- `TEC-004` Definir sitemap para artigos individuais do blog, se a estratégia de blog dinâmico for mantida.
- `TEC-005` Adicionar schema de `Service` nas páginas de oferta publicadas.
- `TEC-006` Criar padrão de metadados para cases, materiais e páginas de serviço.
- `TEC-007` Validar o ativo `logo.png` e os demais assets de marca.
- `TEC-008` Revisar rotas indexáveis periféricas e decidir `noindex`, remoção do sitemap ou reposicionamento.

### 8.4 Conversão

- `CVR-001` Substituir o formulário fake por fluxo real de lead.
  - Depende de decisão humana: destino do lead e stack comercial.
- `CVR-002` Definir CTA principal por tipo de página.
  - Depende de decisão humana: sim.
- `CVR-003` Criar material rico inicial com formulário.
  - Depende de decisão humana: oferta e SLA.
- `CVR-004` Definir thank-you flow e critério mínimo de qualificação.
  - Depende de decisão humana: comercial.
- `CVR-005` Instrumentar WhatsApp, e-mail e contato como etapas do funil.
- `CVR-006` Conectar lead digital a estágio comercial real.
  - Depende de decisão humana: CRM/processo.

## 9. Decisões necessárias do negócio

- Quais 2 ou 3 ofertas devem liderar a aquisição orgânica nos próximos 90 dias.
- Se `MCredential` será tratado como produto estratégico de aquisição ou apenas suporte de marca.
- Se `marketplace`, `games`, `blog-ads`, `blog-review`, `blogs` e `blog-custom` continuam públicos/indexáveis.
- Qual é o destino oficial dos leads: e-mail, WhatsApp, CRM, formulário backend ou combinação.
- Quem aprova conteúdo técnico e cases antes de publicação.

## 10. Fontes

### Fontes externas

1. Google Search Central. “Understand JavaScript SEO Basics”. Acesso em 2026-07-26.
   URL: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

2. Google Search Central. “Creating helpful, reliable, people-first content”. Acesso em 2026-07-26.
   URL: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

3. Google Search Central. “Organization (`Organization`) structured data”. Acesso em 2026-07-26.
   URL: https://developers.google.com/search/docs/appearance/structured-data/organization

4. Google Search Central. “Introduction to structured data markup in Google Search”. Acesso em 2026-07-26.
   URL: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

5. Google Search Console Help. “Sitemaps report”. Acesso em 2026-07-26.
   URL: https://support.google.com/webmasters/answer/7451001

6. Google Search Console Help. “Performance report (Search results): Overview and basic setup”. Acesso em 2026-07-26.
   URL: https://support.google.com/webmasters/answer/7576553

7. Google Search Console Help. “Performance report (Search results): Dimensions and data groupings”. Acesso em 2026-07-26.
   URL: https://support.google.com/webmasters/answer/17011259

8. Google Search Console Help. “What are impressions, position, and clicks?”. Acesso em 2026-07-26.
   URL: https://support.google.com/webmasters/answer/7042828

9. Google Search Console Help. “Getting started with Search Console”. Acesso em 2026-07-26.
   URL: https://support.google.com/webmasters/answer/10267942

10. Google Analytics Help. “[GA4] Event”. Acesso em 2026-07-26.
    URL: https://support.google.com/analytics/answer/9356037

11. Google Analytics Help. “[GA4] Recommended events”. Acesso em 2026-07-26.
    URL: https://support.google.com/analytics/answer/9267735

12. Google Analytics Help. “[GA4] How to generate more leads on your website”. Acesso em 2026-07-26.
    URL: https://support.google.com/analytics/answer/12941105

13. Google Analytics Help. “Lead acquisition report”. Acesso em 2026-07-26.
    URL: https://support.google.com/analytics/answer/16376749

14. Schema.org. “Service”. Acesso em 2026-07-26.
    URL: https://schema.org/Service

15. Schema.org. “Article”. Acesso em 2026-07-26.
    URL: https://schema.org/Article

16. RD Station. “Panoramas de Marketing e Vendas RD Station 2026: o que os dados revelam”. Acesso em 2026-07-26.
    URL: https://www.rdstation.com/blog/marketing/panoramas-marketing-vendas/

17. DataReportal. “Digital 2026: Brazil”. Acesso em 2026-07-26.
    URL: https://datareportal.com/reports/digital-2026-brazil

18. Think with Google. “Como as últimas mudanças na busca do Google vão transformar sua forma de anunciar”. Acesso em 2026-07-26.
    URL: https://www.thinkwithgoogle.com/intl/pt-br/estrategias-de-marketing/search/mudanca-nas-buscas-do-google-novas-formas-de-anunciar/

### Evidências internas do repositório

- `index.html`
- `src/config/config.js`
- `src/config/seo.js`
- `src/core/core.js`
- `src/data/blog-posts.js`
- `src/pages/blog.html`
- `src/pages/materials.html`
- `src/pages/support.html`
- `src/pages/contact.html`
- `src/pages/terms.html`
- `sitemap.xml`
- `robots.txt`
- `docs/PRD/m-site.md`
- `docs/PRD/epic-2-hub-central-da-miranda-soft.md`

## 11. Lacunas sem dado confiável

- Não há baseline de Search Console no workspace; volume, CTR, queries e páginas orgânicas reais precisam ser extraídos após verificação.
- Não há propriedade GA4 ativa no código atual; comportamento real de conversão não pode ser afirmado.
- Não há dado confiável no repo sobre segmentos verticais prioritários da Miranda Soft.
- Não há cases aprovados, depoimentos aprovados ou benchmark proprietário de conversão orgânica.
- Não há confirmação documental de qual jornada de produto além de `MCredential` deve receber investimento orgânico prioritário.
