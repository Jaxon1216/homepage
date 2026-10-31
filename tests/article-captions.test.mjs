import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import ts from 'typescript';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { renderToStaticMarkup } from 'react-dom/server';
import * as jsxRuntime from 'react/jsx-runtime';

function loadPlugin(relativePath, name) {
  const filename = path.resolve(relativePath);
  const loaded = new Module(filename);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return loaded.exports[name];
}

const rehypeCodeMeta = loadPlugin('lib/rehype-code-meta.ts', 'rehypeCodeMeta');
const rehypeMermaid = loadPlugin('lib/rehype-mermaid.ts', 'rehypeMermaid');
const rehypeArticleCaptions = loadPlugin('lib/rehype-article-captions.ts', 'rehypeArticleCaptions');

async function article(source) {
  let tree;
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeMeta)
    .use(rehypeRaw)
    .use(() => rehypeCodeMeta({ restore: true }))
    .use(rehypeMermaid)
    .use(rehypePrettyCode, { theme: { dark: 'one-dark-pro', light: 'github-light' }, keepBackground: false })
    .use(rehypeArticleCaptions)
    .use(() => (value) => { tree = structuredClone(value); })
    .use(rehypeReact, jsxRuntime)
    .process(source);
  const compiled = result.result;
  return { tree, compiled };
}

function name(node) {
  return node.tagName ?? node.name;
}

function text(node) {
  return node.value ?? (node.children ?? []).map(text).join('');
}

function findAll(node, predicate) {
  return [
    ...(predicate(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) => findAll(child, predicate)),
  ];
}

function captions(tree) {
  return findAll(tree, (node) => name(node) === 'figcaption' ||
    (name(node) === 'div' && node.properties?.['data-caption'])).map((node) =>
    name(node) === 'figcaption' ? text(node) : node.properties['data-caption']);
}

test('Markdown、Mermaid 与 HTML 图片 按源码顺序编号，title 优先于 alt', async () => {
  const source = [
    '![第一张备用说明](/first.png "第一张正式图题")',
    '',
    '```mermaid title="模块执行流程"',
    'graph TD',
    'A-->B',
    '```',
    '',
    '<img src="/third.png" alt="第三张说明" width="1200" loading="lazy" />',
    '',
    '<img src="/fourth.png" title="第四张图题" alt="第四张备用说明" />',
  ].join('\n');
  const { tree, compiled } = await article(source);
  assert.deepEqual(captions(tree), [
    '图 1\u3000第一张正式图题', '图 2\u3000模块执行流程',
    '图 3\u3000第三张说明', '图 4\u3000第四张图题',
  ]);
  const mermaid = findAll(tree, (node) => name(node) === 'div' && node.properties?.['data-caption'])[0];
  assert.equal(text(mermaid), 'graph TD\nA-->B\n');

  const html = renderToStaticMarkup(compiled);
  assert.match(html, /<figure class="article-figure">/);
  assert.match(html, /src="\/third.png"[^>]*width="1200"[^>]*loading="lazy"/);
  assert.match(html, /<figcaption>图 4　第四张图题<\/figcaption>/);
});

test('图片从混合段落提升为 figure，保留文字、图片链接并避免 p 内嵌 figure', async () => {
  const { tree, compiled } = await article('前文 **重点 [![链接图片](/linked.png)](https://example.com)** 后文。');
  const paragraphs = findAll(tree, (node) => name(node) === 'p');
  assert.deepEqual(paragraphs.map(text), ['前文 重点 ', ' 后文。']);
  for (const paragraph of paragraphs) {
    assert.equal(findAll(paragraph, (node) => name(node) === 'figure').length, 0);
  }
  const figure = findAll(tree, (node) => name(node) === 'figure')[0];
  assert.equal(findAll(figure, (node) => name(node) === 'a')[0].properties.href, 'https://example.com');
  assert.deepEqual(captions(tree), ['图 1\u3000链接图片']);
  const html = renderToStaticMarkup(compiled);
  assert.match(html, /<\/p><figure class="article-figure">/);
  assert.match(html, /<a href="https:\/\/example.com"><img/);
});

test('表使用独立编号，只消费紧邻的表题段落，不根据章节猜标题', async () => {
  const table = '| 名称 | 值 |\n| --- | --- |\n| A | 1 |';
  const { tree } = await article([
    '表：**状态对照**', '', table, '',
    '# 不能当表题的章节', '', table, '',
    '表：这段应保留', '', '间隔的正文。', '', table,
  ].join('\n'));
  assert.deepEqual(findAll(tree, (node) => name(node) === 'caption').map(text), [
    '表 1\u3000状态对照', '表 2', '表 3',
  ]);
  const paragraphs = findAll(tree, (node) => name(node) === 'p').map(text);
  assert.equal(paragraphs.includes('表：状态对照'), false);
  assert.equal(paragraphs.includes('表：这段应保留'), true);
  assert.equal(paragraphs.includes('间隔的正文。'), true);
  for (const current of findAll(tree, (node) => name(node) === 'table')) {
    assert.equal(name(current.children[0]), 'caption');
  }
});

test('保留既有 figure/figcaption 与表 caption，不改变 pretty-code 的代码图', async () => {
  const { tree } = await article([
    '<figure><img src="/existing.png" alt="已有图" /><figcaption>作者自己的图题</figcaption></figure>',
    '',
    '```tsx title="代码示例"',
    'const image = <img src="/in-code.png" alt="不是正文图片" />;',
    '```',
    '',
    '![后续图片](/next.png)',
    '',
    '<table><caption>作者自己的表题</caption><tbody><tr><td>A</td></tr></tbody></table>',
    '',
    '| a |\n| --- |\n| b |',
  ].join('\n'));
  assert.deepEqual(captions(tree), ['作者自己的图题', '代码示例', '图 2\u3000后续图片']);
  const figures = findAll(tree, (node) => name(node) === 'figure');
  assert.equal(figures.length, 3);
  assert.equal(figures.some((node) => node.properties &&
    Object.hasOwn(node.properties, 'data-rehype-pretty-code-figure')), true);
  for (const figure of figures) {
    assert.equal(findAll(figure, (node) => node !== figure && name(node) === 'figure').length, 0);
  }
  assert.deepEqual(findAll(tree, (node) => name(node) === 'caption').map(text), [
    '作者自己的表题', '表 2',
  ]);
});

test('手写 figure 中的 Mermaid 不再传自动 caption，避免客户端嵌套 figure', async () => {
  const { tree } = await article([
    '<figure>', '',
    '```mermaid title="已有容器的图"', 'graph TD', 'A-->B', '```', '',
    '<figcaption>作者图题</figcaption>', '</figure>',
  ].join('\n'));
  const mermaid = findAll(tree, (node) => name(node) === 'div' &&
    node.properties?.className?.includes('__mermaid__'))[0];
  assert.ok(mermaid);
  assert.equal(mermaid.properties['data-caption'], undefined);
  assert.equal(findAll(tree, (node) => name(node) === 'figure').length, 1);
});

test('同一 transformer 处理多篇文章时独立计数，无标题图只显示编号', () => {
  const transform = rehypeArticleCaptions();
  const imageTree = () => ({ type: 'root', children: [{
    type: 'element', tagName: 'p', properties: {}, children: [{
      type: 'element', tagName: 'img', properties: { src: '/empty.png', alt: '' }, children: [],
    }],
  }] });
  const first = imageTree();
  const second = imageTree();
  transform(first);
  transform(second);
  assert.deepEqual(captions(first), ['图 1']);
  assert.deepEqual(captions(second), ['图 1']);
});
