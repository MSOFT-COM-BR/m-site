# Decision Log: Story 2.1

## Context

Create the first navigable surface of the Miranda Soft master hub using only the existing SPA, routes, visual system, and product destinations.

## Decisions

### 1. Add a dedicated `/ecossistema` route instead of expanding the home page

- **Reason:** The home page remains focused on brand and service conversion, while the hub needs a stable, bookmarkable discovery destination for all offer families.
- **Alternatives considered:** A large new section on `/`; a dropdown-only navigation model.
- **Outcome:** Add `ecossistema` to `config.routes.validPages` and create `src/pages/ecossistema.html`.

### 2. Consolidate primary navigation around user intent

- **Reason:** Individual Apps and Marketplace links make the navigation read like an internal sitemap. The hub becomes the primary starting point while direct URLs remain valid.
- **Alternatives considered:** Keep all current links and add another item; introduce a new dropdown component.
- **Outcome:** Use Ecossistema, Solucoes, Conteudo, and Sobre in the primary navigation. Avoid a new interactive component in this first slice.

### 3. Reuse the existing visual system and static routes

- **Reason:** This is a discovery layer, not a new product runtime. Reusing cards, buttons, Bootstrap grid, and existing routes minimizes regression risk.
- **Alternatives considered:** Introduce a new data service or frontend framework.
- **Outcome:** Use semantic HTML with scoped page styles and no API or dependency changes.

## Rollback

Revert `src/config/config.js`, `src/components/header.html`, and `src/pages/ecossistema.html`. Existing destinations and their direct URLs are unchanged.
