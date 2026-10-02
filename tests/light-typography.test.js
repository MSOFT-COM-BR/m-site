const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('tema claro usa hierarquia legível no título do Ecossistema', () => {
  const page = read('src/pages/ecossistema.html');
  const rule = page.match(/body\[data-bs-theme="light"\] \.ecosystem-title \{([^}]+)\}/);
  assert.ok(rule, 'O título claro precisa de uma escala própria.');
  assert.match(rule[1], /font-weight: 700/);
  assert.match(rule[1], /line-height: 1\.12/);
  assert.match(page, /body\[data-bs-theme="light"\] \.ecosystem-title em \{[^}]*font-family: inherit/s);
});
