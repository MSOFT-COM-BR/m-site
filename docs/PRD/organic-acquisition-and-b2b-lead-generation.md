# PRD Brownfield Draft — Aquisição Orgânica e Geração de Leads B2B

**Status:** Draft / aguardando decisões de stakeholders
**Versão do documento:** 0.1
**Data:** 2026-07-26
**Owner:** @pm
**Tipo:** Brownfield enhancement substancial e faseado
**Projeto:** m-site / Miranda Soft

## 1. Contexto e fontes

Este PRD propõe uma iniciativa brownfield para transformar o m-site em uma base mais confiável para aquisição orgânica e geração de leads B2B, preservando a SPA atual e evitando invenções não verificadas.

**Fontes de verdade usadas neste draft**

- `docs/research/organic-growth-ecosystem-2026.md`
- `docs/PRD/m-site.md`
- `index.html`
- `src/config/config.js`
- `src/data/blog-posts.js`
- `src/pages/contact.html`
- `src/pages/materials.html`
- `src/pages/support.html`
- `src/pages/terms.html`
- `.aiox-core/constitution.md`

## 2. Definição da iniciativa

Trata-se de uma melhoria substancial, não de um ajuste isolado. O trabalho combina restauração de confiança institucional, reestruturação de arquitetura de conteúdo, criação de superfícies comerciais orientadas a intenção, instrumentação mínima de mensuração e implantação de captura real de lead. O escopo precisa ser entregue em fases porque parte das decisões críticas ainda depende de validação comercial e operacional fora do repositório.

## 3. Problema de negócio

O m-site já possui base técnica inicial para descoberta orgânica, mas hoje não opera como um canal confiável de aquisição B2B. O domínio mistura posicionamento Miranda Soft com conteúdo legado de framework/demo, não apresenta uma arquitetura de páginas comerciais compatível com as ofertas B2B prioritárias e não fecha o ciclo de mensuração e captação de demanda qualificada.

Na prática, isso cria três problemas combinados:

- o visitante pode não entender com clareza qual oferta a Miranda Soft vende e para quem;
- mecanismos de busca recebem sinais temáticos conflitantes entre serviços B2B e conteúdo legado;
- o site não oferece trilha confiável de conversão e medição para priorização futura.

## 4. Evidências verificadas do estado atual

### 4.1 Evidências positivas já presentes

- O site já possui `sitemap.xml`, `robots.txt` e metadados básicos em `index.html`.
- A SPA já trata SEO dinâmico em runtime e suporta rotas públicas relevantes.
- O `index.html` publica JSON-LD base de `Organization`, `WebSite` e `LocalBusiness`.
- A configuração central já prevê consentimento e estrutura de analytics em `src/config/config.js`.

### 4.2 Evidências de lacuna que justificam a iniciativa

- `src/data/blog-posts.js` ainda publica conteúdo e autoria ligados a "Framework Frontend", não a dores B2B da Miranda Soft.
- `src/pages/materials.html` continua orientada a recursos de framework, snippets e links placeholder externos.
- `src/pages/support.html` expõe jornada genérica de produto/assinatura com múltiplos `href="#"`, sem base de ajuda coerente com aquisição B2B.
- `src/pages/terms.html` ainda descreve um "vanilla JavaScript framework" e referencia contato externo à Miranda Soft.
- `src/pages/contact.html` apenas simula envio com `setTimeout`, sem evidência de geração real de lead.
- `src/config/config.js` mantém `analytics.enabled: false` e `ga4MeasurementId: "G-XXXXXXXXXX"`.
- `index.html` mantém placeholder de verificação do Search Console: `SUBSTITUIR_PELO_CODIGO_DO_SEARCH_CONSOLE`.
- `src/config/config.js` ainda expõe rotas indexáveis periféricas (`games`, `blog-ads`, `blog-review`, `blogs`, `blog-custom`, `marketplace`, `apps`) cuja função de aquisição não está validada neste draft.

## 5. Resultados desejados

### 5.1 Resultados de produto e negócio

- O site passa a comunicar uma narrativa única e verificável de marca e oferta B2B.
- Visitantes encontram caminhos claros entre conteúdo, páginas de serviço, contato e materiais válidos.
- A Miranda Soft passa a ter base mínima confiável para aprender com busca orgânica e comportamento de conversão.
- O trabalho editorial futuro deixa de depender de páginas legadas que enfraquecem confiança.

### 5.2 Critérios operacionais de sucesso

Como não existe baseline confiável validado neste momento, os primeiros critérios de sucesso deste PRD são operacionais e qualitativos:

- páginas públicas críticas deixam de publicar narrativa legada de framework quando o assunto é aquisição B2B;
- existe pelo menos uma arquitetura de jornada coerente entre descoberta, consideração e contato;
- cada CTA principal possui destino real e auditável, não simulado;
- Search Console e analytics deixam de depender de placeholders para coleta básica;
- o negócio consegue revisar páginas e conteúdos publicados sem depender de interpretações contraditórias sobre oferta, público ou promessa.

Metas numéricas de tráfego, CTR, conversão, pipeline ou ICP ficam explicitamente fora deste draft até que `RES-001`, `RES-002`, `RES-005`, `TEC-001` e `TEC-002` sejam concluídos.

## 6. Premissas, suposições e desconhecidos

### 6.1 Premissas explícitas

- A stack SPA atual em HTML/CSS/JavaScript vanilla será preservada neste ciclo.
- O m-site continuará atuando como camada de descoberta, conteúdo e encaminhamento, não como substituto do processo comercial.
- O research em `docs/research/organic-growth-ecosystem-2026.md` é a base analítica principal já disponível.

### 6.2 Desconhecidos que bloqueiam afirmações mais fortes

- Portfólio comercial prioritário validado pela Miranda Soft (`RES-001`).
- Base real de queries, landing pages e CTR do Search Console (`RES-002`).
- Cases, provas, depoimentos ou permissões de uso aprovadas (`RES-003`).
- Jornada comercial e prioridade real do MCredential (`RES-004`).
- ICPs prioritários e eventual foco vertical real (`RES-005`).
- Destino final do lead, fluxo comercial e integração com CRM ou backend (`CVR-001`, `CVR-004`, `CVR-006`).

## 7. Escopo

### 7.1 In scope

- Consolidar um posicionamento coerente para aquisição B2B nas superfícies públicas do m-site.
- Restaurar ou restringir áreas públicas que hoje prejudicam confiança editorial e institucional.
- Definir e implementar a estrutura inicial de páginas de serviço, conteúdo de apoio e captação real de lead.
- Instrumentar mensuração mínima aprovada pelo negócio, respeitando consentimento.
- Estabelecer um roadmap editorial operável e rastreável ao research.

### 7.2 Out of scope

- Assumir ou publicar métricas não verificadas de tráfego, conversão, pipeline ou receita.
- Inventar novos produtos, ofertas, testimonials, cases ou prioridades comerciais.
- Reescrever a stack do site, introduzir build step ou migrar a SPA para outro framework.
- Definir contratos detalhados de CRM, automação comercial ou backend sem decisão técnica e de negócio.
- Criar stories individuais nesta etapa.

## 8. Requisitos funcionais

- `FR-001`: O m-site deve apresentar narrativa pública coerente com a Miranda Soft nas páginas usadas para aquisição, removendo ou isolando conteúdo legado que contradiga essa proposta.
- `FR-002`: O m-site deve oferecer arquitetura de conteúdo e navegação que conecte intenção de busca, páginas de serviço, conteúdo de consideração e contato.
- `FR-003`: O site deve disponibilizar páginas de serviço somente para ofertas validadas pelo negócio e confirmadas no escopo aprovado.
- `FR-004`: O site deve possuir uma estratégia explícita para `materials`, `support` e `terms`: corrigir, restringir indexação ou retirar da navegação pública enquanto não houver conteúdo confiável.
- `FR-005`: O fluxo de contato principal deve deixar de simular envio e passar a encaminhar leads por um destino real aprovado.
- `FR-006`: Os CTAs principais devem variar por contexto de página e apontar apenas para ações realmente suportadas.
- `FR-007`: O site deve permitir mensuração mínima da jornada pública até o envio ou clique de contato, respeitando consentimento.
- `FR-008`: O backlog editorial inicial deve ser derivado de clusters e backlog do Analyst, não de temas genéricos ou não verificados.
- `FR-009`: A estratégia de publicação deve definir como páginas de blog, materiais, serviços e produto se relacionam por links internos e metadados.
- `FR-010`: Toda decisão de publicação que dependa de prova comercial, ICP, case, CTA ou promessa deve ficar condicionada a gate explícito de aprovação de stakeholder.

## 9. Requisitos não funcionais

- `NFR-001`: A iniciativa deve preservar o funcionamento da SPA atual e o padrão de carregamento baseado em `config.routes.validPages` e `src/core/core.js`.
- `NFR-002`: O trabalho deve manter conformidade com consentimento e LGPD já previstos no site, sem disparar analytics fora da política aprovada.
- `NFR-003`: As páginas públicas devem permanecer responsivas e coerentes com os padrões visuais existentes do m-site.
- `NFR-004`: A implantação deve ser faseada e reversível por área, permitindo rollback de conteúdo, CTA ou indexação sem exigir refatoração estrutural ampla.
- `NFR-005`: Nenhuma página nova deve afirmar proof points, resultados ou segmentação comercial sem origem verificável.
- `NFR-006`: O modelo de conteúdo deve ser sustentável operacionalmente para revisão humana, atualização e governança editorial.

## 10. Requisitos de compatibilidade

- `CR-001`: Preservar o roteamento SPA existente, incluindo fallback para `index.html`.
- `CR-002`: Preservar a estrutura de configuração central em `src/config/config.js` como ponto de verdade do frontend.
- `CR-003`: Não quebrar rotas atuais já expostas publicamente sem plano explícito de redirecionamento, desindexação ou remoção controlada.
- `CR-004`: Qualquer nova captação ou analytics deve continuar compatível com a lógica atual de consentimento.
- `CR-005`: Novas páginas ou ajustes editoriais devem seguir a convenção estrutural já usada em `src/pages/` e no ecossistema de componentes atual.

## 11. Dados, consentimento e privacidade

- Não coletar novos dados pessoais sem definir finalidade, destino operacional, retenção e responsável interno.
- O formulário real de lead, quando implantado, deve capturar apenas os campos mínimos aprovados para o estágio da jornada.
- Eventos analíticos devem respeitar o consentimento existente e não podem assumir que o banner atual já resolve sozinho toda governança de privacidade.
- Materiais ricos ou fluxos de captura progressiva exigem revisão explícita de textos de consentimento e uso comercial antes de publicação.
- Este PRD não autoriza exposição de dados de clientes, cases ou depoimentos sem aprovação de uso.

## 12. Dependências

### 12.1 Dependências de negócio

- validação do portfólio comercial prioritário;
- definição do CTA principal por tipo de página;
- aprovação de linguagem comercial e claims permitidos;
- aprovação de cases, provas e jornada do MCredential.

### 12.2 Dependências operacionais e técnicas

- acesso ao Search Console;
- measurement ID real e estratégia de GA4;
- decisão sobre destino real do lead;
- eventual integração com backend, CRM ou canal operacional aprovado;
- validação de ativos de marca e SEO técnico residual.

## 13. Decision gates

| Gate | Decisão necessária | Artefatos afetados | Impacto se não decidido |
| --- | --- | --- | --- |
| DG-01 | Portfólio comercial prioritário aprovado (`RES-001`) | páginas de serviço, CTAs, narrativa da home/ecossistema | bloqueia definição segura de páginas comerciais |
| DG-02 | Search Console e mensuração mínima aprovados (`RES-002`, `TEC-001`, `TEC-002`) | baseline, priorização editorial, analytics | impede metas e priorização por evidência |
| DG-03 | Cases/provas autorizados (`RES-003`) | páginas de prova, FAQ comercial, conteúdo de confiança | limita profundidade de conversão |
| DG-04 | Jornada e prioridade do MCredential aprovadas (`RES-004`) | páginas de produto, cluster de segurança, CTA | impede tratar produto como pilar confirmado |
| DG-05 | CTA principal e destino real de lead aprovados (`CVR-001`, `CVR-002`, `CVR-004`, `CVR-006`) | contato, materiais, serviço, thank-you flow | bloqueia captação real |
| DG-06 | Política para áreas legadas públicas aprovada (`CON-002`, `CON-003`, `CON-004`, `TEC-008`) | materials, support, terms, rotas periféricas | mantém risco de confiança e dispersão semântica |

## 14. Riscos e estratégia de rollback

| Risco | Tipo | Mitigação | Rollback |
| --- | --- | --- | --- |
| Publicar páginas comerciais para oferta não validada | Negócio | Gate DG-01 antes de copy e CTA finais | retirar página da navegação e manter somente superfícies aprovadas |
| Continuar com conteúdo legado indexável | Conteúdo/SEO | tratar `materials`, `support`, `terms` e rotas periféricas como decisão explícita | restaurar estado anterior apenas em rotas já confiáveis e aplicar `noindex`/remoção controlada |
| Implantar captação sem destino operacional | Conversão | Gate DG-05 antes de qualquer formulário real | voltar temporariamente para CTA de contato manual aprovado |
| Criar instrumentação sem base de consentimento ou ID real | Privacidade/Técnico | usar gates DG-02 e DG-05 | desativar eventos e manter coleta em estado seguro |
| Espalhar esforços editoriais sem arquitetura comercial confiável | Produto | fasear conteúdo após arquitetura e serviços | pausar rollout editorial e manter apenas páginas estruturais |

## 15. Roadmap faseado

### Fase 0 — Validação comercial e de mensuração

- confirmar portfólio prioritário, CTA principal, destino real do lead e prioridade do MCredential;
- validar Search Console, GA4 e escopo mínimo de eventos;
- decidir a política para superfícies legadas públicas.

### Fase 1 — Restauração de confiança e arquitetura de conteúdo

- corrigir ou restringir `blog`, `materials`, `support` e `terms`;
- consolidar a arquitetura pública entre serviço, conteúdo, produto e contato;
- definir padrão de metadados e links internos.

### Fase 2 — Páginas comerciais estruturais

- publicar páginas de serviço aprovadas;
- estruturar a presença de produto apenas se DG-04 estiver resolvido;
- preparar páginas de prova e cases somente com autorização explícita.

### Fase 3 — Captação real e instrumentação

- substituir o fluxo fake de contato por captação real;
- ativar mensuração consentida e funis mínimos;
- formalizar thank-you flow e critérios operacionais de qualificação.

### Fase 4 — Rollout editorial

- iniciar calendário editorial derivado do Analyst backlog;
- revisar links internos e superfícies de conversão;
- só depois converter critérios operacionais em metas numéricas, se houver baseline confiável.

## 16. Traceabilidade para backlog do Analyst

| Área do PRD | Backlog IDs relacionados |
| --- | --- |
| Validação de portfólio, ICP e produto | `RES-001`, `RES-004`, `RES-005` |
| Baseline de busca e mensuração | `RES-002`, `TEC-001`, `TEC-002` |
| Prova comercial e cases | `RES-003`, `CON-009` |
| Restauração de confiança editorial | `CON-001`, `CON-002`, `CON-003`, `CON-004`, `TEC-008` |
| Páginas de serviço e produto | `CON-005`, `CON-006`, `CON-007`, `CON-008`, `TEC-005`, `TEC-006` |
| Arquitetura técnica de descoberta | `TEC-004`, `TEC-006`, `TEC-007`, `TEC-008` |
| Captação e conversão | `CVR-001`, `CVR-002`, `CVR-003`, `CVR-004`, `CVR-005`, `CVR-006`, `TEC-003` |
| Rollout editorial inicial | `CON-010` |

## 17. Observações finais deste draft

- Este documento não autoriza claims comerciais, métricas ou páginas que dependam de prova ainda não aprovada.
- A execução deve começar por decisão e validação, não por produção de volume.
- Após aprovação deste PRD draft, o próximo passo AIOX é detalhar o primeiro incremento em épico e depois transferir criação de stories para `@sm`.
