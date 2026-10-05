const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('todos os tokens consumidos pelo stylesheet público têm definição central', () => {
  const css = read('src/assets/css/developer.css');
  const tokens = read('src/assets/css/design-system.css');
  for (const token of new Set([...css.matchAll(/var\((--(?:ms|dev)-[\w-]+)/g)].map(match => match[1]))) {
    assert.ok(new RegExp(`${token}\\s*:`).test(tokens), `${token} deve existir no design-system`);
  }
  assert.doesNotMatch(css, /--ms-(?:surface|primary|secondary|tertiary|text|outline)[\w-]*\s*:/, 'paleta não deve ser redeclarada em developer.css');
});

test('superfícies e gradiente globais são definidos uma vez e usam tokens', () => {
  const design = read('src/assets/css/design-system.css');
  assert.match(design, /\.ms-card\s*\{[^}]*background: var\(--ms-surface-container\)/);
  for (const file of ['src/assets/css/developer.css', 'src/components/header.html']) assert.doesNotMatch(read(file), /^\s*\.text-gradient\s*\{/m, `${file} não redefine gradiente global`);
  for (const token of ['--ms-surface-container-lowest', '--ms-surface-variant', '--ms-surface-bright', '--ms-surface-dim']) {
    assert.ok(design.slice(design.indexOf('html[data-bs-theme="light"]')).includes(`${token}:`));
  }
});

test('menus usam um único componente e expõem serviços/ferramentas/contato', () => {
  const header = read('src/components/header.html');
  for (const href of ['/criacao-de-sites', '/desenvolvimento-de-sistemas', '/expertise', '/apps', '/contact']) assert.ok(header.includes(`href="${href}"`), href);
  assert.doesNotMatch(header, /^\s*\.dropdown-(?:menu|item)[\s:{]/m, 'não vazar estilos de menu para páginas');
  assert.match(header, /\.dev-header \.dropdown-item\s*\{[^}]*color: var\(--header-dropdown-item-color\)/);
});

test('ícone fica no botão da conta e Área do cliente abre login para visitante', () => {
  const header = read('src/components/header.html');
  assert.match(header, /const accountLink = `\s*<a class="header-client-link" href="\/login"[^>]*data-i18n-aria-label="nav.login"/);
  assert.match(header, /<button class="header-user-btn[\s\S]*?<i class="bi bi-person-circle flex-shrink-0" aria-hidden="true"><\/i>\s*<span class="header-user-name"/);
  assert.doesNotMatch(header, /<li class="nav-item"><a class="nav-link header-client-link"/);
  assert.equal((header.match(/href="\/login"/g) || []).length, 1, 'visitante tem apenas um destino de login');
});
