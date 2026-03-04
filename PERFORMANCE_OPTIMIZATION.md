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

## 未来可优化方向

- **framer-motion 替代方案**：framer-motion 占 116KB 且无法有效 tree-shake，如果未来有真正轻量的兼容替代方案可以考虑迁移
- **移动端禁用粒子**：在移动端完全不加载粒子库，进一步减少 JS
- **图片优化**：`GitHubContribution` 中的外部图片可改用 `next/image` + `remotePatterns` 配置
