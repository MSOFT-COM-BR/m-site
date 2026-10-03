(function (window) {
  class AuditService {
    constructor() {
      this.lastPath = window.location.pathname;
      this.lastActionAt = new Map();
      this.minIntervalMs = 15000;
      this.start();
    }

    isAuditedArea() {
      const path = window.location.pathname || '';
      return ['/console', '/painel', '/admin', '/premium'].some(area => path === area || path.startsWith(area + '/'));
    }

    canSend(actionKey) {
      const now = Date.now();
      const last = this.lastActionAt.get(actionKey) || 0;
      if (now - last < this.minIntervalMs) return false;
      this.lastActionAt.set(actionKey, now);
      return true;
    }

    getCurrentUser() {
      if (!window.authService || !window.authService.getUser) return null;
      return window.authService.getUser();
    }

    async sendLog(payload) {
      try {
        const baseUrl = window?.config?.api?.baseUrl || '';
        if (!baseUrl) return;
        await fetch(`${baseUrl.replace(/\/+$/, '')}/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('msoft_auth_token') || ''}`
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } catch (_error) {
        // Silent on purpose: audit cannot break UX.
      }
    }

    track(action, details, metadata) {
      if (!this.isAuditedArea()) return;
      const user = this.getCurrentUser();
      const userId = user ? (user.email || user.name || user.id || 'unknown') : 'anonymous';

      this.sendLog({
        action,
        details,
        user: String(userId),
        level: 'info',
        path: window.location.pathname,
        metadata: metadata || {}
      });
    }

    wireRouteAudit() {
      setInterval(() => {
        const currentPath = window.location.pathname;
        if (currentPath === this.lastPath) return;
        this.lastPath = currentPath;
        if (!this.isAuditedArea()) return;
        this.track('NAVIGATE', `Navigation to ${currentPath}`);
      }, 800);
    }

    wireClickAudit() {
      document.addEventListener('click', (event) => {
        if (!this.isAuditedArea()) return;
        const target = event.target && event.target.closest ? event.target.closest('a,button') : null;
        if (!target) return;

        const label = (target.textContent || '').trim().slice(0, 120);
        const href = target.getAttribute && target.getAttribute('href');
        const id = target.id || '';
        const key = `click:${id || label || href || 'unknown'}`;
        if (!this.canSend(key)) return;

        this.track('UI_CLICK', `Click on ${label || href || 'element'}`, {
          id,
          href: href || '',
          className: target.className || ''
        });
      });
    }

    wireFormAudit() {
      document.addEventListener('submit', (event) => {
        if (!this.isAuditedArea()) return;
        const form = event.target;
        if (!form || !form.id) return;
        if (!this.canSend(`submit:${form.id}`)) return;
        this.track('FORM_SUBMIT', `Submit form ${form.id}`);
      });
    }

    start() {
      window.addEventListener('auth-change', () => {
        if (!this.isAuditedArea()) return;
        this.track('AUTH_CHANGE', 'Auth state changed on protected area');
      });

      if (this.isAuditedArea()) {
        this.track('PAGE_VIEW', `Open ${window.location.pathname}`);
      }

      this.wireRouteAudit();
      this.wireClickAudit();
      this.wireFormAudit();
    }
  }

  window.auditService = new AuditService();
})(window);
