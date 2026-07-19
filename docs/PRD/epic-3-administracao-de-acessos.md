---
id: "EPIC-3"
title: "Administracao Central de Acessos"
status: "In Review"
owner: "@pm"
created: "2026-07-19"
tracking: "local-only"
---

# EPIC-3: Administracao Central de Acessos

## Goal

Permitir que o Admin Master provisione contas comuns para uma aplicacao especifica sem expor concessao de papeis globais no frontend.

## Guardrails

- O papel global existente `admin` representa o Admin Master.
- Uma conta criada pelo painel recebe somente o papel global `user`.
- O acesso de dominio e registrado em `mAppAccess` com `viewer`, `editor` ou `owner`.
- O backend valida sessao ativa, versao do token e papel administrativo; esconder elementos no browser nao e controle de seguranca.

## Stories

| ID | Title | Priority | Status |
| --- | --- | --- | --- |
| [3.1](../stories/3.1.criar-usuario-por-aplicacao.md) | Criar usuario com acesso por aplicacao | Critical | Ready for Review |
