# Umami 接入实施计划

目标：使用 umami.jiangxu.net 与 Website ID 81d59058-21eb-4930-9426-5a685a3cb2e2，落地现有页面全部核心行为及可观测交互。

约束：保留现有修改，按用户授权分批提交并推送；不向生产数据库写测试事件；不增加运行依赖。单一手动 PV 入口，关闭 SDK 自动 PV（线上脚本缺少 popstate 跟踪）。生产构建且正式域名才发送；Preview、开发、DNT、作者排除均禁用。

- [x] 1. 编写 node:test：URL/referrer 脱敏、事件属性白名单、队列过期/上限、页面去重、合法重复点击、后台/空闲阅读时间、阅读深度与达标条件。先运行失败，再实现纯逻辑。
- [x] 2. 添加 lib/analytics/{config,events,core,client}.ts：类型化事件、生产门禁、冻结上下文、10 秒/50 条内存队列、软预算、SDK callback payload；添加统一 Provider 与页面/曝光/阅读生命周期。验证前进后退与 SDK 就绪顺序。
- [x] 3. 标注现有导航/社交/项目/文章卡片/章节曝光；业务状态变化显式调用 trackEvent。实现简历版本、书籍展开/主线、目录、媒体、评论容器与错误事件。复用 data-analytics 属性，不使用 SDK 属性点击以免阻塞 Next.js 导航。
- [x] 4. 完善使用文档、事件目录与状态。测试环境拦截 SDK 请求验证载荷，不写生产；运行 node --test tests/*.test.mjs、npx tsc --noEmit、范围 ESLint 和 npm run build。
- [x] 5. 对照设计自查并复核差异：线上数据库备份/报表配置属外部运维，不冒称完成；如无法登录后台则明确验收边界。

验证记录：21 项 node:test 通过；TypeScript 通过；ESLint 无错误，仅 lib/utils.ts 原有未使用 clsx 警告；生产构建通过。真实 SDK + 隔离 Chrome 浏览器 smoke 通过，所有采集请求均拦截，未写生产。后台报表和数据库运维未执行，详见 README.md。
