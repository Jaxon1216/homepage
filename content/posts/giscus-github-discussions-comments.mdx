---
title: "给博客接入 GitHub 评论：Giscus 从配置到落地"
date: "2026-09-17"
description: "用 GitHub Discussions 承载评论，讲清 Giscus 的授权、参数获取、URL 映射，以及让 AI 自适应接入任意项目的提示词。"
tags: ["大前端"]
cover: false
---

想给个人博客加评论，又不想维护用户系统、数据库和审核后台，可以考虑 Giscus。

它把评论区嵌进网页，但评论并不保存在你的网站里，而是存进 GitHub Discussions。读者用自己的 GitHub 账号登录留言，站长则继续在仓库的 Discussions 页面审核、回复、锁定讨论。

这篇文章不假设你的项目一定是 Next.js 或 React。无论是静态站、Vue、React，还是一个现成但还没摸清结构的项目，核心准备步骤都一样；代码如何挂载，再交给 AI 根据项目自行判断。

# Giscus 到底做了什么

可以把它理解成一层“网页评论 UI”和 GitHub Discussions 之间的桥：

```text
文章页面 /blog/hello-world
        ↓
网页加载 giscus.app 的 iframe
        ↓
按映射规则查找对应的 GitHub Discussion
        ↓
读者通过 GitHub OAuth 登录并发表评论
        ↓
评论保存到仓库的 GitHub Discussions
```

所以它没有自建账号体系，也不需要你提供数据库连接串。代价也很明确：读者需要 GitHub 账号，评论内容与评论者身份遵循 GitHub Discussions 的规则。

# 上手前要满足的三个条件

先准备一个**公开仓库**。Giscus 的官方配置要求目标仓库公开，否则访客无法读取对应的 Discussion。

接着在仓库中开启 Discussions：

1. 进入仓库的 **Settings**。
2. 打开 **General**。
3. 找到 **Features** 区域，勾选 **Discussions**。
4. 保存后，仓库顶部会出现 **Discussions** 标签页。

最后要把 Giscus GitHub App 安装到这个仓库。这是最容易遗漏的一步。

1. 登录拥有该仓库管理员权限的 GitHub 账号。
2. 打开 [Giscus GitHub App 安装页](https://github.com/apps/giscus/installations/new)。
3. 如果 GitHub 让你选择个人账号或组织，选择仓库所属的那个账号或组织。
4. 在 **Repository access** 选择 **Only select repositories**。
5. 在出现的仓库选择框里选中博客仓库。
6. 点击 **Install** 或 **Save**。

选择“仅指定仓库”就够了，通常不必给 Giscus 所有仓库的访问权限。

这里的安装授权和读者评论时的登录不是一回事：前者是站长授权 Giscus 操作某个仓库的 Discussions；后者是读者授权 Giscus 以读者自己的 GitHub 身份发布评论。

# 去哪里拿配置参数

打开 [Giscus 配置页](https://giscus.app/zh-CN)。这个页面会检查前面的准备是否完成，并自动生成可直接使用的配置。

## 填写仓库

在“仓库”输入框填入 `GitHub 用户名/仓库名`，例如：

```text
Jaxon1216/homepage
```

页面会依次验证仓库公开、Discussions 已开启、Giscus App 已安装。任意一个不满足，先回 GitHub 修正；不要试图手写后面的 ID。

## 选择页面和评论的关联方式

博客通常选择：

```text
Discussion 的标题包含页面的 pathname
```

它生成的配置是：

```html
data-mapping="pathname"
```

于是不同文章路径会映射到不同 Discussion：

```text
/blog/hello-world  → 一条 Discussion
/blog/react-hooks  → 另一条 Discussion
```

首次有人评论或点 reaction 时，如果没有找到对应的 Discussion，Giscus 会自动创建一条。

`pathname` 的优点是稳定、直观，适合有固定 slug 的博客；风险是 URL 本身就是关联键。若你把 `/blog/hello-world` 改成 `/posts/hello-world`，评论会被视为另一篇文章，可能出现两个评论区。文章改路由或 slug 前，要么保留旧链接，要么提前规划迁移。

## 选择 Discussion 分类

在“Discussion 分类”下拉框中优先选 **Announcements**。官方推荐这一类分类：顶层 Discussion 可由仓库维护者和 Giscus 创建，普通访客仍可以在已有文章 Discussion 下评论。

如果下拉框里没有它，可以在仓库的 Discussions 页面创建分类，或选择已有且符合团队管理方式的分类。

## 用推荐值完成其余选项

个人博客一般可以这样选：

| 选项 | 推荐值 | 说明 |
| --- | --- | --- |
| 严格标题匹配 | 关闭 | 减少 URL 细小差异带来的匹配问题 |
| 启用主帖反应 | 开启 | 在评论区顶部展示 GitHub reactions |
| 输出 Discussion 元数据 | 关闭 | 除非页面需要消费评论数等元数据 |
| 评论输入框位置 | 底部 | 常见阅读顺序 |
| 懒加载评论 | 开启 | 不让评论 iframe 影响首屏 |
| 语言 | `zh-CN` | 显示中文界面 |
| 主题 | 跟随站点 | 有亮暗模式的网站要处理同步 |

完成选择后，滚到“启用 giscus”。页面会生成一段脚本：

```html
<script
  src="https://giscus.app/client.js"
  data-repo="你的用户名/你的仓库"
  data-repo-id="R_kgDO..."
  data-category="Announcements"
  data-category-id="DIC_kwDO..."
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="zh-CN"
  crossorigin="anonymous"
  async
></script>
```

直接复制它即可。最关键的四个参数是 `data-repo`、`data-repo-id`、`data-category`、`data-category-id`。两个 ID 是 GitHub 的稳定节点标识，必须由配置页生成；它们不是密码，可以出现在浏览器代码中。

# 让 AI 适配你的项目

AI 可以自己识别项目是 Next.js、Vue 还是纯静态页面，也应该自己找出文章详情页和现有主题方案；但它无法替你登录 GitHub、安装 App，或凭空知道 Giscus 配置页生成的 ID。

因此，最好的分工是：你完成上面的 GitHub 和 Giscus 页面配置，把生成的整段脚本交给 AI；AI 负责扫描项目、选择正确的客户端边界并接入。

下面这段提示词可以直接用于一个全新的项目：

```text
请为当前项目接入 Giscus 评论系统。

先不要假设技术栈。请自行检查仓库的依赖、路由、文章详情页、渲染方式、主题实现和现有性能策略，确认评论组件应放在哪里；如项目缺少文章页，请说明最合理的挂载位置。

接入目标：
1. 每篇文章拥有独立的评论区；
2. 评论区放在文章正文之后；
3. 依据 pathname 关联页面与 GitHub Discussion；
4. 仅在用户接近评论区时加载，避免影响首屏；
5. 如果项目已有亮暗主题，Giscus 必须随主题同步；
6. 优先复用项目已有模式，不要为此大规模重构，也不要引入不必要的依赖；
7. 先给出你识别到的项目结构、接入方案和将修改的文件，再实施；
8. 完成后给出本地验证步骤，并说明 URL/slug 改动会导致评论分裂的风险。

以下是我已在 giscus.app 生成的完整脚本配置，请直接使用其中的 data-* 值，不要自行编造 repo ID 或 category ID：

<把 giscus.app 生成的完整 script 标签粘贴在这里>
```

这里唯一需要用户补充的内容就是最后那段生成的脚本。项目技术栈、文章组件路径、主题库、是否使用 SSR，均应由 AI 在仓库中探测。

# 本项目是怎么实现的

本博客没有安装 Giscus 的 React 封装包，而是在客户端手动创建脚本标签。评论组件在 `components/blog/GiscusComments.tsx`，并由文章详情组件渲染在正文和页脚内容之间。

实现上多做了两件事：

1. 用 `IntersectionObserver` 观察一个占位元素，距离评论区约 200px 时才加载 `https://giscus.app/client.js`。
2. 使用 `next-themes` 取得当前主题；评论 iframe 已加载时，通过 `postMessage` 发送新主题，而不是重新创建整个评论区。

其核心逻辑可以概括为：

```tsx
// 靠近评论区时才注入 Giscus 脚本
if (isVisible) {
  const script = document.createElement("script")
  script.src = "https://giscus.app/client.js"
  script.setAttribute("data-mapping", "pathname")
  // 其余 data-* 值来自 giscus.app
  container.appendChild(script)
}

// 已加载时，主题变化只通知 iframe
iframe.contentWindow?.postMessage(
  { giscus: { setConfig: { theme } } },
  "https://giscus.app"
)
```

纯 HTML 站点通常可以直接粘贴 Giscus 生成的 `<script>`；React、Vue 一类框架则要避免在服务端渲染阶段直接访问 `document`，应在客户端生命周期中挂载。具体采用哪一种，取决于 AI 扫描到的项目架构。

# 验收与常见问题

接入后，用一篇真实文章做一次完整验收：

1. 打开文章页并滚到评论区，确认 Giscus 出现。
2. 用 GitHub 账号登录并发送测试评论或点击 reaction。
3. 回到仓库的 **Discussions**，确认出现了和文章路径关联的 Discussion。
4. 切换网站亮暗主题，确认评论区主题随之切换。
5. 刷新同一篇文章，确认仍然命中原来的 Discussion，而不是新建一条。

如果配置页提示仓库不可用，按这个顺序排查：仓库是否公开、Discussions 是否开启、Giscus App 是否安装到了**正确的仓库**、是否在配置页选择了分类。

最后，Giscus 适合技术博客、开源项目和主要由 GitHub 用户阅读的站点。如果目标读者大多没有 GitHub 账号，注册门槛会直接影响评论量；这时更适合选择带邮箱或匿名身份体系的评论服务。

Giscus 的配置与运行机制以其[官方中文文档](https://giscus.app/zh-CN)为准；GitHub Discussions 的权限和管理能力可参考 [GitHub Discussions 文档](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)。
