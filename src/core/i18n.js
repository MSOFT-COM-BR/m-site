/*
 * Lightweight client-side translations for the global application shell.
 * Page and CMS content remain explicitly scoped to their own translation stories.
 */
(function initI18n() {
  'use strict';

  const DEFAULT_LOCALE = 'pt-BR';
  const STORAGE_KEY = 'msoft.locale';

  const LOCALES = Object.freeze({
    'pt-BR': Object.freeze({ code: 'PT', flag: '🇧🇷', lang: 'pt-BR' }),
    es: Object.freeze({ code: 'ES', flag: '🇪🇸', lang: 'es' }),
    en: Object.freeze({ code: 'EN', flag: '🇺🇸', lang: 'en' })
  });

  const TRANSLATIONS = Object.freeze({
    'pt-BR': Object.freeze({
      'document.title': 'MSoft | Soluções Digitais que Transformam Negócios',
      'nav.ecosystem': 'Ecossistema',
      'nav.solutions': 'Soluções',
      'nav.market': 'Mercado',
      'nav.content': 'Conteúdo',
      'nav.about': 'Sobre',
      'nav.contact': 'Fale Conosco',
      'navigation.open': 'Abrir menu de navegação',
      'navigation.close': 'Fechar menu de navegação',
      'language.select': 'Selecionar idioma',
      'language.pt-BR': 'Português',
      'language.es': 'Espanhol',
      'language.en': 'Inglês',
      'account.menu': 'Menu da conta',
      'account.default': 'Conta',
      'account.accesses': 'Meus acessos',
      'account.admin': 'Painel Admin',
      'account.premium': 'Dashboard Premium',
      'account.dashboard': 'Dashboard',
      'account.profile': 'Meu perfil',
      'account.logout': 'Sair'
    }),
    es: Object.freeze({
      'document.title': 'MSoft | Soluciones Digitales que Transforman Negocios',
      'nav.ecosystem': 'Ecosistema',
      'nav.solutions': 'Soluciones',
      'nav.market': 'Mercado',
      'nav.content': 'Contenido',
      'nav.about': 'Acerca de',
      'nav.contact': 'Hable con nosotros',
      'navigation.open': 'Abrir menú de navegación',
      'navigation.close': 'Cerrar menú de navegación',
      'language.select': 'Seleccionar idioma',
      'language.pt-BR': 'Portugués',
      'language.es': 'Español',
      'language.en': 'Inglés',
      'account.menu': 'Menú de cuenta',
      'account.default': 'Cuenta',
      'account.accesses': 'Mis accesos',
      'account.admin': 'Panel de administración',
      'account.premium': 'Panel premium',
      'account.dashboard': 'Panel',
      'account.profile': 'Mi perfil',
      'account.logout': 'Cerrar sesión'
    }),
    en: Object.freeze({
      'document.title': 'MSoft | Digital Solutions that Transform Businesses',
      'nav.ecosystem': 'Ecosystem',
      'nav.solutions': 'Solutions',
      'nav.market': 'Market',
      'nav.content': 'Content',
      'nav.about': 'About',
      'nav.contact': 'Contact us',
      'navigation.open': 'Open navigation menu',
      'navigation.close': 'Close navigation menu',
      'language.select': 'Select language',
      'language.pt-BR': 'Portuguese',
      'language.es': 'Spanish',
      'language.en': 'English',
      'account.menu': 'Account menu',
      'account.default': 'Account',
      'account.accesses': 'My access',
      'account.admin': 'Admin panel',
      'account.premium': 'Premium dashboard',
      'account.dashboard': 'Dashboard',
      'account.profile': 'My profile',
      'account.logout': 'Sign out'
    })
  });

  function getStorage(windowRef) {
    try {
      return windowRef && windowRef.localStorage ? windowRef.localStorage : null;
    } catch (_) {
      return null;
    }
  }

  class I18n {
    constructor(options = {}) {
      this.window = options.window || (typeof window !== 'undefined' ? window : null);
      this.document = options.document || (this.window && this.window.document) || null;
      this.storage = options.storage === undefined ? getStorage(this.window) : options.storage;
      this.locale = this.resolveLocale(options.locale || this.readStoredLocale());
      this.applyDocumentLanguage();
    }

    isSupportedLocale(locale) {
      return typeof locale === 'string' && Object.prototype.hasOwnProperty.call(LOCALES, locale);
    }

    resolveLocale(locale) {
      return this.isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
    }

    getLocale() {
      return this.locale;
    }

    getLocaleInfo(locale = this.locale) {
      return LOCALES[this.resolveLocale(locale)];
    }

    t(key, fallback) {
      const current = TRANSLATIONS[this.locale];
      const defaultDictionary = TRANSLATIONS[DEFAULT_LOCALE];
      if (Object.prototype.hasOwnProperty.call(current, key)) return current[key];
      if (Object.prototype.hasOwnProperty.call(defaultDictionary, key)) return defaultDictionary[key];
      return fallback === undefined ? key : fallback;
    }

    readStoredLocale() {
      try {
        const storedLocale = this.storage && this.storage.getItem(STORAGE_KEY);
        return this.isSupportedLocale(storedLocale) ? storedLocale : null;
      } catch (_) {
        return null;
      }
    }

    persistLocale(locale) {
      try {
        if (this.storage) this.storage.setItem(STORAGE_KEY, locale);
      } catch (_) {
        // Storage can be disabled by browser privacy settings.
      }
    }

    setLocale(locale, options = {}) {
      if (!this.isSupportedLocale(locale)) return this.locale;

      const previousLocale = this.locale;
      this.locale = locale;
      if (options.persist !== false) this.persistLocale(locale);
      this.applyDocumentLanguage();
      this.apply(this.document);
      this.dispatchLocaleChange(previousLocale);
      return this.locale;
    }

    applyDocumentLanguage() {
      const root = this.document && this.document.documentElement;
      if (!root || typeof root.setAttribute !== 'function') return;
      root.setAttribute('lang', this.getLocaleInfo().lang);
      root.setAttribute('data-locale', this.locale);
    }

    apply(root = this.document) {
      this.applyText(root, '[data-i18n]', 'data-i18n');
      this.applyAttribute(root, '[data-i18n-aria-label]', 'data-i18n-aria-label', 'aria-label');
      this.applyAttribute(root, '[data-i18n-title]', 'data-i18n-title', 'title');
      this.applyAttribute(root, '[data-i18n-placeholder]', 'data-i18n-placeholder', 'placeholder');
    }

    applyText(root, selector, keyAttribute) {
      this.collectElements(root, selector).forEach((element) => {
        const key = element.getAttribute(keyAttribute);
        if (key) element.textContent = this.t(key, element.textContent);
      });
    }

    applyAttribute(root, selector, keyAttribute, targetAttribute) {
      this.collectElements(root, selector).forEach((element) => {
        const key = element.getAttribute(keyAttribute);
        if (key) element.setAttribute(targetAttribute, this.t(key, element.getAttribute(targetAttribute) || ''));
      });
    }

    collectElements(root, selector) {
      if (!root) return [];
      const elements = [];
      if (typeof root.matches === 'function' && root.matches(selector)) elements.push(root);
      if (typeof root.querySelectorAll === 'function') elements.push(...root.querySelectorAll(selector));
      return elements;
    }

    dispatchLocaleChange(previousLocale) {
      if (!this.window || typeof this.window.dispatchEvent !== 'function') return;
      const CustomEventCtor = this.window.CustomEvent;
      if (typeof CustomEventCtor !== 'function') return;
      this.window.dispatchEvent(new CustomEventCtor('i18n:locale-change', {
        detail: {
          locale: this.locale,
          previousLocale,
          localeInfo: this.getLocaleInfo()
        }
      }));
    }
  }

  if (typeof window !== 'undefined' && !window.i18n) {
    window.i18n = new I18n();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_LOCALE, I18n, LOCALES, STORAGE_KEY, TRANSLATIONS };
  }
})();
