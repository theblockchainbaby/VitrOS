const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {setup,output,origin}=require('./design-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:950}});
 await setup(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const checks=[];const check=(name,passed)=>{checks.push({name,passed});assert.equal(passed,true,name)};
 const submissions=[];let release;
 await page.route('**/api/media-batches/mb1/pour',async route=>{
  const body=route.request().postDataJSON();submissions.push(body.barcodes);
  if(submissions.length===1){await new Promise(resolve=>release=resolve);return route.fulfill({json:{created:1,updated:0,results:[{barcode:'POUR-A',status:'created'},{barcode:'POUR-B',status:'error: Fixture conflict'}]}})}
  return route.fulfill({json:{created:1,updated:0,results:[{barcode:'POUR-B',status:'created'}]}});
 });
 await page.goto(origin+'/media/batches',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/Pour/}).first().click();
 const scan=page.getByLabel('Vessel barcode for pour');
 for(const barcode of ['POUR-A','POUR-B']){await scan.fill(barcode);await scan.press('Enter')}
 await page.getByRole('button',{name:'Pour into 2 Vessels',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('input[aria-label="Vessel barcode for pour"]')?.disabled);
 check('pour input locks during submission',await scan.isDisabled());
 release();await page.getByText('1 of 2 operations completed',{exact:true}).waitFor();
 check('partial pour preserves failed barcode',await page.getByRole('button',{name:'Remove POUR-B',exact:true}).isVisible());
 check('completed pour barcode leaves retry queue',await page.getByRole('button',{name:'Remove POUR-A',exact:true}).count()===0);
 await page.getByRole('button',{name:'Pour into 1 Vessel',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 check('pour retry submits only failed barcode',JSON.stringify(submissions)===JSON.stringify([['POUR-A','POUR-B'],['POUR-B']]));
 check('pour workflow has no page errors',errors.length===0);
 fs.writeFileSync(output+'/pour-regressions.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify(checks,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
