-- 先执行 01-setup.sql，再执行本文件。
-- 以下查询只读取数据；预期结果以未修改的 12 行示例为准。

USE mysql_frontend_lab;

-- 0. 记录环境。页大小由实例配置决定；默认通常是 16384 字节。
SELECT VERSION() AS mysql_version, @@innodb_page_size AS page_size_bytes;
SHOW CREATE TABLE products;
SHOW INDEX FROM products;

-- 1. 查看整张表。要保证结果顺序，必须显式写 ORDER BY。
SELECT id, name, category, price, stock
FROM products
ORDER BY id;

-- 2. 主键等值查询。预期：6 | Keyboard | 199.00 | 15。
SELECT id, name, price, stock
FROM products
WHERE id = 6;

-- 3. 主键范围查询。预期 id：5、6、7、8，且按这个顺序返回。
SELECT id, name
FROM products
WHERE id >= 5 AND id <= 8
ORDER BY id;

-- 4. 按分类查商品。预期 id：2、6、10。
-- 如果选择 idx_category，索引中的主键值可用于继续查找商品名称和价格。
SELECT id, name, price
FROM products
WHERE category = 'office'
ORDER BY id;

-- 5. 只取二级索引已有的列，作为第二篇“覆盖索引”的预习。
SELECT category, id
FROM products
WHERE category = 'office'
ORDER BY id;

-- 6. 观察执行计划；EXPLAIN 不是按步骤输出“每一页怎么读”。
-- FORMAT=TRADITIONAL 固定为表格格式，方便对照 key、type、rows 等列。
EXPLAIN FORMAT=TRADITIONAL
SELECT id, name, price, stock
FROM products
WHERE id = 6;

EXPLAIN FORMAT=TRADITIONAL
SELECT id, name, price
FROM products
WHERE category = 'office'
ORDER BY id;

-- 只有 12 行时，优化器可能认为全表扫描更便宜。
-- 不要求 idx_category 必须被选中，也不把示意图当作这张小表的真实页布局。
