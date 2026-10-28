import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Edit model.json to change the teaching data; edit these helpers for visual style.
// Layouts intentionally support the small examples documented in README.md.
const directory = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(await readFile(path.join(directory, 'model.json'), 'utf8'));
const outputDirectory = path.resolve(directory, '../../public/images/mysql');
const colors = {
  ink: '#172B42', muted: '#53677C', line: '#AABACA', panel: '#F3F6FA',
  blue: '#145DA8', blueLight: '#E7F0FC', amber: '#936000', amberLight: '#FFF1CC',
  white: '#FFFFFF', soft: '#E2E8F0',
};
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const product = (id) => model.products.find((row) => row.id === id);

function rect(x, y, width, height, { fill = colors.white, stroke = colors.line, radius = 12, strokeWidth = 1.5 } = {}) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function text(x, y, value, { size = 22, color = colors.ink, weight = 400, anchor = 'start', mono = false } = {}) {
  const font = mono ? 'ui-monospace, SFMono-Regular, Consolas, monospace' : 'PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif';
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${font}">${escape(value)}</text>`;
}

function line(points, { color = colors.line, width = 2, dashed = false, arrow = false, both = false } = {}) {
  const marker = color === colors.blue ? 'blue' : color === colors.amber ? 'amber' : 'gray';
  return `<polyline points="${points.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ' stroke-dasharray="7 6"' : ''}${arrow || both ? ` marker-end="url(#arrow-${marker})"` : ''}${both ? ` marker-start="url(#arrow-${marker})"` : ''}/>`;
}

function label(x, y, value, width = 160, active = false) {
  return rect(x, y, width, 36, { fill: active ? colors.blueLight : colors.panel, stroke: 'none', radius: 18 })
    + text(x + width / 2, y + 25, value, { size: 18, color: active ? colors.blue : colors.muted, weight: 600, anchor: 'middle' });
}

function svg(title, description, height, contents) {
  const markers = ['gray', 'blue', 'amber'].map((name) => `<marker id="arrow-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="${name === 'gray' ? colors.line : colors[name]}" stroke-width="1.7"/></marker>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="title desc">\n<title id="title">${escape(title)}</title>\n<desc id="desc">${escape(description)}</desc>\n<defs>${markers}</defs>\n${rect(0, 0, 1000, height, { fill: colors.white, stroke: 'none', radius: 0 })}\n${text(40, 49, title, { size: 30, weight: 700 })}\n${contents.join('\n')}\n</svg>\n`;
}

// A compact row template shared by the table and leaf-page diagrams.
function recordRow(x, y, width, id, { selected = false, detail = false } = {}) {
  const row = product(id);
  const fill = selected ? colors.blueLight : colors.white;
  return rect(x, y, width, 42, { fill, stroke: selected ? colors.blue : colors.soft, radius: 4, strokeWidth: selected ? 2 : 1 })
    + text(x + 18, y + 28, String(row.id), { size: 21, weight: selected ? 700 : 400, mono: true })
    + text(x + (detail ? 72 : 58), y + 28, row.name, { size: 21, weight: selected ? 600 : 400 });
}

function leafPage(x, y, ids, { width = 260, active = false, heading = '叶子页' } = {}) {
  return rect(x, y, width, 264, { fill: colors.panel, stroke: active ? colors.blue : colors.line, strokeWidth: active ? 2.5 : 1.5 })
    + text(x + 18, y + 34, heading, { size: 22, weight: 600, color: active ? colors.blue : colors.ink })
    + text(x + 18, y + 67, 'id', { size: 17, color: colors.muted, mono: true })
    + text(x + 58, y + 67, 'name（其他列省略）', { size: 17, color: colors.muted })
    + ids.map((id, index) => recordRow(x + 10, y + 82 + index * 43, width - 20, id, { selected: active && id === model.lookupId })).join('');
}

function tableAndPage() {
  const contents = [
    text(40, 86, 'SQL 看到库、表、行；存储引擎按页组织和读取数据。', { size: 21, color: colors.muted }),
    label(45, 118, `逻辑层：${model.table} 表`, 250),
    label(600, 118, '物理组织：InnoDB 索引页', 340, true),
    rect(45, 172, 445, 274, { fill: colors.panel }),
    text(64, 207, 'id', { size: 19, weight: 600, mono: true }),
    text(126, 207, 'name', { size: 19, weight: 600, mono: true }),
    text(300, 207, 'category', { size: 19, weight: 600, mono: true }),
    rect(600, 172, 350, 274, { fill: colors.panel, stroke: colors.blue }),
    text(620, 207, '一页中容纳多条记录', { size: 23, weight: 600 }),
    line([[510, 308], [578, 308]], { color: colors.blue, width: 3, arrow: true }),
    text(544, 276, '组织', { size: 18, anchor: 'middle', color: colors.blue }),
    text(544, 349, '成页', { size: 18, anchor: 'middle', color: colors.blue }),
  ];
  [1, 2, 6, 10].forEach((id, index) => {
    const row = product(id);
    const y = 226 + index * 50;
    contents.push(rect(57, y, 421, 43, { fill: id === 6 ? colors.blueLight : colors.white, stroke: 'none', radius: 5 }));
    contents.push(text(72, y + 29, id, { size: 20, mono: true }));
    contents.push(text(126, y + 29, row.name, { size: 20 }));
    contents.push(text(300, y + 29, row.category, { size: 20 }));
  });
  ['页头等管理信息', '行记录：1、2、3、……', '页目录等辅助结构'].forEach((value, index) => {
    const y = 228 + index * 64;
    contents.push(rect(618, y, 314, 52, { fill: index === 1 ? colors.blueLight : colors.white, stroke: colors.soft, radius: 6 }));
    contents.push(text(775, y + 33, value, { size: 21, anchor: 'middle', color: index === 1 ? colors.blue : colors.ink }));
  });
  contents.push(
    text(45, 484, '左侧只展示部分行与列；右侧只表达组织关系，并非真实字节布局。', { size: 19, color: colors.muted }),
    text(45, 520, 'InnoDB 默认页大小为 16 KiB；页能放多少行，取决于行大小等因素。', { size: 19, color: colors.muted }),
  );
  return svg('表是逻辑视图，页是存储单位', '同一张商品表在逻辑上有行和列，在 InnoDB 中组织到索引页里；页包含管理信息、行记录和页目录，默认页大小为 16 KiB。', 553, contents);
}

function pageDirectory() {
  const contents = [
    text(40, 88, `在一页里找 id = ${model.lookupId}：先缩小到一组，再沿记录链查找。`, { size: 21, color: colors.muted }),
    rect(40, 124, 920, 437, { fill: colors.panel, stroke: colors.soft, radius: 18 }),
    text(67, 161, '页目录（片段）', { size: 22, weight: 600 }),
    text(325, 161, '记录按主键串联（非物理相邻）', { size: 22, weight: 600 }),
    rect(62, 185, 181, 336, { fill: colors.white, stroke: colors.line }),
    text(80, 212, '① 二分目录槽', { size: 19, color: colors.amber, weight: 600 }),
    rect(78, 236, 149, 54, { fill: colors.amberLight, stroke: colors.amber, radius: 6 }),
    text(152, 270, '槽 A → 4', { size: 22, weight: 600, anchor: 'middle' }),
    rect(78, 412, 149, 54, { fill: colors.amberLight, stroke: colors.amber, radius: 6 }),
    text(152, 446, '槽 B → 8', { size: 22, weight: 600, anchor: 'middle' }),
    text(152, 336, '4 < 6 ≤ 8', { size: 22, weight: 700, anchor: 'middle', color: colors.amber }),
    text(152, 367, '目标在第二组', { size: 18, anchor: 'middle', color: colors.muted }),
    text(325, 203, '第一组', { size: 19, color: colors.muted }),
    text(325, 380, '第二组', { size: 19, color: colors.muted }),
    line([[227, 263], [274, 263], [274, 216], [820, 216], [820, 235]], { color: colors.amber, width: 2, dashed: true, arrow: true }),
    line([[227, 439], [274, 439], [274, 515], [820, 515], [820, 467]], { color: colors.amber, width: 2, dashed: true, arrow: true }),
    line([[820, 291], [820, 333], [385, 333], [385, 412]], { color: colors.blue, width: 3, arrow: true }),
    text(603, 323, '② 从 4 的下一条开始', { size: 20, color: colors.blue, anchor: 'middle', weight: 600 }),
  ];
  model.directoryGroups.forEach((ids, groupIndex) => {
    ids.forEach((id, index) => {
      const x = 325 + index * 145;
      const y = 236 + groupIndex * 177;
      const active = id === model.lookupId;
      contents.push(rect(x, y, 120, 54, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.line, strokeWidth: active ? 2.5 : 1.5, radius: 7 }));
      contents.push(text(x + 60, y + 35, `id = ${id}`, { size: 23, anchor: 'middle', weight: active ? 700 : 400, color: active ? colors.blue : colors.ink }));
      if (index < ids.length - 1) contents.push(line([[x + 120, y + 27], [x + 142, y + 27]], { color: id === model.lookupId - 1 ? colors.blue : colors.line, width: id === model.lookupId - 1 ? 3 : 2, arrow: true }));
    });
  });
  contents.push(
    text(530, 497, '③ 5 → 6，找到记录', { size: 21, color: colors.blue, anchor: 'middle', weight: 600 }),
    text(40, 600, '目录槽指向各组末尾的记录；箭头表示引用关系，不是磁盘地址连续。', { size: 20, color: colors.muted }),
    text(40, 634, '仅画页中间的两个普通组；省略 infimum、supremum、首尾槽及其余记录。', { size: 19, color: colors.muted }),
  );
  return svg('页目录：先找组，再找行', '查询 id 等于 6。页目录槽 A 指向组末记录 4，槽 B 指向组末记录 8，二分目录确定 4 小于 6 小于等于 8，然后从 4 的下一条记录 5 开始顺链走到 6。仅展示页的中间片段。', 665, contents);
}

function primaryTree() {
  const contents = [
    text(40, 88, `查询 id = ${model.lookupId}：上层指路，叶子页保存行记录。`, { size: 21, color: colors.muted }),
    label(370, 112, '非叶子页：键值 + 子页引用', 330),
    rect(235, 168, 530, 91, { fill: colors.panel }),
  ];
  const rootCenters = [325, 500, 675];
  model.leafGroups.forEach((ids, index) => {
    const x = 245 + index * 175;
    const active = ids.includes(model.lookupId);
    contents.push(rect(x, 178, 160, 71, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.soft, radius: 7, strokeWidth: active ? 2 : 1 }));
    contents.push(text(x + 80, 208, `下界 ${ids[0]}`, { size: 22, anchor: 'middle', weight: 600, color: active ? colors.blue : colors.ink }));
    contents.push(text(x + 80, 235, `指向页 ${String.fromCharCode(65 + index)}`, { size: 17, anchor: 'middle', color: colors.muted }));
    const leafCenter = 170 + index * 330;
    contents.push(line([[rootCenters[index], 259], [rootCenters[index], 292], [leafCenter, 292], [leafCenter, 335]], { color: active ? colors.blue : colors.line, width: active ? 3 : 2, arrow: true }));
    contents.push(leafPage(40 + index * 330, 338, ids, { active, heading: `叶子页 ${String.fromCharCode(65 + index)}` }));
  });
  contents.push(
    text(525, 316, '5 ≤ 6 < 9，进入页 B', { size: 19, color: colors.blue, weight: 600 }),
    line([[302, 567], [367, 567]], { color: colors.line, width: 2, both: true }),
    line([[632, 567], [697, 567]], { color: colors.line, width: 2, both: true }),
    text(500, 637, '叶子页按键值顺序双向连接，方便继续扫描', { size: 20, anchor: 'middle', color: colors.muted }),
    text(40, 678, '人为画成每页 4 行以展示分支；真实的 12 行通常不需要这 3 个叶子页。', { size: 18, color: colors.muted }),
    text(40, 707, '导航键简化表示；省略最左项最小标志、内部格式及页外存储。', { size: 18, color: colors.muted }),
  );
  return svg('B+ 树：从目录页走到数据页', '两层 B+ 树的根页含下界 1、5、9 和子页引用。查找 id 6 时选择下界 5 的页 B，在该叶子页查找 Keyboard 的行记录。三个叶子页按主键顺序双向连接。每页四行是人为教学假设。', 740, contents);
}

function secondaryLookup() {
  const lookup = product(model.lookupId);
  const matches = model.products.filter((row) => row[model.secondaryColumn] === model.secondaryValue);
  const contents = [
    text(40, 88, `假设走 ${model.secondaryColumn} 索引：找 ${model.secondaryValue} 商品，并取得 name、price。`, { size: 21, color: colors.muted }),
    label(40, 119, '① 找到二级索引中的条目', 340),
    rect(40, 172, 350, 284, { fill: colors.panel }),
    text(64, 207, 'category', { size: 19, weight: 600, mono: true }),
    text(285, 207, '主键 id', { size: 19, weight: 600 }),
  ];
  matches.forEach((row, index) => {
    const y = 226 + index * 65;
    const active = row.id === model.lookupId;
    contents.push(rect(57, y, 316, 51, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.soft, radius: 6, strokeWidth: active ? 2 : 1 }));
    contents.push(text(76, y + 33, row.category, { size: 23, color: active ? colors.blue : colors.ink }));
    contents.push(text(309, y + 33, row.id, { size: 23, anchor: 'middle', weight: active ? 700 : 400, color: active ? colors.blue : colors.ink, mono: true }));
  });
  contents.push(
    text(215, 485, '条目 = 索引列值 + 主键值', { size: 20, anchor: 'middle', color: colors.muted }),
    label(550, 119, '② 拿主键再次查聚簇索引', 400, true),
    line([[391, 317], [490, 317], [490, 216], [548, 216]], { color: colors.blue, width: 3, arrow: true }),
    text(441, 347, `id = ${lookup.id}`, { size: 20, anchor: 'middle', color: colors.blue, weight: 600, mono: true }),
    rect(554, 174, 396, 85, { fill: colors.panel, stroke: colors.blue }),
    text(752, 207, '主键树的上层', { size: 21, anchor: 'middle', weight: 600 }),
    text(752, 239, '1       5       9', { size: 24, anchor: 'middle', mono: true, color: colors.blue }),
    line([[752, 261], [752, 306]], { color: colors.blue, width: 3, arrow: true }),
    rect(554, 310, 396, 186, { fill: colors.blueLight, stroke: colors.blue, strokeWidth: 2 }),
    text(576, 347, `叶子页中的 id = ${lookup.id}`, { size: 23, weight: 700, color: colors.blue }),
    text(576, 389, `name   ${lookup.name}`, { size: 21, mono: true }),
    text(576, 427, `price  ${lookup.price}`, { size: 21, mono: true }),
    text(576, 465, `stock  ${lookup.stock}`, { size: 21, mono: true }),
    text(40, 542, `这张图只展开 id = ${lookup.id} 的一次回表；另外两条匹配记录也要取得所需列。`, { size: 20, color: colors.muted }),
    text(40, 578, '二级索引里保存的是主键值，不是行的磁盘地址。', { size: 20, color: colors.muted }),
    text(40, 614, '如果所需列都能从这个二级索引取得，通常可避免这一步回表。', { size: 20, color: colors.muted }),
  );
  return svg('回表：拿到主键，再找行记录', 'category 二级索引包含 office 与主键 2、6、10。示意展开主键 6 的一次回表，在聚簇索引中找到 Keyboard、价格 199.00、库存 15。其他匹配记录同样需要取得查询所需列。', 650, contents);
}

if (model.leafGroups.length !== 3 || model.leafGroups.some((ids) => ids.length !== 4)
  || model.directoryGroups.length !== 2 || model.directoryGroups.some((ids) => ids.length !== 4)) {
  throw new Error('The teaching layouts require 3 leaf groups × 4 rows and 2 directory groups × 4 rows.');
}
if (!product(model.lookupId) || !model.leafGroups.flat().every((id) => product(id))) {
  throw new Error('Every illustrated id must exist in products.');
}

await mkdir(outputDirectory, { recursive: true });
const diagrams = new Map([
  ['01-table-page.svg', tableAndPage()],
  ['02-page-directory.svg', pageDirectory()],
  ['03-primary-btree.svg', primaryTree()],
  ['04-secondary-lookup.svg', secondaryLookup()],
]);
for (const [filename, content] of diagrams) {
  await writeFile(path.join(outputDirectory, filename), content);
  console.log(`Generated public/images/mysql/${filename}`);
}
