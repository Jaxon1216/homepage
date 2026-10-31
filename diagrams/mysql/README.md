# MySQL 配图模板

`model.json` 保存订单数据、导航键和页内分组，`generate.mjs` 保存 SVG 布局。`join-venn.svg` 是从个人 MySQL 八股笔记复制的 JOIN 图源，保留原图内容，并补充显式宽高，避免只有 viewBox 的 SVG 在 fit-content 图片容器中收缩为零。图源和展示图片一起维护。

## 重新生成

在仓库根目录运行：

```bash
node diagrams/mysql/generate.mjs
```

| 输出文件 | 用途 |
| --- | --- |
| `public/images/mysql/00-query-architecture.svg` | 前端、后端、Server 层与 InnoDB 的分工 |
| `public/images/mysql/01-storage-tree-overview.svg` | 三级主键树、订单 6 的路径、叶子页双向链接 |
| `public/images/mysql/01-table-page.svg` | 表与页的组成关系，备用图 |
| `public/images/mysql/02-record-chain.svg` | 记录头与业务字段、从 infimum 哑节点到 supremum 哨兵的记录链、空页 |
| `public/images/mysql/02-page-search.svg` | A 页内查找 6 的简图：目录二分，再沿记录链查找 |
| `public/images/mysql/02-page-directory.svg` | 同一个 A 页的完整目录槽、n_owned、next 和首尾系统记录 |
| `public/images/mysql/03-primary-btree.svg` | 与总览相同的三层查找路径，用作文章封面 |
| `public/images/mysql/04-secondary-lookup.svg` | user_id 二级索引和回表 |
| `public/images/mysql/05-join-venn.svg` | 从 `join-venn.svg` 复制的 JOIN 图 |
| `public/images/mysql/06-buffer-pool.svg` | MySQL 进程内的 Buffer Pool、磁盘页、缓存命中与未命中读页 |

生成器从自身位置解析路径。修改 JSON、生成脚本或 JOIN 图源后重新生成，不直接修改输出 SVG。没有新增绘图依赖。

## 统一数据与页编号

正文订单表与所有存储配图共用八条订单：

- `orders`：id 1～8；其中 id 6 的 user_id 为 3，amount 为 70.00，status 为 paid。
- `overviewRootKeys`：`[1, 25, 49]`，根页的简化导航下界。
- `navigationKeys`：`[1, 9, 17]`，左侧中间页的简化导航下界。
- 叶子页 A：完整展示 id 1～8。B、C 的导航范围分别是 `[9, 17)`、`[17, 25)`，只画省略框，不添加到 SQL 输入数据中。
- `directoryGroups`：`[[1, 2, 3, 4], [5, 6, 7, 8]]`，表示 A 页的教学分组。两张页内查找图均展开这个 A 页。
- `lookupId` 为 6；`secondaryColumn` 为 user_id，`secondaryValue` 为 3，匹配订单 5、6、8。

总览图为了说明大表结构画三层，并省略其他页内容。如果整张表真的只有这八条短记录，通常一个叶子页就能放下，根也就是叶子。不能把图当成这八条记录在真实数据库中已经形成三层的证据。

这套模板固定为八条订单、两个四条记录的普通组。修改记录数、分组或导航范围时，还要调整布局、图注和正文。生成器会检查数据是否完整覆盖目录分组；不会替代语义和视觉审阅。

第二节 Visits / Transactions 使用另一组到店数据，与 orders 是两套独立示例，不混用 ID。

## 连线与查找约定

- 黄色表示主键或导航键；白色格在树图里表示子页引用；绿色表示叶子记录中的其他列。蓝色高亮查询路径和目标订单。
- 总览图的页间链接为双向，页内记录的 next 为单向。不能把这两种层级的链表混淆。
- 记录链图先展示每条记录的记录头与业务字段，再展示系统记录和普通记录的单向链。infimum 可以类比头部哑节点（dummy node），正式含义仍是页内最小边界系统记录；supremum 是尾部哨兵。两者不保存订单业务数据，空页也保留。
- 页目录槽指向组末记录。四个槽分别指向 infimum、记录 4、记录 8、supremum；拥有计数为 1、4、4、1，其余用户记录的 n_owned 为 0。
- 查找 6 时，先通过页目录确定 `4 < 6 <= 8`，再从前一组末记录 4 沿 next 找到 5、6；不是到记录 8 后倒着找。
- 正文按记录头 → 记录链与哑节点 → 分组 → 目录槽 → 查找展开。记录链图、完整目录图、查找图依次出现；查找图省略系统记录本体，槽内用所指记录的名称或主键标注，实际槽保存页内位置。完整图标明记录头与业务字段、分组、首尾哨兵。普通组为 4～8 条，首尾组允许例外；实际插入同样记录不保证得到同样分组。
- 目录槽保存页内偏移，next 用相对偏移表示下一记录的位置。图按逻辑顺序排布，箭头只表示引用关系，不按真实字节位置绘制。
- 导航键用简化下界表示，省略最左项特殊最小标记；父层导航键不保证始终等于子页当前最小值。
- 叶子页逻辑相邻，不保证磁盘地址连续；行图省略内部字段和可能的页外存储。
- 回表图假设优化器选择 user_id 索引，只展开 id 6 的一次回表，其余匹配行也需要读取额外列。二级索引携带主键值，不是磁盘地址。
- JOIN 维恩图只辅助记忆保留哪一侧记录，不表达一对多连接的行数，也不表示结果会去重。MySQL 不直接支持 FULL OUTER JOIN。

- Buffer Pool 图与树图共用根页、中间页、A/B 页的名称和导航键。假设根页、中间页、A 页已缓存，B 页未缓存；虚线卡片只是读入后的示意位置，不表示预先分配的固定缓存槽。箭头表示之后访问 B 时整页读入，省略写入、刷盘与淘汰过程。B 页内容仍然省略，不增加正文 SQL 输入数据。

## 检查

重新生成后，用浏览器或 SVG 查看器核对文字与连线。可用项目已有的 sharp 渲染 PNG 预览；不需要新增依赖。图中保留 `<text>`、`<title>` 和 `<desc>`，文章使用普通 Markdown 图片语法，沿用图片放大功能。

手走查询路径：根页 → 左侧中间页 → A 页 → 页目录 → 4 → 5 → 6。核对 user_id = 3 的结果为 5、6、8，订单 8 未支付也应保留，因为该查询没有筛选支付状态。
