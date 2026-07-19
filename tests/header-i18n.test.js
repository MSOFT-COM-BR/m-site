const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { TRANSLATIONS } = require('../src/core/i18n.js');

const headerPath = path.join(__dirname, '..', 'src', 'components', 'header.html');
const corePath = path.join(__dirname, '..', 'src', 'core', 'core.js');

test('every header translation key exists in Portuguese, Spanish and English', () => {
  const header = fs.readFileSync(headerPath, 'utf8');
  const keys = [...header.matchAll(/data-i18n(?:-aria-label|-title|-placeholder)?="([^"]+)"/g)]
    .map((match) => match[1]);

  assert.ok(keys.length > 0, 'The header must expose translation attributes.');
  for (const locale of ['pt-BR', 'es', 'en']) {
    for (const key of keys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(TRANSLATIONS[locale], key),
        `Missing ${key} translation for ${locale}`
      );
    }
  }
});

test('the header exposes accessible language choices and translates dynamic account markup', () => {
  const header = fs.readFileSync(headerPath, 'utf8');

  for (const option of ['pt-BR', 'es', 'en']) {
    assert.match(header, new RegExp(`data-language-option="${option}"`));
  }
  assert.match(header, /data-language-current-flag/);
  assert.match(header, /data-language-current-code/);
  assert.match(header, /window\.i18n\.apply\(headerAuthItem\)/);
});

test('the SPA applies a persisted locale to static shell content during initialization', () => {
  const core = fs.readFileSync(corePath, 'utf8');

  const initialTranslation = core.indexOf('this.applyTranslations(document);');
  const routerInitialization = core.indexOf('this.initRouter();');

  assert.ok(initialTranslation >= 0, 'The initial document shell must receive translations.');
  assert.ok(initialTranslation < routerInitialization, 'Translations must run before route content loads.');
});
