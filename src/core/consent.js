/**
 * LGPD Cookie Consent Manager
 * Gerencia consentimento para cookies de analytics.
 */
(function initConsent() {
  'use strict';

  const STORAGE_KEY = 'msoft_cookie_consent';

  const ConsentManager = {
    getConsent() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'accepted') return 'accepted';
        if (stored === 'rejected') return 'rejected';
      } catch (_) {
        return null;
      }
      return null;
    },

    setConsent(value) {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch (_) {
        // Storage pode estar desabilitado
      }
      this.dispatchChange(value);
      return value;
    },

    accept() {
      return this.setConsent('accepted');
    },

    reject() {
      return this.setConsent('rejected');
    },

    hasAccepted() {
      return this.getConsent() === 'accepted';
    },

    dispatchChange(value) {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('msoft:consent-change', {
          detail: { consent: value, accepted: value === 'accepted' }
        }));
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.msoftConsent = ConsentManager;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConsentManager };
  }
})();
