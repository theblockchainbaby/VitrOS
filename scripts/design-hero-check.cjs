const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setup, origin } = require('./design-fixtures.cjs');

(async () => {
  const output = path.resolve(__dirname, '../docs/design-verification/hero');
  fs.mkdirSync(output, { recursive: true });
  const checks = [];

  for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch({ headless: true });
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ serviceWorkers: 'block', colorScheme: theme, reducedMotion: 'reduce' });
      await setup(context, { authenticated: false });
      await context.addInitScript(value => localStorage.setItem('theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const hero = page.locator('#physical-record');

      for (const width of [320, 375, 414, 768, 1280, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        // Navigate at each size so WebKit's media queries and viewport units
        // settle together before measurements and visual evidence are captured.
        await page.goto(origin, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await hero.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('h1').textContent(), 'Every culture. Connected.');
        assert.equal(await page.locator('#physical-record').count(), 1);
        const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, headlineSize: getComputedStyle(document.querySelector('h1')).fontSize }));
        assert(geometry.document <= geometry.viewport);
        const images = await hero.locator('img').evaluateAll(elements => elements.map(image => ({ width: image.naturalWidth, complete: image.complete })));
        assert.equal(images.length, 3);
        assert(images.every(image => image.complete && image.width > 0));
        await hero.getByText('AI photo illustration', { exact: true }).waitFor();
        await hero.getByText('Actual VitrOS screens', { exact: false }).waitFor();
        checks.push({ engine, theme, width, ...geometry, images: images.length, passed: true });
        if ([375, 1440].includes(width)) {
          await page.screenshot({ path: `${output}/${engine}-${theme}-${width}.png` });
        }
      }

      const screenLinks = hero.getByRole('link', { name: /Inspect the full VitrOS/ });
      assert.equal(await screenLinks.count(), 2);
      for (const link of await screenLinks.all()) {
        await link.focus();
        const opened = page.waitForEvent('popup');
        await page.keyboard.press('Enter');
        const popup = await opened;
        await popup.waitForLoadState();
        assert(popup.url().includes('/images/product/'));
        await popup.close();
      }
      await hero.getByRole('link', { name: 'Start free', exact: true }).click();
      await page.waitForURL('**/signup');
      await page.goto(origin, { waitUntil: 'networkidle' });
      await hero.getByRole('link', { name: 'Explore the demo', exact: true }).click();
      await page.waitForURL('**/demo');
      assert.equal(errors.length, 0);
      checks.push({ engine, theme, keyboardImageLinks: 2, signupNavigation: true, demoNavigation: true, pageErrors: errors });
      await context.close();
    }
    await browser.close();
  }

  fs.writeFileSync(`${output}/verification.json`, JSON.stringify({ checkedAt: new Date().toISOString(), origin, checks }, null, 2));
  console.log(JSON.stringify({ responsiveChecks: checks.filter(check => check.width).length, interactionGroups: checks.filter(check => check.keyboardImageLinks).length, errors: 0 }));
})().catch(error => { console.error(error); process.exit(1); });
