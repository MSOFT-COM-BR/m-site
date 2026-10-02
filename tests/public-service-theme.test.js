const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const pages = ['criacao-de-sites', 'desenvolvimento-de-sistemas', 'expertise', 'ecossistema', 'about', 'contact', 'cotacoes', 'apps'];
const read = page => fs.readFileSync(path.join(__dirname, '..', 'src/pages', `${page}.html`), 'utf8');

for (const page of pages) {
  test(`${page}: conteúdo e superfícies seguem o tema sem branco/escuro fixo`, () => {
    const html = read(page);
    // Include templates in scripts: tools/history/de-para must follow the same contract.
    const whiteClasses = [...html.matchAll(/class=["']([^"']*\btext-white\b[^"']*)["']/g)];
    whiteClasses.push(...html.matchAll(/className\s*=\s*["']([^"']*\btext-white\b[^"']*)["']/g));
    for (const [, classes] of whiteClasses) {
      assert.match(classes, /\b(?:btn-primary|btn-info|bg-primary|bg-secondary)\b/, `${page}: branco somente em controles de fundo acentuado`);
    }
    assert.doesNotMatch(html, /\bbg-(?:dark|black)\b|\btext-light\b|\bbtn-outline-light\b|\bbtn-close-white\b/);
    assert.doesNotMatch(html, /(?:^|[;{\s])color:\s*(?:white|#(?:fff(?:fff)?|f8fafc|f1f5f9|e2e8f0|cbd5e1|dbeafe|94a3b8|a8b5c7|64748b)|rgba\(255,\s*255,\s*255,[^)]+\))\s*[;!]/im);
    assert.doesNotMatch(html, /background(?:-color)?:\s*(?:#(?:0f172a|1a1a25)|rgba\((?:2,\s*6,\s*23|10,\s*10,\s*15|15,\s*23,\s*42|20,\s*20,\s*30|30,\s*30,\s*40),[^)]+\))\s*[;!]/i);
  });
}

test('ecossistema usa um único contrato semântico para mapa e CTA', () => {
  const html = read('ecossistema');
  for (const selector of ['ecosystem-map', 'ecosystem-map-node', 'ecosystem-journey-icon', 'ecosystem-cta']) {
    assert.match(html, new RegExp(`\\.${selector}\\s*\\{[^}]*background:[^;]*var\\(--ms-surface`, 's'));
    assert.doesNotMatch(html, new RegExp(`body\\[data-bs-theme="light"\\] \\.${selector}\\s*\\{`));
  }
  assert.match(html, /\.ecosystem-cta h2\s*\{[^}]*color: var\(--ms-on-surface\)/s);
  assert.match(html, /\.ecosystem-cta p\s*\{[^}]*color: var\(--ms-on-surface-variant\)/s);
});

test('formulários preservam superfície e texto semânticos ao focar', () => {
  assert.match(read('contact'), /\.contact-page \.form-control:focus,[\s\S]*background-color: var\(--ms-surface-container[^)]*\)[\s\S]*color: var\(--ms-on-surface\)/);
  assert.match(read('expertise'), /\.expertise-form-control\s*\{[^}]*background: var\(--ms-surface-container\)[^}]*color: var\(--ms-on-surface\)/s);
  assert.match(read('cotacoes'), /\.quote-form-panel option\s*\{[^}]*background: var\(--ms-surface-container\)[^}]*color: var\(--ms-on-surface\)/s);
});

test('estilos locais não vazam para outros componentes da SPA', () => {
  assert.doesNotMatch(read('contact'), /(?:^|\n)\s*\.form-(?:control|select):focus/m);
  assert.doesNotMatch(read('about'), /(?:^|\n)\s*\.(?:glass-morphism|text-gradient)\s*\{/m);
  assert.doesNotMatch(read('apps'), /(?:^|\n)\s*\.dev-skill-card:hover\s*\{/m);
});
