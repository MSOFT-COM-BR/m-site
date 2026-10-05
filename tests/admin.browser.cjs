// PLAYWRIGHT_MODULE=/path/to/playwright node tests/admin.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';
const fixture = () => Array.from({length: 13}, (_, i) => ({ _id: `post-${i}`, title: i === 0 ? 'Arquitetura <img src=x onerror=alert(1)>' : `Artigo ${String(i).padStart(2, '0')}`, slug: `artigo-${i}`, author: 'Autor de teste', categories: [i % 2 ? 'Tecnologia' : 'Programação'], views: i * 10, published: i % 3 !== 0, createdAt: `2026-09-${String(i + 1).padStart(2, '0')}T12:00:00Z`, content: '<p>Conteúdo de teste.</p>', tags: [] }));
async function setup(page, authenticated = true) {
  let posts = fixture(), fail = false, delay = 0;
  const writes = [], reads = [];
  await page.addInitScript(authenticated => {
    localStorage.setItem('msoft_cookie_consent', 'rejected');
    if (!localStorage.getItem('msoft_cms_last_tab')) localStorage.setItem('msoft_cms_last_tab', 'blog');
    if (authenticated) {
      localStorage.setItem('msoft_auth_token', 'synthetic-test-token');
      localStorage.setItem('msoft_user_data', JSON.stringify({name:'Autor de teste', roles:authenticated === 'member' ? ['user'] : ['admin']}));
    }
  }, authenticated);
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.hostname !== 'gateway.mirandasoft.com.br') return route.abort();
    const method = route.request().method();
    if (url.pathname.endsWith('/blogs/all')) {
      reads.push(url.pathname);
      if (delay) await new Promise(resolve => setTimeout(resolve, delay));
      return route.fulfill({json: fail ? {success:false, error:'Test failure'} : {success:true, data:posts}});
    }
    if (/\/blogs(?:\/post-\d+)?$/.test(url.pathname) && method !== 'GET') {
      writes.push({method, body:route.request().postDataJSON()});
      if (method === 'DELETE') posts = posts.filter(p => !url.pathname.endsWith('/'+p._id));
      return route.fulfill({json:{success:true, data:{}}});
    }
    return route.fulfill({json:{success:true, data:[]}});
  });
  return {writes, reads, fail(value) {fail=value;}, empty() {posts=[];}, delay(value) {delay=value;}};
}
async function inspect(page) {
  return page.evaluate(() => {
    const rgb = v => { const m=v.match(/[\d.]+/g); return m ? [...m.slice(0,3).map(Number),m[3]===undefined?1:Number(m[3])] : [0,0,0,0]; };
    const mix=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));
    const lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const violations=[];
    for(const el of document.querySelectorAll('.cms-container h1,.cms-container h2,.cms-container h3,.cms-container h4,.cms-container h5,.cms-container h6,.cms-container p,.cms-container label,.cms-container a,.cms-container button,.cms-container dt,.cms-container dd,.cms-container .cms-status,.cms-container .cms-article-meta,.cms-container input,.cms-container select')) {
      const style=getComputedStyle(el), rect=el.getBoundingClientRect();
      if(!rect.width || !rect.height || style.visibility==='hidden' || el.disabled || !el.textContent.trim() && !el.value) continue;
      let bg=[255,255,255]; const chain=[]; for(let e=el;e;e=e.parentElement) chain.unshift(e);
      for(const e of chain) bg=mix(rgb(getComputedStyle(e).backgroundColor),bg);
      const fg=mix(rgb(style.color),bg); const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);
      const large=parseFloat(style.fontSize)>=24 || parseFloat(style.fontSize)>=18.66 && Number(style.fontWeight)>=700;
      if(ratio<(large?3:4.5)) violations.push({text:el.textContent.trim().slice(0,70),selector:el.tagName+'.'+el.className,ratio:ratio.toFixed(2)});
    }
    return {overflow:document.documentElement.scrollWidth>innerWidth,violations};
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:1000}, reducedMotion:'reduce'});
      const api=await setup(page); const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'/console/conteudo/blog',{waitUntil:'networkidle'});
      await page.waitForSelector('.cms-article');
      assert.equal(await page.locator('#blog-stat-total').innerText(),'13');
      assert.equal(await page.locator('#blog-stat-published').innerText(),'8');
      assert.equal(await page.locator('#blog-stat-drafts').innerText(),'5');
      assert.equal(await page.locator('#blog-stat-views').innerText(),'780');
      assert.equal(await page.locator('.cms-article').count(),10);
      for(const theme of ['light','dark']) {
        await page.evaluate(theme=>{document.body.dataset.bsTheme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
        await page.waitForTimeout(450);
        assert.deepEqual(await inspect(page),{overflow:false,violations:[]},`${width} ${theme} article listing`);
        await page.screenshot({path:`/tmp/m-site-admin-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
      }
      await page.locator('#blog-pagination button').last().click();
      assert.equal(await page.locator('.cms-article').count(),3);
      assert.equal(await page.locator('.cms-article img').count(),0,'untrusted title rendered as text');
      await page.locator('#blog-search').fill('arquitetura');
      assert.equal(await page.locator('.cms-article').count(),1);
      await page.locator('#blog-search').fill('missing article');
      assert.match(await page.locator('#blog-list-container').innerText(),/Nenhum artigo encontrado/);
      await page.locator('[data-list-action="clear"]').click();
      await page.locator('#blog-category-filter').selectOption('Programação');
      await page.locator('#blog-status-filter').selectOption('draft');
      assert.equal(await page.locator('.cms-article').count(),3);
      await page.locator('#blog-clear-filters').click();
      await page.locator('#blog-sort').selectOption('views');
      assert.match(await page.locator('.cms-article').first().innerText(),/120 visualizações/);
      assert.equal(api.reads.length,1,'search/filter/sort/pagination reuse loaded data');
      await page.locator('[data-list-action="edit"]').first().click();
      await page.waitForURL(origin+'/console/conteudo/blog/post-12/editar');
      await page.waitForSelector('.note-editor');
      assert.equal(await page.locator('#blog-id').inputValue(),'post-12');
      assert.equal(await page.locator('#blog-title').inputValue(),'Artigo 12');
      for(const theme of ['light','dark']) {
        await page.evaluate(theme=>{document.body.dataset.bsTheme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
        await page.waitForTimeout(450);
        const result=await inspect(page);
        assert.deepEqual(result,{overflow:false,violations:[]},`${width} ${theme} editor`);
      }
      await page.locator('#blog-title').fill('Artigo editado');
      await page.locator('#blog-save-draft').click();
      await page.waitForFunction(()=>document.getElementById('blog-save-draft').disabled===false && !document.getElementById('blog-save-draft').querySelector('.spinner-border'));
      assert.equal(api.writes[0].method,'PUT');
      assert.equal(api.writes[0].body.title,'Artigo editado');
      await page.locator('#blog-form-container a[href="/console/conteudo/blog"]').click();
      await page.waitForURL(origin+'/console/conteudo/blog');
      await page.waitForSelector('.cms-article');
      page.once('dialog',dialog=>dialog.dismiss());
      await page.locator('[data-list-action="delete"]').first().click();
      assert.equal(api.writes.length,1,'canceling deletion makes no request');
      page.once('dialog',dialog=>dialog.accept());
      await page.locator('[data-list-action="delete"]').first().click();
      await page.waitForFunction(()=>document.getElementById('blog-stat-total').textContent==='12');
      assert.equal(api.writes[1].method,'DELETE');
      api.fail(true); api.delay(300);
      await page.locator('#blog-refresh').click();
      assert.equal(await page.locator('#blog-list-container').getAttribute('aria-busy'),'true');
      await page.waitForSelector('[data-list-action="retry"]');
      assert.equal(await page.locator('#blog-stat-total').innerText(),'—');
      api.fail(false); api.empty();
      await page.locator('[data-list-action="retry"]').click();
      await page.waitForSelector('[data-list-action="create"]');
      assert.equal(await page.locator('#blog-stat-total').innerText(),'0');
      assert.equal(await page.locator('#blog-pagination').isVisible(),false);
      for(const tab of ['overview','theme','mjson','images','logs','users','apps']) {
        await page.evaluate(tab=>window.loadTab(tab),tab);
        await page.waitForTimeout(500);
        for(const theme of ['light','dark']) {
          await page.evaluate(theme=>{document.body.dataset.bsTheme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
          await page.waitForTimeout(450);
          assert.deepEqual(await inspect(page),{overflow:false,violations:[]},`${width} ${theme} ${tab}`);
        }
      }
      if(width===390) {
        await page.locator('#admin-nav-toggle').click();
        assert.equal(await page.locator('#admin-nav-toggle').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#admin-nav-toggle').getAttribute('aria-expanded'),'false');
      }
      if (width === 390) await page.locator('#admin-nav-toggle').click();
      await page.locator('.admin-nav [data-tab="blog"]').click();
      await page.waitForSelector('#blog-search');
      assert.equal(await page.locator('.admin-nav [data-tab="blog"]').getAttribute('aria-current'),'page');
      if (width === 390) assert.equal(await page.locator('#admin-nav-toggle').getAttribute('aria-expanded'),'false');
      await page.evaluate(()=>window.loadTab('mjson'));
      await page.waitForSelector('#mjson-data');
      await page.reload({waitUntil:'networkidle'});
      await page.waitForSelector('#mjson-data');
      assert.equal(await page.locator('.admin-nav [data-tab="mjson"]').getAttribute('aria-current'),'page');
      assert.deepEqual(errors,[],'no uncaught browser errors');
      console.log(`PASS admin ${width}: themes, filters, pagination, editor, save/delete, recovery, tabs`);
      await page.close();
    }
    for (const role of [false, 'member']) {
      const page=await browser.newPage(); const api=await setup(page,role);
      await page.goto(origin+'/console/conteudo/blog',{waitUntil:'networkidle'});
      await page.waitForSelector('#access-denied',{state:'visible'});
      await page.evaluate(()=>window.loadTab('blog'));
      assert.equal(api.reads.length,0,'visitor and non-admin cannot load admin data');
      assert.equal(await page.locator('#admin-role').isVisible(),false);
      await page.close();
    }
    console.log('PASS admin access denied: visitor and non-admin');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
