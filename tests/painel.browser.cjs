// PLAYWRIGHT_MODULE=/path/to/playwright node tests/painel.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8082';
const apps = [
  {appKey:'mcredential', name:'MCredential'},
  {appKey:'free-app', name:'Nome <img src=x onerror=alert(1)>'},
  {appKey:'paid-app', name:'Plano adquirido'},
  {appKey:'missing-app', name:'Sem catálogo'}
];
const catalog = [
  {appKey:'mcredential', type:'free', name:'MCredential', icon:'bi-shield-lock'},
  {appKey:'free-app', type:'free', name:'Nome <img src=x onerror=alert(1)>', icon:'bi-box', description:'Descrição <script>alert(1)</script>'},
  {appKey:'paid-app', type:'subscription', name:"Plano adquirido O'Brien", icon:'bi-star'}
];
async function setup(page, role = 'premium') {
  const calls=[], writes=[]; let fail=false, empty=false, catalogFail=false, catalogComplete=false;
  await page.addInitScript(role => {
    localStorage.setItem('msoft_cookie_consent','rejected');
    if(role !== 'visitor') {
      localStorage.setItem('msoft_auth_token','synthetic-token');
      localStorage.setItem('msoft_user_data',JSON.stringify({name:'Breno Teste',roles:[role]}));
    }
  },role);
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin) return route.continue();
    if(url.hostname!=='gateway.mirandasoft.com.br') return route.abort();
    calls.push(url.pathname+url.search);
    if(url.pathname.endsWith('/auth/me')) {
      if(route.request().method()==='PUT') {
        const payload=route.request().postDataJSON(); writes.push(payload);
        return route.fulfill({json:{success:true,user:{name:payload.name,email:'breno@example.com',roles:[role]}}});
      }
      return route.fulfill({json:{success:true,user:{name:'Breno Teste',email:'breno@example.com',roles:[role]}}});
    }
    if(url.pathname.endsWith('/catalog')) return route.fulfill({json:catalogFail?{success:false,data:null}:{success:true,data:catalogComplete?[...catalog,{appKey:'missing-app',type:'free',name:'Sem catálogo'}]:catalog}});
    if(url.pathname.endsWith('/apps')) return route.fulfill({json:fail?{success:false,data:null}:{success:true,data:empty?[]:apps}});
    return route.fulfill({json:{success:true,data:[]}});
  });
  return {calls,writes, fail(value){fail=value}, empty(value){empty=value}, catalogFail(value){catalogFail=value}, catalogComplete(value){catalogComplete=value}};
}
async function contrastIssues(page) {
  return page.evaluate(() => {
    const selectors=['#painel-title','.premium-header p','.premium-actions .btn','.premium-stat p','.premium-stat-value','.premium-plan h2','.premium-plan .btn','.premium-app-card h3','.premium-app-card p','.premium-app-card-footer small','.premium-app-card-footer button','#apps-filter-label'];
    const rgb = value => { const m=value.match(/[\d.]+/g); return m ? [...m.slice(0,3).map(Number),m[3]===undefined?1:Number(m[3])] : [0,0,0,0]; };
    const mix=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));
    const lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const violations=[];
    for(const selector of selectors) for(const el of document.querySelectorAll(selector)) {
      const style=getComputedStyle(el), rect=el.getBoundingClientRect();
      if(!rect.width || !rect.height || !el.textContent.trim()) continue;
      let bg=[255,255,255]; const chain=[];for(let e=el;e;e=e.parentElement)chain.unshift(e);
      for(const e of chain) bg=mix(rgb(getComputedStyle(e).backgroundColor),bg);
      const fg=mix(rgb(style.color),bg);const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);
      const large=parseFloat(style.fontSize)>=24 || parseFloat(style.fontSize)>=18.66 && Number(style.fontWeight)>=700;
      if(ratio<(large?3:4.5)) violations.push({selector,text:el.textContent.trim().slice(0,35),ratio:Number(ratio.toFixed(2))});
    }
    return violations;
  });
}
async function metrics(page) {
  return page.evaluate(()=>{
    const header=document.querySelector('#head .navbar'),main=document.querySelector('.premium-page');
    return {headerVisible:!!header&&getComputedStyle(document.getElementById('head')).display!=='none', headerBottom:header?.getBoundingClientRect().bottom, mainTop:main?.querySelector('.premium-header')?.getBoundingClientRect().top, overflow:document.documentElement.scrollWidth>innerWidth};
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
      const api=await setup(page); const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      await page.waitForSelector('.premium-app-card button[data-open-app]');
      assert.equal(new URL(page.url()).pathname,'/painel');
      assert.match(await page.title(),/^Painel/);
      assert.equal(await page.locator('#stats-apps').innerText(),'4');
      assert.equal(await page.locator('#stats-purchased').innerText(),'—');
      assert.equal(await page.locator('#stats-purchased').getAttribute('title'),'Dados do catálogo incompletos');
      assert.equal(await page.locator('.premium-app-card button[data-open-app]').count(),4);
      assert.equal(await page.locator('.premium-app-card img').count(),0,'catalog markup escaped');
      assert.equal(await page.locator('.premium-app-card script').count(),0,'catalog description escaped');
      assert.equal(api.calls.filter(call=>call.includes('/apps')).length,1);
      assert.ok(api.calls.includes('/api/apps'));
      for(const theme of ['light','dark']) {
        await page.evaluate(theme=>{document.body.dataset.bsTheme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
        await page.waitForTimeout(550);
        const m=await metrics(page);
        assert.equal(m.headerVisible,true,`${width} ${theme} header`);
        assert.equal(m.overflow,false,`${width} ${theme} overflow`);
        assert.ok(m.mainTop>=m.headerBottom-2,`${width} ${theme} main below navbar`);
        assert.deepEqual(await contrastIssues(page),[],`${width} ${theme} text contrast`);
        await page.screenshot({path:`/tmp/m-site-painel-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
      }
      await page.locator('#apps-filter-label').click();
      await page.locator('[data-app-filter="free"]').click();
      assert.equal(await page.locator('.premium-app-card button[data-open-app]').count(),2);
      assert.match(await page.locator('#apps-result-count').innerText(),/2 de 4/);
      assert.equal(await page.locator('#stats-apps').innerText(),'4');
      await page.locator('#apps-filter-label').click();
      await page.locator('[data-app-filter="paid"]').click();
      assert.equal(await page.locator('.premium-app-card button[data-open-app]').count(),1);
      assert.match(await page.locator('.premium-app-card h3').first().innerText(),/Plano adquirido/);
      await page.locator('#apps-filter-label').click();
      await page.locator('[data-app-filter="unknown"]').click();
      assert.equal(await page.locator('.premium-app-card button[data-open-app]').count(),1);
      assert.match(await page.locator('.premium-app-card h3').first().innerText(),/Sem catálogo/);
      await page.locator('#apps-filter-label').click();
      await page.locator('[data-app-filter="all"]').click();
      assert.equal(api.calls.filter(call=>call.includes('/apps')).length,1,'local filters reuse loaded data');
      assert.equal(await page.locator('.premium-app-card button[data-open-app]').count(),4);
      if(width===390) {
        await page.locator('[data-mobile-nav-toggle]').click();
        assert.equal(await page.locator('[data-mobile-nav-toggle]').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('[data-mobile-nav-toggle]').getAttribute('aria-expanded'),'false');
      }
      assert.deepEqual(errors,[]);
      console.log(`PASS painel ${width}: shared navbar, themes, apps, filter, catalog escape`);
      await page.close();
    }
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'}); const api=await setup(page);
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      await page.waitForSelector('.premium-app-card button[data-open-app]');
      assert.equal(await page.locator('.premium-actions a[href="/painel/perfil"]').count(),1);
      await page.locator('.premium-actions a[href="/painel/perfil"]').click();
      await page.waitForURL(origin+'/painel/perfil');
      await page.waitForSelector('#profile-name');
      assert.equal(await page.locator('#profile-name').innerText(),'Breno Teste');
      assert.equal(await page.locator('#input-email').inputValue(),'breno@example.com');
      assert.equal(await page.locator('#plan-title').innerText(),'Plano Premium');
      assert.equal(await page.locator('#head .navbar').isVisible(),true);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+'/painel/perfil');
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),origin+'/painel/perfil');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
      assert.ok(api.calls.includes('/api/auth/me'));
      assert.equal(await page.locator('#profile-back-link').isVisible(),true);
      await page.locator('#input-name').fill('Breno Alterado');
      await page.locator('#profile-form button[type="submit"]').click();
      await page.waitForFunction(()=>document.getElementById('profile-name').textContent==='Breno Alterado');
      assert.deepEqual(api.writes,[{name:'Breno Alterado'}]);
      await page.locator('#profile-back-link').click();
      await page.waitForURL(origin+'/painel');
      if(width===390) {
        await page.locator('[data-mobile-nav-toggle]').click();
        await page.locator('.header-user-btn').click();
      } else await page.locator('.header-user-btn').click();
      assert.equal(await page.locator('.dev-header a[href="/painel/perfil"]').count(),1);
      await page.close();
      console.log(`PASS profile navigation ${width}`);
    }
    for(const [role,backLink] of [['admin',true],['member',false]]) {
      const page=await browser.newPage(); await setup(page,role);
      await page.goto(origin+'/profile?tab=seguranca#dados',{waitUntil:'networkidle'});
      await page.waitForURL(origin+'/painel/perfil?tab=seguranca#dados');
      await page.waitForSelector('#profile-name');
      assert.equal(await page.locator('#profile-back-link').isVisible(),backLink);
      assert.equal(await page.locator('#plan-title').innerText(),role==='admin'?'Administrador':'Plano Gratuito');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+'/painel/perfil');
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),origin+'/painel/perfil');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.close();
    }
    {
      const page=await browser.newPage(); const api=await setup(page,'visitor');
      await page.goto(origin+'/painel/perfil',{waitUntil:'networkidle'});
      await page.waitForURL(origin+'/login');
      assert.equal(api.calls.includes('/api/auth/me'),false);
      await page.close();
    }
    for(const [path,canonical,hasProfile] of [['/painel/perfil/','/painel/perfil',true],['/profile/','/painel/perfil',true],['/painel/perfil/extra','/painel/perfil/extra',false],['/profile/extra','/profile/extra',false]]) {
      const page=await browser.newPage(); await setup(page);
      await page.goto(origin+path,{waitUntil:'networkidle'});
      if(hasProfile) {await page.waitForURL(origin+canonical);await page.waitForSelector('#profile-form');}
      else {await page.waitForSelector('#root .error-page,#root section');assert.equal(await page.locator('#profile-form').count(),0);}
      assert.equal(new URL(page.url()).pathname,canonical);
      await page.close();
    }
    console.log('PASS profile legacy URL, roles, PUT, trailing slash and guest guard');
    for(const [requested, canonical, role] of [['/premium','/painel','premium'],['/admin','/console','admin'],['/console','/console','admin']]) {
      const page=await browser.newPage(); const api=await setup(page,role);
      await page.goto(origin+requested,{waitUntil:'networkidle'});
      await page.waitForURL(origin+canonical);
      assert.equal(new URL(page.url()).pathname,canonical);
      assert.equal(await page.locator('#head .navbar').isVisible(),true);
      assert.equal(await page.evaluate(()=>window.auditService?.isAuditedArea()),true);
      assert.match(await page.title(),new RegExp(canonical==='/painel'?'^Painel':'^Console'));
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+canonical);
      if(canonical==='/painel') await page.waitForSelector('.premium-app-card button[data-open-app]');
      else { await page.waitForSelector('#admin-role'); assert.equal(await page.locator('.admin-nav').getAttribute('aria-label'),'Navegação do Console'); }
      if(canonical==='/painel') assert.ok(api.calls.includes('/api/apps'));
      else assert.ok(api.calls.includes('/api/apps?all=1')===false);
      await page.close();
    }
    for(const [key,path] of [['mcredential','/app/mcredential'],['missing-app','/apps?tool=missing-app']]) {
      const page=await browser.newPage(); await setup(page);
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      await page.waitForSelector('.premium-app-card button[data-open-app]');
      await page.locator(`[data-open-app="${key}"]`).click();
      await page.waitForURL(origin+path);
      await page.close();
    }
    for(const catalogState of ['complete','failed']) {
      const page=await browser.newPage(); const api=await setup(page);
      if(catalogState==='complete') api.catalogComplete(true);
      else api.catalogFail(true);
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      await page.waitForSelector('.premium-app-card button[data-open-app]');
      assert.equal(await page.locator('#stats-purchased').innerText(),catalogState==='complete'?'1':'—');
      assert.equal(await page.locator('#stats-apps').innerText(),'4');
      await page.close();
    }
    for(const [role,expected] of [['admin','/api/apps?all=1'],['member',null],['visitor',null]]) {
      const page=await browser.newPage(); const api=await setup(page,role);
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      if(role==='admin') {
        await page.waitForSelector('.premium-app-card button[data-open-app]');
        assert.ok(api.calls.includes(expected));
      } else {
        await page.waitForSelector('#access-denied',{state:'visible'});
        assert.equal(api.calls.filter(call=>call.includes('/apps')).length,0);
        assert.equal(await page.locator('#premium-content').isVisible(),false);
      }
      await page.close();
    }
    {
      const page=await browser.newPage(); const api=await setup(page);
      api.fail(true);
      await page.goto(origin+'/painel',{waitUntil:'networkidle'});
      await page.waitForSelector('#apps-retry');
      assert.equal(await page.locator('#stats-apps').innerText(),'—');
      api.fail(false);api.empty(true);
      await page.locator('#apps-retry').click();
      await page.waitForFunction(()=>document.getElementById('stats-apps').textContent==='0');
      assert.match(await page.locator('#my-apps-grid').innerText(),/ainda não instalou/);
      assert.equal(await page.locator('#my-apps-grid .premium-app-card-add').count(),1);
      await page.close();
    }
    {
      const page=await browser.newPage(); await setup(page,'visitor');
      await page.goto(origin+'/marketplace',{waitUntil:'networkidle'});
      await page.waitForSelector('#apps-grid [data-purchase-name]');
      await page.locator('#apps-grid [data-purchase-name]').first().click();
      await page.waitForSelector('#purchase-modal.show');
      assert.equal(await page.locator('#modal-app-name').innerText(),"Plano adquirido O'Brien");
      await page.close();
    }
    console.log('PASS aliases, admin/member/visitor guard, API error/retry/empty, marketplace purchase');
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
