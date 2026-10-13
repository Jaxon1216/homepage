# Umami 使用与维护

已接入代码，部署至正式环境后生效。默认采集入口 https://umami.jiangxu.net/script.js；Homepage Website ID 为 `81d59058-21eb-4930-9426-5a685a3cb2e2`。Website ID 是公开配置，不是密钥。现有 Vercel Analytics 保留。

## 上线与查看

无需再填写数据库配置或后台密码。代码部署至 Vercel Production 且浏览器访问 `jiangxu.net` / `www.jiangxu.net` 后开始采集；localhost、Preview 和 Vercel 默认部署域名均不会向这个 Website ID 写入。

登录 Umami，选择已有 Homepage 网站，查看流量及 Events；按事件名查看 Event data，例如 `project_click` 的 project_id / destination、`contact_click` 的 channel / placement、`article_read_qualified` 的 article_slug。数据从接入上线时开始，不会自动导入 Vercel 历史。长期保留策略与备份仍需在 Umami 数据库侧落实。

## 默认事件与诊断开关

2026-10-13 起，默认自定义事件从 31 类精简为 15 类（schema_version=2），原生手动 PV 继续保留：

- 项目：`project_impression`、`project_click`。
- 联系与外链：`contact_click`、`friend_link_click`、`outbound_click`。
- 博客：`blog_filter_change`、`article_open_click`、`article_read_start`、`article_read_qualified`。
- 简历：`resume_version_view`、`resume_version_change`。
- 书架：`book_open`。
- 活跃与故障：`page_engaged`、`not_found_view`、`app_error`。

其余原有默认事件已移除采集代码。内部页面上下文、阅读深度和活跃计时继续用于归因与有效阅读判定，不单独上报。精简只影响后续数据，Umami 中的历史事件不会自动删除。

`theme_change`、`mobile_menu_toggle`、`media_close`、`book_close`、`comments_load`、`github_chart_view`、`resource_error` 属诊断事件，默认关闭。默认的 `page_engaged` 仅在有效活跃满 30 秒时上报一次，不再发送多档时间阈值或离站汇总。

原生 performance 暂未启用：核验的线上 SDK 没有完整 popstate 跟踪，手动 PV 能正确跟踪后退，但无法保证 SDK 自身的性能 URL/区间归因。性能监控继续使用独立性能工具；后续验证 SDK 生命周期后再加入，不与业务事件混用。回放和热图未开启。没有新增下载/搜索/复制等当前不存在的产品能力。

## 可选环境变量

这些值在构建时读取，修改后需重新部署：

- `NEXT_PUBLIC_ANALYTICS_ENABLED=false`：关闭 Umami。
- `NEXT_PUBLIC_ANALYTICS_EXPOSURE=false`：关闭曝光事件。
- `NEXT_PUBLIC_ANALYTICS_READING=false`：关闭文章阅读事件，`page_engaged` 仍保留。
- `NEXT_PUBLIC_ANALYTICS_DIAGNOSTICS=true`：开启上面的诊断事件。
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`、`NEXT_PUBLIC_UMAMI_SCRIPT_URL`：覆盖默认公开采集配置。

生产环境判断同时检查构建模式与 VERCEL_ENV；服务端将 VERCEL_GIT_COMMIT_SHA 的短值作为 release 传入。文章路径允许表由仓库真实文章生成，兼容 eventLoop 等混合大小写 slug；未知路径与内部未知 referrer 都归 `/:unknown`。

## 排除自己的访问

在自己浏览器的正式站点控制台执行一次：

```js
localStorage.setItem('umami.disabled', '1');
location.reload();
```

恢复统计：

```js
localStorage.removeItem('umami.disabled');
location.reload();
```

这是当前浏览器/当前域名的设置；其他浏览器或 www 域名需要分别设置。DNT 同样会阻止采集。新访客不会自动获得作者排除设置。

## 开发入口

- `lib/analytics/events.ts`：事件名、属性白名单及标注助手。
- `lib/analytics/client.ts`：门禁、页面上下文、队列、SDK 分发、URL/referrer 清洗。
- `lib/analytics/core.ts`：去重/预算/阅读口径纯函数。
- `components/analytics/AnalyticsProvider.tsx`：单一 PV 生命周期、显式标注的点击、观察器管理。
- `lib/analytics/exposure.ts` / `attention.ts`：稳定曝光、可见且非空闲的活跃阅读。

为需要采集的链接使用 `clickAttributes`，为项目曝光使用 `viewAttributes`。简历版本、博客筛选和书籍展开等状态变化在实际处理函数调用 `trackEvent`；站内导航、目录和媒体打开不再采集。示例：

```tsx
<a href={project.github} {...clickAttributes('project_click', {
  project_id: project.id,
  category: project.category,
  destination: 'github',
  placement: 'home_projects',
})}>GitHub</a>
```

不要同时添加 `data-umami-event`，否则会重复记录且 SDK 的链接处理可能干扰 Next.js 导航。不得把完整 URL 参数、输入内容、邮箱或错误堆栈放进属性。事件口径改动需更新设计文档和 schema_version。

## 报表口径

先创建访问概况、项目、文章、简历、书架、质量六组视图。事件总次数用于频次，page_view_id 去重用于同次访问的转化率。精确曝光 CTR 需要同一个资源、同一次页面访问关联；不能直接用总点击次数除总曝光次数。

文章“有效阅读”要求正文深度至少 90%，有效阅读秒数达到 `min(120, max(15, 预计阅读秒数 × 0.3))`。不是阅读理解或完成阅读的证明。文章访问量使用原生 PV，阅读事件次数 / 文章 PV 可作粗略阅读比例，不能称为用户转化率；不再提供文章卡片与书籍曝光点击率。邮箱点击是联系意向，Giscus iframe load 不是评论提交。

同路径错误展示与恢复视为新的页面激活，各有一个原生 PV，并重建观察器；内部 page_view_id 仍更新。质量视图使用 app_error，按 release 和 page_path 查看。

严格关联指标如后台无法直接配置，需要通过 Umami API 或只读 SQL 计算；当前没有替你创建后台报表、部署备份或计划任务。完整定义见 [设计文档](./umami-tracking-design.md)。

## 验证

```bash
node --test tests/*.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

浏览器 smoke 位于 `tests/browser/analytics-smoke.cjs`。需要可用的 Playwright（可通过外部 NODE_PATH 提供，不是应用运行依赖）和 Chrome；先启动生产构建：

```bash
npm run start -- --port 3107
CHROME_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/browser/analytics-smoke.cjs
```

可用 `ANALYTICS_SMOKE_ORIGIN` 覆盖本地服务器，`UMAMI_SCRIPT_PATH` 指定已下载的 tracker 文件。默认只读下载真实 tracker，然后在隔离浏览器中将所有站点请求转向本机，并截获 `/api/send`，其他外部请求全部阻断。测试不写生产数据库，也不修改真实浏览器配置。

自动覆盖核心点击、曝光、SPA/后退、混合大小写文章、404 脱敏、同路径错误恢复阅读、曝光属性变化、作者排除，并断言浏览器无 JS 异常。数据库实际入库、后台展示、Neon 冷启动和备份恢复属于上线后的独立验收。
