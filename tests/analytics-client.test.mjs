import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

function browser(url = 'https://jiangxu.net/') {
  const sent = [];
  let serial = 0;
  const storage = new Map();
  const sandbox = {
    URL, URLSearchParams, Map, Set, Date,
    process: { env: {} },
    location: new URL(url), navigator: { doNotTrack: '0' },
    crypto: { randomUUID: () => `${String(++serial).padStart(18, '0')}-uuid` },
    localStorage: { getItem: key => storage.get(key) },
    document: { referrer: 'https://outside.test/private?secret=abc', querySelector: () => null },
  };
  sandbox.window = sandbox;
  sandbox.window.umami = { track: callback => { const payload = callback({ website: 'test-only', url: sandbox.location.href, title: 'private title' }); const filtered = sandbox.homepageAnalyticsBeforeSend('event', payload); if (filtered) sent.push(filtered); return Promise.resolve(); } };
  const modules = new Map();
  const load = filename => {
    if (modules.has(filename)) return modules.get(filename).exports;
    const compiledModule = { exports: {} };
    modules.set(filename, compiledModule);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const fn = vm.runInNewContext(`(function(require,module,exports){${compiled}\n})`, sandbox);
    fn(relative => load(path.resolve(path.dirname(filename), `${relative}.ts`)), compiledModule, compiledModule.exports);
    return compiledModule.exports;
  };
  const api = load(path.resolve('lib/analytics/client.ts'));
  return { api, sent, sandbox, storage, move: url => { sandbox.location = new URL(url); } };
}

test('开发开关、非生产域名、DNT、作者排除均阻止事件发送', () => {
  for (const mode of ['disabled', 'localhost', 'dnt', 'author']) {
    const b = browser(mode === 'localhost' ? 'http://localhost:3000/' : undefined);
    b.api.configureAnalytics(mode !== 'disabled');
    if (mode === 'dnt') b.sandbox.navigator.doNotTrack = '1';
    if (mode === 'author') b.storage.set('umami.disabled', '1');
    b.api.analyticsReady(); b.api.activatePage(); b.api.trackEvent('contact_click', { channel: 'email' });
    assert.equal(b.sent.length, 0, mode);
  }
});
test('SDK 延迟时缓存发生时页面，手动 PV 与上下文都只报一次', () => {
  const b = browser('https://jiangxu.net/resume?secret=abc');
  b.api.configureAnalytics(true);
  b.api.activatePage(); b.api.activatePage();
  b.api.trackEvent('contact_click', { channel: 'email', email: 'private' });
  b.move('https://jiangxu.net/blog'); b.api.activatePage();
  assert.equal(b.sent.length, 0);
  b.api.analyticsReady();
  assert.equal(b.sent.filter(p => !p.name).length, 2);
  const contact = b.sent.find(p => p.name === 'contact_click');
  assert.equal(contact.url, '/resume');
  assert.equal(contact.data.page_path, '/resume');
  assert.equal(contact.data.email, undefined);
  assert.equal(b.sent[0].referrer, 'https://outside.test');
});
test('前进后退和 BFCache 激活创建独立页面访问，同页调用不重复 PV', () => {
  const b = browser(); b.api.configureAnalytics(true); b.api.analyticsReady();
  b.api.activatePage();
  b.move('https://jiangxu.net/blog'); b.api.activatePage();
  b.move('https://jiangxu.net/'); b.api.activatePage(); b.api.activatePage();
  b.api.activatePage(true);
  const contexts = b.sent.filter(p => p.name === 'page_context');
  assert.equal(contexts.length, 4);
  assert.equal(b.sent.filter(p => !p.name).length, 4);
  assert.equal(new Set(contexts.map(p => p.data.page_view_id)).size, 4);
});
test('未知路径与合法形状的文章 404 都脱敏且不递归', () => {
  for (const pathname of ['/alice@example.com', '/blog/missing']) {
    const b = browser(`https://jiangxu.net${pathname}`);
    b.sandbox.document.querySelector = selector => selector === '[data-analytics-page]' ? { dataset: { analyticsPage: 'not_found' } } : null;
    b.api.configureAnalytics(true); b.api.analyticsReady(); b.api.activatePage();
    b.api.trackEvent('navigation_click', { target_path: '/' });
    assert.equal(b.sent.filter(p => !p.name).length, 1);
    assert.equal(b.sent.find(p => p.name === 'not_found_view').url, '/:unknown');
  }
});
test('曝光按页面去重，真实的多次点击保留', () => {
  const b = browser(); b.api.configureAnalytics(true); b.api.analyticsReady();
  b.api.trackEvent('project_impression', { project_id: 'genbi' }, 'genbi');
  b.api.trackEvent('project_impression', { project_id: 'genbi' }, 'genbi');
  b.api.trackEvent('project_click', { project_id: 'genbi' });
  b.api.trackEvent('project_click', { project_id: 'genbi' });
  assert.equal(b.sent.filter(p => p.name === 'project_impression').length, 1);
  assert.equal(b.sent.filter(p => p.name === 'project_click').length, 2);
});
test('未知/原型事件名不抛错，也不进入载荷', () => {
  const b = browser(); b.api.configureAnalytics(true); b.api.analyticsReady();
  assert.doesNotThrow(() => b.api.trackEvent('__proto__', {}));
  b.api.trackMarkedEvent('constructor', {});
  assert.equal(b.sent.length, 0);
});

test('真实混合大小写文章保留路径，未知文章和内部 referrer 必须按允许表脱敏', () => {
  const b = browser('https://jiangxu.net/blog/eventLoop');
  b.api.configureAnalytics(true, ['/blog/eventLoop']); b.api.analyticsReady(); b.api.activatePage();
  assert.equal(b.sent.find(p => !p.name).url, '/blog/eventLoop');
  assert.equal(b.sent.find(p => p.name === 'page_context').data.article_slug, 'eventLoop');
  assert.equal(b.sandbox.homepageAnalyticsBeforeSend('performance', { url: 'https://jiangxu.net/blog/alice-private-token' }).url, '/:unknown');
  const from404 = browser('https://jiangxu.net/');
  from404.sandbox.document.referrer = 'https://jiangxu.net/blog/alice-private-token?email=secret';
  from404.api.configureAnalytics(true, ['/blog/eventLoop']); from404.api.analyticsReady(); from404.api.activatePage();
  assert.equal(from404.sent.find(p => !p.name).referrer, '/:unknown');
});

test('路由提交前旧观察器查询上下文，不提前产生新页 PV 或混入旧文章', () => {
  const b = browser('https://jiangxu.net/blog/eventLoop');
  b.api.configureAnalytics(true, ['/blog/eventLoop', '/blog/browserRendering']); b.api.analyticsReady(); b.api.activatePage();
  b.move('https://jiangxu.net/blog/browserRendering');
  assert.equal(b.api.getPageContext(), undefined);
  assert.equal(b.sent.filter(p => !p.name).length, 1);
  b.api.activatePage();
  assert.equal(b.sent.filter(p => !p.name).length, 2);
  assert.equal(b.sent.filter(p => p.name === 'page_context').at(-1).data.article_slug, 'browserRendering');
});

test('曝光达到软预算后，书籍展开与简历版本切换仍可上报', () => {
  const b = browser(); b.api.configureAnalytics(true); b.api.analyticsReady(); b.api.activatePage();
  for (let i=0;i<160;i++) b.api.trackEvent('section_view', { section_id: `section-${i}` }, `${i}`);
  b.api.trackEvent('book_open', { book_id: 'to-live', stage_id: 'high-school' });
  b.api.trackEvent('resume_version_change', { from_version: 'old', to_version: 'new' });
  assert.equal(b.sent.filter(p=>p.name==='book_open').length,1);
  assert.equal(b.sent.filter(p=>p.name==='resume_version_change').length,1);
});
