// TEST_ORIGIN=http://127.0.0.1:8082 PLAYWRIGHT_MODULE=/path/to/playwright node tests/blog-editor.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';

async function setup(page, role = 'admin') {
  const posts = [];
  const writes = [];
  let writeDelay = 0;
  await page.addInitScript(role => {
    localStorage.setItem('msoft_cookie_consent', 'rejected');
    if (role) {
      localStorage.setItem('msoft_auth_token', 'synthetic-test-token');
      localStorage.setItem('msoft_user_data', JSON.stringify({ name: 'Autor de teste', roles: [role] }));
    }
  }, role);
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
    const method = route.request().method();
    if (url.pathname.endsWith('/blogs/all')) return route.fulfill({ json: { success: true, data: posts } });
    if (url.pathname.endsWith('/blogs') && method === 'GET') return route.fulfill({ json: { success: true, data: posts.map(({ content, ...post }) => post) } });
    if (url.pathname.endsWith('/blogs/categories')) return route.fulfill({ json: { success: true, data: [] } });
    if (url.pathname.endsWith('/blogs') && method === 'POST') {
      const body = route.request().postDataJSON();
      writes.push({ method, body });
      posts.push({ ...body, _id: 'post-new', views: 0, createdAt: new Date().toISOString() });
      return route.fulfill({ json: { success: true, data: posts[0] } });
    }
    if (url.pathname.endsWith('/blogs/post-new') && method === 'PUT') {
      const body = route.request().postDataJSON();
      writes.push({ method, body });
      Object.assign(posts[0], body);
      if (writeDelay) return new Promise(resolve => setTimeout(resolve, writeDelay)).then(() => route.fulfill({ json: { success: true, data: posts[0] } }));
      return route.fulfill({ json: { success: true, data: posts[0] } });
    }
    if (url.pathname.endsWith('/blogs/artigo-teste') && method === 'GET') {
      return route.fulfill({ json: { success: true, data: posts[0] } });
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return { posts, writes, delayWrites(value) { writeDelay = value; } };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const api = await setup(page);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + '/console/conteudo/blog', { waitUntil: 'networkidle' });
      await page.waitForSelector('.cms-section-header a[href="/console/conteudo/blog/novo"]');
      await page.locator('.cms-section-header a[href="/console/conteudo/blog/novo"]').click();
      await page.waitForURL(origin + '/console/conteudo/blog/novo');
      await page.waitForSelector('.note-editor');
      assert.equal(await page.locator('#new-blog-form').isVisible(), true);
      assert.equal(await page.locator('#blog-list-screen').isVisible(), false);
      assert.equal(await page.locator('#blog-published').isChecked(), false);
      assert.equal(await page.locator('.admin-nav [data-tab="blog"]').getAttribute('aria-current'), 'page');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + '/console/conteudo/blog/novo');
      await page.locator('#blog-title').fill('Artigo Teste');
      await page.locator('#blog-insert-ad').click();
      assert.equal(await page.locator('.note-editable [data-ms-ad-marker]').count(), 1);
      await page.locator('#blog-remove-ad').click();
      assert.equal(await page.locator('.note-editable [data-ms-ad-marker]').count(), 0);
      await page.locator('label[for="blog-mode-html"]').click();
      await page.locator('#blog-content-html').fill('<p>Primeiro bloco.</p><p>Segundo bloco.</p>');
      await page.locator('#blog-insert-ad').click();
      assert.equal(await page.locator('#blog-ad-mode').inputValue(), 'manual');
      assert.match(await page.locator('#blog-content-html').inputValue(), /data-ms-ad-marker="inline"/);
      await page.locator('#blog-remove-ad').click();
      assert.doesNotMatch(await page.locator('#blog-content-html').inputValue(), /data-ms-ad-marker/);
      await page.locator('#blog-insert-ad').click();
      await page.locator('#blog-save-draft').click();
      await page.waitForURL(origin + '/console/conteudo/blog/post-new/editar');
      assert.equal(api.writes[0].method, 'POST');
      assert.equal(api.writes[0].body.published, false);
      assert.match(api.writes[0].body.content, /msoft:inline-ads:manual/);
      assert.match(api.writes[0].body.content, /data-ms-ad-marker="inline"/);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.note-editor');
      assert.equal(await page.locator('#blog-title').inputValue(), 'Artigo Teste');
      assert.equal(await page.locator('#blog-ad-mode').inputValue(), 'manual');
      await page.locator('#blog-save-published').click();
      await page.waitForFunction(() => document.querySelector('#blog-editor-status')?.textContent === 'Publicado');
      assert.equal(api.writes[1].method, 'PUT');
      assert.equal(api.writes[1].body.published, true);
      await page.locator('#blog-title').fill('Título ainda não salvo');
      page.once('dialog', dialog => dialog.dismiss());
      await page.locator('#blog-form-container a[href="/console/conteudo/blog"]').click();
      assert.equal(new URL(page.url()).pathname, '/console/conteudo/blog/post-new/editar');
      page.once('dialog', dialog => dialog.accept());
      await page.locator('#blog-form-container a[href="/console/conteudo/blog"]').click();
      await page.waitForURL(origin + '/console/conteudo/blog');
      await page.waitForSelector('.cms-article');
      await page.locator('[data-list-action="edit"]').click();
      await page.waitForURL(origin + '/console/conteudo/blog/post-new/editar');
      if (width === 1440) {
        await page.waitForSelector('.note-editor');
        await page.locator('#blog-title').fill('Gravação pendente');
        api.delayWrites(350);
        await page.locator('#blog-save-draft').click();
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#blog-form-container a[href="/console/conteudo/blog"]').click();
        await page.waitForURL(origin + '/console/conteudo/blog');
        await page.waitForTimeout(450);
        assert.equal(new URL(page.url()).pathname, '/console/conteudo/blog');
        api.delayWrites(0);
      }
      await page.goto(origin + '/console/conteudo/blog/missing/editar', { waitUntil: 'networkidle' });
      await page.waitForSelector('#blog-editor-load-error:not([hidden])');
      assert.equal(await page.locator('#new-blog-form').isVisible(), false);
      await page.goto(origin + '/blog/artigo-teste', { waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot').count(), 1);
      assert.equal(await page.locator('.blog-content [data-ms-ad-marker]').count(), 0);
      api.posts[0].content = Array.from({ length: 10 }, (_, i) => `<p>Parágrafo ${i + 1}</p>`).join('');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot').count(), 3);
      api.posts[0].content = '<!-- msoft:inline-ads:none -->' + api.posts[0].content;
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot').count(), 0);
      api.posts[0].content = '<p>Legado</p><ins class="adsbygoogle" data-ad-client="ca-pub-evil" data-ad-slot="123"></ins>' + Array.from({ length: 5 }, (_, i) => `<p>Bloco ${i}</p>`).join('');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot').count(), 0);
      assert.equal(await page.locator('.blog-content ins.adsbygoogle').count(), 1);
      assert.equal(await page.locator('.blog-content ins.adsbygoogle').getAttribute('data-ad-client'), 'ca-pub-7844284078845131');
      assert.equal(await page.locator('.blog-content ins.adsbygoogle').getAttribute('data-ad-slot'), '4406317970');
      api.posts[0].content = '<!-- msoft:inline-ads:manual --><p>Bloco</p><p data-ms-ad-marker="inline">Publicidade</p><ins class="adsbygoogle"></ins>';
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot').count(), 1);
      assert.equal(await page.locator('.blog-content ins.adsbygoogle').count(), 1);
      api.posts[0].content = '<!-- msoft:inline-ads:none --><p>Bloco</p><ins class="adsbygoogle"></ins>';
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.locator('.blog-content .ad-inline-slot,.blog-content ins.adsbygoogle').count(), 0);
      api.posts[0].content = '<p>Texto seguro</p><img src="/missing.png" onerror="window.__articleXss=1"><script>window.__articleXss=2</script><a href="javascript:window.__articleXss=3">Link inválido</a>';
      api.posts[0].title = '<img src=x onerror="window.__articleXss=4">';
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.blog-content');
      assert.equal(await page.evaluate(() => window.__articleXss), undefined);
      assert.equal(await page.locator('.blog-content script').count(), 0);
      assert.equal(await page.locator('.blog-content [onerror],.blog-content a[href^="javascript:"]').count(), 0);
      api.posts[0].imageUrl = 'x" onerror="window.__articleXss=5';
      api.posts[0].description = '<img src=x onerror="window.__articleXss=6">';
      await page.goto(origin + '/blog', { waitUntil: 'networkidle' });
      await page.waitForSelector('#blog-grid article');
      assert.equal(await page.evaluate(() => window.__articleXss), undefined);
      assert.equal(await page.locator('#blog-grid [onerror],#blog-grid img[src^="javascript:"]').count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const role of [null, 'user']) {
      const page = await browser.newPage();
      await setup(page, role);
      for (const path of ['/console/conteudo/blog/novo', '/console/conteudo/blog/post-new/editar']) {
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        await page.waitForSelector('#access-denied', { state: 'visible' });
        assert.equal(await page.locator('#new-blog-form').count(), 0);
      }
      await page.close();
    }
    console.log('PASS article editor: create, ads, draft, publish, reload, dirty guard, edit, 404 and roles');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
