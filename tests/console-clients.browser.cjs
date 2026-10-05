// PLAYWRIGHT_MODULE=/path/to/playwright TEST_ORIGIN=http://127.0.0.1:8082 node tests/console-clients.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';

async function setup(page) {
  const documentValue = '52998224725';
  const calls = [];
  let releaseInitialList;
  let releaseSlowDetail;
  const initialListGate = new Promise(resolve => { releaseInitialList = resolve; });
  const slowDetailGate = new Promise(resolve => { releaseSlowDetail = resolve; });
  let heldInitialList = false;
  let heldSlowDetail = false;
  let items = [
    { id: 'client-1', personType: 'PF', name: 'Pessoa de teste', document: '***.***.***-25', email: 'pessoa@example.test', phone: '85999990000', status: 'active', createdAt: '2026-10-05T12:00:00Z', updatedAt: '2026-10-05T12:00:00Z' },
    { id: 'client-2', personType: 'PJ', name: 'Empresa paralela', tradeName: 'Loja paralela', document: '**.***.***/****-12', email: 'paralela@example.test', phone: '85999990001', status: 'active', createdAt: '2026-10-05T12:00:00Z', updatedAt: '2026-10-05T12:00:00Z' },
  ];
  await page.addInitScript(() => {
    localStorage.setItem('msoft_cookie_consent', 'rejected');
    localStorage.setItem('msoft_cms_last_tab', 'clients');
    localStorage.setItem('msoft_auth_token', 'synthetic-test-token');
    localStorage.setItem('msoft_user_data', JSON.stringify({ name: 'Admin de teste', roles: ['admin'] }));
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
    const method = route.request().method();
    if (/\/admin\/clients(?:\/|$)/.test(url.pathname)) {
      calls.push({ method, path: url.pathname, query: url.search, body: method === 'GET' ? null : route.request().postDataJSON() });
      if (url.pathname.endsWith('/search')) {
        const query = String(route.request().postDataJSON()?.q || '');
        const matches = query.includes('529') ? items.filter(item => item.id === 'client-1') : items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        return route.fulfill({ json: { success: true, data: { items: matches, page: 1, limit: 25, total: matches.length, pages: matches.length ? 1 : 0 } } });
      }
      const pathParts = url.pathname.split('/');
      const id = method === 'PATCH' ? pathParts.at(-2) : pathParts.at(-1);
      if (method === 'GET' && url.pathname.endsWith('/clients')) {
        if (!heldInitialList) { heldInitialList = true; await initialListGate; }
        return route.fulfill({ json: { success: true, data: { items, page: 1, limit: 25, total: items.length, pages: 1 } } });
      }
      if (method === 'GET') {
        if (id === 'client-1' && !heldSlowDetail) { heldSlowDetail = true; await slowDetailGate; }
        const client = items.find(item => item.id === id);
        return route.fulfill({ json: { success: true, data: { ...client, document: id === 'client-new' ? '00000000E08G12' : id === 'client-2' ? '00000000E08G12' : documentValue } } });
      }
      if (method === 'POST') {
        const client = { ...route.request().postDataJSON(), id: 'client-new', document: '**.***.***/****-12', status: 'active' };
        items.unshift(client);
        return route.fulfill({ status: 201, json: { success: true, data: client } });
      }
      if (method === 'PUT') {
        const client = items.find(item => item.id === id);
        Object.assign(client, route.request().postDataJSON());
        return route.fulfill({ json: { success: true, data: client } });
      }
      if (method === 'PATCH') {
        const client = items.find(item => item.id === id);
        client.status = route.request().postDataJSON().status;
        return route.fulfill({ json: { success: true, data: client } });
      }
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return { calls, documentValue, releaseInitialList, releaseSlowDetail };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      const api = await setup(page);
      const consoleMessages = [];
      const errors = [];
      page.on('console', message => consoleMessages.push(message.text()));
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}/console/clientes`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#client-search');
      assert.equal(new URL(page.url()).pathname, '/console/clientes');
      assert.equal(await page.locator('.admin-nav [data-tab="clients"]').getAttribute('aria-current'), 'page');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px no horizontal overflow`);

      await page.evaluate(() => { window.config.app.debug = true; });
      await page.locator('#client-query').fill('529.982.247-25');
      await page.locator('#client-search button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#client-count')?.textContent === '1 cliente');
      api.releaseInitialList();
      await page.waitForTimeout(80);
      assert.equal(await page.locator('#client-list article').count(), 1, 'a slower old list cannot replace the newer search');
      assert.doesNotMatch(await page.locator('#client-list').innerText(), new RegExp(api.documentValue));
      const search = api.calls.find(call => call.path.endsWith('/search'));
      assert.equal(search.body.q, '529.982.247-25');
      assert.equal(new URLSearchParams(search.query).has('q'), false, 'personal search terms never enter URL parameters');

      await page.locator('[data-client-edit="client-1"]').click();
      await page.waitForTimeout(80);
      await page.locator('#client-query').fill('');
      await page.locator('#client-search button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelectorAll('#client-list article').length === 2);
      await page.locator('[data-client-edit="client-2"]').click();
      await page.waitForFunction(() => document.querySelector('#client-name')?.value === 'Empresa paralela');
      api.releaseSlowDetail();
      await page.waitForTimeout(80);
      assert.equal(await page.locator('#client-name').inputValue(), 'Empresa paralela', 'a slow older detail lookup cannot replace the selected client');
      await page.locator('#client-editor-close').click();

      await page.locator('#client-new').click();
      await page.locator('#client-person-type').selectOption('PJ');
      await page.locator('#client-name').fill('Empresa de teste');
      await page.locator('#client-trade-name').fill('Loja de teste');
      await page.locator('#client-document').fill('00.000.000/E08G-12');
      await page.locator('#client-email').fill('empresa@example.test');
      await page.locator('#client-phone').fill('(85) 99999-0000');
      await page.locator('#client-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#client-list')?.textContent.includes('Empresa de teste'));
      const create = api.calls.find(call => call.method === 'POST' && call.path.endsWith('/clients'));
      assert.equal(create.body.personType, 'PJ');
      assert.equal(create.body.document, '00.000.000/E08G-12');
      assert.equal(await page.evaluate(() => localStorage.getItem('msoft_auth_token')?.includes('E08G')), false);

      await page.locator('[data-client-edit="client-new"]').click();
      await page.waitForFunction(() => document.querySelector('#client-document')?.value === '00.000.000/E08G-12');
      await page.locator('#client-name').fill('Empresa atualizada');
      await page.locator('#client-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#client-list')?.textContent.includes('Empresa atualizada'));
      assert.ok(api.calls.some(call => call.method === 'PUT' && call.path.endsWith('/client-new')));

      await page.locator('[data-client-status="client-new"]').click();
      await page.waitForFunction(() => document.querySelector('#client-list')?.textContent.includes('Inativo'));
      assert.ok(api.calls.some(call => call.method === 'PATCH' && call.path.endsWith('/client-new/status')));
      assert.deepEqual(errors, []);
      assert.equal(consoleMessages.some(message => message.includes('52998224725') || message.includes('00.000.000/E08G-12')), false, 'fiscal documents never reach the browser console');
      await page.close();
      console.log(`PASS Console Clients PF/PJ, sensitive search, CRUD and layout ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
