const {chromium}=require('playwright');
const fs=require('node:fs');
const {setup,output,origin}=require('./design-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});await setup(context,{authenticated:false});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push({route:page.url(),message:error.message}));
 const results=[];
 const routes=['/','/features','/why-vitros','/pricing','/demo','/login','/signup?plan=growth&interval=annual','/forgot-password','/reset-password','/offline','/unsubscribed','/blog','/blog/fixture-unavailable'];
 for(const route of routes){
  await page.goto(origin+route,{waitUntil:'networkidle',timeout:90000});
  await page.waitForTimeout(500);
  for(const width of [320,375,414,768,1280,1440]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(60);
   const measurement=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelector('h1')?.textContent,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(e).position!=='fixed'&&!e.closest('[data-slot="table-container"], [data-slot="sidebar"], [data-slot="tabs-list"]')}).slice(0,5).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,50)}))}));
   results.push({route,width,...measurement});
   if([375,1440].includes(width))await page.screenshot({path:output+'/screenshots/'+(route==='/'?'homepage':route.slice(1).replace(/[^a-zA-Z0-9-]+/g,'-'))+'-'+width+'.png',fullPage:true});
  }
 }
 await page.setViewportSize({width:320,height:900});await page.goto(origin+'/features',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Open navigation'}).click();results.push({test:'Public mobile menu opens',passed:await page.getByRole('navigation',{name:'Mobile navigation'}).isVisible()});await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Pricing'}).click();await page.waitForURL('**/pricing');results.push({test:'Public mobile menu navigates',passed:page.url().includes('/pricing')});
 await page.goto(origin+'/forgot-password',{waitUntil:'networkidle'});results.push({test:'Recovery has no workspace or welcome',passed:await page.locator('[data-slot="sidebar"]').count()===0 && await page.getByText('Welcome to VitrOS',{exact:true}).count()===0});
 fs.writeFileSync(output+'/public-smoke.json',JSON.stringify({results,errors},null,2));process.exitCode=errors.length||results.some(r=>r.document>r.viewport||r.passed===false)?1:0;console.log(JSON.stringify({checks:results.length,overflow:results.filter(r=>r.document>r.viewport),failures:results.filter(r=>r.passed===false),errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
