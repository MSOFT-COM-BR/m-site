// Run against the local static server only; every external request is isolated.
// PLAYWRIGHT_MODULE=/path/to/playwright node tests/light-contrast.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fixture = { success: true, data: [{ title: 'Artigo sintético de contraste', slug: 'contraste-sintetico', description: 'Conteúdo isolado para validar as cores.', category: 'Tecnologia', createdAt: '2026-01-01T00:00:00Z' }] };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === 'http://127.0.0.1:8082') return route.continue();
        if (url.hostname === 'gateway.mirandasoft.com.br') return route.fulfill({ json: url.pathname.endsWith('/blogs') ? fixture : { success: false, data: null } });
        return route.abort();
      });
      await page.goto('http://127.0.0.1:8082/', { waitUntil: 'networkidle' });
      await page.waitForSelector('#home-blog-grid h3');
      await page.waitForSelector('.footer-title');
      for (const theme of ['light', 'dark']) {
        if (theme === 'dark') {
          if (width < 1200) await page.locator('[data-mobile-nav-toggle]').click();
          await page.locator('[data-theme-toggle]').click();
        }
        assert.equal(await page.locator('body').getAttribute('data-bs-theme'), theme);
        await page.waitForFunction(theme => {
          const card = getComputedStyle(document.querySelector('#features-grid .dev-skill-card'));
          return card.backgroundColor === (theme === 'light' ? 'rgb(226, 232, 240)' : 'rgb(26, 26, 38)');
        }, theme);
        const colors = await page.evaluate(() => {
          const c = selector => getComputedStyle(document.querySelector(selector)).color;
          return { hero: c('#hero-title'), heroFill: getComputedStyle(document.querySelector('#hero-title')).webkitTextFillColor, heading: c('#features-grid h3'), blog: c('#home-blog-grid h3'), footer: c('.footer-title'), description: c('.footer-description'), hub: c('#hub-title'), support: c('#suporte h3'), gradient: getComputedStyle(document.querySelector('#hero-title')).backgroundImage };
        });
        const primary = theme === 'light' ? 'rgb(15, 23, 42)' : 'rgb(241, 245, 249)';
        for (const key of ['heading', 'blog', 'hub', 'support']) assert.equal(colors[key], primary, `${theme}: ${key}`);
        assert.equal(colors.footer, theme === 'light' ? primary : 'rgb(255, 255, 255)');
        assert.equal(colors.description, theme === 'light' ? 'rgb(71, 85, 105)' : 'rgb(148, 163, 184)');
        assert.equal(colors.gradient, 'none', 'título sem degradê');
        assert.equal(colors.hero, primary, 'cor sólida acompanha o tema');
        assert.equal(colors.heroFill, primary, 'texto não pode permanecer transparente');
        for (const selector of ['#hero-title .text-gradient', '.text-gradient-neon']) {
          for (const element of await page.locator(selector).all()) {
            const style = await element.evaluate(e => { const s = getComputedStyle(e); return {background:s.backgroundImage,fill:s.webkitTextFillColor}; });
            assert.equal(style.background, 'none');
            assert.equal(style.fill, primary);
          }
        }
        if (width === 390) {
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile horizontal overflow');
        }
        await page.screenshot({ path: `/tmp/m-site-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
        console.log(JSON.stringify({ width, theme, colors }));
      }
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
