---
id: "EPIC-4"
title: "Internacionalizacao Inicial da Navegacao"
status: "Planning"
owner: "@pm"
created: "2026-07-19"
source_prd: "docs/PRD/m-site.md"
tracking: "local-only"
---

# EPIC-4: Internacionalizacao Inicial da Navegacao

| Field | Value |
| --- | --- |
| Status | Planning |
| Owner | @pm |
| Source of truth | `docs/PRD/m-site.md` e a solicitacao do usuario para disponibilizar espanhol e ingles por bandeiras. |
| Tracking | Local-only. Nenhum adaptador de PM esta configurado neste workspace. |

## Goal

Permitir que visitantes escolham portugues do Brasil, espanhol ou ingles na navegacao global do m-site, com uma base pequena e reutilizavel para futuras traducoes de paginas.

## Business Value

O site institucional passa a comunicar sua disponibilidade internacional sem depender de servico externo, traducao automatica ou uma nova aplicacao. A escolha do visitante fica estavel entre recarregamentos e prepara a expansao incremental do catalogo de paginas.

## Existing System Context

- O m-site e uma SPA em JavaScript vanilla; `src/core/core.js` carrega fragmentos HTML de paginas e componentes em tempo de execucao.
- `src/components/header.html` e o ponto global de navegacao, menu mobile e acoes autenticadas.
- Nao existe modulo, dependencia ou catalogo de internacionalizacao no repositorio.
- `src/assets/js/storage.js` pertence ao fluxo isolado de MCredential e nao e carregado pela shell global; a preferencia de idioma deve usar uma chave propria e segura no navegador.
- O Bootstrap ja esta empacotado localmente e oferece o dropdown necessario para o seletor; nenhuma biblioteca de bandeiras ou servico de traducao e necessario.

## Scope

### In Scope

- Disponibilizar portugues do Brasil, espanhol e ingles na navegacao global, com portugues do Brasil como padrao.
- Criar uma camada leve de dicionario cliente, atributos de traducao e evento de troca de idioma compativel com os fragmentos dinamicos da SPA.
- Exibir bandeiras do Brasil, Espanha e Estados Unidos junto de codigos e nomes de idioma acessiveis no header desktop e mobile.
- Traduzir os textos estaticos e as acoes de conta produzidas pelo header.
- Persistir somente uma preferencia de idioma validada no navegador e atualizar o atributo `lang` do documento.

### Out of Scope

- Traduzir todas as paginas, posts de blog, dados de CMS, textos legais ou respostas da API nesta historia.
- Criar traducao automatica, chamar APIs externas, introduzir dependencia de i18n ou alterar URLs por idioma.
- Mudar autenticacao, autorizacao, contratos de backend, precos, conteudo editorial ou a configuracao do tema.

## Stories

| ID | Title | Priority | Status | Executor | Quality Gate |
| --- | --- | --- | --- | --- | --- |
| [4.1](../stories/4.1.seletor-global-de-idiomas.md) | Adicionar seletor global de idiomas | High | Ready for Review | @dev | @qa |

## Success Criteria

- [ ] O header permite selecionar espanhol e ingles, alem de retornar a portugues do Brasil.
- [ ] A escolha sobrevive a um recarregamento sem enviar dados para a API.
- [ ] Os textos do header e do menu de conta acompanham a escolha de idioma.
- [ ] O menu continua acessivel por teclado, responsivo e compativel com os fluxos de autenticacao existentes.
- [ ] A base criada pode ser usada por paginas futuras sem trocar o roteador SPA ou adicionar dependencias.

## Compatibility Requirements

- Manter o carregamento sincrono do core e o padrao de fragmentos HTML em `src/core/core.js`.
- Preservar o tema escuro padrao, o suporte ao tema claro do header e os comportamentos atuais do menu mobile.
- Nunca aceitar ou persistir um codigo de idioma fora da lista suportada.
- Nao usar rede, API, CMS ou armazenamento de autenticacao para a preferencia de idioma.

## Risks and Mitigations

| Risk | Impact | Mitigation | Rollback |
| --- | --- | --- | --- |
| Bandeiras sem traducao correspondente induzirem o visitante ao erro | Alto | Limitar a historia ao header e documentar explicitamente que paginas permanecem em portugues. | Remover o seletor e o modulo de idioma. |
| Preferencia invalida corromper a interface | Medio | Validar contra uma lista fixa e aplicar `pt-BR` como fallback. | Limpar somente a chave de idioma do navegador. |
| Seletor afetar menu mobile ou dropdown de conta | Medio | Reutilizar Bootstrap local, botoes nativos e testar fechamento, teclado e autenticacao. | Restaurar apenas o header anterior. |
| Componente dinamico nao receber textos atualizados | Medio | Aplicar traducoes depois de cada carregamento de fragmento e emitir evento de idioma. | Manter o fallback em portugues. |

## Quality Assurance Strategy

- Testes unitarios Node para validacao, persistencia e aplicacao dos atributos de traducao.
- Smoke test da SPA em servidor estatico para verificar que o novo script e o header sao servidos corretamente.
- Revisao manual de acessibilidade: rotulos, foco, botoes, estado selecionado, desktop e mobile.
- Revisao manual do diff e verificacao de que nao ha chamadas de rede ou alteracoes de API.

## Definition of Done

- [ ] A historia 4.1 atende todos os criterios de aceite e registra evidencias de teste.
- [ ] A File List, o indice de historias, o decision log e o gate de QA foram atualizados.
- [ ] O escopo de traducao parcial e suas limitacoes permanecem explicitos nos artefatos SDD.

## Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-19 | 1.0 | Epic criado a partir da solicitacao de idiomas no header do m-site. | @pm / Codex |
