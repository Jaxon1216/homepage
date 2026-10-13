/* eslint-disable @typescript-eslint/no-require-imports -- Standalone runner supports bundled Playwright via NODE_PATH. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const script = process.env.UMAMI_SCRIPT_PATH
    ? fs.readFileSync(process.env.UMAMI_SCRIPT_PATH, 'utf8')
    : await (await fetch('https://umami.jiangxu.net/script.js')).text();
  const localOrigin = process.env.ANALYTICS_SMOKE_ORIGIN ?? 'http://127.0.0.1:3107';
  const browser = await chromium.launch({headless: true, ...(process.env.CHROME_EXECUTABLE ? {executablePath: process.env.CHROME_EXECUTABLE} : {})});
  const context = await browser.newContext({viewport: {width: 1400,height: 950}});
  const events = [], errors = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'umami.jiangxu.net' && url.pathname === '/script.js') return route.fulfill({contentType:'application/javascript',body:script});
    if (url.hostname === 'umami.jiangxu.net' && url.pathname === '/api/send') {
      events.push(JSON.parse(route.request().postData()));
      return route.fulfill({status:200,contentType:'application/json',body:'{"cache":"test-only"}',headers:{'Access-Control-Allow-Origin':'*'}});
    }
    if (url.hostname === 'jiangxu.net' && !url.pathname.startsWith('/_vercel/')) {
      const response = await route.fetch({url:`${localOrigin}${url.pathname}${url.search}`});
      return route.fulfill({response});
    }
    // No request from this smoke test is allowed to reach production services.
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const named = name => events.filter(e => e.type === 'event' && e.payload.name === name);
  const pvs = () => events.filter(e => e.type === 'event' && !e.payload.name);
  await page.goto('https://jiangxu.net/?utm_source=github&token=secret', {waitUntil:'networkidle'});
  assert.equal(pvs().length,1,'initial PV');
  assert.equal(named('page_context').length,0,'retired context event is not sent');
  assert.equal(pvs()[0].payload.url,'/?utm_source=github');
  const project = page.locator('[data-analytics-view="project_impression"]').first();
  await project.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  assert.ok(named('project_impression').length>=1,'project exposed');
  await page.locator('a[data-analytics-click="project_click"]').first().click();
  await page.waitForTimeout(200);
  assert.equal(named('project_click').length,1);
  assert.equal(named('outbound_click').length,0,'no duplicate generic outbound');
  await page.locator('footer a[data-analytics-click="friend_link_click"]').first().click();
  await page.waitForTimeout(200);
  assert.equal(named('friend_link_click').length,1);
  assert.equal(named('friend_link_click')[0].payload.data.target_id,'woleigefou.xyz');
  assert.equal(named('friend_link_click')[0].payload.data.target_host,'woleigefou.xyz','friend properties remain unchanged');
  await page.locator('header a[href="/blog"]').click();
  await page.waitForURL('**/blog'); await page.waitForTimeout(700);
  assert.equal(pvs().length,2,'SPA PV');
  await page.locator('button').filter({hasText:/^agent$/}).click();
  await page.waitForTimeout(600);
  assert.equal(named('blog_filter_change').length,1);
  assert.equal(pvs().length,2,'filter does not add PV');
  const card = page.locator('a[data-analytics-click="article_open_click"]').first();
  await card.click(); await page.waitForURL('**/blog/*'); await page.waitForTimeout(600);
  assert.equal(named('article_open_click').length,1);
  assert.equal(pvs().length,3,'article PV');
  const articlePath = new URL(page.url()).pathname;
  await page.locator('#post-content').scrollIntoViewIfNeeded(); await page.waitForTimeout(6200);
  assert.equal(named('article_read_start').length,1,'article active reading');
  const image = page.locator('#post-content img[role="button"]').first();
  if (await image.count()) {
    await image.click(); await page.waitForTimeout(200);
    await page.getByRole('dialog').waitFor({state:'visible'});
    assert.equal(named('media_open').length,0,'image still opens without a media event');
    await page.keyboard.press('Escape');
  }
  await page.goBack(); await page.waitForTimeout(700);
  assert.equal(new URL(page.url()).pathname,'/blog');
  assert.equal(pvs().length,4,'browser back PV');
  await page.locator('header a[href="/resume"]').click(); await page.waitForURL('**/resume'); await page.waitForTimeout(700);
  const resumeViewsBefore = named('resume_version_view').length;
  assert.ok(resumeViewsBefore>=1,'initial resume version');
  const switchButton = page.locator('main .sm\\:w-48 button').nth(1);
  if (await switchButton.count()) {
    await switchButton.click(); await page.waitForTimeout(900);
    assert.equal(named('resume_version_change').length,1);
    assert.ok(named('resume_version_view').length>resumeViewsBefore,'new resume version');
  }
  await page.locator('a[data-analytics-click="contact_click"][href^="mailto:"]').first().click(); await page.waitForTimeout(200);
  assert.ok(named('contact_click').length>=1);
  await page.locator('header a[href="/inner-world"]').click(); await page.waitForURL('**/inner-world'); await page.waitForTimeout(700);
  const book = page.locator('.book-spine').first();
  await book.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200); await book.click(); await page.waitForTimeout(400);
  assert.equal(named('book_open').length,1);
  // Keep mixed-case real slugs intact, and restart reading after same-path error recovery.
  await page.goto('https://jiangxu.net/blog/eventLoop', {waitUntil:'networkidle'});
  assert.equal(pvs().at(-1).payload.url,'/blog/eventLoop');
  const beforeError = pvs().length;
  await page.evaluate(() => { const main=document.querySelector('main'); main.dataset.analyticsPage='error'; main.dataset.analyticsError='route_render_error'; });
  await page.waitForTimeout(250);
  assert.equal(named('app_error').length,1);
  await page.evaluate(() => { const main=document.querySelector('main'); delete main.dataset.analyticsPage; delete main.dataset.analyticsError; });
  await page.waitForTimeout(250);
  assert.equal(pvs().length,beforeError+2,'error and recovery retain independent native PVs');
  const beforeReading = named('article_read_start').length;
  await page.locator('#post-content').scrollIntoViewIfNeeded();
  await page.waitForTimeout(6200);
  assert.equal(named('article_read_start').length,beforeReading+1,'reading restarts after recovery');
  // A marker whose properties change during its stability window must restart that window.
  await page.evaluate(() => {
    const marker=document.createElement('div'); marker.id='analytics-regression';
    marker.style.cssText='position:fixed;top:120px;left:100px;width:100px;height:100px;background:white';
    marker.dataset.analyticsView='project_impression'; marker.dataset.analyticsViewProps=JSON.stringify({project_id:'test-before',category:'test'});
    document.body.append(marker);
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => { document.getElementById('analytics-regression').dataset.analyticsViewProps=JSON.stringify({project_id:'test-after',category:'test'}); });
  await page.waitForTimeout(1250);
  assert.equal(named('project_impression').filter(e=>e.payload.data.project_id==='test-after').length,1);
  await page.evaluate(() => document.getElementById('analytics-regression').remove());
  await page.goto('https://jiangxu.net/blog/missing?email=secret', {waitUntil:'networkidle'});
  assert.equal(named('not_found_view').length,1);
  assert.equal(named('not_found_view')[0].payload.url,'/:unknown');
  const beforeRestore = pvs().length;
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true})));
  await page.waitForTimeout(250);
  assert.equal(pvs().length,beforeRestore+1,'persisted pageshow activates once');
  await page.setViewportSize({width:390,height:844});
  await page.goto('https://jiangxu.net/', {waitUntil:'networkidle'});
  await page.locator('button[aria-label="Toggle menu"]').click();
  const beforeMobileNavigation = pvs().length;
  await page.locator('header a[href="/blog"]:visible').click();
  await page.waitForURL('**/blog'); await page.waitForTimeout(700);
  assert.equal(pvs().length,beforeMobileNavigation+1,'mobile navigation retains one native PV');
  const allowed = new Set(['page_engaged','project_impression','project_click','contact_click','friend_link_click','outbound_click','blog_filter_change','article_open_click','article_read_start','article_read_qualified','resume_version_view','resume_version_change','book_open','not_found_view','app_error']);
  assert.ok(events.every(e=>!e.payload.name || allowed.has(e.payload.name)),'only the 15 retained default events are sent');
  assert.ok(events.filter(e=>e.payload.name).every(e=>e.payload.data.schema_version===2));
  assert.ok(!JSON.stringify(events).includes('token=secret'));
  assert.deepEqual(errors,[],'no runtime JS errors');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  const beforeExcluded = events.length;
  const excluded = await context.newPage();
  await excluded.addInitScript(() => localStorage.setItem('umami.disabled','1'));
  await excluded.goto('https://jiangxu.net/', {waitUntil:'networkidle'});
  await excluded.waitForTimeout(1100);
  assert.equal(events.length,beforeExcluded,'author exclusion sends nothing');
  await excluded.close();
  console.log(JSON.stringify({pv:pvs().length,eventCounts:Object.fromEntries([...new Set(events.map(e=>e.payload.name).filter(Boolean))].map(name=>[name,named(name).length])),articlePath,errors},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
