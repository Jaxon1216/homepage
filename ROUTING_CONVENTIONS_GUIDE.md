# Next.js App Router 路由约定文件学习指南

本次提交新增了三个 App Router 约定文件。本文帮你理解它们**为什么存在、怎么工作、何时触发**。

---

## 1. `not-found.tsx` — 自定义 404 页面

### 文件位置

```
app/not-found.tsx          ← 全局 404（本次新增）
app/blog/[slug]/page.tsx   ← 已有的 notFound() 调用
```

### 核心机制

Next.js 有两种方式触发 404：

| 触发方式 | 说明 |
|----------|------|
| **自动触发** | 用户访问不存在的路由（如 `/aaa`），Next.js 自动匹配到 `not-found.tsx` |
| **手动触发** | 在 Server Component 中调用 `notFound()` 函数（如 `app/blog/[slug]/page.tsx` 第 36 行） |

### 关键知识点

- `not-found.tsx` 是 **Server Component**（默认），不需要 `"use client"`
- 它会被嵌套在最近的 `layout.tsx` 中渲染（所以 Navbar 和 Footer 仍然显示）
- 如果你在 `app/blog/` 下也放一个 `not-found.tsx`，那么博客路由的 404 会优先用它（**就近原则**）
- Next.js 会自动返回 HTTP 404 状态码，不需要手动设置

### 代码要点

```tsx
// 这是 Server Component，可以直接用 Link
import Link from "next/link";

export default function NotFound() {
  // 使用项目已有的 CSS 动画类 animate-fade-up
  // 通过 [animation-delay:0.1s] 实现错开入场
  return ( ... );
}
```

### 测试方法

启动 dev server 后访问任意不存在路径，如 `http://localhost:3000/this-does-not-exist`。

---

## 2. `loading.tsx` — 流式加载骨架屏

### 文件位置

```
app/blog/[slug]/loading.tsx   ← 本次新增，只作用于博客详情页
```

### 核心机制：React Suspense

`loading.tsx` 本质上是 Next.js 自动为你包裹的 Suspense boundary：

```tsx
// Next.js 在内部大致做了这件事：
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

当 `page.tsx` 是 async Server Component（博客详情页需要读取 MDX、调用 rehype 管线），
在数据准备好之前，`loading.tsx` 导出的组件会先展示。

### 关键知识点

- `loading.tsx` 的作用域是**同级 `page.tsx`**，不影响父级或其他路由
- 它利用了 React 18 的 **Streaming SSR**：服务端先发送骨架 HTML，数据就绪后再流式替换
- 这不是 client-side loading indicator，而是**服务端渲染流式传输**的一部分
- 骨架屏使用 Tailwind 的 `animate-pulse` 实现呼吸闪烁效果
- 在生产环境（SSG）中，如果页面已静态生成，`loading.tsx` 几乎不会被看到——它主要在 **dev 模式**和**动态渲染**时有意义

### 代码要点

```tsx
// 无需 "use client"，纯静态 JSX
export default function BlogPostLoading() {
  return (
    <div className="animate-pulse">
      {/* 用 div + bg-[var(--card)] 模拟文本行 */}
      <div className="h-4 w-3/4 rounded bg-[var(--card)]" />
      {/* 模拟代码块 */}
      <div className="h-32 w-full rounded-lg bg-[var(--card)] border ..." />
    </div>
  );
}
```

### 骨架屏设计思路

对照 `PostContent.tsx` 的真实布局来设计：

| 真实元素 | 骨架对应 |
|----------|----------|
| "返回文章列表" 链接 | `h-4 w-28` 的灰条 |
| 文章标题 h1 | `h-9 w-3/4` |
| 日期 + 阅读时间 | 两个短灰条 |
| 标签 | 三个小灰条 |
| 正文段落 | 多个 `h-4` 灰条 |
| 代码块 | 一个 `h-32` 带边框的块 |

### 测试方法

在 dev 模式下点击博客链接时可以短暂看到骨架屏。如果太快看不到，可以临时在 `page.tsx` 里加一个 `await new Promise(r => setTimeout(r, 2000))` 来模拟慢加载。

---

## 3. `error.tsx` — 错误边界

### 文件位置

```
app/error.tsx   ← 本次新增，全局错误边界
```

### 核心机制：React Error Boundary

`error.tsx` 是 Next.js 对 React Error Boundary 的封装：

```tsx
// Next.js 在内部大致做了这件事：
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</ErrorBoundary>
```

当 `page.tsx`（或其子组件）在渲染时抛出错误，`error.tsx` 接管，防止整个应用崩溃。

### 关键知识点

- **必须是 Client Component**（`"use client"`），因为 Error Boundary 依赖 React 的 class component `componentDidCatch` 生命周期
- 接收两个 props：
  - `error`: 错误对象（含 `message`、`digest` 等）
  - `reset`: 调用它会尝试重新渲染出错的路由段
- `error.tsx` 能捕获**同级及子级路由**的错误，但**不能**捕获同级 `layout.tsx` 的错误
- 要捕获根 Layout 的错误，需要 `global-error.tsx`（另一个约定文件，这里没加）
- `error.digest` 在生产环境是一个短哈希，避免向客户端泄露敏感错误信息

### 为什么用 `<a>` 而不是 `<Link>` 返回首页？

```tsx
// error.tsx 中用原生 <a> 而不是 Next.js <Link>
<a href="/">返回首页</a>
```

因为 Error Boundary 捕获的可能是路由系统本身的错误。使用 `<Link>` 可能会触发 client-side 导航，
而 client-side 路由状态此时可能已损坏。用 `<a>` 会触发完整页面刷新，更安全。

### 测试方法

临时在某个 page 组件中加 `throw new Error("test")` 即可看到效果。

---

## 整体架构：约定文件的嵌套关系

```
layout.tsx
├── error.tsx          ← 捕获 page 和子路由的错误
│   └── loading.tsx    ← Suspense fallback
│       └── page.tsx   ← 实际页面内容
│
└── not-found.tsx      ← 路由不存在或 notFound() 被调用
```

渲染优先级：
1. 路由匹配失败 → `not-found.tsx`
2. 路由匹配成功但渲染报错 → `error.tsx`
3. 路由匹配成功且正在加载 → `loading.tsx`
4. 一切正常 → `page.tsx`

---

## 延伸阅读

- [Next.js Docs: Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js Docs: Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Docs: Not Found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [React Docs: Suspense](https://react.dev/reference/react/Suspense)
- [React Docs: Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
