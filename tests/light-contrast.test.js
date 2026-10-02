const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('home estática e dinâmica usam texto semântico, não branco fixo', () => {
  const home = read('src/pages/home.html');
  assert.doesNotMatch(home, /\btext-white\b/);
  assert.match(home, /\.home-hub-shell\s*\{[^}]*var\(--ms-surface-container-low\)/);
  assert.match(home, /\.home-hub-card\s*\{[^}]*color: var\(--ms-on-surface\)/);
});

test('textos e títulos usam cor sólida sem degradê nos dois temas', () => {
  const css = read('src/assets/css/design-system.css');
  assert.match(css, /\.text-on-surface\s*\{\s*color: var\(--ms-on-surface\) !important;/);
  assert.match(css, /\.text-on-surface-variant\s*\{\s*color: var\(--ms-on-surface-variant\) !important;/);
  assert.match(css, /\.text-gradient,\s*\.text-gradient-primary,\s*\.text-gradient-neon\s*\{[^}]*color: var\(--ms-on-surface\)/);
  assert.match(css, /\.text-gradient-neon\s*\{[^}]*background: none;[^}]*-webkit-text-fill-color: currentColor;/);
  assert.doesNotMatch(read('src/assets/css/developer.css'), /\.text-gradient-neon\s*\{/);
});

test('rodapé usa tokens para títulos, descrições e hover', () => {
  const footer = read('src/components/footer.html');
  assert.doesNotMatch(footer, /color:\s*#(?:ffffff|f8fafc|94a3b8|64748b|475569)\s*;/i);
  assert.match(footer, /color: var\(--ms-text-primary\)/);
  assert.match(footer, /color: var\(--ms-text-secondary\)/);
});
