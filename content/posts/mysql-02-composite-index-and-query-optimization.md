---
status: draft
title: "MySQL 入门（二）：联合索引、执行计划与查询优化"
date: "2026-11-02"
description: "沿着订单查询理解联合索引的排序、最左前缀与索引条件下推，再用 EXPLAIN 检查查询计划。"
tags: ["服务端"]
---

[上一篇](/blog/mysql-01-from-query-to-btree)里，我们沿着一条 SQL 找到数据页，认识了 B+ 树、二级索引、回表和覆盖索引。那时我们给 `orders` 表的 `user_id` 建了单列索引：先在索引里找用户，再根据订单主键回表取其他字段。

但业务里的查询往往不止一个条件。比如，用户打开订单页时，我们想找出他的已支付订单，按下单时间从近到远展示。只按 `user_id` 找到订单后，可能还要筛选状态、排序。如果一个用户有很多订单，能不能让索引同时照顾这些条件？

本文从这个问题出发，看看**联合索引怎样排列数据，哪些条件可以缩小查找范围，以及怎样用执行计划验证自己的判断**。和上一篇一样，基线是 **MySQL 8.4、InnoDB 存储引擎**。

# 一、一个索引里放多个字段

## 回到订单表

继续用上一篇的订单数据，给每笔订单加一个 `created_at`，表示下单时间。下表里的日期是本文新增的示例；`id`、`user_id`、`amount`、`status` 与上一篇保持一致。

| id | user_id | amount | status | created_at |
| --- | --- | --- | --- | --- |
| 1 | 1 | 120.00 | paid | 2026-10-01 10:00:00 |
| 2 | 1 | 80.00 | paid | 2026-10-02 10:00:00 |
| 3 | 2 | 160.00 | paid | 2026-10-01 11:00:00 |
| 4 | 2 | 90.00 | paid | 2026-10-03 11:00:00 |
| 5 | 3 | 60.00 | paid | 2026-10-01 12:00:00 |
| 6 | 3 | 70.00 | paid | 2026-10-02 12:00:00 |
| 7 | 4 | 300.00 | paid | 2026-10-03 12:00:00 |
| 8 | 3 | 900.00 | unpaid | 2026-10-03 13:00:00 |

为了让下面的 SQL 可以自己运行，这里给出表结构和数据：

```sql
CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_user_id (user_id)
) ENGINE = InnoDB;

INSERT INTO orders (id, user_id, amount, status, created_at) VALUES
  (1, 1, 120.00, 'paid',   '2026-10-01 10:00:00'),
  (2, 1,  80.00, 'paid',   '2026-10-02 10:00:00'),
  (3, 2, 160.00, 'paid',   '2026-10-01 11:00:00'),
  (4, 2,  90.00, 'paid',   '2026-10-03 11:00:00'),
  (5, 3,  60.00, 'paid',   '2026-10-01 12:00:00'),
  (6, 3,  70.00, 'paid',   '2026-10-02 12:00:00'),
  (7, 4, 300.00, 'paid',   '2026-10-03 12:00:00'),
  (8, 3, 900.00, 'unpaid', '2026-10-03 13:00:00');
```

这些语句你读过去应该就知道什么意思了。不多解释。

## 用户打开订单页

现在查用户 3 最近的已支付订单：

```sql
SELECT id, user_id, status, created_at -- 3. 展示订单信息
FROM orders                            -- 1. 从订单表取数据
WHERE user_id = 3                      -- 2. 限定用户
  AND status = 'paid'                  -- 2. 只要已支付订单
ORDER BY created_at DESC, id DESC     -- 4. 新订单在前，时间相同按 id 降序
LIMIT 20;                              -- 5. 最多取 20 条
```

结果是：

| id | user_id | status | created_at |
| --- | --- | --- | --- |
| 6 | 3 | paid | 2026-10-02 12:00:00 |
| 5 | 3 | paid | 2026-10-01 12:00:00 |

订单 8 属于用户 3，但状态是 `unpaid`，所以没有出现在结果中。`id DESC` 用来给时间相同的订单确定顺序；如果只有 `ORDER BY created_at DESC`，相同时间的订单先后没有保证。

上一篇的 `idx_user_id` 可以帮助找到用户 3 的索引项，但它不包含 `status` 和 `created_at`。假设使用这棵索引，查询还需要取得缺少的列并处理筛选、排序。能否把查询常用的几个字段一起放进索引？

```sql
CREATE INDEX idx_user_status_created
ON orders (user_id, status, created_at);
```

这就建立了一个**联合索引**。它仍是一棵二级 B+ 树，不是三棵单列索引；索引项里有这三个索引列，也有 InnoDB 附带的主键 `id`。建索引不会改变表的列。[多列索引](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html) · [InnoDB 索引扩展](https://dev.mysql.com/doc/refman/8.4/en/index-extensions.html)

## 索引里的顺序是怎样的

可以把联合索引想成一串**多字段组成的键**：

```text
(user_id, status, created_at, id)
```

先比较 `user_id`；用户相同，再比较 `status`；前两项都相同，再比较 `created_at`。当三个显式索引列的值也相同时，再用附带的主键区分记录。

![联合索引先按 user_id 排列，同一用户内按 status 排列，同一状态内再按 created_at 排列](/images/mysql/07-composite-index.svg)

在本文的数据中，用户 3 的 `paid` 订单 5、6 排在同一段，`unpaid` 的订单 8 在另一段。查询 `user_id = 3 AND status = 'paid'` 时，可以先定位到用户 3 的已支付订单范围，再沿时间顺序读取。

注意：`created_at` 只是在**前面的 `user_id` 和 `status` 相同的那一组内**有序，不是整棵索引按时间全局排列。上一篇讲过的叶子页顺序、范围扫描和页内查找，在这里依然适用；变化是比较的键从一个字段变成了多个字段的组合。

<div class="interview-group">

**面试串联**

<details>
<summary>联合索引和多个单列索引有什么区别？</summary>

`(user_id, status, created_at)` 是一棵按照这几个字段的组合顺序排列的索引树；分别给三个字段建索引，则是三棵各自按单列排序的树。

联合索引可以直接利用相邻列共同确定部分查询的访问范围，也可能同时支持排序或覆盖。多个单列索引有时可以由优化器使用 Index Merge 等方式组合，但不等同于一棵按组合键排列的树。最终选哪种访问方式，要看查询和成本。[Index Merge](https://dev.mysql.com/doc/refman/8.4/en/index-merge-optimization.html)

</details>

</div>

# 二、最左前缀：从哪里开始找

## 为什么要从前面的字段看起

还是看 `(user_id, status, created_at)`：

- 只有 `user_id = 3`：用户 3 的索引项排在一起，可以找到这一段。
- 加上 `status = 'paid'`：用户 3 内部的已支付订单又排在一起，可以继续缩小范围。
- 再加 `created_at >= '2026-10-02'`：可以在用户和状态确定的范围里继续按时间查找。

从左到右连续使用索引前面的列，这就是常说的**最左前缀**。例如上面的索引有 `(user_id)`、`(user_id, status)` 和 `(user_id, status, created_at)` 这些前缀。

如果只有 `status = 'paid'`，各用户的已支付订单分散在不同的用户分组中，并不构成整棵索引里的一段连续范围。因此，不能像知道 `user_id` 时那样，直接定位到一个完整的 `paid` 范围。

这不是说“没有最左列，这棵索引就绝对不可能被用到”。优化器仍可能选择扫描索引，特定条件下也可能考虑 **Skip Scan** 等访问方式；具体取决于查询、数据分布和成本。最左前缀先帮助我们理解普通的连续范围查找，不是替代执行计划的万能规则。[范围优化与 Skip Scan](https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html)

## WHERE 的书写顺序，要和索引一样吗

下面两条查询表达的过滤条件相同：

```sql
WHERE user_id = 3 AND status = 'paid'
```

```sql
WHERE status = 'paid' AND user_id = 3
```

对这两个普通的 `AND` 条件，不必为了匹配联合索引而调整文字顺序。优化器分析的是条件和索引结构，**索引定义里的列顺序**才决定索引怎样排列。

如果只有 `user_id` 和 `created_at` 的条件，中间缺了 `status`，则不能把它们简单当成连续的 `(user_id, created_at)` 索引前缀。`user_id` 仍可能用于定位用户范围，`created_at` 也可能用于后续筛选；实际使用到什么程度，应查看执行计划。

<div class="interview-group">

**面试串联**

<details>
<summary>什么是最左前缀？没有最左列就一定不能用索引吗？</summary>

联合索引按多列依次排序。最左前缀指从索引第一列开始连续组成的前缀；用它们更容易定位连续的索引范围。

缺少首列时，一般不能直接定位这样的连续范围，但不代表这棵索引在任何情况下都不会被使用。比如优化器可能扫描覆盖所需列的索引，满足条件时也可能使用 Skip Scan。要区分**是否能有效定位范围**和**执行计划是否选择了这棵索引**。

</details>

</div>

# 三、范围条件之后，字段还有用吗

## 先分清扫描范围和筛选条件

为了把问题看清楚，暂时用一个简化索引 `(a, b, c)`：

```sql
WHERE a = 1 AND b > 10 AND c = 3
```

索引先按 `a` 排，再在相同 `a` 内按 `b` 排，最后才按 `c` 排。这里可以先找到 `a = 1`、`b > 10` 的索引范围；但在这段范围中，`b` 有很多不同值，每个 `b` 下的 `c` 分别排列，`c = 3` 的记录不一定紧挨在一起。

所以，在这个例子里，`c = 3` **通常不能继续把整个扫描范围缩成一段连续区间**。但它仍是查询条件，也仍在索引项里，不能因此说它“完全没用”。[多列索引范围](https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html)

相比之下，如果是 `a = 1 AND b = 10 AND c > 3`，前两个值已经固定，就可以在这个分组内按 `c` 确定范围。

## 索引条件下推：先筛掉一些，再回表

假设上面的查询还要读取不在索引里的其他列，需要回表；图里这段范围有四个索引项，其中两个的 `c` 等于 3。

![联合索引范围内有四个索引项，其中两个满足 c 等于 3；索引条件下推可先过滤，再对符合条件的项回表](/images/mysql/08-composite-icp.svg)

没有使用索引条件下推时，可以先按索引范围找到候选项，再取得完整记录并判断剩余条件。使用 **索引条件下推（Index Condition Pushdown，ICP）** 时，引擎可以先利用索引项里的 `c` 判断条件，仅对通过的候选项回表。

在这张示意图中，要扫描的索引项仍是四个；假设其他条件相同，回表从四次减少到两次。这里的数字是为了说明路径，**不是每条查询都会得到这个比例**。ICP 是否适用、是否被选择，要结合执行计划。InnoDB 的 ICP 用于二级索引访问；针对已经包含完整行的聚簇索引，不能用同样的“先筛再减少回表”来解释。[索引条件下推](https://dev.mysql.com/doc/refman/8.4/en/index-condition-pushdown-optimization.html)

把这三件事分开：

| 方式 | 主要减少什么 |
| --- | --- |
| 更合适的索引范围 | 减少需要扫描的索引项 |
| 索引条件下推 | 在需要完整记录时，先用索引列筛掉部分候选项，减少回表 |
| 覆盖索引 | 查询需要的列已经在索引中，通常不必为了取其他列回表 |

覆盖索引的可见性边界沿用上一篇：在某些需要检查版本可见性的情况下，InnoDB 仍可能访问聚簇记录。“覆盖”主要说明取列路径，不能理解为任何情况下都绝不访问聚簇记录。

<div class="interview-group">

**面试串联**

<details>
<summary>联合索引遇到范围条件后，后面的列就失效了吗？</summary>

不能这样一概而论。对于 `(a, b, c)` 和 `a = 1 AND b > 10 AND c = 3`，各个 `b` 值下满足 `c = 3` 的记录不一定构成一段连续范围；`c` 仍可能用于索引条件下推、覆盖查询或其他筛选，某些查询的范围边界也可能涉及后续列。具体作用取决于 SQL 和执行计划。

索引条件下推和覆盖索引也不同：前者在需要完整记录时，尽量先筛掉候选项；后者是查询所需的列已经包含在索引里。

</details>

</div>

# 四、索引还能帮助排序和覆盖吗

## 在一组订单里按时间读

回到订单页查询：

```sql
SELECT id, user_id, status, created_at
FROM orders
WHERE user_id = 3 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`user_id` 和 `status` 都是等值条件，范围落在同一个用户、同一种状态内；该组里的索引项再按 `created_at` 和附带的 `id` 排列。对于这个查询，优化器可以考虑反向读取这段索引，以满足两个字段的降序要求。

这里的前提是**选择了合适的访问路径，并且索引顺序与排序要求相匹配**。如果同时查询多个用户，或者排序方向、表达式与索引顺序不匹配，就不能直接套用这个结论。实际是否需要额外排序，仍要看计划。[ORDER BY 优化](https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html)

## 为什么这个查询可能被覆盖

查询需要的 `user_id`、`status`、`created_at` 在联合索引中；`id` 是主键，InnoDB 二级索引也包含它。假如执行计划使用这棵索引，通常可以从索引取得这些列，不必为了取列回表。

如果把 `amount` 也加进 SELECT，而当前联合索引没有它，就可能需要回表：

```sql
SELECT id, user_id, status, created_at, amount
FROM orders
WHERE user_id = 3 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

能不能把 `amount` 也加进索引？可以作为方案评估，但列的顺序也要重新检查。如果直接在 `created_at` 后加 `amount`，它会排在隐含的 `id` 前面，未必还能满足同一时间内按 `id` 排序的要求。候选方案可以考虑显式将 `id` 放在 `amount` 前，再用执行计划验证。

别只看这一条查询：更宽的索引占用更多空间，也需要随写入维护。是否值得，要看访问频率、数据量、回表代价和其他查询的需要。

# 五、用 EXPLAIN 看执行计划

## 先看 MySQL 打算怎么查

上一篇说过，有索引不代表优化器一定选择它。现在可以在订单查询前加 `EXPLAIN`：

```sql
EXPLAIN FORMAT=TRADITIONAL
SELECT id, user_id, status, created_at
FROM orders
WHERE user_id = 3 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`FORMAT=TRADITIONAL` 让输出采用表格形式，方便先认识常用列。我们从下面几项看起：

| 输出列 | 看什么 |
| --- | --- |
| `type` | 对这张表采用什么访问方式，例如 `ALL` 表示全表扫描，`range` 表示范围访问 |
| `possible_keys` | 优化器认为可能用于查找的候选索引；出现某个名字不代表最终选了它 |
| `key` | 实际选中的索引名；也要结合 `type` 看是定位范围还是扫描索引 |
| `key_len` | 计划使用的索引键长度，可辅助分析使用了哪些键部分，但不能单独证明所有条件都缩小了扫描范围 |
| `rows` | 优化器估计需要检查的行数，不是实际测量值 |
| `filtered` | 估计经过表条件过滤后保留的百分比 |
| `Extra` | 其他执行信息，例如索引覆盖、索引条件下推或额外排序 |

例如，`Extra` 里的 `Using index` 通常表示查询可由索引覆盖；`Using index condition` 表示使用了索引条件下推，两者不是一回事。`Using filesort` 表示额外的排序阶段，**不代表一定写入磁盘**。[EXPLAIN 输出](https://dev.mysql.com/doc/refman/8.4/en/explain-output.html) · [ORDER BY 与 filesort](https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html)

别急着把 `type` 背成一个性能排名：返回行数、数据分布、是否覆盖和排序成本都重要。`key` 有值也不自动代表查询高效；它可能是在扫描很大一段索引。

**不要期待这 8 行练习数据一定选中联合索引。** 小表直接扫描可能更便宜；MySQL 版本、统计信息、表大小和数据分布也会影响选择。实际输出以你的实例为准，因此这里不虚构一张执行计划结果表。

## 看实际执行：EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT id, user_id, status, created_at
FROM orders
WHERE user_id = 3 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`EXPLAIN ANALYZE` 会**真正执行这条语句**，并以树形结构展示执行过程，包括估计行数、实际返回行数、耗时和执行次数 `loops`。可以把估计与实际对照，观察优化器预期是否偏离数据情况；有多个循环时，也要结合 `loops` 理解每轮数据。

它不是免费读取计划：语句会占用真实资源。练习时先使用可控数据和 `SELECT`，分析生产查询时也要考虑执行成本。[EXPLAIN ANALYZE](https://dev.mysql.com/doc/refman/8.4/en/explain.html)

<div class="interview-group">

**面试串联**

<details>
<summary>EXPLAIN 和 EXPLAIN ANALYZE 有什么区别？</summary>

`EXPLAIN` 主要展示优化器选出的计划和估算；`EXPLAIN ANALYZE` 会执行语句，展示执行节点的估算与实际指标。普通 `EXPLAIN` 也支持树形输出；`EXPLAIN ANALYZE` 使用树形输出，其实际行数和耗时还应结合循环次数、缓存和测试环境解读。

看到 `possible_keys` 里有某个索引，不代表使用了它；要看 `key` 以及访问类型、预计行数等信息。不同数据分布和统计信息可能产生不同计划。

</details>

</div>

# 六、把查询优化串起来

假设线上订单页变慢了，我们先拿到真实 SQL 和对应的表结构，再围绕它做一次检查。

## 第一步：明确需要的数据

订单页需要**某个用户的已支付订单**，按时间和 ID 倒序取前 20 条。先确认查询确实需要哪些列，避免为了展示几项信息取回整行。

然后记录现有索引，执行 `EXPLAIN`，在合适的测试环境使用 `EXPLAIN ANALYZE`。重点看选中的访问路径、估计与实际行数、是否有额外排序；有慢查询日志或监控时，也要结合调用频率和端到端耗时。

## 第二步：提出索引方案

`(user_id, status, created_at)` 是一个值得验证的候选：前两列对应等值条件，后面衔接时间顺序；InnoDB 二级索引包含主键，而查询也用主键作为同时间订单的排序依据。

但这只是针对当前 SQL 的**假设**。如果还有按用户查询所有状态订单、按时间查询全部用户订单等其他高频需求，就要一起评估。联合索引列顺序首先服务查询模式，不存在一套对所有业务都最优的固定顺序。

## 第三步：用一组数据验证

上面只有 8 行数据，不适合观察索引在较大数据集中的选择。下面做一个**独立实验**：生成 10 万条订单，对同一条查询比较建联合索引前后的计划。请在新建的练习库里执行，下面的 `orders` 是一张新的实验表，不要直接用已有业务表执行。

```sql
CREATE TABLE orders (
  id BIGINT NOT NULL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  KEY idx_user_id (user_id)
) ENGINE = InnoDB;

-- 五组 0～9 交叉组合出 0～99999，生成 10 万条实验数据
INSERT INTO orders (id, user_id, status, created_at, amount)
WITH digits AS (
  SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
  SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
  SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
), nums AS (
  SELECT a.n + 10*b.n + 100*c.n + 1000*d.n + 10000*e.n AS n
  FROM digits a CROSS JOIN digits b CROSS JOIN digits c
  CROSS JOIN digits d CROSS JOIN digits e
)
SELECT n + 1, FLOOR(n / 100) + 1,
       IF(MOD(n, 2) = 0, 'paid', 'unpaid'),
       TIMESTAMP('2026-01-01 00:00:00') + INTERVAL MOD(n, 365) DAY,
       MOD(n, 10000) / 100
FROM nums;

ANALYZE TABLE orders; -- 更新实验表的索引统计信息
```

这组数据里，每个用户有 100 条订单，其中一半为 `paid`。下面查询比前面的例子多取了 `amount`，方便观察需要完整记录的情况：

```sql
EXPLAIN FORMAT=TRADITIONAL
SELECT id, user_id, status, created_at, amount
FROM orders
WHERE user_id = 42 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

先记录结果。想看实际执行节点，可以在建联合索引前运行下列语句，并在建索引后再运行一次，对比前后变化：

```sql
EXPLAIN ANALYZE
SELECT id, user_id, status, created_at, amount
FROM orders
WHERE user_id = 42 AND status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

然后创建联合索引，更新统计信息，重新执行上面的 `EXPLAIN` 和 `EXPLAIN ANALYZE`：

```sql
CREATE INDEX idx_user_status_created
ON orders (user_id, status, created_at);

ANALYZE TABLE orders;
```

在一次 **MySQL 8.4.13、InnoDB** 的隔离环境实验中，表格计划的部分结果如下：

| 对比项 | 建联合索引前 | 建联合索引后 |
| --- | --- | --- |
| `key` | `idx_user_id` | `idx_user_status_created` |
| `rows`（估计） | 100 | 50 |
| `filtered`（估计百分比） | 10 | 100 |
| `Extra` | `Using where; Using filesort` | `Backward index scan` |

同一次实验中，`EXPLAIN ANALYZE` 显示：建索引前先经用户索引读取 100 条候选记录，筛出 50 条已支付订单，再排序并取 20 条；建索引后，计划从对应联合索引范围反向读取，取得 20 条后满足 `LIMIT`，没有单独的排序节点。这里的查询还需要索引中没有的 `amount`，不能把它说成覆盖查询。

注意区分表格里的 `rows`、`filtered` **只是优化器估计**，并不等于 `EXPLAIN ANALYZE` 实际看到的行数：本例中建索引前估计过滤比例为 10%，实际 100 条中有 50 条符合状态条件。这一偏差本身正说明估计和实际值得对照。

这只是特定数据与环境下的一次实验，不是所有实例都会选择同样计划，更不意味着这个索引总是更快。真实业务还要一起观察：

- 访问范围是否更集中，是否有额外排序？
- 查询需要的列是否被覆盖，是否需要回表取列？
- 延迟和资源消耗有没有改善，写入与存储成本增加了多少？

比较时保证前后查询条件一致；缓存状态、数据分布和并发负载不同，也会影响耗时。不要从一次执行的毫秒数就下结论。如果计划和预期差距很大，可以检查统计信息是否反映当前数据，再重新观察；不要一开始就把强制索引当成最终方案。[InnoDB 索引统计信息](https://dev.mysql.com/doc/refman/8.4/en/innodb-persistent-stats.html)

## 为什么有索引还是可能全表扫描

优化器会比较预估成本。如果表很小，或者一个条件命中了表中大部分记录，走二级索引再多次回表可能比直接扫描更贵。反过来，状态字段虽然不同值不多，如果某个状态很少见，或者它是适合查询的联合索引的一部分，也可能有价值。

另外，有些写法可能让普通索引难以直接形成有效范围。例如按某一天筛选：

```sql
-- 对列应用函数，普通 created_at 索引未必能直接用该条件定位范围
WHERE DATE(created_at) = '2026-10-02'
```

如果业务语义确实是这个自然日，可以改写为左闭右开的范围：

```sql
WHERE created_at >= '2026-10-02 00:00:00'
  AND created_at <  '2026-10-03 00:00:00'
```

范围写法不需要猜一天最后一个小数秒。函数索引、数据类型和实际计划都会影响结果；左模糊匹配、隐式类型转换等情况也应具体分析，而不是看到某个写法就断言“索引一定失效”。

<div class="interview-group">

**面试串联**

<details>
<summary>设计联合索引时，列顺序应该怎样选择？</summary>

先看需要支持的实际查询：哪些列做等值过滤，哪些列用于范围、排序或分组，以及是否有覆盖查询的收益。再比较候选索引的复用价值、扫描范围、空间和写入成本。

不要机械地只按字段区分度排序，也不要一看到低区分度字段就排除它。一个索引是否有效，最终要在接近实际的数据和负载下验证。

</details>

<details>
<summary>为什么建了索引，MySQL 仍然选择全表扫描？</summary>

优化器按统计信息估算成本：表很小、条件命中大量记录、回表较多，或者现有索引无法有效支持当前查询时，全表扫描都可能更便宜。统计信息与实际分布差距大，也可能造成估算偏差。

先检查 SQL、执行计划和实际行数，再考虑调整索引、更新统计信息或改写查询。`possible_keys` 中出现索引不代表它最终被选择。

</details>

</div>

回头看文章开头的订单页，完整过程是：

```text
明确用户、状态、排序与返回列
  → 设计候选联合索引，理解组合键顺序
  → 用 EXPLAIN 看优化器选择的路径
  → 在合适的数据上对照实际执行情况
  → 权衡扫描、回表、排序和索引维护成本
```

联合索引让多个字段按同一套顺序组织起来，`EXPLAIN` 则帮助我们检查 MySQL 最终如何使用它。下一篇会从查询转向并发修改，继续看事务、锁、undo log 和 Read View。
