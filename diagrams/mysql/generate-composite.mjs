import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '../../public/images/mysql');
const rows = [
  { user: '1', status: 'paid', date: '2026-10-01 10:00', id: '1' },
  { user: '1', status: 'paid', date: '2026-10-02 10:00', id: '2' },
  { user: '2', status: 'paid', date: '2026-10-01 11:00', id: '3' },
  { user: '3', status: 'paid', date: '2026-10-01 12:00', id: '5' },
  { user: '3', status: 'paid', date: '2026-10-02 12:00', id: '6' },
  { user: '3', status: 'unpaid', date: '2026-10-03 13:00', id: '8' },
];
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, value, size = 20, color = '#172B42', extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="${size}" ${extra}>${esc(value)}</text>`;
const parts = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="700" viewBox="0 0 1080 700" role="img" aria-labelledby="title desc">',
  '<title id="title">联合索引：先按用户，再按状态，最后按时间排序</title>',
  '<desc id="desc">联合索引 user_id、status、created_at 的部分叶子项按用户、状态、时间依次排列；用户三的项目连续，其中已支付订单也构成更小的连续区间。索引项附带主键 id。</desc>',
  '<rect width="1080" height="700" fill="#ffffff"/>',
  '<rect x="36" y="29" width="7" height="56" rx="3" fill="#145DA8"/>',
  text(57, 53, '联合索引：先按用户，再按状态，最后按时间', 27, '#172B42', 'font-weight="700"'),
  text(57, 85, '索引 (user_id, status, created_at) 的部分叶子项；每项还携带订单主键 id', 18, '#53677C'),
  '<rect x="57" y="120" width="700" height="45" rx="7" fill="#F3F6FA"/>',
  text(100, 150, 'user_id', 19, '#53677C', 'font-weight="700"'),
  text(215, 150, 'status', 19, '#53677C', 'font-weight="700"'),
  text(341, 150, 'created_at', 19, '#53677C', 'font-weight="700"'),
  text(555, 150, 'id（主键）', 19, '#53677C', 'font-weight="700"'),
  '<rect x="63" y="348" width="690" height="198" rx="14" fill="#E7F0FC" stroke="#145DA8" stroke-width="2"/>',
  '<rect x="76" y="356" width="664" height="122" rx="10" fill="#E9F5E5" stroke="#598743" stroke-width="2"/>',
];
rows.forEach((row, i) => {
  const y = 203 + i * 62;
  parts.push(`<circle cx="83" cy="${y - 6}" r="5" fill="${row.user === '3' ? '#145DA8' : '#AABACA'}"/>`,
    text(120, y, row.user, 23), text(215, y, row.status, 22), text(341, y, row.date, 20), text(583, y, row.id, 22),
    `<line x1="95" y1="${y + 17}" x2="718" y2="${y + 17}" stroke="#CEDAE3" stroke-width="1"/>`);
});
parts.push(
  '<polyline points="758,445 790,445 790,378 803,378" fill="none" stroke="#145DA8" stroke-width="2.5"/>',
  '<circle cx="803" cy="378" r="4" fill="#145DA8"/>',
  text(818, 372, 'user_id = 3', 20, '#145DA8', 'font-weight="700"'),
  text(818, 402, '一个连续区间', 18, '#53677C'),
  '<polyline points="748,415 779,415 779,479 803,479" fill="none" stroke="#598743" stroke-width="2.5"/>',
  '<circle cx="803" cy="479" r="4" fill="#598743"/>',
  text(818, 473, '再加 status', 20, '#598743', 'font-weight="700"'),
  text(818, 502, '= paid', 20, '#598743', 'font-weight="700"'),
  text(818, 531, '范围进一步缩小', 18, '#53677C'),
  '<line x1="57" y1="584" x2="1020" y2="584" stroke="#CEDAE3" stroke-width="2"/>',
  text(58, 620, '同一用户中，先按状态排；同一状态内，再按时间排。', 21, '#172B42', 'font-weight="600"'),
  text(58, 656, '图中仅展示部分索引项，日期用于说明排列，不表示索引按时间全局有序。', 18, '#53677C'),
  '</svg>',
);
await mkdir(output, { recursive: true });
await writeFile(path.join(output, '07-composite-index.svg'), parts.join('\n') + '\n');
await writeFile(path.join(output, '08-composite-icp.svg'), await readFile(path.join(directory, 'composite-range-index-condition-pushdown.svg')));
console.log('Generated 07-composite-index.svg and copied 08-composite-icp.svg');
