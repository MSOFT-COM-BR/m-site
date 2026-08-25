const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function appSlugs(configSource) {
  const match = configSource.match(/appPages:\s*\[([^\]]+)\]/);
  assert.ok(match, 'config.routes.appPages must exist.');
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

test('aplicativos possuem uma única rota canônica em /app/<slug>', () => {
  const config = read('src/config/config.js');
  const core = read('src/core/core.js');
  const seo = read('src/config/seo.js');
  const premium = read('src/pages/premium.html');
  const ecosystem = read('src/pages/ecossistema.html');
  const sitemap = read('sitemap.xml');
  const slugs = appSlugs(config);

  assert.deepEqual(slugs.sort(), ['mcredential', 'studio-bva']);
  for (const slug of slugs) {
    assert.ok(fs.existsSync(path.join(root, 'src', 'pages', 'app', slug, 'index.html')), `Missing app fragment for ${slug}`);
    assert.match(seo, new RegExp(`'app-${slug}':`));
  }

  assert.match(core, /legacyAppPages/);
  assert.match(core, /requestedPageName === 'app' && segments\.length === 3/);
  assert.match(core, /\/app\/\$\{appSlug\}/);
  assert.match(premium, /window\.location\.href = '\/app\/mcredential'/);
  assert.match(premium, /appPages\.includes\(appKey\)/);
  assert.match(premium, /\/app\/\$\{encodeURIComponent\(appKey\)\}/);
  assert.match(premium, /data-open-app=/);
  assert.match(premium, /['"]studio-bva['"]:[\s\S]*\/app\/studio\/revendas\/catalogo/);
  assert.match(premium, /openHandlers\.get\(button\.dataset\.openApp\)/);
  assert.doesNotMatch(premium, /onclick="window\.__openApp_\$\{app\.appKey\}\(\)"/);
  assert.match(ecosystem, /href="\/app\/mcredential"/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/mirandasoft\.com\.br\/mcredential<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/mirandasoft\.com\.br\/app\/mcredential<\/loc>/);
});

test('Console BVA é hospedado no M-site sem handoff externo ou iframe', () => {
  const page = read('src/pages/app/studio-bva/index.html');
  const core = read('src/core/core.js');

  assert.match(page, /data-bva-console-root/);
  assert.match(page, /data-studio-console-root/);
  assert.match(page, /StudioConsoleRouter/);
  assert.doesNotMatch(page, /id="login-screen"/);
  assert.doesNotMatch(page, /bva_session/);
  assert.doesNotMatch(page, /studiobva\.com\.br\/portal/);
  assert.doesNotMatch(page, /<iframe\b/i);
  assert.match(core, /pageName\.startsWith\('app-studio-'/);
});

test('Studio organiza os módulos em rotas canônicas semânticas', () => {
  const config = read('src/config/config.js');
  const core = read('src/core/core.js');
  const page = read('src/pages/app/studio-bva/index.html');

  for (const route of ['fabrica/produtos', 'crm/radar', 'equipe/consultoras', 'revendas/catalogo', 'vendas/registrar']) {
    assert.match(config, new RegExp(`'${route}'`));
  }
  assert.match(core, /segments\.length === 5/);
  assert.match(core, /studioPages/);
  assert.match(page, /studio-console-router\.js/);
  assert.match(read('src/modules/studio-console-router.js'), /fabrica\/produtos/);
  assert.match(core, /requestedStudioRouteKey\.replace\(\/\^erp\\\//);
  assert.match(core, /\/app\/studio\/\$\{studioRouteKey\}/);
});

test('Studio separa cada listagem ERP e Revendas na sua rota própria', () => {
  const config = read('src/config/config.js');
  const router = read('src/modules/studio-console-router.js');
  const shell = read('src/pages/app/studio-bva/views/console.html');
  const routes = {
    'vendas/registrar': 'vendas/registrar.html',
    'fabrica/produtos': 'erp/produtos.html',
    'fabrica/insumos': 'erp/insumos.html',
    'fabrica/kardex': 'erp/kardex.html',
    'fabrica/categorias': 'erp/categorias.html',
    'fabrica/maquinas': 'erp/maquinas.html',
    'revendas/pedidos': 'revendas/pedidos.html',
  };

  for (const [route, view] of Object.entries(routes)) {
    assert.match(config, new RegExp(`'${route}'`));
    assert.match(router, new RegExp(`'${route}': '${view}'`));
    assert.ok(fs.existsSync(path.join(root, 'src/pages/app/studio-bva/views', view)), `Missing list page: ${view}`);
    assert.match(shell, new RegExp(`data-studio-route="${route}"`));
  }
  assert.match(router, /activeRoute === 'fabrica\/maquinas' \? \['maquina'\]/);
  assert.match(router, /activeRoute === 'fabrica\/produtos' \? \['produto'\]/);
});

test('Studio monta páginas internas por módulo sem reutilizar a tela de login BVA', () => {
  const entry = read('src/pages/app/studio-bva/index.html');
  const router = read('src/modules/studio-console-router.js');

  assert.match(entry, /studio-console-router\.js/);
  assert.doesNotMatch(entry, /id="login-screen"/);
  assert.doesNotMatch(entry, /bva_session/);
  assert.match(router, /const STUDIO_PAGES/);
  assert.match(router, /authService\?\.isAuthenticated\(\)/);
  assert.match(router, /msoft:route-unmount/);
  assert.match(router, /\/bva\/orders/);
  assert.match(router, /\/bva\/prospects/);
  assert.match(router, /\/bva\/consultoras/);
  assert.match(router, /\/erp\/produtos/);
  assert.match(router, /\/erp\/insumos/);
  assert.match(router, /window\.core\.fetchAPI/);
  for (const page of ['revendas/catalogo', 'crm/radar', 'equipe/consultoras', 'fabrica/produtos']) {
    assert.match(router, new RegExp(page));
  }

  for (const capability of ['openCrudDialog', 'submitCrud', 'confirmMutation', 'crud-form', 'crud-action']) {
    assert.match(router, new RegExp(capability));
  }
});

test('navegação Studio oferece menu lateral e compacto no mobile sem alterar as rotas operacionais', () => {
  const shell = read('src/pages/app/studio-bva/views/console.html');
  const router = read('src/modules/studio-console-router.js');
  assert.match(shell, /studio-console-sidebar/);
  assert.match(shell, /studio-mobile-menu/);
  assert.match(shell, /Menu do Studio/);
  assert.match(shell, /min-height: 44px/);
  assert.match(shell, /@media \(max-width: 760px\)/);
  assert.match(router, /querySelectorAll\(`\[data-studio-route=/);
  for (const route of ['revendas/catalogo', 'crm/radar', 'equipe/consultoras', 'fabrica/produtos']) {
    assert.match(shell, new RegExp(`data-studio-route="${route}"`));
  }
});

test('todos os modais CRUD do Studio usam um único dialog raiz sem estilo embutido', () => {
  const entry = read('src/pages/app/studio-bva/index.html');
  const router = read('src/modules/studio-console-router.js');
  const componentPath = path.join(root, 'src/components/studio-dialog.js');
  assert.ok(fs.existsSync(componentPath), 'O componente modal compartilhado deve existir.');
  const component = fs.readFileSync(componentPath, 'utf8');

  assert.match(entry, /src\/components\/studio-dialog\.js/);
  assert.ok(!fs.existsSync(path.join(root, 'src/modules/studio-components.js')), 'O dialog não deve duplicar implementações em modules.');
  assert.match(component, /function createDialog\(\{ content, className, onClose, initialFocus \}\)/);
  assert.doesNotMatch(component, /\.style\s*=/);
  assert.match(component, /content\.querySelectorAll\('\[data-close\]'\)/);
  assert.match(router, /window\.MSoftComponents\.createDialog\(/);
  assert.match(router, /className: 'studio-crud-dialog'/);
  assert.doesNotMatch(router, /querySelectorAll\('\[data-close\]'\)\.forEach/);
  for (const entity of ['lead', 'consultora', 'produto', 'insumo', 'categoria', 'maquina']) {
    assert.ok(router.includes(`${entity}: [`), `CRUD ${entity} deve usar o dialog compartilhado.`);
  }
  assert.match(read('src/pages/app/studio-bva/views/console.html'), /\.studio-dialog-header button[^}]*min-width: 44px/);
});

test('ações CRUD do Studio usam ícones acessíveis com alvo mínimo de toque', () => {
  const router = read('src/modules/studio-console-router.js');
  const shell = read('src/pages/app/studio-bva/views/console.html');

  assert.match(router, /function crudIconAction\(action, entity, id\)/);
  assert.match(router, /class="crud-action crud-icon-action"/);
  assert.match(router, /aria-label="\$\{label\}"/);
  assert.match(router, /<i class="bi \$\{definition\.icon\}" aria-hidden="true"><\/i>/);
  assert.match(shell, /\.crud-icon-action[^}]*width:\s*36px/);
  assert.match(shell, /\.crud-icon-action[^}]*height:\s*36px/);
});

test('produto ERP envia os dados no contrato da API e registra fabricação', () => {
  const router = read('src/modules/studio-console-router.js');
  const productForm = read('src/pages/app/studio-bva/views/shared/crud-forms.html');

  assert.match(productForm, /data-studio-filamentos/);
  assert.match(productForm, /<select name="categoria" data-studio-categorias required>/);
  assert.match(router, /body\.filamentos = filamentos/);
  assert.match(router, /const categorySelect = form\.querySelector\('\[data-studio-categorias\]'\)/);
  assert.match(router, /Object\.values\(crudRecords\.categoria \|\| \{\}\)/);
  assert.match(router, /function updateProductPricing\(form\)/);
  assert.match(router, /Custo: \$\{money\(total\)\}/);
  assert.match(router, /\/erp\/produtos\/\$\{encodeURIComponent\(id\)\}\/fabricar/);
  assert.match(router, /function openProductPreview\(id\)/);
  assert.match(router, /data-product-view/);
  assert.match(router, /\/image\?appKey=\$\{APP_KEY\}/);
  assert.match(router, /method: 'POST'/);
  assert.match(router, /\/attachments\?appKey=\$\{APP_KEY\}/);
  assert.match(router, /\/videos\?appKey=\$\{APP_KEY\}/);
  assert.match(router, /const mediaUrl/);
  assert.match(router, /\/uploads\//);
  assert.match(router, /rel="noopener noreferrer"/);
});

test('link VIP aponta para a vitrine pública, sem vazar a origem local do console', () => {
  const router = read('src/modules/studio-console-router.js');
  const catalog = read('src/pages/app/studio-bva/views/revendas/catalogo.html');

  assert.match(router, /const officialResellerLink/);
  assert.match(router, /https:\/\/studiobva\.mirandasoft\.com\.br\//);
  assert.match(router, /link\.searchParams\.set\('consultora', resellerId\)/);
  assert.match(catalog, /data-copy-reseller-link/);
  assert.match(catalog, /target="_blank"/);
});

test('vendas do Studio usam o catálogo, confirmam o pedido e baixam o estoque pelo servidor', () => {
  const router = read('src/modules/studio-console-router.js');
  const sales = read('src/pages/app/studio-bva/views/vendas/registrar.html');

  assert.match(router, /async function loadVendas\(\)/);
  assert.match(router, /api\('\/erp\/vendas', 'POST'/);
  assert.match(router, /saleCart = new Map\(\)/);
  assert.match(router, /data-vendas-remover/);
  assert.match(router, /\/bva\/orders\/cliente\?appKey=/);
  assert.match(sales, /Confirmar venda e baixar estoque/);
  assert.match(sales, /id="vendas-carrinho"/);
  assert.match(sales, /name="clienteNome" autocomplete="name"/);
  assert.doesNotMatch(sales, /name="clienteNome" required/);
});

test('console atualiza automaticamente sem exibir ações manuais redundantes', () => {
  const router = read('src/modules/studio-console-router.js');

  for (const view of ['erp/produtos.html', 'erp/insumos.html', 'erp/kardex.html', 'erp/categorias.html', 'erp/maquinas.html', 'revendas/catalogo.html', 'revendas/pedidos.html', 'crm/radar.html', 'equipe/consultoras.html']) {
    assert.doesNotMatch(read(`src/pages/app/studio-bva/views/${view}`), /data-studio-refresh/);
  }
  assert.match(router, /25_000/);
  assert.match(router, /window\.clearInterval\(refreshInterval\)/);
});

test('Kardex carrega todas as páginas e expõe os totais financeiros', () => {
  const router = read('src/modules/studio-console-router.js');
  const kardex = read('src/pages/app/studio-bva/views/erp/kardex.html');

  assert.match(router, /async function loadAllKardex\(query\)/);
  assert.match(router, /limit=200&page=1/);
  assert.match(router, /remainingPages\.flatMap/);
  assert.doesNotMatch(router, /erp-kardex-list', \(kardex\.data \|\| \[\]\)\.slice/);
  for (const id of ['kardex-total-entradas', 'kardex-total-saidas', 'kardex-total-saldo', 'kardex-total-vendas', 'kardex-total-lancamentos']) {
    assert.match(kardex, new RegExp(`id="${id}"`));
    assert.match(router, id === 'kardex-total-saldo' ? /setSignedMoney\('kardex-total-saldo'/ : new RegExp(`setText\\('${id}'`));
  }
});

test('componentes HTML possuem root padronizado e aceitam variantes pelo Core', () => {
  const componentNames = ['banner', 'blog-content', 'contact', 'cookie-banner', 'footer', 'header', 'hghlight', 'icons', 'modal', 'packages', 'products', 'search', 'steps'];
  const core = read('src/core/core.js');

  for (const name of componentNames) {
    assert.match(read(`src/components/${name}.html`), new RegExp(`data-component-root="${name}"`));
  }
  assert.match(core, /configureComponentRoot\(host, \{ className, variant \} = \{\}\)/);
  assert.match(core, /this\.configureComponentRoot\(el, \{/);
  assert.match(core, /el\.dataset\.componentClass/);
  assert.match(core, /el\.dataset\.componentVariant/);
});

test('router rejeita resposta HTTP de erro antes de interpretar o fragmento', () => {
  const core = read('src/core/core.js');
  assert.match(
    core,
    /const res = await fetch\(filePath\);\s*if \(!res\.ok\) \{\s*throw new Error\(`Page request failed: \$\{res\.status\}`\);\s*\}\s*const html = await res\.text\(\);/,
  );
});

test('MCredential pode ser montado novamente sem redeclarar o módulo', () => {
  const page = read('src/pages/app/mcredential/index.html');
  const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'O fragmento MCredential deve conter seu script de montagem.');

  const context = vm.createContext({
    window: {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    },
    setTimeout: () => undefined,
  });

  vm.runInContext(script, context);
  assert.doesNotThrow(() => vm.runInContext(script, context));
  assert.equal(typeof context.window.MCredApp?.init, 'function');
});

test('MCredential cancela a inicialização pendente ao desmontar a rota', () => {
  const core = read('src/core/core.js');
  const page = read('src/pages/app/mcredential/index.html');
  const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'O fragmento MCredential deve conter seu script de montagem.');
  assert.match(core, /new CustomEvent\('msoft:route-unmount'\)/);
  assert.ok(
    core.indexOf("new CustomEvent('msoft:route-unmount')") < core.indexOf('this.showSkeleton(root);'),
    'O router deve desmontar a página anterior antes de iniciar a transição.',
  );

  const timers = [];
  const listeners = new Map();
  let navigateCalls = 0;
  const window = {
    authService: { isAuthenticated: () => false },
    core: { navigate: () => { navigateCalls += 1; } },
    addEventListener: (eventName, listener) => listeners.set(eventName, listener),
    removeEventListener: (eventName) => listeners.delete(eventName),
  };
  const context = vm.createContext({
    window,
    clearTimeout: (timer) => { timer.cancelled = true; },
    setTimeout: (callback) => {
      const timer = { callback, cancelled: false };
      timers.push(timer);
      return timer;
    },
  });

  vm.runInContext(script, context);
  listeners.get('msoft:route-unmount')?.();
  timers.forEach((timer) => { if (!timer.cancelled) timer.callback(); });

  assert.equal(navigateCalls, 0);
});

test('router descarta uma resposta de página que chega depois de uma navegação mais nova', async () => {
  const coreSource = read('src/core/core.js').replace('window.core = new Core();', 'window.Core = Core;');
  const pendingResponses = new Map();
  const rootElement = {
    classList: { add: () => undefined, remove: () => undefined },
    closest: () => null,
    querySelector: () => null,
    innerHTML: '',
  };
  const window = {
    addEventListener: () => undefined,
    dispatchEvent: () => undefined,
    history: { replaceState: () => undefined },
    location: { pathname: '/app/mcredential', search: '', hash: '', origin: 'http://localhost' },
    scrollTo: () => undefined,
  };
  const context = vm.createContext({
    window,
    config: {
      app: { version: 'test', debug: false },
      routes: { appPages: ['mcredential', 'studio-bva'], validPages: [] },
    },
    document: {
      body: { style: {} },
      getElementById: (id) => id === 'root' ? rootElement : null,
    },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    URLSearchParams,
    fetch: (url) => new Promise((resolve) => pendingResponses.set(url, resolve)),
    setTimeout: (callback) => { callback(); return 0; },
  });
  vm.runInContext(coreSource, context);

  const core = Object.create(context.window.Core.prototype);
  Object.assign(core, { _navigationId: 0, state: {}, params: [], registerPages: [] });
  core.showSkeleton = () => undefined;
  core.executeScripts = () => undefined;
  core.applyTranslations = () => undefined;
  core.initializeComponents = () => undefined;
  core.updatePageSEO = () => undefined;

  const firstLoad = core.loadPage();
  window.location.pathname = '/app/studio-bva';
  const secondLoad = core.loadPage();

  pendingResponses.get('/src/pages/app/studio-bva/index.html?v=test')({ ok: true, text: async () => '<section>Studio BVA</section>' });
  await secondLoad;
  pendingResponses.get('/src/pages/app/mcredential/index.html?v=test')({ ok: true, text: async () => '<section>MCredential</section>' });
  await firstLoad;

  assert.equal(rootElement.innerHTML, '<section>Studio BVA</section>');
});

test('router não renderiza o fallback 404 de uma navegação que ficou obsoleta', async () => {
  const coreSource = read('src/core/core.js').replace('window.core = new Core();', 'window.Core = Core;');
  const pendingResponses = new Map();
  const rootElement = {
    classList: { add: () => undefined, remove: () => undefined },
    closest: () => null,
    querySelector: () => null,
    innerHTML: '<section>Conteúdo inicial</section>',
  };
  const window = {
    addEventListener: () => undefined,
    dispatchEvent: () => undefined,
    history: { replaceState: () => undefined },
    location: { pathname: '/app/mcredential', search: '', hash: '', origin: 'http://localhost' },
    scrollTo: () => undefined,
  };
  const context = vm.createContext({
    window,
    config: {
      app: { version: 'test', debug: false },
      routes: { appPages: ['mcredential', 'studio-bva'], validPages: [] },
    },
    document: {
      body: { style: {} },
      getElementById: (id) => id === 'root' ? rootElement : null,
    },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    URLSearchParams,
    fetch: (url) => new Promise((resolve) => pendingResponses.set(url, resolve)),
    setTimeout: (callback) => { callback(); return 0; },
  });
  vm.runInContext(coreSource, context);

  const core = Object.create(context.window.Core.prototype);
  Object.assign(core, { _navigationId: 0, state: {}, params: [], registerPages: [] });
  core.showSkeleton = () => undefined;
  core.executeScripts = () => undefined;
  core.applyTranslations = () => undefined;
  core.initializeComponents = () => undefined;
  core.updatePageSEO = () => undefined;

  const firstLoad = core.loadPage();
  pendingResponses.get('/src/pages/app/mcredential/index.html?v=test')({ ok: true, text: async () => '' });
  for (let tick = 0; tick < 10 && !pendingResponses.has('/src/pages/404.html'); tick += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.ok(pendingResponses.has('/src/pages/404.html'));

  window.location.pathname = '/app/studio-bva';
  const secondLoad = core.loadPage();
  pendingResponses.get('/src/pages/404.html')({ ok: false });
  await firstLoad;

  assert.equal(rootElement.innerHTML, '<section>Conteúdo inicial</section>');

  pendingResponses.get('/src/pages/app/studio-bva/index.html?v=test')({ ok: true, text: async () => '<section>Studio BVA</section>' });
  await secondLoad;
  assert.equal(rootElement.innerHTML, '<section>Studio BVA</section>');
});
