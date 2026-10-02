const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const blog = fs.readFileSync(path.join(__dirname, '../src/pages/blog.html'), 'utf8');

test('listagem e corpo do blog não forçam branco nas superfícies do tema', () => {
  assert.ok(!blog.includes('class="text-white text-decoration-none hover-gradient"'));
  assert.ok(!blog.includes('blog-content pb-4 text-white'));
  assert.ok(blog.includes('blog-content pb-4 text-on-surface'));
});

test('filtros, metadados e ações do detalhe usam cores semânticas', () => {
  assert.ok(blog.includes('border-color: var(--ms-outline);'));
  assert.ok(blog.includes('color: var(--ms-on-surface-variant);'));
  assert.ok(blog.includes('#post-content .btn.btn-outline-light'));
  assert.ok(blog.includes('background: var(--ms-primary-container);'));
});
