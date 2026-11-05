import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

function setupPosts(t) {
  const filename = path.resolve('lib/posts.ts');
  const loaded = new Module(filename);
  loaded.paths = [path.resolve('node_modules')];
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-posts-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, 'content/posts');
  fs.mkdirSync(directory, { recursive: true });
  t.mock.method(process, 'cwd', () => root);
  loaded._compile(compiled, filename);

  function writePost(status) {
    const state = status === undefined ? '' : `status: ${status}\n`;
    fs.writeFileSync(path.join(directory, 'example.md'), `---\n${state}tags: [agent]\n---\nExample body\n`);
  }
  return { ...loaded.exports, writePost };
}

test('文章发布和撤回时，列表、标签与详情一起切换', (t) => {
  const { writePost, getAllPosts, getAllTags, getPostBySlug } = setupPosts(t);

  function assertHidden() {
    assert.deepEqual(getAllPosts(), []);
    assert.deepEqual(getAllTags(), []);
    assert.equal(getPostBySlug('example'), null);
  }

  writePost();
  assertHidden();
  writePost('draft');
  assertHidden();
  writePost('published');
  assert.deepEqual(getAllPosts().map((post) => post.slug), ['example']);
  assert.deepEqual(getAllTags(), ['agent']);
  assert.equal(getPostBySlug('example').content.trim(), 'Example body');
  writePost('draft');
  assertHidden();
});

test('拼写错误的状态在列表与详情读取时均报错', (t) => {
  const { writePost, getAllPosts, getPostBySlug } = setupPosts(t);
  writePost('publised');
  assert.throws(() => getAllPosts(), /publised/);
  assert.throws(() => getPostBySlug('example'), /publised/);
});
