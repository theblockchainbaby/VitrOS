const {chromium}=require('playwright');
const fs=require('node:fs');
const {setup,output,origin}=require('./design-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000},reducedMotion:'reduce'});await setup(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
 for(const route of ['/','/vessels','/scan','/labels','/analytics','/demand-planning','/integrations','/team-performance','/login','/features']){
  await page.goto(origin+route,{waitUntil:'networkidle'});await page.evaluate(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark')});if(route==='/')await page.getByText('Production insights',{exact:false}).click();
  for(const width of [375,768,1440]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);checks.push({route,width,document:await page.evaluate(()=>document.documentElement.scrollWidth),dark:await page.evaluate(()=>document.documentElement.classList.contains('dark'))});if(width===1440&&['/','/scan','/vessels','/features'].includes(route))await page.screenshot({path:output+'/screenshots/'+(route==='/'?'today':route.slice(1))+'-dark.png',fullPage:true});}
 }
 const contrast=[];
 for(const mode of ['light','dark']){
  await page.goto(origin+'/vessels',{waitUntil:'networkidle'});
  await page.evaluate(mode=>{document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(mode)},mode);
  const pairs=await page.evaluate(()=>{
   const color=v=>v.match(/[\d.]+/g).slice(0,3).map(Number);
   const lum=rgb=>rgb.map(n=>{n/=255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
   const root=getComputedStyle(document.documentElement);
   const pairs=[['--foreground','--background'],['--muted-foreground','--background'],['--primary-foreground','--primary'],['--sidebar-muted-foreground','--sidebar']];
   return pairs.map(([a,b])=>{
    const colors=[a,b].map(variable=>{const el=document.createElement('span');el.style.setProperty('transition','none','important');el.style.setProperty('color',root.getPropertyValue(variable),'important');document.body.append(el);const rgb=color(getComputedStyle(el).color);el.remove();return rgb});
    const [lo,hi]=colors.map(lum).sort((a,b)=>a-b);
    return{foreground:a,background:b,ratio:(hi+.05)/(lo+.05),values:[root.getPropertyValue(a),root.getPropertyValue(b)]};
   });
  });
  contrast.push({mode,pairs});checks.push({test:mode+' core text contrast',pairs,passed:pairs.every(c=>c.ratio>=4.5)});
 }
 const result={checks,errors};fs.writeFileSync(output+'/theme-smoke.json',JSON.stringify(result,null,2));console.log(JSON.stringify({checks:checks.length,overflow:checks.filter(r=>r.document>r.width),errors,contrast},null,2));await browser.close();process.exitCode=errors.length||checks.some(r=>r.document>r.width||r.passed===false)?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
