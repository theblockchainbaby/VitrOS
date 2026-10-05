const {chromium}=require('playwright');
const fs=require('node:fs');
const {setup,output,origin}=require('./design-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});await setup(context);
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push({route:page.url(),message:error.message}));
 const results=[];
 const routes=process.env.SMOKE_ROUTES?process.env.SMOKE_ROUTES.split(','):['/','/tasks','/vessels','/vessels/v1','/vessels/v1/lineage','/scan','/labels','/batch','/batch/create','/batch/multiply','/multiply/v1','/cultivars','/cultivars/c1','/clone-lines','/clone-lines/cl1','/media','/media/m1','/media/batches','/inventory','/inventory/i1','/locations','/locations/l1','/protocols','/reports','/admin/billing','/analytics','/demand-planning','/team-performance','/forecasting','/integrations','/environment','/import','/onboarding','/assistant','/notifications','/activity','/admin'];
 for(const route of routes){
  await page.goto(origin+route,{waitUntil:'networkidle',timeout:90000});
  await page.waitForTimeout(500);if(route==='/')await page.getByRole('heading',{name:'Today',exact:true}).waitFor({timeout:15000});
  for(const width of [320,375,414,768,1280,1440]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(60);
   const measurement=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelector('h1')?.textContent,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(e).position!=='fixed'&&!e.closest('[data-slot="table-container"], [data-slot="sidebar"], [data-slot="tabs-list"]')}).slice(0,5).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,50)}))}));
   results.push({route,width,...measurement});
   if([375,1440].includes(width))await page.screenshot({path:output+'/screenshots/'+(route==='/'?'today':route.slice(1).replaceAll('/','-'))+'-'+width+'.png',fullPage:true});
  }
 }
 await page.goto(origin+'/labels',{waitUntil:'networkidle'});const cb=page.locator('input[type=checkbox]').first();await cb.waitFor();if(await cb.count()){await cb.click();results.push({test:'label checkbox selects exactly once',passed:await cb.isChecked()})}
 await context.close();
 const failed=await browser.newContext({serviceWorkers:'block'});await setup(failed,{failStats:true});const fp=await failed.newPage();await fp.goto(origin+'/tasks',{waitUntil:'networkidle'});results.push({test:'Tasks failure never claims All Clear',passed:await fp.getByRole('alert').count()>0&&await fp.getByText('All Clear',{exact:true}).count()===0});await failed.close();
 fs.writeFileSync(output+'/local-smoke.json',JSON.stringify({results,errors},null,2));process.exitCode=errors.length||results.some(r=>r.document>r.viewport||r.passed===false)?1:0;console.log(JSON.stringify({checks:results.length,overflow:results.filter(r=>r.document>r.viewport),failures:results.filter(r=>r.passed===false),errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
