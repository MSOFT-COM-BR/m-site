// PLAYWRIGHT_MODULE=/path/to/playwright node tests/blog-theme.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const post = { title: 'Post sintético de contraste', slug: 'contraste-sintetico', description: 'Descrição sintética legível nos dois temas.', category: 'Tecnologia', author: 'Autor sintético', tags: ['Teste'], createdAt: '2026-01-01T00:00:00Z', imageUrl: 'http://127.0.0.1:8082/synthetic-cover.svg', content: '<h2>Subtítulo sintético</h2><p>Texto sintético do artigo.</p><ul><li>Item sintético</li></ul><p><a href="/blog">Link sintético</a></p>' };
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      for (const detail of [false, true]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });
        await page.route('**/*', route => {
          const url = new URL(route.request().url());
          if (url.pathname === '/synthetic-cover.svg') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#cbd5e1"/></svg>' });
          if (url.origin === 'http://127.0.0.1:8082') return route.continue();
          if (url.hostname === 'gateway.mirandasoft.com.br') return route.fulfill({ json: url.pathname.endsWith('/blogs') ? { success: true, data: [post] } : url.pathname.endsWith('/blogs/contraste-sintetico') ? { success: true, data: post } : { success: false, data: null } });
          return route.abort();
        });
        await page.goto(`http://127.0.0.1:8082/blog${detail ? '/contraste-sintetico' : ''}`, { waitUntil: 'networkidle' });
        await page.waitForSelector(detail ? '.blog-content p' : '#blog-grid h3 a');
        for (const [index, theme] of ['light', 'dark', 'light'].entries()) {
          if (index) {
            if (!(await page.locator('[data-theme-toggle]').isVisible())) await page.locator('[data-mobile-nav-toggle]').click();
            await page.locator('[data-theme-toggle]').click();
            if (width < 1200) await page.locator('[data-mobile-nav-toggle]').click();
          }
          assert.equal(await page.locator('body').getAttribute('data-bs-theme'), theme);
          const selectors = detail ? ['.blog-content', '.blog-content h2', '.blog-content p', '.blog-content li', '#post-content .btn-outline-light', '.blog-tag-badge'] : ['#blog-grid h3 a', '#blog-filters [data-filter="tecnologia"]'];
          const expected = theme === 'light' ? 'rgb(15, 23, 42)' : 'rgb(241, 245, 249)';
          for (const selector of selectors) {
            await page.waitForFunction(({ selector, expected }) => getComputedStyle(document.querySelector(selector)).color === expected, { selector, expected });
            assert.equal(await page.locator(selector).first().evaluate(e => getComputedStyle(e).color), expected, `${width} ${theme} ${selector}`);
          }
          if (!detail) {
            await page.locator('#blog-grid').scrollIntoViewIfNeeded();
            assert.equal(await page.locator('#blog-filters .active').evaluate(e => getComputedStyle(e).color), 'rgb(255, 255, 255)');
            await page.locator('#blog-filters [data-filter="tecnologia"]').click();
            assert.equal(await page.locator('#blog-grid h3 a').count(), 1);
            await page.locator('#blog-filters [data-filter="todos"]').click();
            await page.locator('#blog-grid article').scrollIntoViewIfNeeded();
            await page.waitForFunction(() => getComputedStyle(document.querySelector('#blog-grid .animate-on-scroll')).opacity === '1');
          }
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: `/tmp/blog-${detail ? 'detail' : 'list'}-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
          console.log(`PASS ${width}px ${detail ? 'detail' : 'listing'} ${theme}`);
        }
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
