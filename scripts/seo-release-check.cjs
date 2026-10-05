/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node release check. */
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const { setup,origin }=require('./design-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});const ctx=await browser.newContext({serviceWorkers:'block'});await setup(ctx,{authenticated:false});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
 for(const route of ['/','/features','/pricing','/demo','/why-vitros','/blog','/login','/signup','/forgot-password','/reset-password','/offline','/blog/fixture-unavailable']){
  const response=await page.goto(origin+route,{waitUntil:'networkidle'});const publicPage=['/','/features','/pricing','/demo','/why-vitros','/blog'].includes(route);
  const metadata=await page.evaluate(()=>({title:document.title,canonical:document.querySelector('link[rel=canonical]')?.href,robots:document.querySelector('meta[name=robots]')?.content,og:document.querySelector('meta[property="og:image"]')?.content,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent))}));
  if(publicPage){assert.equal(new URL(metadata.canonical).href,new URL(route,'https://vitroslabs.com').href);assert.equal(metadata.robots,'index, follow');assert(metadata.og?.includes('/images/product/tissue-culture-dashboard.png'));assert.equal(metadata.h1.length,1)}else{assert(metadata.robots?.includes('noindex'));assert.equal(metadata.canonical,undefined)}
  if(route==='/'){const html=await response.text();assert(html.includes('Every culture.'));assert(html.includes('Connected.'));assert(html.includes('Plant tissue culture software'));assert.equal(metadata.h1[0],'Every culture. Connected.');assert.equal(metadata.schema.length,1);assert(!JSON.stringify(metadata.schema).includes('AggregateOffer'));}
  else assert.equal(metadata.schema.length,0);
  checks.push({route,status:response.status(),...metadata});
 }
 const sitemap=await ctx.request.get(origin+'/sitemap.xml');const sitemapBody=await sitemap.text();assert.equal(sitemap.status(),200);assert(sitemapBody.includes('https://vitroslabs.com/features'));assert(!sitemapBody.includes('/login'));assert(!sitemapBody.includes('/signup'));assert(!sitemapBody.includes('<lastmod>'));
 const robots=await ctx.request.get(origin+'/robots.txt');const robotsBody=await robots.text();assert.equal(robots.status(),200);assert(robotsBody.includes('Sitemap: https://vitroslabs.com/sitemap.xml'));assert(robotsBody.includes('Disallow: /api/'));
 const authenticated=await browser.newContext({serviceWorkers:'block'});await setup(authenticated);const app=await authenticated.newPage();await app.goto(origin,{waitUntil:'networkidle'});await app.getByRole('heading',{name:'Today',exact:true}).waitFor();checks.push({test:'authenticated home remains dashboard',passed:true});await authenticated.close();
 assert.equal(errors.length,0);const output=path.resolve(__dirname,'../docs/seo/release-verification.json');fs.writeFileSync(output,JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,errors,sitemap:sitemapBody,robots:robotsBody},null,2));console.log(JSON.stringify({checks:checks.length,errors,sitemapStatus:sitemap.status(),robotsStatus:robots.status()},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
