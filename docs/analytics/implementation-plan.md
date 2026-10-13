# Umami 接入实施计划

目标：使用 umami.jiangxu.net 与 Website ID 81d59058-21eb-4930-9426-5a685a3cb2e2，落地现有页面全部核心行为及可观测交互。

约束：保留现有修改，按用户授权分批提交并推送；不向生产数据库写测试事件；不增加运行依赖。单一手动 PV 入口，关闭 SDK 自动 PV（线上脚本缺少 popstate 跟踪）。生产构建且正式域名才发送；Preview、开发、DNT、作者排除均禁用。

- [x] 1. 编写 node:test：URL/referrer 脱敏、事件属性白名单、队列过期/上限、页面去重、合法重复点击、后台/空闲阅读时间、阅读深度与达标条件。先运行失败，再实现纯逻辑。
- [x] 2. 添加 lib/analytics/{config,events,core,client}.ts：类型化事件、生产门禁、冻结上下文、10 秒/50 条内存队列、软预算、SDK callback payload；添加统一 Provider 与页面/曝光/阅读生命周期。验证前进后退与 SDK 就绪顺序。
- [x] 3. 标注现有导航/社交/项目/文章卡片/章节曝光；业务状态变化显式调用 trackEvent。实现简历版本、书籍展开/主线、目录、媒体、评论容器与错误事件。复用 data-analytics 属性，不使用 SDK 属性点击以免阻塞 Next.js 导航。
- [x] 4. 完善使用文档、事件目录与状态。测试环境拦截 SDK 请求验证载荷，不写生产；运行 node --test tests/*.test.mjs、npx tsc --noEmit、范围 ESLint 和 npm run build。
- [x] 5. 对照设计自查并复核差异：线上数据库备份/报表配置属外部运维，不冒称完成；如无法登录后台则明确验收边界。

验证记录：21 项 node:test 通过；TypeScript 通过；ESLint 无错误，仅 lib/utils.ts 原有未使用 clsx 警告；生产构建通过。真实 SDK + 隔离 Chrome 浏览器 smoke 通过，所有采集请求均拦截，未写生产。后台报表和数据库运维未执行，详见 README.md。

## 2026-10-13：精简默认事件

目标：按已确认方案将默认自定义事件从 31 类缩至 15 类，原生 PV 继续保留；友链参数不变。用户授权本次 commit，不推送。

保留：page_engaged、project_impression、project_click、contact_click、friend_link_click、outbound_click、blog_filter_change、article_open_click、article_read_start、article_read_qualified、resume_version_view、resume_version_change、book_open、not_found_view、app_error。原有 7 类诊断事件仍由 diagnostics 开关控制，默认关闭。

实现：从 events.ts 注册表和页面调用点移除其余 16 类事件；页面内部 context、page_view_id、文章深度和活跃计时继续用于正确归因及有效阅读判定，不再单独发送 page_context、深度或时间阈值。事件公共 schema_version 升至 2，历史数据不删除。

- [x] 1. 更新 tests/analytics-client.test.mjs：逐一调用旧事件应无发送且不隐式产生 PV；调用全部注册事件仅发 15 类默认事件；诊断默认关闭。已有生命周期测试改用 getPageContext() 验证独立 id，文章归因使用 article_read_start；软预算使用 project_impression 触发。先运行 node --test tests/analytics-client.test.mjs，确认精简断言失败。
- [x] 2. 修改 lib/analytics/events.ts、client.ts、attention.ts：移除 16 类注册项和分发；只保留 page_engaged 的 30 秒阈值及 article_read_start/qualified。移除 app/、components/ 中对应 click/view 标注和状态变化采集；保留所有 UI 行为、诊断及友链载荷。
- [x] 3. 更新 tests/analytics-exposure.test.mjs 为项目曝光属性变化场景；更新 tests/browser/analytics-smoke.cjs，断言保留事件与原生 PV，友链仍按域名区分，图片/书架/移动导航正常交互且不再发送停报事件。
- [x] 4. 更新 README.md 使用说明与 umami-tracking-design.md 为 15 类事件口径；停止提供文章卡片/书籍曝光 CTR，文章访问分母使用原生 PV，不冒称精确用户转化率。
- [x] 5. 执行 node --test tests/*.test.mjs、npx tsc --noEmit、npm run lint、npm run build 和隔离浏览器 smoke；复核 diff 后只提交本次相关文件，保留 .obsidian/ 与 .temp/ 本地目录。

精简验证记录：22 项 node:test、TypeScript、生产构建均通过；ESLint 无错误，仅保留 lib/utils.ts 原有 clsx 警告。隔离浏览器 smoke 通过，13 次原生 PV，停报事件未发送，友链域名参数保持原样，无 JS 异常；全部采集请求拦截，未写生产。独立只读复核未发现本次改动引入的问题。
