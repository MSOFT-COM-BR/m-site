const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const read = name => fs.readFileSync(path.join(__dirname, '../src/pages', name), 'utf8');

test('catálogo e consulta compartilham superfícies e foreground semânticos', () => {
  const html = read('marketplace.html');
  assert.doesNotMatch(html, /\b(?:bg-dark|text-white|btn-close-white)\b/);
  assert.match(html, /background: var\(--ms-surface-container\)/);
  assert.match(html, /#purchase-modal \.modal-content/);
  assert.match(html, /color: var\(--ms-on-surface\)/);
  assert.match(html, /--bs-btn-color: var\(--ms-on-surface\)/);
  assert.match(html, /aria-label="Fechar"/);
  assert.match(html, /background: currentColor/);
  assert.match(html, /A consultar/);
  assert.match(html, /encodeURIComponent\(item.appKey\)/);
});

test('login e seleção de destino reutilizam tokens em vez de superfícies dark fixas', () => {
  const html = read('login.html');
  assert.doesNotMatch(html, /\btext-white\b|color:\s*(?:white|#fff|#f8fafc)\b/);
  assert.doesNotMatch(html, /background:\s*rgba\((?:20, 20, 28|14, 14, 19)/);
  assert.match(html, /background: var\(--ms-surface-container\)/);
  assert.match(html, /background: var\(--ms-surface-container-low\)/);
  assert.match(html, /#roleSelectorModal \.modal-content/);
  assert.match(html, /#roleSelectorModal \.role-btn/);
  assert.match(html, /color: var\(--ms-error\)/);
  assert.match(html, /color: var\(--ms-on-surface-variant\)/);
  assert.match(html, /window.authService.login\(email, password\)/);
});

test('textos auxiliares têm foreground semântico no catálogo e login', () => {
  assert.match(read('marketplace.html'), /#marketplace-content \.text-muted,[\s\S]*?#purchase-modal \.text-muted\s*\{\s*color: var\(--ms-on-surface-variant\) !important;/);
  assert.match(read('login.html'), /\.login-screen \.text-muted,[\s\S]*?#roleSelectorModal \.text-muted\s*\{\s*color: var\(--ms-on-surface-variant\) !important;/);
});
