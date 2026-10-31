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
    text(40, 88, '每个节点都是页；只展开 A 页的 8 条订单，其他页内容省略。', { size: 21, color: colors.muted }),
    text(365, 151, '根页', { size: 23, weight: 600, anchor: 'end' }),
    navigationPage(390, 118, model.overviewRootKeys),
    navigationPage(80, 300, model.navigationKeys),
    text(80, 284, '中间页', { size: 22, weight: 600 }),
    rect(575, 300, 150, 52, { radius: 0 }), rect(810, 300, 150, 52, { radius: 0 }),
    text(650, 334, '……', { size: 26, anchor: 'middle' }),
    text(885, 334, '……', { size: 26, anchor: 'middle' }),
    line([[480, 172], [260, 298]], { color: colors.blue, width: 3, arrow: true }),
    line([[600, 172], [650, 298]], { color: colors.line, arrow: true }),
    line([[720, 172], [885, 298]], { color: colors.line, arrow: true }),
    text(281, 230, '6 < 25', { size: 20, color: colors.blue, weight: 600 }),
    line([[170, 354], [330, 483]], { color: colors.blue, width: 3, arrow: true }),
    line([[290, 354], [635, 483]], { color: colors.line, arrow: true }),
    line([[410, 354], [875, 483]], { color: colors.line, arrow: true }),
    text(40, 406, '6 < 9，进入 A 页', { size: 20, color: colors.blue, weight: 600 }),
    text(40, 465, '叶子页 A：订单 1～8', { size: 23, weight: 700, color: colors.blue }),
    rect(30, 475, 410, 344, { fill: colors.white, stroke: colors.blue, strokeWidth: 2, radius: 4 }),
  ];
  const widths = [50, 95, 110, 135];
  const header = ['id', 'user_id', 'amount', 'status'];
  let left = 40;
  header.forEach((value, j) => {
    c.push(rect(left, 485, widths[j], 36, { fill: j === 0 ? '#FFE59C' : '#EEF6E8', radius: 0 }),
      text(left + widths[j] / 2, 510, value, { size: 18, mono: true, anchor: 'middle', weight: 600 }));
    left += widths[j];
  });
  model.orders.forEach((row, i) => {
    let x = 40;
    const y = 521 + i * 36, active = row.id === model.lookupId;
    [row.id, row.user_id, row.amount, row.status].forEach((value, j) => {
      c.push(rect(x, y, widths[j], 36, { fill: active ? colors.blueLight : j === 0 ? '#FFD258' : '#DCECCB', stroke: active ? colors.blue : colors.line, radius: 0 }),
        text(x + widths[j] / 2, y + 25, value, { size: 19, mono: true, anchor: 'middle', weight: active ? 700 : 400 }));
      x += widths[j];
    });
  });
  [550, 790].forEach((x, i) => c.push(
    rect(x, 485, 170, 324, { fill: colors.panel, radius: 0 }),
    text(x + 85, 527, '叶子页 ' + String.fromCharCode(66 + i), { size: 23, anchor: 'middle', weight: 600 }),
    text(x + 85, 580, i === 0 ? '9 ≤ id < 17' : '17 ≤ id < 25', { size: 19, anchor: 'middle', mono: true }),
    text(x + 85, 648, '……', { size: 30, anchor: 'middle' }),
    text(x + 85, 690, '内容省略', { size: 19, anchor: 'middle', color: colors.muted }),
  ));
  c.push(line([[442, 754], [548, 754]], { color: colors.black, both: true }),
    line([[722, 754], [788, 754]], { color: colors.black, both: true }),
    text(494, 725, '页间双向链接', { size: 16, anchor: 'middle', color: colors.muted }),
    text(40, 859, '页与页：按主键顺序双向连接；A 页内部怎样查找，见后面的页目录图。', { size: 20, color: colors.muted }),
    text(40, 901, '三层是大表结构示意；如果整张表真的只有这 8 行，通常一页就能放下。', { size: 19, color: colors.muted }),
    text(40, 936, '导航键使用简化下界，省略最左项的特殊标记；其他分支不表示本例额外的 SQL 输入。', { size: 18, color: colors.muted }));
  return svg('主键 B+ 树：先找到 A 页，再找订单 6', '根页下界1、25、49，中间页下界1、9、17。查询6沿蓝线进入叶子页A，A页包含完整的八条示例订单，B、C和其他分支内容省略。叶子页之间双向连接。', 970, c);
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

function recordChain() {
  const c = [
    text(40, 88, '先看一条记录，再看它怎样通过 next 连到下一条。', { size: 21, color: colors.muted }),
    rect(40, 125, 400, 150, { fill: '#FBECEF', stroke: '#D4ADB4', radius: 0 }),
    rect(440, 125, 520, 150, { fill: '#EDF5E5', stroke: '#AABF90', radius: 0 }),
    text(240, 166, '记录头：InnoDB 的管理信息', { size: 23, weight: 700, anchor: 'middle' }),
    text(70, 210, 'next → 记录 7 的位置', { size: 23 }),
    text(70, 249, 'n_owned = 0（分组时再解释）', { size: 21 }),
    text(700, 166, '订单 6 的业务数据', { size: 23, weight: 700, anchor: 'middle' }),
    text(470, 210, 'id = 6，user_id = 3', { size: 23, mono: true }),
    text(470, 249, 'amount = 70.00，status = paid', { size: 23, mono: true }),
    text(40, 331, '同一个 A 页：按主键顺序单向连接', { size: 24, weight: 700 }),
  ];
  const nodes = [
    { label: 'infimum', x: 40, width: 120 },
    ...model.orders.map((row, i) => ({ label: String(row.id), x: 180 + i * 80, width: 60, active: row.id === model.lookupId })),
    { label: 'supremum', x: 820, width: 140 },
  ];
  nodes.forEach((node, i) => {
    c.push(rect(node.x, 365, node.width, 80, { fill: node.active ? colors.blueLight : i === 0 || i === nodes.length - 1 ? colors.amberLight : colors.white, stroke: node.active ? colors.blue : colors.line, strokeWidth: node.active ? 2.5 : 1.5, radius: 5 }),
      text(node.x + node.width / 2, 413, node.label, { size: i === 0 || i === nodes.length - 1 ? 21 : 26, anchor: 'middle', weight: 600 }));
    if (i < nodes.length - 1) c.push(line([[node.x + node.width + 2, 405], [nodes[i + 1].x - 2, 405]], { color: node.active ? colors.blue : colors.line, arrow: true }));
  });
  c.push(text(100, 479, '头部哑节点', { size: 21, anchor: 'middle', color: colors.amber }),
    text(890, 479, '尾部哨兵', { size: 21, anchor: 'middle', color: colors.amber }),
    text(40, 561, '空页时：', { size: 23, weight: 600 }),
    rect(290, 525, 180, 65, { fill: colors.amberLight }),
    text(380, 566, 'infimum', { size: 24, anchor: 'middle' }),
    line([[473, 557], [647, 557]], { color: colors.line, width: 2.5, arrow: true }),
    rect(650, 525, 180, 65, { fill: colors.amberLight }),
    text(740, 566, 'supremum', { size: 24, anchor: 'middle' }),
    text(40, 644, 'infimum 可类比链表里的 dummy node；首尾都是系统记录，不保存订单业务数据。', { size: 20, color: colors.muted }),
    text(40, 681, '这里只展开 next、n_owned，省略记录的其他信息；方块位置表示逻辑顺序。', { size: 19, color: colors.muted }));
  return svg('记录头、记录链与头部哑节点', '订单6由记录头和业务字段组成，next引用记录7的位置。A页记录链从头部哑节点infimum，经过订单1至8，到尾部哨兵supremum。空页仍保留infimum到supremum的连接；dummy node是类比，infimum正式含义是页内最小边界系统记录。', 715, c);
}

function pageSearch() {
  const c = [
    text(40, 88, '同一个叶子页 A：先查目录，再沿单向记录链找 id = 6。', { size: 21, color: colors.muted }),
    text(40, 161, '页目录', { size: 23, weight: 600 }),
  ];
  ['infimum', '4', '8', 'supremum'].forEach((value, i) => {
    const x = 220 + i * 140;
    c.push(rect(x, 125, 110, 55, { fill: i === 1 || i === 2 ? colors.blueLight : colors.panel }),
      text(x + 55, 161, value, { size: 22, anchor: 'middle', weight: 600 }),
      text(x + 55, 114, '槽 ' + i, { size: 17, anchor: 'middle', color: colors.muted }));
  });
  c.push(text(40, 425, '① 比较槽指向的主键：4 < 6 ≤ 8，确定在第二组', { size: 22, color: colors.blue, weight: 600 }),
    rect(40, 275, 435, 110, { fill: colors.panel, stroke: 'none' }),
    rect(480, 275, 445, 110, { fill: '#EFF5E7', stroke: 'none' }));
  model.orders.forEach((row, i) => {
    const x = 70 + i * 110, active = row.id === model.lookupId;
    c.push(rect(x, 310, 70, 50, { fill: active ? colors.blueLight : colors.white, stroke: active ? colors.blue : colors.line, strokeWidth: active ? 3 : 1.5, radius: 4 }),
      text(x + 35, 343, row.id, { size: 25, anchor: 'middle', weight: active ? 700 : 400 }));
    if (i < model.orders.length - 1) c.push(line([[x + 72, 335], [x + 108, 335]], { color: i === 3 || i === 4 ? colors.blue : colors.line, width: i === 3 || i === 4 ? 3 : 2, arrow: true }));
  });
  c.push(
    line([[415, 182], [415, 253], [435, 253], [435, 308]], { color: colors.red, dashed: true, arrow: true }),
    line([[555, 182], [555, 260], [875, 260], [875, 308]], { color: colors.red, dashed: true, arrow: true }),
    text(258, 300, '第一组：1～4', { size: 18, anchor: 'middle', color: colors.muted }),
    text(700, 300, '第二组：5～8', { size: 18, anchor: 'middle', color: colors.muted }),
    text(40, 465, '② 从前一个边界 4 开始，沿 next 找到 5、6；不是从 8 倒着找。', { size: 22, color: colors.blue, weight: 600 }),
    text(40, 510, '槽中实际保存位置，上面用所指记录的名称或主键标注；系统记录的本体省略。', { size: 19, color: colors.muted }),
    text(40, 548, '红虚线：槽 → 组末记录；横向箭头：记录通过 next 单向连接。', { size: 19, color: colors.muted }));
  return svg('A 页里怎样找到记录 6', '目录槽指向infimum、4、8、supremum。二分查目录确定4小于6且6小于等于8，从前一组末尾4沿单向记录链访问5、6。槽中实际保存位置。', 580, c);
}

function pageDirectory() {
  const c = [
    text(40, 88, '还是 A 页：红虚线指向组末，黑线表示下一条记录。', { size: 21, color: colors.muted }),
    rect(25, 116, 950, 770, { radius: 0, stroke: colors.black }),
    text(50, 153, '页目录', { size: 23, weight: 600 }),
    text(420, 135, '记录头（节选）', { size: 18, anchor: 'middle', color: colors.muted }),
    text(665, 135, '业务字段（用户记录）', { size: 18, anchor: 'middle', color: colors.muted }),
    line([[340, 143], [500, 143]], { color: colors.line }),
    line([[500, 143], [830, 143]], { color: colors.line }),
    text(880, 390, '第 1 组', { size: 18, color: colors.muted }),
    text(880, 630, '第 2 组', { size: 18, color: colors.muted }),
    rect(45, 175, 155, 665, { fill: '#EFF5E7', radius: 12 }),
    rect(310, 258, 550, 235, { fill: colors.panel, stroke: 'none' }),
    rect(310, 498, 550, 235, { fill: '#EFF5E7', stroke: 'none' }),
  ];
  const fields = [80, 80, 80, 250];
  let hx = 340;
  ['n_owned', 'next', 'id', '其他行数据'].forEach((name, i) => {
    c.push(text(hx + fields[i] / 2, 174, name, { size: i === 0 ? 17 : 20, anchor: 'middle', weight: 600 }));
    hx += fields[i];
  });
  const records = [
    { id: 'infimum', owned: 1, y: 200, system: true },
    ...model.orders.map((row, i) => ({ id: row.id, owned: model.directoryGroups.some((ids) => ids.at(-1) === row.id) ? 4 : 0, y: (i < 4 ? 270 : 510) + (i % 4) * 55 })),
    { id: 'supremum', owned: 1, y: 750, system: true },
  ];
  records.forEach((record, i) => {
    const active = record.id === model.lookupId;
    let x = 340;
    fields.forEach((width, j) => {
      c.push(rect(x, record.y, width, 46, { fill: active ? colors.blueLight : [colors.pink, colors.white, colors.green, colors.record][j], stroke: active ? colors.blue : colors.line, strokeWidth: active ? 2.5 : 1, radius: 0 }));
      x += width;
    });
    c.push(text(380, record.y + 31, record.owned, { size: 23, anchor: 'middle' }),
      text(540, record.y + 31, record.system ? '—' : record.id, { size: 23, anchor: 'middle', weight: active ? 700 : 400 }),
      text(705, record.y + (record.system ? 20 : 31), record.system ? record.id : '订单 ' + record.id + ' 的字段', { size: record.system ? 20 : 22, anchor: 'middle', weight: active ? 700 : 400 }));
    if (record.system) c.push(text(705, record.y + 39, record.id === 'infimum' ? '头部哑节点（系统记录）' : '尾部哨兵（系统记录）', { size: 15, anchor: 'middle', color: colors.muted }));
    if (i < records.length - 1) {
      c.push('<circle cx="460" cy="' + (record.y + 23) + '" r="5" fill="' + colors.black + '"/>',
        line([[460, record.y + 30], [460, records[i + 1].y - 2]], { color: colors.black, arrow: true }));
    } else c.push(text(460, record.y + 31, '∅', { size: 23, anchor: 'middle' }));
  });
  [records[0], records[4], records[8], records[9]].forEach((record, i) => {
    const y = record.y + 23;
    c.push(rect(65, y - 20, 115, 40, { fill: colors.white, radius: 4 }),
      text(122, y + 7, '槽 ' + i, { size: 22, anchor: 'middle' }),
      line([[182, y], [338, y]], { color: colors.red, dashed: true, arrow: true }));
  });
  c.push(text(40, 928, '记录 4、8 的 n_owned = 4：各自负责 4 条记录；其余用户记录为 0。', { size: 21 }),
    text(40, 966, '首尾系统记录在本图中各自一组，n_owned = 1；普通组为 4～8 条，首尾允许例外。', { size: 19, color: colors.muted }),
    text(40, 1004, '图按逻辑顺序排布，不表示字节位置；next 连接的是同一页内的记录，方向为单向。', { size: 19, color: colors.muted }));
  return svg('A 页的目录槽、分组与记录头', 'A页包含订单1至8。四个目录槽分别指向infimum、4、8、supremum，对应n_owned为1、4、4、1。infimum可类比头部哑节点，supremum为尾部哨兵，都是系统记录。记录头和用户业务字段分开标注。记录沿next单向连接，6高亮。图按逻辑顺序绘制，不表示真实物理偏移。', 1040, c);
}

function primaryTree() {
  const c = [
    text(40, 88, 'id = 6：根页 → 左侧中间页 → 叶子页 A。', { size: 22, color: colors.muted }),
    label(45, 130, '根页', 120), navigationPage(290, 122, model.overviewRootKeys),
    line([[380, 176], [380, 220]], { color: colors.blue, width: 3, arrow: true }),
    text(520, 208, '6 < 25', { size: 22, color: colors.blue }),
    label(45, 240, '中间页', 120), navigationPage(290, 232, model.navigationKeys),
    line([[380, 286], [380, 330]], { color: colors.blue, width: 3, arrow: true }),
    text(520, 318, '6 < 9', { size: 22, color: colors.blue }),
    rect(290, 345, 560, 110, { fill: colors.blueLight, stroke: colors.blue, strokeWidth: 2 }),
    text(315, 384, '叶子页 A：订单 1～8', { size: 25, color: colors.blue, weight: 700 }),
    text(315, 427, 'id 6  ·  user_id 3  ·  amount 70.00  ·  paid', { size: 22, mono: true }),
    text(40, 507, '这里只画选中的路径；完整分支、页间双向链接和 A 页内容见总览图。', { size: 20, color: colors.muted }),
  ];
  return svg('查询订单 6 的主键索引路径', '与总览图相同的三层树：根页1、25、49，中间页1、9、17，目标位于包含1至8的A页。', 545, c);
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
    text(752, 207, '根页 → 中间页', { size: 21, anchor: 'middle', weight: 600 }),
    text(752, 239, '1 / 25 / 49 → 1 / 9 / 17', { size: 20, anchor: 'middle', mono: true, color: colors.blue }),
    line([[752, 261], [752, 306]], { color: colors.blue, width: 3, arrow: true }),
    rect(554, 310, 396, 186, { fill: colors.blueLight, stroke: colors.blue, strokeWidth: 2 }),
    text(576, 347, 'A 页中的 id = ' + lookup.id, { size: 23, weight: 700, color: colors.blue }),
    text(576, 389, 'user_id  ' + lookup.user_id, { size: 22, mono: true }),
    text(576, 427, 'amount   ' + lookup.amount, { size: 22, mono: true }),
    text(576, 465, 'status   ' + lookup.status, { size: 22, mono: true }),
    text(40, 542, '图中展开 id = 6 的一次回表；id = 5、8 也要取得查询所需列。', { size: 20, color: colors.muted }),
    text(40, 578, '这条查询没有筛选付款状态，未付款的订单 8 也在匹配范围内。', { size: 20, color: colors.muted }),
    text(40, 614, '二级索引保存主键值，不是行的磁盘地址；所需列被覆盖时可省去取额外列的回表。', { size: 18, color: colors.muted }));
  return svg('回表：先取得主键，再找订单记录', 'user_id二级索引中，值3对应主键5、6、8。展开id6的一次回表，聚簇索引叶子行包含user_id3、amount70.00和status paid；另外两条匹配记录也需要所需列。', 650, c);
}

function bufferPool() {
  const c = [
    text(40, 88, '应用发送 SQL；InnoDB 访问某个页时，先看它是否已经在内存中。', { size: 21, color: colors.muted }),
    rect(260, 120, 620, 65, { fill: colors.blue, stroke: 'none' }),
    text(570, 162, '应用（后端服务）', { size: 28, color: colors.white, weight: 700, anchor: 'middle' }),
    line([[480, 188], [480, 241]], { color: colors.blue, width: 3, arrow: true }),
    line([[650, 241], [650, 188]], { color: colors.line, width: 3, arrow: true }),
    text(460, 221, 'SQL', { size: 20, anchor: 'end', color: colors.blue }),
    text(670, 221, '查询结果', { size: 20, color: colors.muted }),
    rect(160, 245, 800, 360, { fill: '#FAFBFD', stroke: colors.blue, strokeWidth: 2, radius: 18 }),
    text(185, 290, 'MySQL 进程', { size: 24, weight: 700, color: colors.blue }),
    rect(365, 263, 570, 45, { fill: colors.blueLight, stroke: 'none', radius: 6 }),
    text(650, 293, 'Server 执行器 → 调用 InnoDB 访问页', { size: 21, anchor: 'middle' }),
    line([[550, 310], [550, 323]], { color: colors.blue, arrow: true }),
    rect(185, 325, 750, 255, { fill: '#F1F6E9', stroke: '#AABF90', radius: 14 }),
    text(210, 362, 'Buffer Pool：InnoDB 的内存缓冲区', { size: 24, weight: 700 }),
  ];
  const pages = [
    { name: '根页', values: [model.overviewRootKeys.join(' / '), '导航键和子页引用'] },
    { name: '中间页', values: [model.navigationKeys.join(' / '), '导航键和子页引用'] },
    { name: '叶子页 A', values: ['订单 1～8', 'id 6 → 70.00', '其余字段省略'] },
    { name: '叶子页 B', values: ['内容省略'] },
  ];
  pages.forEach((page, i) => {
    const x = 205 + i * 180;
    if (i === 3) {
      c.push('<rect x="' + x + '" y="385" width="165" height="160" rx="8" fill="' + colors.white + '" stroke="' + colors.line + '" stroke-width="2" stroke-dasharray="7 6"/>',
        text(x + 82, 419, page.name, { size: 23, anchor: 'middle', color: colors.muted }),
        text(x + 82, 461, '尚未缓存', { size: 24, anchor: 'middle', weight: 700, color: colors.muted }),
        text(x + 82, 501, '读入后的示意位置', { size: 16, anchor: 'middle', color: colors.muted }));
    } else {
      c.push(rect(x, 385, 165, 160, { fill: colors.white, stroke: colors.blue, radius: 8 }),
        text(x + 82, 419, page.name, { size: 23, anchor: 'middle', weight: 700, color: colors.blue }));
      page.values.forEach((value, j) => c.push(text(x + 82, 458 + j * 29, value, { size: j === 0 ? 21 : 18, anchor: 'middle', mono: j === 0 })));
    }
  });
  c.push(
    text(200, 642, '① 根页、中间页、A 页已缓存：本次找 id = 6，可以直接读内存。', { size: 21, color: colors.blue, weight: 600 }),
    text(200, 683, '② 如果之后要访问 B 页：未缓存，先整页读入内存。', { size: 21, color: colors.blue }),
    rect(185, 710, 750, 210, { fill: '#F3F6FA', stroke: colors.line, strokeWidth: 2, radius: 14 }),
    text(210, 747, '磁盘：存放数据页、索引页等', { size: 24, weight: 700 }),
  );
  pages.forEach((page, i) => {
    const x = 205 + i * 180;
    c.push(rect(x, 765, 165, 125, { fill: colors.white, stroke: i === 3 ? colors.blue : colors.line, radius: 8, strokeWidth: i === 3 ? 2 : 1.5 }),
      text(x + 82, 799, page.name, { size: 23, weight: 700, anchor: 'middle', color: i === 3 ? colors.blue : colors.ink }));
    const values = i < 2 ? [page.values[0], '其余内容省略'] : page.values.slice(0, 2);
    values.forEach((value, j) => c.push(text(x + 82, 839 + j * 30, value, { size: 20, anchor: 'middle', mono: j === 0 })));
  });
  c.push(line([[827, 762], [827, 548]], { color: colors.blue, width: 3, arrow: true }),
    text(40, 968, '只示意读取过程。内存里的卡片是页的缓存，不是整条 SQL 的查询结果。', { size: 20, color: colors.muted }));
  return svg('Buffer Pool：先找内存里的页', '应用通过SQL访问MySQL，Server执行器调用InnoDB。Buffer Pool位于MySQL进程内，假设根页、中间页和A页已缓存，查订单6可以读内存；B页尚未缓存，之后需要访问B时，从磁盘将B整页读入缓冲池。页名和导航键与正文主键树一致，B页内容省略。', 1000, c);
}

if (model.table !== 'orders' || model.orders.length !== 8
  || model.directoryGroups.length !== 2 || model.directoryGroups.some((ids) => ids.length !== 4)
  || model.overviewRootKeys.join(',') !== '1,25,49' || model.navigationKeys.join(',') !== '1,9,17') {
  throw new Error('Layouts require 8 orders in page A, navigation 1/9/17 and 1/25/49, and two groups of four.');
}
if (!order(model.lookupId) || new Set(model.directoryGroups.flat()).size !== model.orders.length
  || !model.directoryGroups.flat().every((id, i) => id === model.orders[i].id)) {
  throw new Error('The directory must cover every illustrated order in primary-key order.');
}

await mkdir(outputDirectory, { recursive: true });
const diagrams = new Map([
  ['00-query-architecture.svg', queryArchitecture()],
  ['01-storage-tree-overview.svg', storageTreeOverview()],
  ['01-table-page.svg', tableAndPage()],
  ['02-record-chain.svg', recordChain()],
  ['02-page-search.svg', pageSearch()],
  ['02-page-directory.svg', pageDirectory()],
  ['03-primary-btree.svg', primaryTree()],
  ['04-secondary-lookup.svg', secondaryLookup()],
  ['06-buffer-pool.svg', bufferPool()],
]);
for (const [filename, content] of diagrams) {
  await writeFile(path.join(outputDirectory, filename), content);
  console.log('Generated public/images/mysql/' + filename);
}

await writeFile(path.join(outputDirectory, '05-join-venn.svg'), await readFile(path.join(directory, 'join-venn.svg')));
console.log('Copied public/images/mysql/05-join-venn.svg');
