// PLAYWRIGHT_MODULE=/path/to/playwright TEST_ORIGIN=http://127.0.0.1:8082 node tests/console-apps.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';

function catalogFixture() {
  return Array.from({ length: 12 }, (_, i) => ({
    _id: `app-${i}`,
    name: i === 0 ? 'Aplicativo com nome bastante extenso para validar a quebra segura do conteúdo do cartão' : `Aplicativo ${i}`,
    appKey: `aplicativo-${i}`,
    description: i === 0 ? 'Descrição de teste muito comprida '.repeat(16) : `Descrição ${i}`,
    type: i % 2 ? 'subscription' : 'free',
    price: i % 2 ? 49.9 : 0,
    currency: 'BRL',
    icon: 'bi-box',
    category: 'Categoria longa para verificar conteúdo e responsividade',
    features: ['Relatórios', 'Equipe'],
    active: i !== 1,
  }));
}

async function setup(page) {
  let items = catalogFixture();
  let failList = false;
  let failNextStatus = false;
  const calls = [];
  await page.addInitScript(() => {
    localStorage.setItem('msoft_cookie_consent', 'rejected');
    localStorage.setItem('msoft_cms_last_tab', 'apps');
    localStorage.setItem('msoft_auth_token', 'synthetic-test-token');
    localStorage.setItem('msoft_user_data', JSON.stringify({ name: 'Admin de teste', roles: ['admin'] }));
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
    const method = route.request().method();
    if (url.pathname.endsWith('/catalog/admin')) {
      calls.push({ method, path: url.pathname, body: route.request().postDataJSON() });
      if (method === 'GET') return route.fulfill({ status: failList ? 503 : 200, json: failList ? { success: false, error: 'Falha de teste' } : { success: true, data: items } });
      const body = route.request().postDataJSON();
      if (items.some(item => item.appKey === body.appKey)) return route.fulfill({ status: 409, json: { success: false, error: 'Já existe um item com esse appKey.' } });
      const item = { ...body, _id: `app-new-${Date.now()}`, active: true };
      items.unshift(item);
      return route.fulfill({ status: 201, json: { success: true, data: item } });
    }
    if (url.pathname.includes('/catalog/admin/')) {
      const appKey = decodeURIComponent(url.pathname.split('/').pop());
      calls.push({ method, path: url.pathname, body: route.request().postDataJSON() });
      if (method === 'DELETE' && failNextStatus) { failNextStatus = false; return route.fulfill({ status: 503, json: { success: false, error: 'Falha de status de teste' } }); }
      const item = items.find(entry => entry.appKey === appKey);
      if (!item) return route.fulfill({ status: 404, json: { success: false, error: 'App not found' } });
      if (method === 'DELETE') item.active = false;
      if (method === 'PUT') Object.assign(item, route.request().postDataJSON());
      return route.fulfill({ json: { success: true, data: item } });
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return { calls, failList(value) { failList = value; }, failNextStatus() { failNextStatus = true; } };
}

async function geometry(page, width) {
  const result = await page.evaluate(() => {
    const list = document.querySelector('#catalog-app-list');
    const bounds = list.getBoundingClientRect();
    const errors = [];
    for (const card of list.querySelectorAll('article')) {
      const cardRect = card.getBoundingClientRect();
      if (cardRect.left < bounds.left - 1 || cardRect.right > bounds.right + 1) errors.push('card escapes catalog list');
      for (const control of card.querySelectorAll('button')) {
        const rect = control.getBoundingClientRect();
        if (rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1) errors.push('action escapes card');
        if (rect.right > innerWidth + 1) errors.push('action escapes viewport');
      }
    }
    return { overflow: document.documentElement.scrollWidth > innerWidth, errors };
  });
  assert.deepEqual(result, { overflow: false, errors: [] }, `${width}px catalog geometry`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 1024, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      const api = await setup(page);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}/console/sistema/apps`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#catalog-app-list article');
      assert.equal(new URL(page.url()).pathname, '/console/sistema/apps');
      for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => { document.body.dataset.bsTheme = theme; document.documentElement.dataset.bsTheme = theme; }, theme);
        await geometry(page, width);
      }

      await page.locator('#catalog-app-name').fill('Novo app de teste');
      await page.locator('#catalog-app-key').fill('novo-app');
      await page.locator('#catalog-app-category').fill('Teste');
      await page.locator('#catalog-app-description').fill('Descrição de teste');
      await page.locator('#catalog-app-features').fill('Primeiro recurso');
      await page.locator('#catalog-app-submit').click();
      await page.waitForFunction(() => document.querySelector('#catalog-app-count')?.textContent === '(13)');
      assert.equal(api.calls.filter(call => call.method === 'POST' && call.path.endsWith('/catalog/admin')).length, 1);
      assert.equal(await page.locator('#catalog-form-title').innerText(), 'Novo app');
      assert.match(await page.locator('#catalog-app-submit').innerText(), /Cadastrar app/);

      await page.locator('[data-catalog-action="edit"]').first().click();
      assert.equal(await page.locator('#catalog-app-name').inputValue(), 'Novo app de teste');
      await page.locator('#catalog-app-name').fill('App editado');
      await page.locator('#catalog-app-submit').click();
      await page.waitForFunction(() => document.querySelector('#catalog-app-list')?.innerText.includes('App editado'));
      const update = api.calls.find(call => call.method === 'PUT' && call.path.endsWith('/novo-app'));
      assert.equal(update.body.name, 'App editado');
      assert.equal(update.body.appKey, undefined, 'immutable appKey is excluded from edit payload');
      assert.match(await page.locator('#catalog-app-submit').innerText(), /Cadastrar app/);

      await page.locator('[data-catalog-action="edit"]').first().click();
      await page.locator('#catalog-app-name').fill('Alteração cancelada');
      await page.locator('#catalog-app-cancel').click();
      assert.equal(await page.locator('#catalog-app-name').inputValue(), '');
      assert.equal(await page.locator('#catalog-form-title').innerText(), 'Novo app');

      await page.locator('#catalog-app-key').fill('novo-app');
      await page.locator('#catalog-app-name').fill('Duplicado');
      await page.locator('#catalog-app-description').fill('Descrição');
      await page.locator('#catalog-app-submit').click();
      await page.waitForFunction(() => document.querySelector('#catalog-app-feedback')?.textContent.includes('Já existe'));
      assert.equal(await page.locator('#catalog-app-name').inputValue(), 'Duplicado', 'validation/server errors preserve the form');

      page.once('dialog', dialog => dialog.dismiss());
      await page.locator('[data-catalog-action="deactivate"]').first().click();
      assert.equal(api.calls.filter(call => call.method === 'DELETE').length, 0, 'cancel leaves status unchanged');
      api.failNextStatus();
      page.once('dialog', dialog => dialog.accept());
      await page.locator('[data-catalog-action="deactivate"]').first().click();
      await page.waitForFunction(() => document.querySelector('#catalog-app-list-feedback')?.textContent.includes('Falha de status de teste'));
      assert.equal(await page.locator('#catalog-app-list-feedback').isVisible(), true, 'status failure appears beside the list');
      await geometry(page, width);
      page.once('dialog', dialog => dialog.accept());
      await page.locator('[data-catalog-action="deactivate"]').first().click();
      await page.waitForFunction(() => document.querySelector('[data-catalog-action="reactivate"]'));
      assert.equal(api.calls.filter(call => call.method === 'DELETE').length, 2, 'one failed attempt and one successful retry');
      await page.locator('[data-catalog-action="reactivate"]').first().click();
      await page.waitForFunction(() => document.querySelector('[data-catalog-action="deactivate"]'));
      assert.equal(api.calls.filter(call => call.method === 'PUT' && call.body?.active === true).length, 1);

      api.failList(true);
      await page.locator('#catalog-app-refresh').click();
      await page.waitForFunction(() => document.querySelector('#catalog-app-list')?.textContent.includes('Falha de teste'));
      api.failList(false);
      await page.locator('#catalog-app-refresh').click();
      await page.waitForSelector('#catalog-app-list article');
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS Console Apps CRUD and geometry ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
