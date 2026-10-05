(function () {
  const paths = Object.freeze({
    overview: '/console',
    theme: '/console/aparencia',
    mjson: '/console/conteudo/mjson',
    blog: '/console/conteudo/blog',
    images: '/console/midia',
    logs: '/console/sistema/logs',
    users: '/console/sistema/usuarios',
    apps: '/console/sistema/apps'
  });
  const groups = { overview: null, theme: 'workspace', mjson: 'content', blog: 'content', images: 'workspace', logs: 'system', users: 'system', apps: 'system' };
  const auth = window.authService;
  const content = document.getElementById('admin-content');
  const denied = document.getElementById('access-denied');
  const nav = document.querySelector('.admin-nav');
  const toggle = document.getElementById('admin-nav-toggle');
  const container = document.getElementById('tab-content');
  if (!content || !denied || !container) return;

  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const routePath = window.location.pathname.replace(/\/$/, '');
  const isBlogEditorRoute = routePath === '/console/conteudo/blog/novo'
    || /^\/console\/conteudo\/blog\/[a-zA-Z0-9-]{1,64}\/editar$/.test(routePath);
  const explicitTab = Object.keys(paths).find(tab => paths[tab] === routePath) || (isBlogEditorRoute ? 'blog' : undefined);
  const legacyRoot = routePath === '/admin';
  let selectedTab = explicitTab;
  let renderId = 0;

  function destroyEditor() {
    try { window.summernoteEditor?._editor?.summernote('destroy'); } catch (_) { /* editor may already be detached */ }
    window.summernoteEditor = null;
  }
  window.addEventListener('msoft:route-unmount', () => {
    lifecycle.abort();
    renderId++;
    destroyEditor();
  }, { once: true, signal });

  function closeMobileNav() {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir navegação do Console');
  }
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar navegação do Console' : 'Abrir navegação do Console');
  }, { signal });
  document.addEventListener('pointerdown', event => {
    if (window.innerWidth < 992 && nav?.classList.contains('open') && !nav.contains(event.target)) closeMobileNav();
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      event.preventDefault();
      closeMobileNav();
      toggle?.focus({ preventScroll: true });
    }
  }, { signal });

  function markActive(tab) {
    nav?.querySelectorAll('[data-tab]').forEach(item => {
      const active = item.dataset.tab === tab;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    nav?.querySelectorAll('.admin-nav-group').forEach(group => {
      group.classList.toggle('active', group.dataset.group === groups[tab]);
    });
    const current = document.getElementById('admin-current-tab');
    if (current) current.textContent = nav?.querySelector(`[data-tab="${tab}"]`)?.textContent.trim() || '';
  }

  window.consoleViews = window.consoleViews || Object.create(null);
  window.consoleViewLoads = window.consoleViewLoads || Object.create(null);
  async function loadView(tab) {
    if (window.consoleViews[tab]) return window.consoleViews[tab];
    if (!window.consoleViewLoads[tab]) {
      window.consoleViewLoads[tab] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `/src/assets/js/console/${tab}.js?v=${window.config.app.version}`;
        script.onload = () => resolve(window.consoleViews[tab]);
        script.onerror = () => reject(new Error(`Não foi possível carregar ${tab}`));
        document.head.appendChild(script);
      });
    }
    return window.consoleViewLoads[tab];
  }

  async function render(tab) {
    if (!auth?.isAuthenticated() || !auth.hasRole('admin') || !paths[tab]) return;
    const requestId = ++renderId;
    if (selectedTab === 'blog' && tab !== 'blog') destroyEditor();
    selectedTab = tab;
    try { localStorage.setItem('msoft_cms_last_tab', tab); } catch (_) { /* storage unavailable */ }
    markActive(tab);
    closeMobileNav();
    container.style.opacity = '0';
    container.setAttribute('aria-busy', 'true');
    try {
      const view = await loadView(tab);
      if (signal.aborted || requestId !== renderId || !container.isConnected) return;
      container.replaceChildren();
      await view({ container, auth });
      if (signal.aborted || requestId !== renderId || !container.isConnected) return;
      container.style.transition = 'opacity 0.4s ease';
      container.style.opacity = '1';
    } catch (error) {
      if (signal.aborted || requestId !== renderId) return;
      console.error('[Console]', error);
      container.textContent = 'Não foi possível carregar esta seção. Atualize a página e tente novamente.';
      container.style.opacity = '1';
    } finally {
      if (requestId === renderId) container.removeAttribute('aria-busy');
    }
  }

  window.loadTab = tab => {
    if (!paths[tab]) return;
    const destination = paths[tab];
    if (window.location.pathname !== destination && !legacyRoot) {
      window.core.navigate(destination);
      return;
    }
    if (legacyRoot && selectedTab && selectedTab !== tab) {
      window.core.navigate(destination);
      return;
    }
    return render(tab);
  };

  if (auth?.isAuthenticated() && auth.hasRole('admin')) {
    content.style.display = 'block';
    document.getElementById('admin-role').hidden = false;
    const initialTab = explicitTab || 'overview';
    render(initialTab);
  } else {
    denied.style.display = 'block';
  }
})();
