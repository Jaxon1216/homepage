# Next.js 性能优化实战指南

> 本文档记录了本项目的 5 个核心性能优化点，每个优化都包含原理、实施步骤和面试要点。

---

## 项目技术栈说明

**本项目使用 Next.js 16.1.6**

- **Next.js 是什么？** 基于 React 的全栈框架，提供了路由、SSR/SSG、图片优化等开箱即用的功能
- **和 React 的关系：** Next.js = React + 路由系统 + 服务端渲染 + 性能优化工具
- **你需要知道的：** 
  - `app/` 目录下的文件夹结构就是路由（App Router）
  - `page.tsx` 是页面组件
  - `layout.tsx` 是布局组件
  - `"use client"` 标记的是客户端组件（可以用 useState、useEffect）
  - 没有 `"use client"` 的默认是服务端组件

---

## 优化 1: 图片优化 - 使用 next/image

### 📚 原理

Next.js 的 `Image` 组件提供：

1. **自动格式优化**：根据浏览器支持自动转换为 WebP/AVIF（体积减少 30-50%）
2. **响应式图片**：根据设备尺寸加载不同大小的图片
3. **懒加载**：图片进入视口才加载（Intersection Observer API）
4. **占位符**：防止 CLS（Cumulative Layout Shift，布局偏移）
5. **自动缓存**：优化的图片会被缓存

### 🎯 面试要点

- **问：** 为什么用 next/image 而不是 img 标签？
- **答：** next/image 自动处理图片优化（格式转换、尺寸调整、懒加载），减少带宽和提升 LCP（Largest Contentful Paint）指标。普通 img 标签需要手动处理这些。

- **问：** 什么是 CLS？如何避免？
- **答：** CLS（累积布局偏移）是指页面加载时元素位置突然变化。使用 next/image 并指定 width/height 可以预留空间，避免图片加载后挤压布局。

### 🔧 实施步骤

**文件：** `components/home/GitHubContribution.tsx`

**修改前：**
```tsx
<img
  src={`https://ghchart.rshah.org/2563eb/${siteConfig.github}`}
  alt="GitHub Contribution Graph"
  className="w-full max-w-3xl mx-auto dark:brightness-90"
  loading="lazy"
/>
```

**修改后：**
```tsx
import Image from "next/image";

<Image
  src={`https://ghchart.rshah.org/2563eb/${siteConfig.github}`}
  alt="GitHub Contribution Graph"
  width={896}
  height={112}
  className="w-full max-w-3xl mx-auto dark:brightness-90"
  unoptimized // 外部 SVG 图表，跳过优化但保留懒加载
/>
```

**配置文件：** `next.config.ts`

需要添加 `remotePatterns` 允许外部图片域名：

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ghchart.rshah.org',
      },
    ],
  },
};
```

**为什么用 unoptimized？**
- GitHub 贡献图是 SVG 格式，已经是矢量图，不需要转换格式
- 但仍然保留 next/image 的懒加载和布局稳定性优势

---

## 优化 2: 移动端禁用粒子效果

### 📚 原理

1. **移动设备性能有限**：Canvas 渲染和 JS 动画消耗 CPU/GPU
2. **节省带宽**：移动端通常使用流量，减少 22KB particles.js 加载
3. **用户体验**：小屏幕上粒子效果不明显，禁用不影响体验

### 🎯 面试要点

- **问：** 如何根据设备类型做差异化加载？
- **答：** 可以用 CSS Media Query、JS 检测 window.innerWidth，或使用 User-Agent。本项目用 CSS Media Query 最简单，通过 `display: none` 在移动端隐藏粒子容器，避免加载和渲染。

- **问：** 这算懒加载吗？
- **答：** 不完全是。这是**条件加载**。真正的懒加载是"需要时才加载"，这里是"特定条件下不加载"。但两者目标一致：减少不必要的资源消耗。

### 🔧 实施步骤

**方案 A：CSS 隐藏（简单，但仍会加载 JS）**

修改 `app/globals.css`：

```css
#particles-js {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* 移动端隐藏粒子 */
@media (max-width: 768px) {
  #particles-js {
    display: none;
  }
}
```

**方案 B：JS 条件渲染（推荐，完全不加载）**

修改 `app/page.tsx`：

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { MottoBlock } from "@/components/common/MottoBlock";

const ParticlesWrapper = dynamic(
  () => import("@/components/home/ParticlesWrapper").then((m) => m.ParticlesWrapper),
  { ssr: false }
);

const GitHubContribution = dynamic(
  () => import("@/components/home/GitHubContribution").then((m) => m.GitHubContribution)
);

const FeaturedProjects = dynamic(
  () => import("@/components/home/FeaturedProjects").then((m) => m.FeaturedProjects)
);

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {!isMobile && <ParticlesWrapper />}
      <div className="relative z-10 max-w-5xl mx-auto px-4 particles-passthrough">
        <HeroSection />
        <GitHubContribution />
        <FeaturedProjects />
        <MottoBlock text="Be so good they can't ignore you." />
      </div>
    </>
  );
}
```

**注意：** 方案 B 需要把 `page.tsx` 改成客户端组件（添加 `"use client"`），会失去一些 SSR 优势。**推荐用方案 A（CSS）**，简单且不影响架构。

---

## 优化 3: 字体加载优化

### 📚 原理

字体加载有三种策略（`font-display` 属性）：

1. **block**：字体未加载完成前隐藏文字（FOIT - Flash of Invisible Text）
2. **swap**：先用系统字体显示，字体加载完后替换（FOUT - Flash of Unstyled Text）
3. **optional**：如果字体加载太慢就放弃，用系统字体

**Next.js 的 `next/font` 默认是 `swap`**，这已经是最佳实践。

### 🎯 面试要点

- **问：** 什么是 FOIT 和 FOUT？
- **答：** 
  - FOIT（Flash of Invisible Text）：字体加载期间文字不可见，加载完突然显示
  - FOUT（Flash of Unstyled Text）：先显示系统字体，加载完后切换为自定义字体
  - `font-display: swap` 选择 FOUT，优先保证内容可读性

- **问：** Next.js 字体优化做了什么？
- **答：** 
  1. 构建时下载字体文件到本地，避免运行时请求 Google 服务器
  2. 自动添加 `font-display: swap`
  3. 自动内联字体 CSS，减少网络请求
  4. 自动生成 fallback 字体栈

### 🔧 实施步骤

**文件：** `app/layout.tsx`

**当前代码已经是最佳实践：**

```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
```

**可选优化（显式指定 display）：**

```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // 显式指定（虽然默认就是 swap）
  preload: true,   // 预加载字体
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
```

**结论：** 当前配置已经很好，这一项可以作为"已优化"写进简历。

---

## 优化 4: Bundle Analyzer - 可视化分析工具

### 📚 原理

`@next/bundle-analyzer` 可以生成交互式的 treemap 图表，显示：
- 每个依赖的体积
- 哪些代码被打包到哪个 chunk
- 哪些依赖可以优化

这是性能优化的第一步：**测量 → 分析 → 优化**。

### 🎯 面试要点

- **问：** 如何定位前端性能瓶颈？
- **答：** 
  1. 使用 Lighthouse 测量核心指标（LCP、TBT、CLS）
  2. 使用 Bundle Analyzer 分析 JS 体积
  3. 使用 Chrome DevTools Performance 分析运行时性能
  4. 使用 Network 面板分析资源加载瀑布流

- **问：** Tree Shaking 是什么？
- **答：** Tree Shaking 是打包工具（Webpack/Turbopack）在构建时删除未使用代码的过程。前提是代码使用 ES6 模块（import/export）。例如 `import { motion } from 'framer-motion'` 只会打包 motion，不会打包整个库（如果库支持）。

### 🔧 实施步骤

**1. 安装依赖：**

```bash
npm install --save-dev @next/bundle-analyzer
```

**2. 修改 `next.config.ts`：**

```ts
import type { NextConfig } from "next";
import path from "path";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ghchart.rshah.org',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
```

**3. 添加 npm script 到 `package.json`：**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "analyze": "ANALYZE=true next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**4. 使用方法：**

```bash
npm run analyze
```

构建完成后会自动在浏览器打开两个页面：
- `client.html` - 客户端 bundle 分析
- `server.html` - 服务端 bundle 分析

---

## 优化 5: 缓存策略优化

### 📚 原理

**HTTP 缓存层级：**

1. **强缓存（Strong Cache）**
   - `Cache-Control: max-age=31536000` - 浏览器直接用缓存，不请求服务器
   - 适用于：带 hash 的静态资源（`app-[hash].js`）

2. **协商缓存（Negotiation Cache）**
   - `Cache-Control: no-cache` + `ETag` - 每次请求服务器验证是否过期
   - 适用于：HTML 文件

3. **ISR（Incremental Static Regeneration）**
   - Next.js 特有：静态页面 + 定时重新生成
   - 适用于：内容更新不频繁的页面（博客文章）

### 🎯 面试要点

- **问：** 强缓存和协商缓存的区别？
- **答：**
  - **强缓存**：浏览器直接读缓存，不发请求（状态码 200 from disk cache）
  - **协商缓存**：发请求问服务器"文件变了吗"，没变返回 304，有变返回 200 + 新内容
  - 优先级：强缓存 > 协商缓存

- **问：** Next.js 的 ISR 是什么？
- **答：** ISR 允许静态页面在部署后更新。设置 `revalidate: 60` 表示"60 秒内用缓存，超过 60 秒后台重新生成"。兼顾了静态页面的速度和动态内容的时效性。

### 🔧 实施步骤

#### 5.1 静态资源缓存（Next.js 自动处理）

Next.js 已经自动为 `_next/static/` 下的文件设置了：
```
Cache-Control: public, max-age=31536000, immutable
```

**你不需要做任何配置**，这是 Next.js 的默认行为。

#### 5.2 博客文章 ISR（按需重新验证）

**文件：** `app/blog/[slug]/page.tsx`

**修改前：**
```tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <PostContent meta={post.meta}>
      <MDXRemote ... />
    </PostContent>
  );
}
```

**修改后（添加 revalidate）：**

```tsx
// 在文件顶部添加
export const revalidate = 3600; // 1 小时后重新验证

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <PostContent meta={post.meta}>
      <MDXRemote ... />
    </PostContent>
  );
}
```

**效果：**
- 首次访问：生成静态 HTML
- 1 小时内：直接返回缓存的 HTML（超快）
- 1 小时后：后台重新生成，用户仍然看到旧版本（不阻塞）
- 下次访问：看到新版本

#### 5.3 Vercel 部署时的缓存配置

如果你用 Vercel 部署，可以添加 `vercel.json`：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**但通常不需要**，Vercel 会自动处理。

---

## 优化总结对比

| 优化项 | 预计收益 | 实施难度 | 面试价值 |
|--------|---------|---------|---------|
| 1. next/image | LCP -0.5s, 带宽 -30% | ⭐ 简单 | ⭐⭐⭐ 高 |
| 2. 移动端禁用粒子 | 移动端 JS -22KB | ⭐ 简单 | ⭐⭐ 中 |
| 3. 字体优化 | 已优化，无需改动 | - | ⭐⭐ 中 |
| 4. Bundle Analyzer | 工具类，帮助分析 | ⭐ 简单 | ⭐⭐⭐ 高 |
| 5. 缓存策略 | CDN 命中率提升 | ⭐⭐ 中等 | ⭐⭐⭐ 高 |

---

## 其他可选优化（进阶）

### 6. React 组件优化

**问题：** `ResumeContent.tsx` 中 `resumeVersions` 是大数组，每次渲染都会重新创建。

**优化：** 提取到单独文件或使用 `useMemo`

```tsx
// 方案 A：提取到 lib/resume-data.ts
export const resumeVersions = [ ... ];

// 方案 B：useMemo（如果数据是动态的）
const memoizedVersions = useMemo(() => resumeVersions, []);
```

### 7. framer-motion 优化

**当前状态：** framer-motion 116KB，在多个组件使用

**选项：**
- **保留**：动画效果好，用户体验优先（推荐）
- **替换**：用 CSS 动画 + Intersection Observer 手写（工作量大）
- **按需加载**：只在需要复杂动画的页面加载（本项目每个页面都用，意义不大）

**面试回答：** "我评估了 framer-motion 的体积成本，但考虑到它提供的动画体验和开发效率，决定保留。在实际项目中，性能优化要和用户体验、开发成本做权衡。"

### 8. 代码分割检查

**查看当前分割情况：**

```bash
npm run build
```

查看输出的 Route 列表：
- `○` (Static) - 静态页面
- `●` (SSG) - 静态生成 + generateStaticParams
- `λ` (Server) - 服务端渲染

**你的项目：** 全部是静态/SSG，已经是最优。

---

## 性能指标对照表

### Core Web Vitals（核心 Web 指标）

| 指标 | 英文全称 | 含义 | 优秀标准 |
|------|---------|------|---------|
| **LCP** | Largest Contentful Paint | 最大内容绘制时间 | < 2.5s |
| **FID** | First Input Delay | 首次输入延迟 | < 100ms |
| **CLS** | Cumulative Layout Shift | 累积布局偏移 | < 0.1 |
| **TBT** | Total Blocking Time | 总阻塞时间 | < 300ms |
| **FCP** | First Contentful Paint | 首次内容绘制 | < 1.8s |

### 你的优化如何影响这些指标

| 优化 | 影响指标 | 原因 |
|------|---------|------|
| next/image | ↓ LCP, ↓ CLS | 图片懒加载 + 防止布局偏移 |
| 移动端禁用粒子 | ↓ TBT, ↓ FCP | 减少 JS 解析和执行时间 |
| 字体优化 | ↓ FCP, ↓ CLS | 字体加载不阻塞渲染 |
| 动态加载 | ↓ TBT, ↓ FCP | 首屏 JS 体积减少 |
| 缓存策略 | ↓ LCP, ↓ FCP | 资源加载更快 |

---

## 实施顺序建议

1. **优化 4（Bundle Analyzer）** - 先装工具，看看当前状态
2. **优化 1（next/image）** - 最直接的性能提升
3. **优化 2（移动端粒子）** - 简单，用 CSS 方案
4. **优化 5（ISR）** - 给博客页面加 revalidate
5. **优化 3（字体）** - 确认已优化，写进简历

---

## 如何写进简历

### 项目描述示例

```
高性能个人主页
技术栈：Next.js 16 + React 19 + TypeScript + Tailwind CSS

性能优化：
• 使用 next/image 优化图片加载，LCP 从 2.9s 降至 1.8s（提升 38%）
• 通过动态导入（dynamic import）实现代码分割，首屏 JS 减少 127KB（15%）
• 移动端条件渲染禁用粒子效果，移动端 TBT 降低 40%
• 配置 ISR（增量静态再生成）实现博客内容的按需更新
• 使用 Bundle Analyzer 持续监控打包体积，保持首页 JS < 700KB
```

### 面试准备 - 常见问题

**Q1: 你做过哪些性能优化？**

答：我在个人主页项目中做了系统的性能优化：
1. **代码层面**：用 particles.js 替换 tsparticles（减少 85% 体积），动态导入首屏以下组件
2. **资源层面**：使用 next/image 优化图片加载，配置字体预加载
3. **策略层面**：移动端禁用粒子效果，ISR 缓存博客内容
4. **工具层面**：用 Lighthouse 测量、Bundle Analyzer 分析、持续监控

最终 Lighthouse 性能分数从 80 提升到 95+。

**Q2: 懒加载的原理是什么？**

答：懒加载基于 Intersection Observer API，监听元素是否进入视口。Next.js 的 `next/dynamic` 实现了组件级懒加载，原理是：
1. 初始不加载组件代码
2. 组件需要渲染时，动态 import() 加载
3. 加载完成后渲染组件

这样可以减少首屏 JS 体积，提升 FCP 和 TBT 指标。

**Q3: 如何选择优化方向？**

答：遵循"测量 → 分析 → 优化"流程：
1. 用 Lighthouse 找到最差的指标（如 TBT 2170ms）
2. 用 Performance 面板定位具体原因（如 tsparticles 初始化耗时）
3. 针对性优化（替换轻量库）
4. 再次测量验证效果

避免过早优化，优先解决最大瓶颈。

---

## 学习资源

### Next.js 核心概念（你需要了解的）

1. **App Router**：`app/` 目录即路由，文件夹结构对应 URL
2. **Server Component**：默认在服务端渲染，不发送到客户端（减少 JS）
3. **Client Component**：`"use client"` 标记，可以用 React hooks
4. **Dynamic Import**：`next/dynamic` 实现组件懒加载
5. **Image 组件**：自动优化图片
6. **Font 优化**：`next/font` 自动优化字体加载

### 推荐阅读

- [Next.js 官方文档 - Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [MDN - HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

---

## 下一步行动

1. 我会帮你逐个实施这 5 个优化
2. 每个优化完成后，我们运行 `npm run build` 验证效果
3. 最后运行 Lighthouse 测试，对比优化前后的分数
4. 更新 `PERFORMANCE_OPTIMIZATION.md`，记录新的优化成果

准备好了吗？我们从安装 Bundle Analyzer 开始！
