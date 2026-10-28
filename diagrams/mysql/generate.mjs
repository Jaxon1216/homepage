import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The JSON stores the teaching data; each pure diagram function stores its layout.
const directory = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(await readFile(path.join(directory, 'model.json'), 'utf8'));
const outputDirectory = path.resolve(directory, '../../public/images/mysql');
const colors = {
  ink: '#172B42', muted: '#53677C', line: '#AABACA', panel: '#F3F6FA',
  blue: '#145DA8', blueLight: '#E7F0FC', amber: '#936000', amberLight: '#FFF1CC',
  white: '#FFFFFF', soft: '#E2E8F0', black: '#303C45', red: '#B13F28',
  green: '#DCECAB', pink: '#F4C8CC', record: '#D7E8F9', cream: '#FAF8ED',
};
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const order = (id) => model.orders.find((row) => row.id === id);

function rect(x, y, width, height, { fill = colors.white, stroke = colors.line, radius = 12, strokeWidth = 1.5 } = {}) {
  return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height
    + '" rx="' + radius + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"/>';
}

function text(x, y, value, { size = 22, color = colors.ink, weight = 400, anchor = 'start', mono = false } = {}) {
  const font = mono ? 'ui-monospace, SFMono-Regular, Consolas, monospace' : 'PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif';
  return '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-size="' + size
    + '" font-weight="' + weight + '" text-anchor="' + anchor + '" font-family="' + font + '">' + escape(value) + '</text>';
}

function line(points, { color = colors.line, width = 2, dashed = false, arrow = false, both = false } = {}) {
  const marker = Object.entries(colors).find(([, value]) => value === color)?.[0] ?? 'line';
  return '<polyline points="' + points.map(([x, y]) => x + ',' + y).join(' ') + '" fill="none" stroke="' + color
    + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round"'
    + (dashed ? ' stroke-dasharray="7 6"' : '')
    + (arrow || both ? ' marker-end="url(#arrow-' + marker + ')"' : '')
    + (both ? ' marker-start="url(#arrow-' + marker + ')"' : '') + '/>';
}

function label(x, y, value, width = 160, active = false) {
  return rect(x, y, width, 36, { fill: active ? colors.blueLight : colors.panel, stroke: 'none', radius: 18 })
    + text(x + width / 2, y + 25, value, { size: 18, color: active ? colors.blue : colors.muted, weight: 600, anchor: 'middle' });
}

function svg(title, description, height, contents) {
  const markers = ['line', 'blue', 'amber', 'red', 'black'].map((name) =>
    '<marker id="arrow-' + name + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    + '<path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="' + colors[name] + '" stroke-width="1.7"/></marker>').join('');
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="' + height + '" viewBox="0 0 1000 ' + height + '" role="img" aria-labelledby="title desc">\n'
    + '<title id="title">' + escape(title) + '</title>\n<desc id="desc">' + escape(description) + '</desc>\n'
    + '<defs>' + markers + '</defs>\n' + rect(0, 0, 1000, height, { fill: colors.white, stroke: 'none', radius: 0 }) + '\n'
    + text(40, 49, title, { size: 30, weight: 700 }) + '\n' + contents.join('\n') + '\n</svg>\n';
}

function queryArchitecture() {
  const c = [
    text(40, 87, 'Server 层理解和执行 SQL；存储引擎负责数据组织与访问。', { size: 22, color: colors.muted }),
    rect(40, 125, 165, 88, { fill: colors.panel }),
    text(122, 159, '前端', { size: 25, anchor: 'middle', weight: 700 }),
    text(122, 190, '发送查询请求', { size: 18, anchor: 'middle', color: colors.muted }),
    rect(40, 290, 165, 113, { fill: colors.panel }),
    text(122, 326, '后端', { size: 25, anchor: 'middle', weight: 700 }),
    text(122, 358, '构造 SQL', { size: 20, anchor: 'middle' }),
    text(122, 385, '通过驱动使用连接', { size: 17, anchor: 'middle', color: colors.muted }),
    line([[100, 216], [100, 286]], { color: colors.blue, width: 2.5, arrow: true }),
    line([[150, 286], [150, 216]], { color: colors.line, arrow: true }),
    text(77, 256, 'HTTP', { size: 15, anchor: 'end', color: colors.blue }),
    rect(345, 125, 615, 543, { fill: '#FAFBFD', stroke: colors.blue, strokeWidth: 2, radius: 18 }),
    text(370, 160, 'MySQL', { size: 27, weight: 700, color: colors.blue }),
    rect(370, 180, 565, 250, { fill: colors.blueLight, stroke: 'none', radius: 12 }),
    text(395, 217, 'Server 层', { size: 25, weight: 700 }),
    rect(395, 238, 245, 61, { fill: colors.white, stroke: colors.line, radius: 7 }),
    text(517, 276, '连接与认证', { size: 22, anchor: 'middle' }),
    rect(665, 238, 245, 61, { fill: colors.white, stroke: colors.line, radius: 7 }),
    text(787, 276, '解析与准备', { size: 22, anchor: 'middle' }),
    rect(395, 334, 245, 61, { fill: colors.white, stroke: colors.line, radius: 7 }),
    text(517, 372, '优化器：选择计划', { size: 21, anchor: 'middle' }),
    rect(665, 334, 245, 61, { fill: colors.white, stroke: colors.blue, radius: 7 }),
    text(787, 372, '执行器：按计划执行', { size: 20, anchor: 'middle' }),
    line([[641, 268], [662, 268]], { color: colors.blue, arrow: true }),
    line([[787, 301], [787, 315], [517, 315], [517, 331]], { color: colors.blue, arrow: true }),
    line([[642, 364], [662, 364]], { color: colors.blue, arrow: true }),
    line([[208, 321], [285, 321], [285, 268], [392, 268]], { color: colors.blue, width: 2.5, arrow: true }),
    text(279, 246, 'SQL', { size: 21, color: colors.blue, anchor: 'middle', weight: 600 }),
    line([[370, 414], [252, 414], [252, 372], [208, 372]], { color: colors.line, width: 2, arrow: true }),
    text(287, 442, '查询结果', { size: 19, anchor: 'middle', color: colors.muted }),
    rect(370, 505, 565, 139, { fill: '#F1F6E9', stroke: '#AABF90', radius: 12 }),
    text(395, 542, 'InnoDB 存储引擎', { size: 25, weight: 700 }),
    text(395, 581, 'Buffer Pool（缓冲池）', { size: 21 }),
    text(395, 617, '数据页、索引与记录的访问', { size: 21 }),
    line([[765, 398], [765, 502]], { color: colors.blue, width: 2.5, arrow: true }),
    line([[865, 502], [865, 398]], { color: colors.line, width: 2, arrow: true }),
    text(751, 469, '调用引擎接口', { size: 17, anchor: 'end', color: colors.blue }),
    text(875, 469, '返回记录', { size: 17, color: colors.muted }),
    text(40, 709, '职责与调用关系示意；后端可复用连接，执行器也可能多次调用引擎取记录。', { size: 19, color: colors.muted }),
  ];
  return svg('查询进入 MySQL 后，谁负责什么', '前端通过 HTTP 请求后端；后端通过数据库驱动和连接发送 SQL。MySQL Server 层负责连接认证、解析准备、优化与执行；执行器调用 InnoDB 接口访问记录，结果经后端返回前端。', 744, c);
}

function navigationPage(x, y, keys) {
  return keys.map((key, i) => {
    const left = x + i * 120;
    return rect(left, y, 60, 52, { fill: '#FFD258', stroke: '#89927E', radius: 0 })
      + rect(left + 60, y, 60, 52, { fill: colors.white, stroke: '#89927E', radius: 0 })
      + text(left + 30, y + 34, key, { size: 24, weight: 600, anchor: 'middle', mono: true });
  }).join('');
}

function storageTreeOverview() {
  const c = [
    text(40, 88, '主键索引：上层保存导航键与子页引用，叶子页保存行记录。', { size: 21, color: colors.muted }),
    text(365, 152, '根页', { size: 23, weight: 600, anchor: 'end' }),
    navigationPage(390, 118, model.overviewRootKeys),
    text(80, 296, '中间页', { size: 22, weight: 600 }),
    navigationPage(80, 315, model.leafGroups.map((ids) => ids[0])),
    rect(575, 315, 150, 52, { radius: 0 }),
    rect(810, 315, 150, 52, { radius: 0 }),
    text(650, 349, '……', { size: 26, anchor: 'middle' }),
    text(885, 349, '……', { size: 26, anchor: 'middle' }),
    text(770, 401, '其余子树省略', { size: 18, anchor: 'middle', color: colors.muted }),
    text(40, 499, '叶子页', { size: 22, weight: 600 }),
    line([[480, 172], [260, 313]], { color: colors.black, arrow: true }),
    line([[600, 172], [650, 313]], { color: colors.black, arrow: true }),
    line([[720, 172], [885, 313]], { color: colors.black, arrow: true }),
  ];
  const widths = [40, 76, 84, 80];
  model.leafGroups.forEach((ids, i) => {
    const x = 40 + i * 330;
    c.push(line([[170 + i * 120, 369], [x + 140, 518]], { color: colors.black, arrow: true }));
    let cursor = x;
    ['id', 'user_id', 'amount', 'status'].forEach((name, j) => {
      c.push(rect(cursor, 520, widths[j], 36, { fill: j === 0 ? '#FFE59C' : '#EEF6E8', stroke: '#89927E', radius: 0 }),
        text(cursor + widths[j] / 2, 544, name, { size: 16, anchor: 'middle', weight: 600, mono: true }));
      cursor += widths[j];
    });
    ids.forEach((id, rowIndex) => {
      const row = order(id), y = 556 + rowIndex * 42;
      let left = x;
      [row.id, row.user_id, row.amount, row.status].forEach((value, j) => {
        c.push(rect(left, y, widths[j], 42, { fill: j === 0 ? '#FFD258' : '#DCECCB', stroke: '#89927E', radius: 0 }),
          text(left + widths[j] / 2, y + 28, value, { size: 19, anchor: 'middle', mono: true, weight: j === 0 ? 600 : 400 }));
        left += widths[j];
      });
    });
  });
  c.push(
    line([[68, 684], [68, 718], [350, 718], [350, 578], [368, 578]], { color: colors.black, arrow: true }),
    line([[398, 684], [398, 745], [680, 745], [680, 578], [698, 578]], { color: colors.black, arrow: true }),
    text(40, 785, '叶子页按主键顺序双向连接；图中为简洁只画向右的链接。', { size: 19, color: colors.muted }),
    text(40, 818, '三级结构示意，仅展开订单 1～8；根页的 10、20 表示省略分支的范围下界。', { size: 18, color: colors.muted }),
    text(40, 848, '节点对应页，导航键用简化下界表示；真实的 8 条短记录通常仍在一个叶子页内。', { size: 18, color: colors.muted }),
  );
  return svg('InnoDB 把表数据组织成一棵主键 B+ 树', '三级主键索引总览，黄色格表示导航主键或叶子记录主键，白色格表示子页引用，绿色格表示行的其他字段。根页导航项1、10、20引用中间页，只展开第一个中间页的1、4、7三个分支，叶子页显示订单1至8的id、user_id、amount和status。其余子树省略。叶子页实际双向连接，图中仅画向右链接。', 878, c);
}

function tableAndPage() {
  const c = [
    text(40, 86, 'SQL 看到表和行；InnoDB 将记录组织在数据页中。', { size: 21, color: colors.muted }),
    label(45, 118, '逻辑层：orders 表', 250),
    label(600, 118, '物理组织：InnoDB 索引页', 340, true),
    rect(45, 172, 445, 274, { fill: colors.panel }),
    text(64, 207, 'id', { size: 19, weight: 600, mono: true }),
    text(130, 207, 'user_id', { size: 19, weight: 600, mono: true }),
    text(260, 207, 'amount', { size: 19, weight: 600, mono: true }),
    text(371, 207, 'status', { size: 19, weight: 600, mono: true }),
    rect(600, 172, 350, 274, { fill: colors.panel, stroke: colors.blue }),
    text(620, 207, '一页中容纳多条记录', { size: 23, weight: 600 }),
    line([[510, 308], [578, 308]], { color: colors.blue, width: 3, arrow: true }),
    text(544, 276, '组织', { size: 18, anchor: 'middle', color: colors.blue }),
    text(544, 349, '成页', { size: 18, anchor: 'middle', color: colors.blue }),
  ];
  [1, 2, 6, 8].forEach((id, i) => {
    const row = order(id), y = 226 + i * 50;
    c.push(rect(57, y, 421, 43, { fill: id === model.lookupId ? colors.blueLight : colors.white, stroke: 'none', radius: 5 }));
    [[72, row.id], [157, row.user_id], [260, row.amount], [371, row.status]].forEach(([x, value]) => c.push(text(x, y + 29, value, { size: 20, mono: true })));
  });
  ['页头等管理信息', '行记录：1、2、3、……', '页目录等辅助结构'].forEach((value, i) => {
    const y = 228 + i * 64;
    c.push(rect(618, y, 314, 52, { fill: i === 1 ? colors.blueLight : colors.white, stroke: colors.soft, radius: 6 }));
    c.push(text(775, y + 33, value, { size: 21, anchor: 'middle', color: i === 1 ? colors.blue : colors.ink }));
  });
  c.push(text(45, 484, '左侧节选四条订单；右侧表示组成关系，不按真实字节偏移绘制。', { size: 19, color: colors.muted }),
    text(45, 520, '默认页大小为 16 KiB；一页能放多少记录，取决于记录大小与页利用率。', { size: 19, color: colors.muted }));
  return svg('表、行与数据页', 'orders 表的行包含 id、user_id、amount、status。InnoDB 按页组织记录，每页还有管理信息与页目录。', 553, c);
}

// Four fields follow the supplied reference: n_owned / next pointer / primary key / row payload.
function directoryRecord(x, y, id, nOwned) {
  const w = [40, 40, 48, 137], fills = [colors.pink, colors.white, colors.green, colors.record];
  let cursor = x;
  const parts = [];
  w.forEach((width, i) => {
    parts.push(rect(cursor, y, width, 50, { fill: fills[i], stroke: '#7E888C', radius: 0, strokeWidth: 1.2 }));
    cursor += width;
  });
  parts.push(text(x + 20, y + 33, nOwned, { size: 23, anchor: 'middle' }),
    '<circle cx="' + (x + 60) + '" cy="' + (y + 25) + '" r="6" fill="' + colors.black + '"/>',
    text(x + 104, y + 33, id, { size: 23, anchor: 'middle', weight: 600 }),
    text(x + 196, y + 33, '行记录', { size: 23, anchor: 'middle' }));
  return parts.join('');
}

function sentinel(x, y, name, last = false) {
  return rect(x, y, 40, 50, { fill: colors.pink, stroke: '#7E888C', radius: 0 })
    + rect(x + 40, y, 40, 50, { fill: colors.white, stroke: '#7E888C', radius: 0 })
    + rect(x + 80, y, 230, 50, { fill: '#F4F5A4', stroke: '#7E888C', radius: 0 })
    + text(x + 20, y + 33, '1', { size: 23, anchor: 'middle' })
    + (last ? text(x + 60, y + 31, '∅', { size: 24, anchor: 'middle' })
      : '<circle cx="' + (x + 60) + '" cy="' + (y + 25) + '" r="6" fill="' + colors.black + '"/>')
    + text(x + 195, y + 32, name, { size: 21, anchor: 'middle', weight: 600 });
}

function pageDirectory() {
  const c = [
    text(40, 88, '目录槽指向组末记录；next 字段把记录按主键顺序串起来。', { size: 21, color: colors.muted }),
    rect(22, 115, 956, 937, { fill: colors.white, stroke: '#747E84', radius: 0, strokeWidth: 2 }),
    text(111, 157, '页目录', { size: 26, weight: 700, anchor: 'middle' }),
    rect(48, 177, 126, 842, { fill: colors.green, stroke: '#809758', radius: 24, strokeWidth: 1.5 }),
    rect(250, 177, 665, 92, { fill: colors.cream, stroke: '#9C9E93', radius: 20 }),
    rect(250, 301, 665, 258, { fill: colors.cream, stroke: '#9C9E93', radius: 20 }),
    rect(250, 622, 665, 258, { fill: colors.cream, stroke: '#9C9E93', radius: 20 }),
    rect(250, 940, 665, 92, { fill: colors.cream, stroke: '#9C9E93', radius: 20 }),
    text(934, 229, '组 1', { size: 17, anchor: 'middle' }),
    text(934, 434, '组 2', { size: 17, anchor: 'middle' }),
    text(934, 755, '组 3', { size: 17, anchor: 'middle' }),
    text(934, 991, '组 4', { size: 17, anchor: 'middle' }),
  ];
  const slots = [225, 435, 756, 985];
  slots.forEach((y, i) => {
    c.push(text(111, y - 24, '槽 ' + i, { size: 22, anchor: 'middle', weight: 600 }),
      rect(88, y - 13, 46, 46, { fill: colors.white, stroke: '#7E888C', radius: 0 }),
      '<circle cx="111" cy="' + (y + 10) + '" r="6" fill="' + colors.black + '"/>');
  });
  c.push(sentinel(450, 199, '最小记录 infimum'));
  model.directoryGroups.forEach((ids, groupIndex) => {
    const firstY = 336 + groupIndex * 321;
    ids.forEach((id, i) => c.push(directoryRecord(i % 2 ? 620 : 295, firstY + Math.floor(i / 2) * 122, id, i === ids.length - 1 ? ids.length : 0)));
  });
  c.push(sentinel(450, 960, '最大记录 supremum', true));
  // next-record links: emerge from the pointer cell; the records are not necessarily physically adjacent.
  [
    [[510, 224], [510, 285], [315, 285], [315, 334]],
    [[355, 361], [355, 410], [593, 410], [593, 361], [618, 361]],
    [[680, 361], [680, 423], [315, 423], [315, 456]],
    [[355, 483], [355, 535], [593, 535], [593, 483], [618, 483]],
    [[680, 483], [680, 590], [315, 590], [315, 655]],
    [[355, 682], [355, 731], [593, 731], [593, 682], [618, 682]],
    [[680, 682], [680, 744], [315, 744], [315, 777]],
    [[355, 804], [355, 856], [593, 856], [593, 804], [618, 804]],
    [[680, 804], [680, 907], [470, 907], [470, 958]],
  ].forEach((points) => c.push(line(points, { color: colors.black, width: 2, arrow: true })));
  // Slot offsets point to owner records (the last record of each group).
  [
    [[118, 235], [211, 235], [211, 163], [625, 163], [625, 197]],
    [[118, 445], [225, 445], [724, 445], [724, 456]],
    [[118, 766], [225, 766], [724, 766], [724, 777]],
    [[118, 995], [211, 995], [211, 925], [625, 925], [625, 958]],
  ].forEach((points) => c.push(line(points, { color: colors.red, width: 2.5, dashed: true, arrow: true })));
  c.push(
    rect(40, 1080, 26, 26, { fill: colors.pink, stroke: '#7E888C', radius: 0 }),
    text(78, 1101, 'n_owned：本条记录拥有的组内记录数', { size: 20 }),
    rect(490, 1080, 26, 26, { fill: colors.green, stroke: '#7E888C', radius: 0 }),
    text(528, 1101, '主键 id', { size: 20 }),
    rect(700, 1080, 26, 26, { fill: colors.record, stroke: '#7E888C', radius: 0 }),
    text(738, 1101, '其他行数据', { size: 20 }),
    line([[40, 1140], [95, 1140]], { color: colors.red, dashed: true, arrow: true }),
    text(110, 1147, '目录槽 → 组末记录', { size: 20 }),
    line([[490, 1140], [545, 1140]], { color: colors.black, arrow: true }),
    text(560, 1147, 'next 指针 → 下一条记录', { size: 20 }),
    text(40, 1190, '8 条用户记录与 2 条系统记录；按连接关系排布，不表示实际页内物理偏移。', { size: 18, color: colors.muted }),
  );
  return svg('数据页：页目录、分组与记录链', '参考用户提供的页目录图重绘。绿色目录区包含四个槽，分别指向 infimum、主键4、主键8和supremum。每条用户记录分为n_owned、next指针、主键id、行数据四格。两组用户记录分别为1至4、5至8，组末记录的n_owned为4，其余为0；首尾系统记录各自拥有1条。黑线表示下一条记录，红色虚线表示槽指向的组末记录。', 1220, c);
}

function recordRow(x, y, width, id, selected) {
  const row = order(id);
  return rect(x, y, width, 46, { fill: selected ? colors.blueLight : colors.white, stroke: selected ? colors.blue : colors.soft, radius: 4, strokeWidth: selected ? 2 : 1 })
    + text(x + 20, y + 31, row.id, { size: 23, weight: selected ? 700 : 400, mono: true })
    + text(x + 100, y + 31, row.amount, { size: 23, weight: selected ? 600 : 400, mono: true });
}

function leafPage(x, y, ids, active, heading) {
  return rect(x, y, 260, 249, { fill: colors.panel, stroke: active ? colors.blue : colors.line, strokeWidth: active ? 2.5 : 1.5 })
    + text(x + 18, y + 34, heading, { size: 22, weight: 600, color: active ? colors.blue : colors.ink })
    + text(x + 28, y + 68, 'id', { size: 19, color: colors.muted, mono: true })
    + text(x + 110, y + 68, 'amount', { size: 19, color: colors.muted, mono: true })
    + ids.map((id, i) => recordRow(x + 10, y + 84 + i * 49, 240, id, active && id === model.lookupId)).join('');
}

function primaryTree() {
  const c = [
    text(40, 88, '查询 id = ' + model.lookupId + '：上层指路，叶子页保存行记录。', { size: 21, color: colors.muted }),
    label(350, 112, '非叶子页：导航键 + 子页引用', 340),
    rect(235, 168, 530, 91, { fill: colors.panel }),
  ];
  const rootCenters = [325, 500, 675];
  model.leafGroups.forEach((ids, i) => {
    const x = 245 + i * 175, active = ids.includes(model.lookupId);
    c.push(rect(x, 178, 160, 71, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.soft, radius: 7, strokeWidth: active ? 2 : 1 }));
    c.push(text(x + 80, 208, '下界 ' + ids[0], { size: 22, anchor: 'middle', weight: 600, color: active ? colors.blue : colors.ink }));
    c.push(text(x + 80, 235, '指向页 ' + String.fromCharCode(65 + i), { size: 17, anchor: 'middle', color: colors.muted }));
    c.push(line([[rootCenters[i], 259], [rootCenters[i], 292], [170 + i * 330, 292], [170 + i * 330, 335]], { color: active ? colors.blue : colors.line, width: active ? 3 : 2, arrow: true }));
    c.push(leafPage(40 + i * 330, 338, ids, active, '叶子页 ' + String.fromCharCode(65 + i)));
  });
  c.push(text(525, 316, '4 ≤ 6 < 7，进入页 B', { size: 19, color: colors.blue, weight: 600 }),
    line([[302, 557], [367, 557]], { both: true }), line([[632, 557], [697, 557]], { both: true }),
    text(500, 622, '叶子页按主键顺序双向连接；此处只显示 id、amount 两列。', { size: 20, anchor: 'middle', color: colors.muted }),
    text(40, 663, '为展示分支，把 8 行人为画成 3 个叶子页；真实小表通常只需一个叶子页。', { size: 18, color: colors.muted }),
    text(40, 693, '导航键为简化下界，省略最左项最小标志、内部格式及页外存储。', { size: 18, color: colors.muted }));
  return svg('B+ 树：从导航页走到记录所在页', '根页用简化下界1、4、7引用三个叶子页，分别显示订单1至3、4至6、7至8。查找id6时进入页B，取得金额70.00的订单记录。叶子页双向连接。', 725, c);
}

function secondaryLookup() {
  const lookup = order(model.lookupId);
  const matches = model.orders.filter((row) => row[model.secondaryColumn] === model.secondaryValue);
  const c = [
    text(40, 88, '假设走 user_id 索引：查 user_id = 3 的订单，取得 amount、status。', { size: 21, color: colors.muted }),
    label(40, 119, '① 二级索引中的匹配记录', 340),
    rect(40, 172, 350, 284, { fill: colors.panel }),
    text(64, 207, 'user_id', { size: 20, weight: 600, mono: true }),
    text(285, 207, '主键 id', { size: 19, weight: 600 }),
  ];
  matches.forEach((row, i) => {
    const y = 226 + i * 65, active = row.id === model.lookupId;
    c.push(rect(57, y, 316, 51, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.soft, radius: 6, strokeWidth: active ? 2 : 1 }),
      text(107, y + 34, row.user_id, { size: 25, anchor: 'middle', color: active ? colors.blue : colors.ink, mono: true }),
      text(309, y + 34, row.id, { size: 25, anchor: 'middle', weight: active ? 700 : 400, color: active ? colors.blue : colors.ink, mono: true }));
  });
  c.push(text(215, 485, '索引列 user_id + 主键 id', { size: 20, anchor: 'middle', color: colors.muted }),
    label(550, 119, '② 拿主键再次查聚簇索引', 400, true),
    line([[391, 317], [490, 317], [490, 216], [548, 216]], { color: colors.blue, width: 3, arrow: true }),
    text(441, 347, 'id = ' + lookup.id, { size: 20, anchor: 'middle', color: colors.blue, weight: 600, mono: true }),
    rect(554, 174, 396, 85, { fill: colors.panel, stroke: colors.blue }),
    text(752, 207, '主键树的上层', { size: 21, anchor: 'middle', weight: 600 }),
    text(752, 239, '1       4       7', { size: 24, anchor: 'middle', mono: true, color: colors.blue }),
    line([[752, 261], [752, 306]], { color: colors.blue, width: 3, arrow: true }),
    rect(554, 310, 396, 186, { fill: colors.blueLight, stroke: colors.blue, strokeWidth: 2 }),
    text(576, 347, '叶子页中的 id = ' + lookup.id, { size: 23, weight: 700, color: colors.blue }),
    text(576, 389, 'user_id  ' + lookup.user_id, { size: 22, mono: true }),
    text(576, 427, 'amount   ' + lookup.amount, { size: 22, mono: true }),
    text(576, 465, 'status   ' + lookup.status, { size: 22, mono: true }),
    text(40, 542, '图中展开 id = 6 的一次回表；id = 5、8 也要取得查询所需列。', { size: 20, color: colors.muted }),
    text(40, 578, '这条查询没有筛选付款状态，未付款的订单 8 也在匹配范围内。', { size: 20, color: colors.muted }),
    text(40, 614, '二级索引保存主键值，不是行的磁盘地址；所需列被覆盖时可省去取额外列的回表。', { size: 18, color: colors.muted }));
  return svg('回表：先取得主键，再找订单记录', 'user_id二级索引中，值3对应主键5、6、8。展开id6的一次回表，聚簇索引叶子行包含user_id3、amount70.00和status paid；另外两条匹配记录也需要所需列。', 650, c);
}

if (model.table !== 'orders' || model.orders.length !== 8
  || model.leafGroups.length !== 3 || model.leafGroups.some((ids) => ids.length > 3)
  || model.directoryGroups.length !== 2 || model.directoryGroups.some((ids) => ids.length !== 4)) {
  throw new Error('The teaching layouts require orders, 8 records, 3 leaf groups (up to 3 rows) and 2 directory groups of 4.');
}
if (!order(model.lookupId) || !model.leafGroups.flat().every((id) => order(id))
  || !model.directoryGroups.flat().every((id) => order(id))) {
  throw new Error('Every illustrated id must exist in orders.');
}

await mkdir(outputDirectory, { recursive: true });
const diagrams = new Map([
  ['00-query-architecture.svg', queryArchitecture()],
  ['01-storage-tree-overview.svg', storageTreeOverview()],
  ['01-table-page.svg', tableAndPage()],
  ['02-page-directory.svg', pageDirectory()],
  ['03-primary-btree.svg', primaryTree()],
  ['04-secondary-lookup.svg', secondaryLookup()],
]);
for (const [filename, content] of diagrams) {
  await writeFile(path.join(outputDirectory, filename), content);
  console.log('Generated public/images/mysql/' + filename);
}
