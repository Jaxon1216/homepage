# 性能测试指南 - Lighthouse 使用手册

## 测试环境选择

### 本地测试 vs 线上测试

| 测试环境 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| **本地测试** | 快速迭代，立即看到效果 | 没有 CDN、网络条件理想化 | 开发阶段快速验证 |
| **线上测试** | 真实用户体验，包含 CDN/网络延迟 | 需要部署，测试慢 | 最终验证、对外展示 |

**推荐流程：**
1. **优化前**：线上测试记录基准数据
2. **优化中**：本地测试快速验证
3. **优化后**：线上测试记录最终数据

---

## Lighthouse 测试步骤

### 步骤 1：启动项目

**本地测试：**
```bash
npm run build
npm start
```

然后访问 `http://localhost:3000`

**线上测试：**
直接访问你的 Vercel 域名（如 `https://jiangxu.net`）

---

### 步骤 2：打开 Chrome 无痕模式

**为什么用无痕模式？**
- 避免浏览器插件干扰（广告拦截、主题插件等会影响性能）
- 清空缓存状态，模拟首次访问
- 确保测试结果可重复

**操作：**
1. Chrome 浏览器按 `Cmd + Shift + N`（Mac）或 `Ctrl + Shift + N`（Windows）
2. 访问你的网站

---

### 步骤 3：打开 Lighthouse

**方法 1：DevTools 内置（推荐）**

1. 按 `F12` 或 `Cmd + Option + I` 打开开发者工具
2. 点击顶部的 **Lighthouse** 标签
   - 如果没看到，点击 `>>` 按钮，在下拉菜单中选择 Lighthouse
3. 配置测试选项：
   - **Mode**: Navigation（默认）
   - **Device**: Desktop 或 Mobile（建议都测）
   - **Categories**: 勾选 Performance、Accessibility、Best Practices、SEO
4. 点击 **Analyze page load**

**方法 2：在线工具**

访问 [PageSpeed Insights](https://pagespeed.web.dev/)，输入你的线上 URL（只能测线上，不能测本地）

---

### 步骤 4：记录关键数据

Lighthouse 报告会显示很多数据，**你需要记录这些核心指标：**

#### 📊 必须记录的数据

| 指标类别 | 指标名称 | 英文 | 含义 | 记录内容 |
|---------|---------|------|------|---------|
| **总分** | 性能得分 | Performance Score | 综合评分 | 0-100 的分数 |
| **核心指标** | 首次内容绘制 | FCP | 首次渲染任何内容的时间 | 秒数（如 1.2s） |
| | 最大内容绘制 | LCP | 最大元素渲染完成时间 | 秒数（如 2.9s） |
| | 总阻塞时间 | TBT | 主线程被阻塞的总时长 | 毫秒（如 2170ms） |
| | 累积布局偏移 | CLS | 页面元素位置跳动程度 | 数值（如 0.05） |
| | 速度指数 | Speed Index | 页面内容填充速度 | 秒数（如 2.1s） |
| **诊断数据** | JavaScript 执行时间 | - | JS 解析和执行耗时 | 秒数（如 3.5s） |
| | 未使用的 JavaScript | - | 首屏未用到的 JS 体积 | KB（如 301KB） |
| | 主线程工作 | - | 主线程总工作时间 | 秒数（如 5.8s） |

#### 📋 测试记录模板

```markdown
## 优化前基准测试

**测试环境：**
- 日期：2026-03-16
- 测试方式：Chrome 无痕模式 + Lighthouse
- 设备：Desktop / Mobile
- 网络：本地 / 线上（Vercel）
- URL：http://localhost:3000 或 https://jiangxu.net

**核心指标：**
- Performance Score: __/100
- FCP (First Contentful Paint): __s
- LCP (Largest Contentful Paint): __s
- TBT (Total Blocking Time): __ms
- CLS (Cumulative Layout Shift): __
- Speed Index: __s

**诊断数据：**
- JavaScript 执行时间: __s
- 未使用的 JavaScript: __KB
- 主线程工作: __s
- 最大 JS Bundle 大小: __KB

**截图：**
（保存 Lighthouse 报告截图）
```

---

## 如何保存 Lighthouse 报告

### 方法 1：导出 HTML 报告

1. Lighthouse 测试完成后，点击右上角的 **⚙️ 设置图标**
2. 选择 **Save as HTML**
3. 保存为 `lighthouse-before-optimization.html`

### 方法 2：截图

1. 截取 Lighthouse 报告的核心指标部分
2. 保存为 `lighthouse-before.png`

### 方法 3：复制 JSON 数据

1. 点击 Lighthouse 报告右上角的 **⋮** 菜单
2. 选择 **Save as JSON**
3. 可以用脚本解析 JSON 提取数据

---

## 测试建议

### 1. 多次测试取平均值

性能测试会受网络波动影响，建议：
- **至少测试 3 次**
- 取平均值或中位数
- 如果某次数据异常（偏差 >20%），丢弃重测

### 2. 测试不同页面

建议测试这些页面：
- **首页** `/` - 最重要，用户第一印象
- **简历页** `/resume` - 你的核心页面
- **博客列表** `/blog` - 内容页
- **博客详情** `/blog/nature-of-university` - MDX 渲染性能

### 3. 桌面端 + 移动端都要测

- **Desktop**：通常分数较高（90+）
- **Mobile**：更严格，网络慢 + CPU 弱（目标 85+）

移动端测试更能体现优化效果！

---

## 实战：现在开始测试

### 第一步：确保项目运行

**如果测本地：**
```bash
# 构建生产版本（重要！dev 模式不准确）
npm run build

# 启动生产服务器
npm start
```

访问 `http://localhost:3000`

**如果测线上：**
直接访问你的 Vercel 域名

---

### 第二步：Lighthouse 测试

1. **打开 Chrome 无痕窗口**（Cmd + Shift + N）
2. **访问首页**
3. **F12 打开 DevTools**
4. **切换到 Lighthouse 标签**
5. **配置：**
   - Mode: Navigation
   - Device: **Mobile**（先测移动端，更严格）
   - Categories: 全选
6. **点击 "Analyze page load"**
7. **等待 30-60 秒**（会刷新页面多次）

---

### 第三步：记录数据

测试完成后，你会看到这样的界面：

```
Performance: 82/100  ← 记录这个总分

Metrics:
🟠 First Contentful Paint       1.5s  ← 记录
🟠 Largest Contentful Paint     3.2s  ← 记录（最重要）
🟢 Total Blocking Time          180ms ← 记录
🟢 Cumulative Layout Shift      0.02  ← 记录
🟠 Speed Index                  2.8s  ← 记录

Diagnostics:
⚠️ Reduce unused JavaScript     Save 245 KB  ← 记录
⚠️ Minimize main-thread work    4.2s         ← 记录
```

**重点关注：**
- **Performance Score**（总分）
- **LCP**（最大内容绘制）- 最重要的用户体验指标
- **TBT**（总阻塞时间）- 反映 JS 执行效率
- **Unused JavaScript**（未使用的 JS）- 优化潜力

---

## 测试数据记录表格

我帮你准备了一个表格模板，测试时填写：

### 首页性能测试记录

| 测试阶段 | 设备 | Performance | FCP | LCP | TBT | CLS | Speed Index | 未使用 JS | 主线程工作 |
|---------|------|-------------|-----|-----|-----|-----|-------------|----------|----------|
| 优化前-本地 | Mobile | | | | | | | | |
| 优化前-线上 | Mobile | | | | | | | | |
| 优化后-本地 | Mobile | | | | | | | | |
| 优化后-线上 | Mobile | | | | | | | | |
| 优化前-本地 | Desktop | | | | | | | | |
| 优化前-线上 | Desktop | | | | | | | | |
| 优化后-本地 | Desktop | | | | | | | | |
| 优化后-线上 | Desktop | | | | | | | | |

---

## 快速测试命令

我帮你准备了测试流程：

```bash
# 1. 构建生产版本
npm run build

# 2. 启动生产服务器（会占用终端）
npm start

# 3. 在浏览器访问 http://localhost:3000
# 4. 打开无痕模式，运行 Lighthouse
# 5. 记录数据
# 6. Ctrl+C 停止服务器
```

---

## 我的建议

**现在的测试策略：**

1. **先测线上（Vercel）** - 记录真实数据作为基准
   - 优点：真实环境，包含 CDN
   - 缺点：需要部署才能看到优化效果

2. **实施优化**

3. **本地测试验证** - 快速检查优化是否生效
   - 优点：快速迭代
   - 缺点：数据不如线上准确

4. **推送到 Vercel** - 记录最终优化数据

5. **对比前后数据** - 计算提升百分比

---

## 现在开始？

你现在可以：

**选项 A：先测试，后优化（推荐）**
1. 你去测试线上 Vercel 网站（无痕模式 + Lighthouse）
2. 把数据发给我（或者截图）
3. 我帮你实施所有 5 个优化
4. 再测一次，对比数据

**选项 B：先优化，后测试**
1. 我现在帮你实施所有 5 个优化
2. 你部署到 Vercel
3. 测试优化后的数据
4. 和你之前 `PERFORMANCE_OPTIMIZATION.md` 里的数据对比

---

## 你之前的测试数据（参考）

从 `PERFORMANCE_OPTIMIZATION.md` 看到：

```
优化前：
- Performance Score: ~80/100
- TBT: 2170ms
- LCP: 2.9s
- JS 执行时间: 3.5s
- 未使用 JS: 301KB
- 主线程工作: 5.8s

优化后（particles.js + 动态加载）：
- 首页 JS 总量: 843KB → 716KB (-127KB)
```

**但缺少优化后的 Lighthouse 分数！**

所以我建议：
1. 先测一次当前线上版本（记录现状）
2. 实施新的 5 个优化
3. 再测一次（记录最终效果）
4. 更新 `PERFORMANCE_OPTIMIZATION.md`，补充完整的前后对比

---

## 快速参考：Lighthouse 评分标准

### Performance Score 组成

| 指标 | 权重 | 优秀 | 一般 | 差 |
|------|------|------|------|-----|
| LCP | 25% | < 2.5s | 2.5-4.0s | > 4.0s |
| TBT | 30% | < 200ms | 200-600ms | > 600ms |
| FCP | 10% | < 1.8s | 1.8-3.0s | > 3.0s |
| Speed Index | 10% | < 3.4s | 3.4-5.8s | > 5.8s |
| CLS | 25% | < 0.1 | 0.1-0.25 | > 0.25 |

**TBT 权重最高（30%）** - 这就是为什么你之前优化 particles.js 效果明显！

---

## 我帮你做什么？

告诉我你想：

**A. 我先去测试，你等我数据**
- 你去测试，把截图或数据发给我
- 我根据数据分析瓶颈
- 然后实施优化

**B. 你先帮我实施优化，我再测试**
- 我现在就开始实施 5 个优化
- 你部署后测试
- 把优化后的数据告诉我

**C. 你帮我本地测试 + 实施优化一起做**
- 我帮你启动本地服务器
- 你在浏览器测试
- 我实施优化
- 你再测一次

选哪个？
