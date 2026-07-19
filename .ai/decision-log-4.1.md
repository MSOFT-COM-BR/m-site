# Decision Log: Story 4.1

**Story:** docs/stories/4.1.seletor-global-de-idiomas.md
**Generated:** 2026-07-19T19:06:04-03:00
**Agent:** dev
**Status:** completed
**Execution Time:** 0s
**Decisions Made:** 4

## Context

The m-site needed visible Spanish and English language choices without an existing i18n library, build system or translated page catalog. The existing SPA loads global HTML components and page fragments dynamically.

## Decisions

### 1. Use a local, dependency-free I18n module

- **Reason:** The application is vanilla JavaScript and has no package manifest or existing i18n runtime. A small local dictionary preserves the no-build-step architecture and avoids a network dependency.
- **Alternatives considered:** Add an i18n library; use an external translation API; translate only visual labels without state.
- **Outcome:** Add `src/core/i18n.js` before the SPA core with validated locale state, `localStorage` fallback, DOM attribute application and a locale-change event. Apply the persisted locale to the initial document shell before the router loads content.

### 2. Limit the first translation slice to the global shell

- **Reason:** The repository has many Portuguese page fragments and CMS-rendered content. Showing flags while claiming full page translation would be inaccurate.
- **Alternatives considered:** Translate all pages in one change; use automatic browser translation; hide the selector until all content is translated.
- **Outcome:** Translate the document title, header navigation, language control and dynamic account menu. Document page and CMS translation as future scoped work.

### 3. Reuse Bootstrap dropdowns with accessible flag, code and text labels

- **Reason:** Bootstrap is already bundled locally and the header already uses dropdown behavior. Native buttons preserve keyboard access without a new control library.
- **Alternatives considered:** Remote flag image assets; icon-only country flags; a custom modal selector.
- **Outcome:** Use Brazil, Spain and United States emoji flags with visible PT/ES/EN codes, translated language names, `aria-label`, `aria-pressed` and focus-visible styling.

### 4. Keep translated values out of HTML interpolation

- **Reason:** Translation values should be inserted only by `textContent` or approved attributes. The existing account menu has dynamic HTML, so user display names also need escaping.
- **Alternatives considered:** Interpolate dictionary values into account menu templates; leave user display names unchanged.
- **Outcome:** Add `data-i18n` attributes to account markup and call `i18n.apply` after render; escape the display name before its existing template use.

## Verification

- Seven Node tests passed for state, persistence, initial shell reload, blocked storage, DOM application and header key coverage.
- JavaScript syntax, inline header scripts, scope scans and `git diff --check` passed.
- Static SPA smoke tests returned HTTP 200 for the root, a deep link, the i18n module and the header fragment.

## Rollback

Remove `src/core/i18n.js`, its script tag, the translation calls in `src/core/core.js`, and the language selector from `src/components/header.html`. The default Portuguese header and existing routes remain intact.
