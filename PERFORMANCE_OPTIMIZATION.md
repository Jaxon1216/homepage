# 性能优化记录

## 背景

Chrome 无痕模式下 Lighthouse 性能得分约 80，主要瓶颈：

- **TBT (Total Blocking Time)**: 2170ms
- **LCP (Largest Contentful Paint)**: 2.9s
- **JS 执行时间**: 3.5s
- **未使用 JS**: 301KB
- **主线程工作**: 5.8s

## 根因分析

通过分析构建产物 `.next/static/chunks/`，定位到首页 JS 总量 ~843KB（未压缩），其中可优化部分：

| 依赖 | 未压缩体积 | Gzipped | 说明 |
|------|-----------|---------|------|
| `@tsparticles/slim` | 142KB | ~40KB | 粒子背景，首页运行时动态加载 |
| `framer-motion` | 116KB | ~50KB | 动画库，被打包到共享 chunk，每个页面都加载 |

`tsparticles` 是最大的主线程阻塞源——Canvas 引擎初始化需要大量 JS 解析和执行。

## 优化措施

### 1. particles.js 替换 tsparticles

**效果：运行时动态加载从 142KB 降至 22KB（减少 85%）**

[particles.js](https://github.com/VincentGarreau/particles.js) 是原版轻量粒子库，22KB 未压缩 / 5.8KB gzipped / 0 依赖。效果与 tsparticles 配置一致（点线漂浮 + 鼠标 grab 交互）。

变更文件：
- `components/home/ParticlesBg.tsx` — 重写为 particles.js 初始化
- `components/home/ParticlesWrapper.tsx` — 保留 `next/dynamic` + `ssr: false`
- `app/globals.css` — CSS 选择器从 `#tsparticles` 改为 `#particles-js`
- `types/particles.d.ts` — 新增类型声明
- `package.json` — 卸载 `@tsparticles/react` + `@tsparticles/slim`（移除 37 个包），安装 `particles.js`（1 个包）

### 2. 首屏以下组件延迟加载

**效果：减少首屏 JS 解析量**

首页 `GitHubContribution` 和 `FeaturedProjects` 在首屏以下（需要滚动才能看到），改为 `next/dynamic` 做代码分割。

变更文件：
- `app/page.tsx` — `GitHubContribution` 和 `FeaturedProjects` 改为 dynamic import

### 3. 尝试但未采用：motion/react 替代 framer-motion

经验证，`motion` 包的 `motion/react` 入口只是 `export * from 'framer-motion'` 的 re-export，**不会减小体积**。framer-motion 保持不变。

## 优化结果

| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 首页 JS 总量（含运行时） | ~843KB | ~716KB | -127KB (-15%) |
| 粒子库体积 | 142KB | 22KB | -120KB (-85%) |
| npm 包数量 | 551 | 515 | -36 |

---

## 第二轮优化（2026-03-17）

### 背景

第一轮优化后 Lighthouse Performance 已达 98/100（Desktop），继续寻找优化空间。

Lighthouse 诊断仍存在的问题：
- **Reduce unused JavaScript**：47 KiB 可节省（来自 framer-motion 和框架代码）
- **Network dependency tree**：关键路径延迟 582ms（CSS 阻塞渲染）
- **Preconnect origins**：外部资源未预连接

### 4. Bundle Analyzer 集成

**效果：可视化分析打包体积，定位优化瓶颈**

安装 `@next/bundle-analyzer`，通过 `npm run analyze` 生成交互式 treemap。

分析结果（Webpack 构建，未压缩）：

| Chunk | 大小 | 内容 |
|-------|------|------|
| `4bd1b696` | 194KB | react-dom |
| `framework` | 185KB | React 框架 |
| `794` | 184KB | Next.js 内部代码 |
| `main` | 131KB | Next.js 路由 + 运行时 |
| `995` | 117KB | framer-motion |
| `polyfills` | 110KB | 浏览器兼容 |
| `389` | 22KB | particles.js |
| 其余 | ~30KB | 业务代码 |
| **总计** | **~1048KB** | **gzip 后约 300KB** |

**结论：** 框架代码（react-dom + Next.js + polyfills）占 60%，framer-motion 占 11%，业务代码仅 3%。项目已经很精简，剩余优化空间有限。

变更文件：
- `package.json` — 添加 `analyze` script
- `next.config.ts` — 集成 `@next/bundle-analyzer`

### 5. 外部资源预连接（preconnect）

**效果：减少外部资源的网络连接延迟**

GitHub 贡献图从 `ghchart.rshah.org` 加载，添加 `preconnect` 和 `dns-prefetch` 提前建立连接，省去 DNS 解析 + TCP 握手 + TLS 握手的时间。

变更文件：
- `app/layout.tsx` — `<head>` 中添加 `<link rel="preconnect">` 和 `<link rel="dns-prefetch">`

### 6. 图片标签添加尺寸属性

**效果：防止 CLS（布局偏移）**

`GitHubContribution` 的 `<img>` 标签添加 `width` 和 `height` 属性，让浏览器在图片加载前就预留正确的空间，避免加载后页面跳动。

变更文件：
- `components/home/GitHubContribution.tsx` — `<img>` 添加 `width={896} height={112}`

### 7. 尝试但未采用：next/image 替换 img

评估了用 `next/image` 替换 `<img>` 加载 GitHub 贡献图（外部 SVG）。

**未采用原因：**
- 该图片是外部 SVG，`next/image` 需要设置 `unoptimized` 跳过格式转换，失去了主要优势
- `next/image` 即使设置 `unoptimized`，请求仍经过 Next.js 的图片代理层（`/_next/image?url=...`），反而增加了一跳延迟
- 实测首次加载速度明显变慢
- CLS 问题已通过添加 `width/height` 属性解决

**结论：** 对于不需要格式转换的外部 SVG 图片，原生 `<img>` + 显式尺寸是更优方案。`next/image` 更适合需要格式优化（WebP/AVIF）的本地图片或大尺寸照片。

## 第二轮优化结果

| 指标 | 第一轮优化后 | 第二轮优化后 | 变化 |
|------|------------|------------|------|
| Lighthouse Performance (Desktop) | 98/100 | 98/100 | 持平 |
| Unused JavaScript | 47.3 KiB | 46.8 KiB | -0.5 KiB |
| CLS 风险 | 有（img 无尺寸） | 无（img 有尺寸） | ✅ 改善 |
| 打包分析能力 | 无 | Bundle Analyzer | ✅ 新增 |
| 外部资源连接 | 无预连接 | preconnect + dns-prefetch | ✅ 新增 |

**总结：** 98 分已接近天花板，第二轮优化重点不在提分，而在完善工程化工具链和消除潜在问题（CLS、网络延迟）。

---

## 两轮优化总览

| 指标 | 最初 | 第一轮后 | 第二轮后 |
|------|------|---------|---------|
| Lighthouse Performance | ~80 | 98 | 98 |
| TBT | 2170ms | - | - |
| LCP | 2.9s | - | - |
| 首页 JS 总量 | ~843KB | ~716KB | ~1048KB (Webpack) / ~716KB (Turbopack) |
| 粒子库体积 | 142KB | 22KB | 22KB |
| npm 包数量 | 551 | 515 | 531 (+bundle-analyzer) |
| 未使用 JS | 301KB | ~47KB | ~47KB |

## 未来可优化方向

- **framer-motion 替代方案**：占 117KB 且无法有效 tree-shake，如果未来有轻量兼容替代方案可以考虑迁移
- **移动端禁用粒子**：通过 CSS Media Query 或条件渲染，在移动端不加载粒子库