// PLAYWRIGHT_MODULE=/path/to/playwright TEST_ORIGIN=http://127.0.0.1:8082 node tests/header-mobile-layout.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[390, 844], [550, 768], [768, 900], [1199, 800], [1366, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      await page.addInitScript(() => localStorage.setItem('msoft_cookie_consent', 'rejected'));
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      await page.goto(`${origin}/about`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        window.authService = { isAuthenticated: () => true, getUser: () => ({ name: 'Breno' }), hasRole: role => ['admin', 'premium'].includes(role) };
        window.dispatchEvent(new Event('auth-change'));
      });
      const toggle = page.locator('[data-mobile-nav-toggle]');
      assert.equal(await toggle.isVisible(), true);
      await toggle.click();
      await page.waitForFunction(() => document.documentElement.classList.contains('header-mobile-menu-open'));
      const panel = page.locator('#navbarNav');
      const metrics = await page.evaluate(() => {
        const panel = document.querySelector('#navbarNav');
        const rect = panel.getBoundingClientRect();
        return {
          rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
          background: getComputedStyle(panel).backgroundColor,
          htmlOverflow: getComputedStyle(document.documentElement).overflow,
          bodyOverflow: getComputedStyle(document.body).overflow,
          themeLabel: getComputedStyle(document.querySelector('[data-theme-label]')).visibility,
          controlWidths: ['#header-language-action button', '#header-theme-action button', '#header-auth-action .header-user-btn'].map(selector => {
            const rect = document.querySelector(selector).getBoundingClientRect();
            return rect.width;
          }),
          themeButtonHeight: document.querySelector('#header-theme-action button').getBoundingClientRect().height,
          pageY: scrollY,
        };
      });
      assert.ok(metrics.rect.left >= 0 && metrics.rect.right <= width, `${width}px menu fits horizontally`);
      assert.ok(metrics.rect.top >= 0 && metrics.rect.bottom <= height, `${width}px menu fits viewport vertically`);
      assert.match(metrics.background, /^rgb\(/, `${width}px menu surface is opaque`);
      assert.equal(metrics.htmlOverflow, 'hidden');
      assert.equal(metrics.bodyOverflow, 'hidden');
      assert.equal(metrics.themeLabel, 'visible', 'mobile theme action has a visible label');
      assert.ok(metrics.controlWidths.every(width => Math.abs(width - metrics.controlWidths[0]) <= 1), 'language, theme and account controls fill the same width');
      assert.ok(metrics.themeButtonHeight >= 44, 'theme action has a full-height touch target');
      assert.equal(metrics.pageY, 0, 'opening the menu does not move the page');

      await page.locator('.header-user-btn').click();
      const profileLink = page.locator('.dev-header a[href="/painel/perfil"]');
      await profileLink.scrollIntoViewIfNeeded();
      assert.equal(await profileLink.isVisible(), true);
      const profileRect = await profileLink.boundingBox();
      assert.ok(profileRect.x >= 0 && profileRect.x + profileRect.width <= width, `${width}px profile action fits the screen`);
      const coverage = await profileLink.evaluate(link => {
        const rect = link.getBoundingClientRect();
        const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return { clear: top?.closest('a') === link, top: top?.outerHTML.slice(0, 120) };
      });
      assert.equal(coverage.clear, true, `${width}px profile action is not covered by ${coverage.top}`);
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'first Escape closes the account submenu');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('header-mobile-menu-open')), false);
      await page.close();
      console.log(`PASS responsive header menu ${width}x${height}`);
    }
    const desktop = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await desktop.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await desktop.goto(`${origin}/about`, { waitUntil: 'networkidle' });
    await desktop.waitForSelector('.dev-header .navbar');
    assert.equal(await desktop.locator('[data-mobile-nav-toggle]').isVisible(), false);
    const desktopLinks = await desktop.locator('.dev-header .navbar-nav > .nav-item > .nav-link, .dev-header .navbar-nav > .nav-item > .dropdown > .nav-link').evaluateAll(links => links.map(link => {
      const rect = link.getBoundingClientRect();
      return { visible: rect.width > 0, left: rect.left, right: rect.right, text: link.textContent.trim() };
    }));
    for (const link of desktopLinks) assert.ok(link.visible && link.left >= 0 && link.right <= 1400, `1400px ${link.text} fits`);
    await desktop.close();
    console.log('PASS responsive header desktop 1400px');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
