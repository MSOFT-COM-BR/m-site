// PLAYWRIGHT_MODULE=/path/to/playwright node tests/header-navigation.browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch();
  const results=[];
  try {
    for (const width of [390, 1199, 1200, 1366, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion:'reduce' });
      await page.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:8082' ? route.continue() : route.abort());
      await page.goto('http://127.0.0.1:8082/about', { waitUntil:'networkidle' });
      await page.waitForSelector('.dev-header .navbar');
      for (const authenticated of [false,true]) {
        await page.evaluate(authenticated => {
          window.authService = { isAuthenticated:()=>authenticated, getUser:()=>({name:'NomeSinteticoMuitoLongo Teste'}), hasRole:role=>['admin','premium'].includes(role) };
          window.dispatchEvent(new Event('auth-change'));
        }, authenticated);
        for (const locale of ['pt-BR','es','en']) {
          await page.evaluate(locale=>window.i18n.setLocale(locale),locale);
          for (const theme of ['light','dark']) {
            await page.evaluate(theme=>{document.body.dataset.bsTheme=theme;document.documentElement.dataset.bsTheme=theme;window.dispatchEvent(new Event('theme-change'));},theme);
            const mobile=page.locator('[data-mobile-nav-toggle]');
            if(await mobile.isVisible() && await mobile.getAttribute('aria-expanded')!=='true') await mobile.click();
            await page.waitForTimeout(350);
            const bounds=await page.locator('.dev-header .nav-link').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {text:e.textContent,visible:!!b.width,left:b.left,right:b.right};}));
            for(const b of bounds) assert.ok(b.visible && b.left>=0 && b.right<=width,`${width} ${locale} ${theme}: ${b.text} alcançável`);
            for(const [key,hrefs] of [['solutions',['/criacao-de-sites','/desenvolvimento-de-sistemas','/expertise']],['marketplace',['/marketplace','/apps']],['about',['/about','/contact','/login']]]) {
              const toggle=page.locator(`.dev-header [data-i18n="nav.${key}"][data-bs-toggle]`);
              await toggle.click();
              assert.equal(await toggle.getAttribute('aria-expanded'),'true');
              for(const href of hrefs) {
                const link=page.locator(`.dev-header a[href="${href}"]`);
                await link.scrollIntoViewIfNeeded();
                assert.ok(await link.isVisible(),href);
                const box=await link.boundingBox();
                assert.ok(box.x>=-.5 && box.x+box.width<=width+.5,`${width}: ${href} sem corte`);
                const top=await link.evaluate(e=>{const b=e.getBoundingClientRect();return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('a')===e;});
                assert.ok(top,`${href} não está coberto`);
              }
              await toggle.click();
            }
            if(await mobile.isVisible()) await mobile.click();
            results.push({width,authenticated,locale,theme});
            fs.writeFileSync('/tmp/m-site-header-navigation-results.json',JSON.stringify(results));
            console.log(`PASS ${width} ${authenticated?'auth':'public'} ${locale} ${theme}`);
          }
        }
      }
      if (width === 390 || width === 1440) {
        await page.evaluate(() => {
          window.authService.isAuthenticated = () => false;
          window.dispatchEvent(new Event('auth-change'));
        });
        for (const href of ['/criacao-de-sites','/desenvolvimento-de-sistemas','/expertise','/marketplace','/apps','/about','/contact','/login']) {
          const link = page.locator(`.dev-header .dropdown-menu a[href="${href}"]`);
          const mobile = page.locator('[data-mobile-nav-toggle]');
          if (await mobile.isVisible() && await mobile.getAttribute('aria-expanded') !== 'true') await mobile.click();
          await link.locator('xpath=ancestor::li[contains(@class,"dropdown")][1]').locator('[data-bs-toggle="dropdown"]').click();
          await Promise.all([
            page.waitForResponse(response => response.url().includes(`/src/pages/${href.slice(1)}.html`)),
            link.click()
          ]);
          await page.waitForFunction(path => location.pathname === path, href);
          await page.waitForTimeout(500);
          assert.ok(await page.locator('#root').innerText(), `${href} carregou conteúdo`);
          assert.equal(await page.locator('body').getAttribute('data-bs-theme'), 'dark', 'navegação preserva tema');
          console.log(`ROUTE ${width} ${href}`);
        }
      }
      await page.close();
    }
    assert.equal(results.length,60);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
