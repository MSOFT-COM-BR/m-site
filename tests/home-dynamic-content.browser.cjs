// PLAYWRIGHT_MODULE=/path/to/playwright TEST_ORIGIN=http://127.0.0.1:8082 node tests/home-dynamic-content.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      let failBlogListing = false;
      await page.addInitScript(() => localStorage.setItem('msoft_cookie_consent', 'rejected'));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === origin) return route.continue();
        if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
        if (url.pathname.endsWith('/blogs/categories')) return route.fulfill({ json: { success: true, data: [{ _id: 'cat-1', name: 'Tecnologia' }, { _id: 'cat-2', name: 'Produto' }, { _id: 'cat-3', name: 'Sem artigos' }] } });
        if (url.pathname.endsWith('/blogs')) return route.fulfill({ json: failBlogListing ? { success: false, error: 'API indisponível' } : { success: true, data: [
          { title: 'Artigo popular', slug: 'artigo-popular', description: 'Resumo mais lido.', category: 'Tecnologia', categories: ['Tecnologia'], views: 901, published: true, createdAt: '2026-10-01T12:00:00Z' },
          { title: 'Artigo do produto', slug: 'artigo-produto', description: 'Resumo de produto.', category: 'Produto', categories: [], views: 420, published: true, createdAt: '2026-10-02T12:00:00Z' },
          { title: 'Artigo recente', slug: 'artigo-recente', description: 'Resumo recente.', category: 'Tecnologia', views: 88, published: true },
          { title: 'Rascunho privado', slug: 'rascunho-privado', views: 9000, published: false },
        ] } });
        return route.fulfill({ json: { success: true, data: {} } });
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.waitForSelector('.home-category-chip');
      await page.waitForSelector('.home-article-card h4');
      assert.equal(await page.locator('.home-category-chip').count(), 2, 'only dynamic categories used by published content are shown');
      assert.equal(await page.locator('.home-category-chip').nth(0).getAttribute('href'), '/blog?categoria=Tecnologia');
      assert.deepEqual(await page.locator('.home-article-card h4').allTextContents(), ['Artigo popular', 'Artigo do produto', 'Artigo recente']);
      assert.equal(await page.getByText('Rascunho privado').count(), 0, 'unpublished content is never shown');
      assert.equal(await page.locator('.home-article-meta').first().innerText().then(text => text.includes('901')), true);
      const rankRect = await page.locator('.home-article-card-text-only .home-article-rank').first().boundingBox();
      const categoryRect = await page.locator('.home-article-card-text-only .home-article-meta a').first().boundingBox();
      assert.equal(rankRect.y + rankRect.height <= categoryRect.y, true, 'rank does not cover the category link when an article has no image');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px no horizontal overflow`);
      await page.locator('.home-category-chip').first().click();
      await page.waitForURL('**/blog?categoria=Tecnologia');
      await page.waitForSelector('#blog-filters [data-filter="tecnologia"].active');
      await page.goto(`${origin}/blog?categoria=Produto`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#blog-filters [data-filter="produto"].active');
      failBlogListing = true;
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('#home-popular-articles')?.textContent.includes('Não foi possível carregar'));
      assert.equal(await page.locator('.home-category-chip').count(), 0);
      assert.equal(await page.getByText('Ainda não há artigos publicados.').count(), 0, 'API errors are distinct from a genuinely empty blog');
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS homepage dynamic categories, popular articles and category links ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
