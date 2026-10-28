-- MySQL 第一篇：表、数据页与索引树。
-- 目标环境：MySQL 8.4 / InnoDB。
-- 在演示库中创建表，补入不存在的示例主键；重复运行不会重置已有行。

CREATE DATABASE IF NOT EXISTS mysql_frontend_lab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE mysql_frontend_lab;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL,
  INDEX idx_category (category)
) ENGINE = InnoDB;

INSERT INTO products (id, name, category, price, stock) VALUES
  (1,  'Notebook', 'stationery',  12.50, 100),
  (2,  'Desk lamp', 'office',     89.00,  20),
  (3,  'Pen',       'stationery',  3.00, 200),
  (4,  'Mug',       'home',       25.00,  60),
  (5,  'Mouse',     'electronics',59.00,  40),
  (6,  'Keyboard',  'office',    199.00,  15),
  (7,  'Cable',     'electronics',19.90,  80),
  (8,  'Towel',     'home',       15.00,  50),
  (9,  'Eraser',    'stationery',  2.00, 150),
  (10, 'Monitor',   'office',    899.00,   8),
  (11, 'Charger',   'electronics',79.00,  30),
  (12, 'Basket',    'home',       35.00,  25)
ON DUPLICATE KEY UPDATE id = products.id;

-- 上面的最后一行是“把原 id 赋回原 id”，让重复执行保留原记录。
-- 它是本实验的初始化便利写法，正文无需先掌握 upsert。
-- IF NOT EXISTS 不会修正已有同名表的结构，请使用独立的演示库。

SELECT COUNT(*) AS product_count FROM products;
-- 首次在空演示库执行时：12。
