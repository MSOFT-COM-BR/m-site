// Synthetic local article/ad rendering; no requests or clicks to real ad networks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:8082';
const post = { title: 'Leitura sintética', slug: 'scroll-sintetico', description: 'Teste local de rolagem.', author: 'Teste', category: 'Teste', createdAt: '2026-01-01', tags: [], content: Array.from({length:70},(_,i)=>`<h2>Seção ${i+1}</h2><p>Conteúdo sintético para testar a rolagem do artigo e das duas laterais sem publicidade real.</p>`).join('') };
(async()=>{
  const browser = await chromium.launch();
  const results = [];
  try {
    for(const width of [1440,1920,390]) {
      const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      await page.route('**/*',route=>{
        const u = new URL(route.request().url());
        if(u.origin===origin) return route.continue();
        if(u.hostname==='gateway.mirandasoft.com.br') return route.fulfill({json:u.pathname.endsWith('/blogs/scroll-sintetico')?{success:true,data:post}:{success:true,data:[]}});
        return route.abort();
      });
      await page.goto(origin+'/blog/scroll-sintetico',{waitUntil:'networkidle'});
      await page.waitForSelector('.blog-content p');
      await page.evaluate(()=>{
        document.querySelectorAll('.ad-sidebar-content').forEach(e=>{e.innerHTML='<div style="height:300px;background:#cbd5e1;color:#0f172a;padding:16px">Publicidade sintética</div>';});
      });
      await page.waitForTimeout(500);
      for(const theme of ['light','dark']) {
        await page.evaluate(()=>scrollTo(0,0));
        if(theme==='dark') {
          if(width<1200) await page.locator('[data-mobile-nav-toggle]').click();
          await page.locator('[data-theme-toggle]').click();
          if(width<1200) await page.locator('[data-mobile-nav-toggle]').click();
        }
        await page.waitForTimeout(400);
        if(width<1200) {
          assert.equal(await page.locator('.blog-ads-sidebar').first().isVisible(),false);
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        } else {
          for(const side of ['left','right']) {
            const slot=page.locator(`[data-ad-position="${side}"]`);
            assert.equal(await slot.evaluate(e=>getComputedStyle(e).position),'sticky',`${side}: deve acompanhar a leitura`);
          }
          await page.evaluate(()=>scrollTo(0,1200));
          await page.waitForTimeout(200);
          for(const side of ['left','right']) {
            const b=await page.locator(`[data-ad-position="${side}"]`).boundingBox();
            assert.ok(Math.abs(b.y-100)<1,`${side}: permanece abaixo do cabeçalho, y=${b.y}`);
          }
          await page.screenshot({path:`/tmp/blog-ads-scroll-${theme}-${width}.png`});
          await page.evaluate(()=>{const rail=document.querySelector('.blog-ads-sidebar');scrollTo(0,rail.getBoundingClientRect().bottom+scrollY-150);});
          await page.waitForTimeout(200);
          for(const side of ['left','right']) {
            const bounds=await page.locator(`[data-ad-position="${side}"]`).evaluate(e=>({slot:e.getBoundingClientRect().bottom,rail:e.parentElement.getBoundingClientRect().bottom,top:e.getBoundingClientRect().top}));
            assert.ok(Math.abs(bounds.slot-bounds.rail)<1,`${side}: respeita o fim do artigo`);
            assert.ok(bounds.top<100,`${side}: deixa de ficar presa ao chegar ao final`);
          }
        }
        results.push({width,theme});
        fs.writeFileSync('/tmp/blog-ads-scroll-results.json',JSON.stringify(results));
        console.log(`PASS ${width} ${theme}`);
      }
      await page.close();
    }
    assert.equal(results.length,6);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
