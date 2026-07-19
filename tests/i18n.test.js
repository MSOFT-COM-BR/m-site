const assert = require('node:assert/strict');
const test = require('node:test');
const { DEFAULT_LOCALE, I18n, STORAGE_KEY } = require('../src/core/i18n.js');

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

function createElement(attributes = {}, textContent = '') {
  const values = new Map(Object.entries(attributes));
  return {
    textContent,
    getAttribute(name) {
      return values.has(name) ? values.get(name) : null;
    },
    setAttribute(name, value) {
      values.set(name, String(value));
    },
    hasAttribute(name) {
      return values.has(name);
    }
  };
}

function createDocument(elements = []) {
  const rootAttributes = new Map();
  const documentElement = {
    setAttribute(name, value) {
      rootAttributes.set(name, String(value));
    },
    getAttribute(name) {
      return rootAttributes.get(name) || null;
    }
  };

  return {
    documentElement,
    querySelectorAll(selector) {
      const attribute = selector.slice(1, -1);
      return elements.filter((element) => element.hasAttribute(attribute));
    }
  };
}

function createWindow(document, storage) {
  const events = [];
  return {
    document,
    localStorage: storage,
    events,
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    dispatchEvent(event) {
      events.push(event);
      return true;
    }
  };
}

test('uses Portuguese as the safe default for a missing or invalid locale', () => {
  const storage = new MemoryStorage({ [STORAGE_KEY]: 'fr' });
  const document = createDocument();
  const i18n = new I18n({ window: createWindow(document, storage) });

  assert.equal(i18n.getLocale(), DEFAULT_LOCALE);
  assert.equal(document.documentElement.getAttribute('lang'), 'pt-BR');
  assert.equal(i18n.setLocale('fr'), DEFAULT_LOCALE);
  assert.equal(storage.getItem(STORAGE_KEY), 'fr');
});

test('persists a supported locale and notifies consumers about the change', () => {
  const storage = new MemoryStorage();
  const document = createDocument();
  const window = createWindow(document, storage);
  const i18n = new I18n({ window });

  assert.equal(i18n.setLocale('es'), 'es');
  assert.equal(storage.getItem(STORAGE_KEY), 'es');
  assert.equal(document.documentElement.getAttribute('lang'), 'es');
  assert.equal(window.events.length, 1);
  assert.equal(window.events[0].type, 'i18n:locale-change');
  assert.equal(window.events[0].detail.previousLocale, 'pt-BR');

  const reloadedTitle = createElement({ 'data-i18n': 'document.title' }, 'MSoft');
  const reloadedDocument = createDocument([reloadedTitle]);
  const reloaded = new I18n({ window: createWindow(reloadedDocument, storage) });
  assert.equal(reloaded.getLocale(), 'es');
  reloaded.apply(reloadedDocument);
  assert.equal(reloadedTitle.textContent, 'MSoft | Soluciones Digitales que Transforman Negocios');
});

test('applies text and supported accessibility attributes without HTML insertion', () => {
  const title = createElement({ 'data-i18n': 'document.title' }, 'Portuguese title');
  const label = createElement({ 'data-i18n': 'nav.solutions' }, 'Soluções');
  const button = createElement({ 'data-i18n-aria-label': 'language.select', 'aria-label': 'Selecionar idioma' });
  const tooltip = createElement({ 'data-i18n-title': 'language.select', title: 'Selecionar idioma' });
  const input = createElement({ 'data-i18n-placeholder': 'nav.content', placeholder: 'Conteúdo' });
  const document = createDocument([title, label, button, tooltip, input]);
  const i18n = new I18n({ window: createWindow(document, new MemoryStorage()) });

  i18n.setLocale('en', { persist: false });

  assert.equal(title.textContent, 'MSoft | Digital Solutions that Transform Businesses');
  assert.equal(label.textContent, 'Solutions');
  assert.equal(button.getAttribute('aria-label'), 'Select language');
  assert.equal(tooltip.getAttribute('title'), 'Select language');
  assert.equal(input.getAttribute('placeholder'), 'Content');
});

test('continues working when browser storage is blocked', () => {
  const blockedStorage = {
    getItem() {
      throw new Error('Storage blocked');
    },
    setItem() {
      throw new Error('Storage blocked');
    }
  };
  const document = createDocument();
  const i18n = new I18n({ window: createWindow(document, blockedStorage) });

  assert.equal(i18n.setLocale('en'), 'en');
  assert.equal(document.documentElement.getAttribute('lang'), 'en');
});
