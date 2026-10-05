const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { setup, stats, vessels, origin } = require('./design-fixtures.cjs');
(async () => {
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
 await setup(context);
 await context.route('**/api/auth/session',r=>r.fulfill({json:{user:{id:'u1',name:'Alex Morgan',role:'manager',organizationId:'demo',organizationName:'Demo tissue culture lab'},expires:'2099-01-01T00:00:00Z'}}));
 await context.route('**/api/stats',r=>r.fulfill({json:{...stats,readyToMultiply:vessels.map((v,i)=>({...v,barcode:`TC-2026-00${i+1}`,cultivarName:i?'Philodendron Birkin':'Monstera deliciosa',updatedAt:'2026-10-01T12:00:00Z'})),recentActivities:[{id:'a1',type:'health_checked',notes:'Routine inspection completed',createdAt:'2026-10-05T01:00:00Z',vessel:{id:'v1',barcode:'TC-2026-001'},user:{name:'Alex Morgan'}},{id:'a2',type:'created',createdAt:'2026-10-04T12:00:00Z',vessel:{id:'v2',barcode:'TC-2026-002'},user:{name:'Sam Lee'}}]}}));
 const page=await context.newPage();await page.goto(origin,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 const target=path.resolve(__dirname,'../public/images/product');fs.mkdirSync(target,{recursive:true});await page.screenshot({path:path.join(target,'today.png'),fullPage:false});await browser.close();console.log('Captured actual UI with explicitly illustrative demo records.');
})().catch(error=>{console.error(error);process.exit(1)});
