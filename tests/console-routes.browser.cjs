// PLAYWRIGHT_MODULE=/path/to/playwright TEST_ORIGIN=http://127.0.0.1:8082 node tests/console-routes.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';
const routes = [
  ['overview', '/console', 'Visão geral'],
  ['theme', '/console/aparencia', 'Personalização Visual'],
  ['blog', '/console/conteudo/blog', 'Artigos'],
  ['images', '/console/midia', 'Galeria e Assets'],
  ['logs', '/console/sistema/logs', 'Monitoramento'],
  ['users', '/console/sistema/usuarios', 'Usuários por aplicação'],
  ['apps', '/console/sistema/apps', 'Catálogo de aplicativos'],
  ['clients', '/console/clientes', 'Clientes MSoft']
];

async function setup(page, role = 'admin') {
  const calls = [];
  await page.addInitScript(role => {
    localStorage.setItem('msoft_cookie_consent', 'rejected');
    if (!localStorage.getItem('msoft_cms_last_tab')) localStorage.setItem('msoft_cms_last_tab', 'users');
    if (role) {
      localStorage.setItem('msoft_auth_token', 'synthetic-test-token');
      localStorage.setItem('msoft_user_data', JSON.stringify({ name: 'Teste', roles: [role] }));
    }
  }, role);
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
    calls.push(url.pathname);
    // Auth/session telemetry may use POST; every request stays inside this fixture.
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return calls;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const calls = await setup(page);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const [tab, path, title] of routes) {
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        await page.waitForSelector(`#tab-content [id],#tab-content h4`);
        await page.waitForFunction(tab => document.querySelector(`.admin-nav [data-tab="${tab}"]`)?.getAttribute('aria-current') === 'page', tab);
        assert.equal(new URL(page.url()).pathname, path);
        assert.match(await page.locator('#tab-content').innerText(), new RegExp(title, 'i'));
        assert.equal(await page.locator('.admin-nav [aria-current="page"]').count(), 1);
        assert.equal(await page.locator('.admin-nav [data-tab="' + tab + '"]').getAttribute('href'), path);
        assert.equal(await page.locator('#head .navbar').isVisible(), true);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + path);
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForFunction(tab => document.querySelector(`.admin-nav [data-tab="${tab}"]`)?.getAttribute('aria-current') === 'page', tab);
      }
      await page.goto(origin + '/console/aparencia', { waitUntil: 'networkidle' });
      if (width === 390) await page.locator('#admin-nav-toggle').click();
      await page.locator('.admin-nav [data-tab="blog"]').click();
      await page.waitForURL(origin + '/console/conteudo/blog');
      await page.waitForSelector('#blog-search');
      if (width === 390) assert.equal(await page.locator('#admin-nav-toggle').getAttribute('aria-expanded'), 'false');
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForURL(origin + '/console/aparencia');
      assert.equal(await page.locator('.admin-nav [data-tab="theme"]').getAttribute('aria-current'), 'page');
      await page.goForward({ waitUntil: 'networkidle' });
      await page.waitForURL(origin + '/console/conteudo/blog');
      assert.equal(await page.locator('.admin-nav [data-tab="blog"]').getAttribute('aria-current'), 'page');
      await page.evaluate(() => localStorage.setItem('msoft_cms_last_tab', 'mjson'));
      await page.goto(origin + '/console', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('.admin-nav [aria-current="page"]'));
      assert.equal(await page.locator('.admin-nav [data-tab="overview"]').getAttribute('aria-current'), 'page');
      assert.match(await page.locator('#tab-content').innerText(), /Visão geral/);
      assert.equal(await page.locator('.console-overview-card').count(), 7);
      assert.equal(await page.locator('.admin-nav [data-tab="mjson"]').count(), 0);
      assert.doesNotMatch(await page.locator('#tab-content').innerText(), /MJSON/);
      await page.goto(origin + '/admin', { waitUntil: 'networkidle' });
      assert.equal(new URL(page.url()).pathname, '/console');
      await page.goto(origin + '/console/inexistente', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.admin-nav').count(), 0);
      assert.equal(new URL(page.url()).pathname, '/console/inexistente');
      await page.goto(origin + '/console/conteudo/mjson', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#not-found-title').innerText(), 'Página não encontrada');
      assert.equal(await page.locator('.admin-nav').count(), 0);
      assert.equal(new URL(page.url()).pathname, '/console/conteudo/mjson');
      assert.equal(calls.some(path => path === '/mjson' || path.startsWith('/mjson/')), false, calls.join(', '));
      await page.goto(origin + '/console/conteudo/blog/novo', { waitUntil: 'networkidle' });
      await page.waitForSelector('.note-editor');
      await page.waitForFunction(() => !document.querySelector('#tab-content')?.hasAttribute('aria-busy') && typeof window.showBlogForm === 'function');
      await page.evaluate(() => {
        Object.defineProperty(window, 'vendorLoader', {
          configurable: true,
          value: { loadAdminEditorVendors: () => new Promise(resolve => { window.resolveEditorVendors = resolve; }) }
        });
        window.showBlogForm();
      });
      assert.equal(await page.evaluate(() => typeof window.resolveEditorVendors), 'function');
      if (width === 390) await page.locator('#admin-nav-toggle').click();
      await page.locator('.admin-nav [data-tab="theme"]').click();
      await page.waitForURL(origin + '/console/aparencia');
      await page.waitForSelector('#theme-form');
      await page.evaluate(() => window.resolveEditorVendors());
      await page.waitForTimeout(50);
      assert.equal(await page.locator('.note-editor').count(), 0);
      assert.deepEqual(errors, []);
      assert.ok(calls.length > 0);
      await page.close();
    }
    for (const role of [null, 'user']) {
      const page = await browser.newPage();
      const calls = await setup(page, role);
      for (const [, path] of routes) {
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        await page.waitForSelector('#access-denied', { state: 'visible' });
        assert.equal((await page.locator('#tab-content').innerText()).trim(), '');
      }
      assert.equal(calls.some(path => /blogs|catalog\/admin|\/mjson|\/admin\/users|\/admin\/clients/.test(path)), false, calls.join(', '));
      await page.close();
    }
    console.log('PASS Console routes: overview, seven direct pages, reload, history, legacy, removed MJSON, 404, roles and SEO');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
