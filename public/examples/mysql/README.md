# MySQL 第一篇配套 SQL

这组文件与 MySQL 系列第一篇配套，目标环境是 **MySQL 8.4 + InnoDB**。

- [01-setup.sql](./01-setup.sql)：创建 `mysql_frontend_lab.products`，加入 12 条商品数据和一个分类索引。
- [01-queries.sql](./01-queries.sql)：主键查询、范围查询、分类查询，以及两条 `EXPLAIN`。

下面任选一种运行方式。代码块中的终端命令与 `mysql>` 后的 SQL 分开执行；不需要输入提示符本身。

## 方式一：使用临时 Docker 容器

先安装并启动 Docker Desktop。把两个 SQL 文件下载到同一目录，在该目录打开终端。启动一个只用于学习的容器：

```bash
docker run --name mysql-frontend-lab --rm \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
  -d mysql:8.4
```

这个临时容器使用空密码，没有映射宿主机端口；通过 `docker exec` 使用容器内的客户端即可，不需要本机已有数据库的账户。`--rm` 表示容器停止后自动移除容器及其匿名卷中的实验数据。空密码仅用于这个临时实验环境。

查看启动日志，等到正式服务出现 `ready for connections`。首次启动时初始化过程中的临时服务也会打印这个提示；看到 `MySQL init process done. Ready for start up.` 后，再等正式服务就绪：

```bash
docker logs mysql-frontend-lab
```

把 SQL 文件复制进去，然后打开 MySQL 客户端：

```bash
docker cp 01-setup.sql mysql-frontend-lab:/tmp/01-setup.sql
docker cp 01-queries.sql mysql-frontend-lab:/tmp/01-queries.sql
docker exec -it mysql-frontend-lab mysql -uroot
```

在 `mysql>` 提示符后运行：

```sql
SOURCE /tmp/01-setup.sql;
SOURCE /tmp/01-queries.sql;
```

想逐条观察，可以打开 `01-queries.sql`，每次复制一条以分号结尾的语句执行。在 MySQL 中输入 `exit` 只会退出客户端；不再需要实验数据时，可以在终端停止这个临时容器：

```bash
docker stop mysql-frontend-lab
```

以上容器用法依据 [Docker Official Image: MySQL](https://hub.docker.com/_/mysql) 的环境变量与客户端说明。

## 方式二：使用已有 MySQL 客户端

在保存两个 SQL 文件的目录打开终端，连接自己的本地实验实例。把用户名换成具有创建演示库和表权限的实验账户：

```bash
mysql -h 127.0.0.1 -P 3306 -u your_lab_user -p
```

输入密码后，在 `mysql>` 提示符后运行：

```sql
SOURCE 01-setup.sql;
SOURCE 01-queries.sql;
```

文件路径按启动客户端时所在的目录解析。两个脚本都明确使用 `mysql_frontend_lab`，不依赖连接时默认选中了哪个数据库。

## 应当看到什么

在空演示库首次执行初始化后，`product_count` 为 `12`。若已经修改过演示数据，下表中的结果可能不同。

| 查询 | 预期结果 |
| --- | --- |
| `WHERE id = 6` | `6 / Keyboard / 199.00 / 15` |
| `WHERE id >= 5 AND id <= 8 ORDER BY id` | `5 / Mouse`、`6 / Keyboard`、`7 / Cable`、`8 / Towel` |
| `WHERE category = 'office' ORDER BY id` | `2 / Desk lamp / 89.00`、`6 / Keyboard / 199.00`、`10 / Monitor / 899.00` |
| 只查询 `category, id` | `office / 2`、`office / 6`、`office / 10` |
| `SHOW INDEX FROM products` | 主键索引 `PRIMARY` 与分类索引 `idx_category` |

主键点查的计划通常会显示 `key = PRIMARY`、`type = const`。分类查询不保证选择 `idx_category`：12 行数据很少，优化器可能认为扫描整张表更划算。不同版本、统计信息或数据分布也会影响计划，所以不要将整份 `EXPLAIN` 输出当作固定答案。下一篇再展开 `key`、`rows` 等列的含义。

文章里的索引树人为限制了每页记录数，用于演示搜索路径。真实 InnoDB 不会因为插入了这 12 条数据，就必然生成图中同样数量的页。

## 重复运行会怎样

初始化脚本没有 `DROP`、`TRUNCATE` 或删除数据的语句。库和表不存在时才创建；同一个主键已经存在时，`ON DUPLICATE KEY UPDATE id = products.id` 将原来的 `id` 赋回自身，保留该行其他列。

因此重复运行可以补回缺失的示例主键，但**不会恢复已经修改过的名称、价格或库存**，也不会删除额外插入的行。`CREATE TABLE IF NOT EXISTS` 不检查或修复已有同名表的结构，已有不同结构时请换一个独立的实验实例。关于重复主键赋值的行为，可查 [MySQL 8.4：INSERT ... ON DUPLICATE KEY UPDATE](https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html)。

整份查询脚本只有查询、结构查看与 `EXPLAIN`，没有更新或删除商品的操作。

## 验证记录

2026-10-28 在独立的 `mysql:8.4` 临时容器中完成验证，实际版本为 **MySQL 8.4.13**，`@@innodb_page_size = 16384`：

- 连续执行两次初始化，均保留 12 条记录。
- 完整执行查询脚本，12 行数据与 `diagrams/mysql/model.json` 的配图数据逐字段一致。
- 主键点查返回 Keyboard，范围和分类查询与上表一致。
- 在临时库修改 Keyboard 的名称、价格和库存，再执行初始化，修改后的值仍然保留。
- 本次主键点查计划为 `type = const / key = PRIMARY / rows = 1`；分类查询为 `type = ref / key = idx_category / rows = 3`。这些是本次环境的观察值，不是后续每次运行必须得到的固定输出。
