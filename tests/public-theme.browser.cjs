// PLAYWRIGHT_MODULE=/path/to/playwright node tests/public-theme.browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:8082';
const routes = ['/', '/ecossistema', '/criacao-de-sites', '/desenvolvimento-de-sistemas', '/expertise', '/mercado', '/marketplace', '/apps', '/about', '/contact', '/cotacoes', '/login', '/blog', '/privacy', '/terms', '/lgpd', '/cookies', '/404'];
const post = { title: 'Artigo sintético', slug: 'artigo-sintetico', description: 'Descrição sintética.', category: 'Tecnologia', author: 'Teste', createdAt: '2026-01-01', content: '<p>Conteúdo sintético.</p>', tags: [] };
const catalog = [{ appKey: 'synthetic-paid', name: 'Produto sintético', description: 'Descrição sintética', type: 'subscription', icon: 'bi-box' }, { appKey: 'synthetic-free', name: 'Ferramenta sintética', description: 'Descrição sintética', type: 'free', icon: 'bi-tools' }];
async function isolate(page) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname === 'economia.awesomeapi.com.br') return route.fulfill({ json: Object.fromEntries(['USDBRL', 'EURBRL', 'BTCBRL'].map(code => [code, { bid: '5', pctChange: '1', timestamp: '1767225600' }])) });
    if (url.hostname === 'gateway.mirandasoft.com.br') return route.fulfill({ json: { success: true, data: url.pathname.endsWith('/blogs') ? [post] : url.pathname.endsWith('/catalog') ? catalog : null } });
    return route.abort();
  });
}
async function switchTheme(page, theme) {
  if (await page.locator('body').getAttribute('data-bs-theme') === theme) return;
  const toggle = page.locator('[data-theme-toggle]');
  // Login intentionally hides the public shell; still verify its shared palette.
  if (!(await toggle.isVisible()) && !(await page.locator('[data-mobile-nav-toggle]').isVisible())) {
    await page.evaluate(theme => { document.body.dataset.bsTheme = theme; document.documentElement.dataset.bsTheme = theme; }, theme);
    await page.waitForTimeout(500);
    return;
  }
  if (!(await toggle.isVisible())) await page.locator('[data-mobile-nav-toggle]').click();
  await toggle.click();
  const mobile = page.locator('[data-mobile-nav-toggle]');
  if (await mobile.isVisible()) await mobile.click();
  await page.waitForTimeout(500);
}
async function inspect(page) {
  return page.evaluate(() => {
    const rgb = value => { const m = value.match(/[\d.]+/g); return m ? [...m.slice(0,3).map(Number), m[3] === undefined ? 1 : Number(m[3])] : [0,0,0,0]; };
    const mix = (a,b) => a.slice(0,3).map((v,i) => v*a[3]+b[i]*(1-a[3]));
    const lum = a => a.slice(0,3).map(v => { v /= 255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; }).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const background = element => { let c=[255,255,255]; const chain=[]; for(let e=element;e;e=e.parentElement) chain.unshift(e); for(const e of chain) c=mix(rgb(getComputedStyle(e).backgroundColor),c); return c; };
    const violations=[];
    const elements=[...document.querySelectorAll('#root h1,#root h2,#root h3,#root h4,#root h5,#root p,#root li,#root label,#root a,#root button,#root .card-title')];
    for(const e of elements) {
      const c=getComputedStyle(e), rect=e.getBoundingClientRect(), text=e.textContent.trim();
      if(!text || !rect.width || !rect.height || c.visibility==='hidden' || Number(c.opacity)<.9 || e.closest('.modal:not(.show),[aria-hidden="true"],.hidden')) continue;
      const fill=c.webkitTextFillColor;
      if(fill==='rgba(0, 0, 0, 0)') continue; // Gradient text is verified separately via its semantic token.
      const fg=rgb(c.color), bg=background(e);
      const ownGradient=c.backgroundImage!=='none';
      if(ownGradient) continue; // Button gradients have an explicit accent foreground/surface contract.
      const score=ratio(mix(fg,bg),bg);
      const large=parseFloat(c.fontSize)>=24 || (parseFloat(c.fontSize)>=18.66 && Number(c.fontWeight)>=700);
      if(score<(large?3:4.5)) violations.push({text:text.slice(0,85),selector:e.tagName+'.'+String(e.className).replaceAll(' ','.'),fg:c.color,bg,ratio:Number(score.toFixed(2))});
    }
    return { violations, links:[...document.querySelectorAll('#root a[href]')].map(e=>e.getAttribute('href')), overflow:document.documentElement.scrollWidth>innerWidth };
  });
}
(async () => {
  const browser=await chromium.launch({headless:true});
  const results=[];
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      await isolate(page);
      for(const route of routes) {
        await page.goto(origin+route,{waitUntil:'networkidle'});
        await page.waitForSelector('#root section, #root .container');
        for(const theme of ['light','dark']) {
          await switchTheme(page,theme);
          await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}scrollTo(0,0);});
          await page.waitForTimeout(500);
          const result={route,width,theme,...await inspect(page)};
          if (route === '/marketplace') {
            await page.locator('#marketplace-content .btn-outline-success').hover();
            assert.deepEqual((await inspect(page)).violations, [], `${width} ${theme}: ação gratuita no hover`);
            await page.mouse.move(0, 0);
            await page.locator('.marketplace-card button').click();
            await page.waitForSelector('#purchase-modal.show');
            await page.waitForTimeout(400);
            assert.equal(await page.locator('#modal-price').innerText(), 'A consultar');
            assert.deepEqual((await inspect(page)).violations, [], `${width} ${theme}: modal comercial`);
            const surface = await page.locator('#purchase-modal .modal-content').evaluate(e => getComputedStyle(e).backgroundColor);
            assert.equal(surface, theme === 'light' ? 'rgb(241, 245, 249)' : 'rgb(20, 20, 29)');
            await page.locator('#purchase-modal .btn-close').click();
            await page.waitForSelector('#purchase-modal.show', {state:'hidden'});
            result.modalVerified = true;
          }
          results.push(result);
          fs.writeFileSync('/tmp/m-site-public-theme-results.json',JSON.stringify(results,null,2));
          if(route==='/about') await page.screenshot({path:`/tmp/m-site-about-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
          console.log(`${result.violations.length?'FAIL':'PASS'} ${route} ${width} ${theme}: ${result.violations.length} contrast issues, overflow=${result.overflow}`);
        }
      }
      await page.close();
    }
    assert.equal(results.length,routes.length*4);
    const failures=results.filter(r=>r.violations.length || r.overflow);
    console.log(JSON.stringify(failures,null,2));
    assert.equal(failures.length,0,'todas as páginas públicas da matriz devem passar');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
