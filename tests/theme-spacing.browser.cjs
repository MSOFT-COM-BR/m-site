// PLAYWRIGHT_MODULE=/path/to/playwright node tests/theme-spacing.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === 'http://127.0.0.1:8082') return route.continue();
        if (url.hostname === 'economia.awesomeapi.com.br') return route.fulfill({ json: Object.fromEntries(['USDBRL', 'EURBRL', 'BTCBRL'].map(code => [code, { bid: '5', pctChange: '1', timestamp: '1767225600' }])) });
        if (url.hostname === 'gateway.mirandasoft.com.br') return route.fulfill({ json: { success: false, data: null } });
        return route.abort();
      });
      await page.goto('http://127.0.0.1:8082/mercado', { waitUntil: 'networkidle' });
      await page.waitForSelector('.market-hero h1');
      const measure = () => page.evaluate(() => Object.fromEntries(['body', '.navbar', '.navbar-brand', '.market-hero h1', '.market-hero > p', '.market-toolbar', '.market-grid'].map(selector => {
        const e = document.querySelector(selector), css = getComputedStyle(e), rect = e.getBoundingClientRect();
        return [selector, { font: css.fontFamily, lineHeight: css.lineHeight, spacing: css.letterSpacing, width: rect.width, height: rect.height, top: rect.top }];
      })));
      const reference = await measure();
      for (const theme of ['dark', 'light']) {
        if (!(await page.locator('[data-theme-toggle]').isVisible())) await page.locator('[data-mobile-nav-toggle]').click();
        await page.locator('[data-theme-toggle]').click();
        if (width < 1200) await page.locator('[data-mobile-nav-toggle]').click();
        await page.waitForFunction(theme => document.body.dataset.bsTheme === theme, theme);
        await page.waitForTimeout(500);
        const actual = await measure();
        console.log(JSON.stringify({ width, theme, metrics: actual }));
        for (const selector of Object.keys(reference)) {
          for (const property of ['font', 'lineHeight', 'spacing']) assert.equal(actual[selector][property], reference[selector][property], `${width}px ${theme} ${selector} ${property}`);
          for (const property of ['width', 'height', 'top']) assert.ok(Math.abs(actual[selector][property] - reference[selector][property]) <= .5, `${width}px ${theme} ${selector} ${property}: geometria deve ser igual (tolerância subpixel de 0.5px)`);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sem overflow horizontal');
        await page.screenshot({ path: `/tmp/market-spacing-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
        console.log(`PASS ${width}px ${theme}: geometria igual ao claro`);
      }
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
