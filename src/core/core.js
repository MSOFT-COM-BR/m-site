// Core Framework Class
class Core {
  constructor() {
    // Componentes JS registrados
    this.components = new Map();
    // Componentes HTML já carregados via fetch
    this.loadedHtmlComponents = new Set();
    // Registro de carregamentos ativos para evitar concorrência (Race Conditions)
    this._activeLoads = new Set();
    // Estado global
    this.state = {};
    // Parâmetros da URL
    this.params = [];
    // Skeleton universal
    this.skeleton = null;
    // Caminho atual
    this._currentPath = null;
    // Sequência usada para descartar carregamentos de rota que chegaram atrasados
    this._navigationId = 0;
    // Inicialização única
    this._globalComponentsLoaded = false;
    // Lista de páginas válidas
    this.registerPages = config.routes.validPages;
    // inicializa o core
    this.init();
    this.initTracking();
  }

  // Tracking de eventos de clique (analytics)
  initTracking() {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-track]');
      if (!el) return;
      const eventName = el.getAttribute('data-track');
      const eventParams = {};
      el.querySelectorAll('[data-track-param]').forEach(paramEl => {
        const key = paramEl.getAttribute('data-track-param');
        const value = paramEl.getAttribute('data-track-value') || paramEl.textContent.trim();
        if (key) eventParams[key] = value;
      });
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-track-') && attr.name !== 'data-track') {
          const key = attr.name.replace('data-track-', '');
          eventParams[key] = attr.value;
        }
      });
      if (typeof window.trackEvent === 'function') {
        window.trackEvent(eventName, eventParams);
      }
    });
  }

  // Registro de componentes JS
  registerComponent(name, component) {
    this.components.set(name, component);
  }

  getComponent(name) {
    return this.components.get(name);
  }

  configureComponentRoot(host, { className, variant } = {}) {
    const root = host?.querySelector?.('[data-component-root]');
    if (!root) return null;
    const classes = String(className || '').split(/\s+/).filter(Boolean);
    if (classes.length) root.classList.add(...classes);
    if (variant) root.dataset.componentVariant = variant;
    return root;
  }

  applyTranslations(container) {
    if (window.i18n && typeof window.i18n.apply === 'function') {
      window.i18n.apply(container);
    }
  }

  // Inicialização principal
  async init() {
    // Aplica o locale persistido na shell estatica, incluindo o titulo do documento.
    this.applyTranslations(document);
    this.initRouter();
    this.initializeComponents(document.body);
  }


  // Inicializa todos os [data-component]
  initializeComponents(container) {
    const elements = container.querySelectorAll('[data-component]');

    elements.forEach(async el => {
      const name = el.getAttribute('data-component');

      // 1. Verificações de segurança síncronas e imediatas
      if (name === 'skeleton' || el.hasAttribute('data-loaded')) return;
      
      // Bloqueio atômico em memória (Set é síncrono, data-attribute é lento)
      if (this._activeLoads.has(el)) return;
      this._activeLoads.add(el);

      // Determine skeleton type based on component name
      const skeletonTypeMap = {
        'header': 'header',
        'footer': 'footer',
        'banner': 'hero',
        'cards': 'cards',
        'timeline': 'timeline',
        'contact': 'contact',
        'education': 'education'
      };

      const skeletonType = skeletonTypeMap[name] || 'card';

      // Show skeleton while loading (if Skeleton is available)
      if (typeof Skeleton !== 'undefined' && Skeleton.show) {
        Skeleton.show(el, skeletonType);
      }

      try {
        const componentVersion = config?.app?.version || '0';
        const res = await fetch(`/src/components/${name}.html?v=${componentVersion}`);
        if (res.ok) {
          const content = await res.text();

          let finalContent = content;
          // Padronização: Extrair <style> para evitar repetição no DOM
          const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
          let match;
          let extractedStyles = '';
          while ((match = styleRegex.exec(content)) !== null) {
            extractedStyles += match[1] + '\n';
          }
          if (extractedStyles.trim()) {
            finalContent = content.replace(styleRegex, '');
            const styleId = `style-comp-${name}`;
            if (!document.getElementById(styleId)) {
              const styleEl = document.createElement('style');
              styleEl.id = styleId;
              styleEl.textContent = extractedStyles;
              document.head.appendChild(styleEl);
            }
          }

          // Use smooth transition if Skeleton is available
          if (typeof Skeleton !== 'undefined' && Skeleton.hide) {
            Skeleton.hide(el, finalContent, () => {
              this._activeLoads.delete(el);
              el.setAttribute('data-loaded', 'true');
              this.loadedHtmlComponents.add(name);
              this.configureComponentRoot(el, {
                className: el.dataset.componentClass,
                variant: el.dataset.componentVariant,
              });
              // Execute any inline scripts
              this.executeScripts(el);
              this.applyTranslations(el);
            });
          } else {
            el.innerHTML = finalContent;
            this._activeLoads.delete(el);
            el.setAttribute('data-loaded', 'true');
            this.loadedHtmlComponents.add(name);
            this.configureComponentRoot(el, {
              className: el.dataset.componentClass,
              variant: el.dataset.componentVariant,
            });
            this.executeScripts(el);
            this.applyTranslations(el);
          }
          return;
        }
      } catch (error) {
        this._activeLoads.delete(el);
        if (config?.app?.debug) console.warn(`Failed to load component: ${name}`, error);
      }

      // Fallback to JS component
      const Comp = this.getComponent(name);
      if (Comp) {
        const instance = new Comp();
        if (typeof instance.render === 'function') {
          if (typeof Skeleton !== 'undefined' && Skeleton.hide) {
            const tempDiv = document.createElement('div');
            instance.render(tempDiv);
            Skeleton.hide(el, tempDiv.innerHTML, () => {
              this._activeLoads.delete(el);
              el.setAttribute('data-loaded', 'true');
              this.configureComponentRoot(el, {
                className: el.dataset.componentClass,
                variant: el.dataset.componentVariant,
              });
              this.applyTranslations(el);
            });
          } else {
            instance.render(el);
            this._activeLoads.delete(el);
            el.setAttribute('data-loaded', 'true');
            this.configureComponentRoot(el, {
              className: el.dataset.componentClass,
              variant: el.dataset.componentVariant,
            });
            this.applyTranslations(el);
          }
        }
      } else {
        this._activeLoads.delete(el);
      }
    });
  }

  // Execute inline scripts in a container
  executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }


  // SPA: Carrega página em #root
  async loadPage() {
    const root = document.getElementById('root');
    if (!root) return;
    const navigationId = ++this._navigationId;
    const isCurrentNavigation = () => navigationId === this._navigationId;
    window.dispatchEvent(new CustomEvent('msoft:route-unmount'));
    this.showSkeleton(root);

    // Get segments from pathname
    const segments = window.location.pathname.split('/');
    const requestedPageName = segments[1] || 'home';
    const isPadraoEngineeringRoute = requestedPageName === 'padrao-engenharia';
    const hasValidPadraoEngineeringPath = !isPadraoEngineeringRoute
      || segments.length === 2
      || (segments.length === 3 && ['consultar', 'contato'].includes(segments[2]));
    const nestedAppSlug = requestedPageName === 'app' && segments.length === 3 && /^[a-z0-9-]+$/.test(segments[2] || '')
      ? segments[2]
      : '';
    const studioRouteKey = requestedPageName === 'app' && segments.length === 5 && segments[2] === 'studio'
      && /^[a-z0-9-]+$/.test(segments[3] || '') && /^[a-z0-9-]+$/.test(segments[4] || '')
      ? `${segments[3]}/${segments[4]}`
      : '';
    const studioPagePath = studioRouteKey ? config.routes.studioPages?.[studioRouteKey] || '' : '';
    const legacyAppSlug = segments.length === 2
      ? config.routes.legacyAppPages?.[requestedPageName] || ''
      : '';
    const appSlug = nestedAppSlug || legacyAppSlug;
    const pageName = studioRouteKey
      ? `app-studio-${studioRouteKey.replace('/', '-')}`
      : appSlug
        ? `app-${appSlug}`
      : requestedPageName === 'padrao-engenharia' && ['consultar', 'contato'].includes(segments[2])
        ? 'padrao-engenharia-contato'
        : requestedPageName;
    this.params = pageName === 'padrao-engenharia-contato' || appSlug || studioRouteKey ? [] : segments.slice(2);

    if (config?.app?.debug) {
      console.log(`pageName`, pageName);
      console.log(`params`, this.params);
    }

    // Armazena os parâmetros no estado global
    this.state = { ...this.state, params: this.params };

    // Dispara evento de mudança de parâmetros
    window.dispatchEvent(new CustomEvent('paramsChange', {
      detail: { params: this.params }
    }));

    try {
      // Verifica se o arquivo existe no path
      const pagePath = studioPagePath || (appSlug ? `app/${appSlug}/index` : config.routes.pagePaths?.[pageName] || pageName);
      const filePath = `/src/pages/${pagePath}.html?v=${config.app.version}`;

      if (config?.app?.debug) console.log(`filePath`, filePath);

      const isRegisteredPage = studioRouteKey
        ? Boolean(studioPagePath)
        : appSlug
          ? config.routes.appPages.includes(appSlug)
        : hasValidPadraoEngineeringPath && this.registerPages.includes(pageName);
      if (!isRegisteredPage) {
        throw new Error('Page not found');
      }

      const res = await fetch(filePath);
      if (!res.ok) {
        throw new Error(`Page request failed: ${res.status}`);
      }
      const html = await res.text();
      if (!isCurrentNavigation()) return;

      // Verifica se a resposta está vazia ou é inválida
      if (!html || html.trim() === '') {
        throw new Error('Page is empty');
      }

      // Check for recursion (SPA fallback returning index.html)
      if (html.includes('<!DOCTYPE html>') || html.includes('<html')) {
        console.error(`[Router] Error: ${filePath} returned full HTML document (likely soft 404).`);
        throw new Error('Page not found (soft 404)');
      }

      // Save reference to this for callback
      const self = this;

      // Function to load content and execute scripts
      const loadContent = () => {
        if (!isCurrentNavigation()) return;

        // Set the HTML content
        root.innerHTML = html;

        // Execute all scripts in the loaded content
        self.executeScripts(root);
        const tool = new URLSearchParams(window.location.search).get('tool');
        if (pageName === 'apps' && tool && typeof window.openTool === 'function') {
          window.openTool(tool);
        }
        self.applyTranslations(root);

        // Initialize any components inside the loaded content
        self.initializeComponents(root);

        // Force scroll to top of page when changing page views
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });

        // Add fade-in animation
        root.classList.add('content-fade-in');
        setTimeout(() => {
          root.classList.remove('content-fade-in');
        }, 400);
      };

      // Use smooth transition with skeleton if available
      if (typeof Skeleton !== 'undefined' && Skeleton.hide) {
        // Check if skeleton wrapper exists
        const hasSkeletonWrapper = root.querySelector('.skeleton-wrapper');
        if (hasSkeletonWrapper) {
          hasSkeletonWrapper.classList.add('skeleton-fade-out');
          setTimeout(loadContent, 300);
        } else {
          loadContent();
        }
      } else {
        loadContent();
      }

      if (config?.app?.debug) console.log(`Page loaded: ${pageName}`);

      // Gerenciamento de visibilidade global baseada em Rotas (Regras de Negócio)
      const headerEl = document.getElementById('head');
      const footerEl = document.getElementById('footer');

      // "dashboard de admin pode apareceer o menu do site.. dash premium nao pode"
      const isPadraoEngineeringRoute = ['padrao-engenharia', 'padrao-engenharia-contato'].includes(pageName);
      const isBvaConsoleRoute = pageName.startsWith('app-studio-');
      const hideMainFrame = pageName === 'premium' || isPadraoEngineeringRoute || isBvaConsoleRoute;
      const fullBleedLayout = isPadraoEngineeringRoute || isBvaConsoleRoute;
      const layoutWrapper = root.closest('.container-lg');
      if (headerEl) headerEl.style.display = hideMainFrame ? 'none' : 'block';
      if (footerEl) footerEl.style.display = hideMainFrame ? 'none' : 'block';
      if (layoutWrapper) {
        layoutWrapper.style.maxWidth = fullBleedLayout ? 'none' : '1140px';
      }
      
      if(hideMainFrame) {
         document.body.style.background = '#0a0a0f';
      } else {
         document.body.style.background = '';
      }

      // Atualiza a URL mantendo os parâmetros
      const paramsString = this.params.length > 0 ? `/${this.params.join('/')}` : '';
      const canonicalPath = pageName === 'home'
        ? '/'
        : studioRouteKey
          ? `/app/studio/${studioRouteKey}`
          : appSlug
            ? `/app/${appSlug}`
          : pageName === 'padrao-engenharia-contato'
            ? '/padrao-engenharia/consultar'
            : `/${pageName}${paramsString}`;
      const routeSearch = window.location.search;
      const routeHash = window.location.hash;
      const newPath = `${canonicalPath}${routeSearch}${routeHash}`;
      window.history.replaceState({}, '', newPath);

      // Atualiza SEO dinâmico (título, meta description, canonical, noindex)
      this.updatePageSEO(pageName, canonicalPath);

      // Analytics: page_view em navegacao SPA (se consentimento aceito)
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('page_view', {
          page_path: newPath,
          page_title: document.title,
          page_location: window.location.href
        });
      }
    } catch (error) {
      if (!isCurrentNavigation()) return;

      // Mantém a URL solicitada e apresenta a tela de página não encontrada.
      this.updatePageSEO('404', '/404');
      const headerEl = document.getElementById('head');
      const footerEl = document.getElementById('footer');
      const layoutWrapper = root.closest('.container-lg');
      if (headerEl) headerEl.style.display = 'block';
      if (footerEl) footerEl.style.display = 'block';
      if (layoutWrapper) layoutWrapper.style.maxWidth = '1140px';
      document.body.style.background = '';
      try {
        const errorRes = await fetch('/src/pages/404.html');
        if (errorRes.ok) {
          const errorHtml = await errorRes.text();
          if (!isCurrentNavigation()) return;
          const isSoft404 = errorHtml.includes('<!DOCTYPE html>') || errorHtml.includes('<html');
          if (errorHtml && errorHtml.trim() !== '' && !isSoft404) {
            root.innerHTML = errorHtml;
            this.executeScripts(root);
            this.initializeComponents(root);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar página 404:', error);
      }
      // Fallback se não conseguir carregar a página 404
      if (!isCurrentNavigation()) return;
      root.innerHTML = `
        <section class="dev-section text-center py-5">
          <h1 class="text-white mb-3">Página não encontrada</h1>
          <p class="text-muted mb-4">A página solicitada não foi encontrada.</p>
          <a href="/" class="dev-btn dev-btn-primary">Voltar ao Início</a>
        </section>
      `;
    }
  }

  // SPA: Navegação e roteamento
  initRouter() {
    window.addEventListener('popstate', () => this.handleRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`));
    document.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (link && link.href.startsWith(window.location.origin) && !link.hasAttribute('target')) {
        if (link.hash && link.pathname === window.location.pathname) {
          return; // allow default anchor scroll for same-page links
        }
        e.preventDefault();
        this.navigate(`${link.pathname}${link.search}${link.hash}`);
      }
    });
    this.handleRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  }

  handleRoute(path) {
    if (this._currentPath === path) return;
    this._currentPath = path;
    this.loadPage(path);
  }

  navigate(path) {
    const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentRoute !== path) {
      window.history.pushState({}, '', path);
      this.handleRoute(path);
    }
  }

  // SEO: Atualiza title, meta description, canonical e noindex conforme a página
  updatePageSEO(pageName, path) {
    const seo = (typeof window !== 'undefined' && window.SEO_CONFIG) ? window.SEO_CONFIG[pageName] : null;
    if (!seo) return;

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${path === '/' ? '/' : path}`;

    // Title
    if (seo.title) {
      document.title = seo.title;
      const titleEl = document.querySelector('title');
      if (titleEl) titleEl.textContent = seo.title;
    }

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (seo.description) metaDescription.setAttribute('content', seo.description);

    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Meta robots (noindex)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (seo.noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
      metaRobots.remove();
    }

    // Open Graph e Twitter dinâmicos
    this.updateMetaTag('og:title', seo.title);
    this.updateMetaTag('og:description', seo.description);
    this.updateMetaTag('og:url', canonicalUrl);
    this.updateMetaTag('twitter:title', seo.title);
    this.updateMetaTag('twitter:description', seo.description);
  }

  updateMetaTag(property, content) {
    if (!content) return;
    const isTwitter = property.startsWith('twitter:');
    const selector = isTwitter ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(isTwitter ? 'name' : 'property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  // Skeleton universal - Enhanced version
  showSkeleton(element, type = 'page', options = {}) {
    const { count = 1, animated = true } = options;

    // Use the static method if Skeleton is available
    if (typeof Skeleton !== 'undefined' && Skeleton.show) {
      return Skeleton.show(element, type, { count, animated });
    }

    // Fallback to instance method
    if (!this.skeleton) this.skeleton = new Skeleton({ type, count, animated });
    else this.skeleton.setState({ type, count, animated });

    this.skeleton.render(element);
    return this.skeleton;
  }

  // Hide skeleton with smooth transition
  hideSkeleton(element, newContent = '', callback) {
    if (typeof Skeleton !== 'undefined' && Skeleton.hide) {
      Skeleton.hide(element, newContent, callback);
    } else {
      element.innerHTML = newContent;
      if (callback) callback();
    }
  }

  // FetchAPI
  async fetchAPI(url, verb = 'GET', data = {}, customOptions = {}) {
    console.time('fetchAPI');
    try {
      // Verifica se a URL base está definida
      if (!config?.api?.baseUrl) {
        throw new Error('API base URL não está configurada');
      }

      // Verifica se há configuração de proxy
      const useProxy = config?.api?.useProxy || false;
      const proxyUrl = config?.api?.proxyUrl || '';

      // Constrói a URL base
      let baseUrl = config.api.baseUrl;

      // Se proxy estiver ativo, usa a URL do proxy
      if (useProxy && proxyUrl) {
        // Remove trailing slashes and clean the URL
        const cleanProxyUrl = proxyUrl.replace(/\/+$/, '');
        const cleanUrl = url.replace(/^\/+/, '');

        // Constrói a URL completa para o proxy
        const fullUrl = `${cleanProxyUrl}/api/${cleanUrl}`;
        if (config?.app?.debug) console.log(`[API Request] ${verb} ${fullUrl}`, data);

        const options = {
          method: verb,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('msoft_auth_token') || '____STANDBY____'}`,
            'X-CSRF-TOKEN': localStorage.getItem('csrf_token') || '____STANDBY____'
          },
          mode: 'cors',
          credentials: 'include'
        };

        // Só adiciona o body se não for GET
        if (verb !== 'GET') {
          options.body = JSON.stringify(data);
        }

        const res = await fetch(fullUrl, options);

        // Verifica se a resposta está ok
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`API Error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
        }

        const responseData = await res.json();
        if (config?.app?.debug) console.log(`[API Response] ${verb} ${url}:`, responseData);
        console.timeEnd('fetchAPI');
        return responseData;
      }

      // Request Direto (Sem Proxy)
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const cleanUrl = url.replace(/^\/+/, '');
      const fullUrl = `${cleanBaseUrl}/${cleanUrl}`;

      if (config?.app?.debug) console.log(`[API Request] ${verb} ${fullUrl}`, data);

      const options = {
        method: verb,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('msoft_auth_token') || '____STANDBY____'}`,
        },
        mode: 'cors',
        credentials: 'include'
      };

      // Só adiciona o body se não for GET
      if (verb !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const res = await fetch(fullUrl, options);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Se for 404, retorna o erro do backend se existir
        if (errorData.error) {
          return errorData;
        }
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const responseData = await res.json();
      if (config?.app?.debug) console.log(`[API Response] ${verb} ${url}:`, responseData);
      console.timeEnd('fetchAPI');
      return responseData;
    } catch (error) {
      if (config?.app?.debug) console.error('[API Fetch Error Original]:', error);
      // Tenta fallback se a URL base falhar e não for o próprio fallback
      const fallbackUrl = config?.api?.fallbackUrl;
      const baseUrl = config?.api?.baseUrl;

      if (fallbackUrl && baseUrl !== fallbackUrl && !url.startsWith('http')) {
        if (config?.app?.debug) console.warn(`[API Fallback] Request failed, retrying with ${fallbackUrl}`);
        
        try {
          const cleanFallback = fallbackUrl.replace(/\/+$/, '');
          const cleanUrl = url.replace(/^\/+/, '');
          const fallbackFullUrl = `${cleanFallback}/${cleanUrl}`;
          
          const options = {
            method: verb,
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('msoft_auth_token') || '____STANDBY____'}`,
            },
            mode: 'cors',
            credentials: 'include'
          };
          if (verb !== 'GET') options.body = JSON.stringify(data);

          const res = await fetch(fallbackFullUrl, options);
          const fallbackData = await res.json().catch(() => ({}));
          
          if (res.ok) {
            console.timeEnd('fetchAPI');
            return fallbackData;
          } else {
            // Se o fallback retornou erro (ex: 403), repassa esse erro em vez de deixar cair na falha de conexão original
            if (config?.app?.debug) console.error('[API Fallback] Error Status:', res.status, fallbackData);
            return fallbackData;
          }
        } catch (fallbackErr) {
          if (config?.app?.debug) console.error('[API Fallback] Critical Error:', fallbackErr);
        }
      }

      // Mensagens de erro mais específicas baseadas no tipo de erro
      let errorMessage = 'Erro ao acessar o servidor. Por favor, tente novamente mais tarde.';

      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      } else if (error.message.includes('API base URL')) {
        errorMessage = 'Configuração da API está incompleta. Contate o suporte.';
      }

      if (!customOptions.silent) {
        // Notifica o usuário sobre o erro
        this.toast(errorMessage, 'error');

        if (config?.app?.debug) {
          console.error(`[API Error] ${verb} ${url}:`, {
            error: error.message,
            stack: error.stack,
            url: url,
            verb: verb
          });
        }
      }

      // Propaga o erro para ser tratado pelo chamador
      throw error;
    }
  }

  // get data global  
  getData(key) {
    return window.document.getElementById(key).value;
  }

  // set data global 
  setData(key, value, isValue = null, isAfter = false) {
    if (isValue) {
      window.document.getElementById(key).value = value;
    } else {
      if (isAfter) {
        window.document.getElementById(key).insertAdjacentHTML('afterend', value);
      } else {
        window.document.getElementById(key).innerHTML = value;
      }
    }
  }

  // event listener
  eventListener(event, callback) {
    return window.document.addEventListener(event, callback).then(data => {
      if (config?.app?.debug) console.log(`data`, data);
      return data;
    }).catch(error => {
      if (config?.app?.debug) console.error(`error`, error);
      return error;
    });
  }

  // notifiction toast
  toast(message, type = 'success') {
    // Cria o container de toasts se não existir
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    // Define as cores e ícones baseados no tipo
    const toastConfig = {
      success: {
        icon: 'bi-check-circle-fill text-success',
        borderColor: 'border-success',
        bgStyle: 'background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'
      },
      error: {
        icon: 'bi-x-circle-fill text-danger',
        borderColor: 'border-danger',
        bgStyle: 'background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'
      },
      warning: {
        icon: 'bi-exclamation-triangle-fill text-warning',
        borderColor: 'border-warning',
        bgStyle: 'background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'
      },
      info: {
        icon: 'bi-info-circle-fill text-info',
        borderColor: 'border-info',
        bgStyle: 'background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'
      }
    };

    const config = toastConfig[type] || toastConfig.info;

    // Cria o toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white border-0 border-start border-4 ${config.borderColor} mb-3`;
    toast.style.cssText = config.bgStyle;

    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-3">
          <i class="bi ${config.icon} fs-4"></i>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Adiciona o toast ao container
    toastContainer.appendChild(toast);

    // Inicializa o toast do Bootstrap
    const bsToast = new bootstrap.Toast(toast, {
      animation: true,
      autohide: true,
      delay: 5000
    });

    // Mostra o toast
    bsToast.show();

    // Remove o toast do DOM quando escondido
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }
}
// Instancia global
window.core = new Core();
