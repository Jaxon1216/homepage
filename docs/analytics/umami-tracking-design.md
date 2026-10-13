# Homepage Umami 埋点体系设计

设计日期：2026-10-12；精简更新：2026-10-13。状态：代码接入完成，部署至正式环境后生效；实现差异和操作说明见 README.md。适用项目：jiangxu.net，Next.js App Router；Umami 仓库当前版本 3.4.0，线上版本需核验。

## 1. 目标与方案选择

回答五类问题：访客从哪里来；哪些内容被真正看到；哪些文章被有效阅读；哪些项目和简历引发进一步行动；页面故障是否阻碍这些行动。

推荐：Umami 负责长期流量、业务事件、行为漏斗；保留 Vercel 的基础流量作为辅助参照。两套数据不可相加，也不要求 UV 完全一致。Vercel 的既有历史不会自动迁移到 Umami，接入后的数据从上线日开始积累。

备选一：所有业务事件同时发给 Vercel 和 Umami。优点是对照方便；缺点是 Vercel 套餐限制、属性限制、额外维护和费用，不推荐作为默认。

备选二：Umami 全量点击采集、热图和会话回放。适合短期界面诊断，但噪声、数据量和隐私成本更高；首期采用显式语义事件，回放和热图关闭。

2026-10-13 按实际使用反馈将默认自定义事件从 31 类精简到 15 类，保留项目效果、阅读质量和关键主动行为。7 类原有诊断事件仍默认关闭；其余 16 类事件移除采集代码，历史数据保留。站内导航、章节/卡片/书籍曝光、目录和媒体打开不再统计。

## 2. 数据架构

浏览器 → AnalyticsProvider（环境判断、SDK 生命周期、路由上下文）→ trackEvent（事件类型、属性白名单、去重与限流）→ Umami script.js → Umami /api/send → PostgreSQL。

正式域名使用 Homepage Website ID；开发和 Preview 禁用采集，隔离浏览器验收截获全部请求，不写生产。如需测试环境真实入库，另建测试 Website ID。首页无需数据库连接；DATABASE_URL、后台账号、API 密钥只能存在于 Umami 服务端或离线报表任务。

实施时核验线上脚本发现自动 PV 没有完整 popstate 跟踪，因此统一关闭 data-auto-pageview，由 Provider 在 React 路由提交后手动产生唯一 PV，并维护内部页面上下文；不允许自动与手动并存。锚点跳转、主题和简历版本切换、标签筛选均不新增 PV。

使用 data-before-send 清洗 URL/referrer，排除 hash，仅允许 utm_source、utm_medium、utm_campaign；去掉其他 query。外站 referrer 保留域名，内部 referrer 保留规范化 pathname。清洗前后需验证 UTM 报表仍可正确归因。站内导航不加 UTM。

## 3. 数据字典与事件规范

事件名使用稳定的 snake_case，命名表达业务行为，不把文章标题、书名或 URL 拼进事件名。所有事件属性使用扁平字符串、数字或布尔值，内部约束最多 16 个属性、字符串最多 120 字符；不依赖 Umami 对复杂对象的转换行为。

所有自定义事件公共字段：

- schema_version：数字 2，事件含义或去重口径变更必须升级。
- page_type：home / blog_list / article / resume / inner_world / about / footprint / not_found / error。
- page_path：规范化 pathname，移除 query/hash。
- page_view_id：每次页面激活生成的短随机 ID；只用于同次访问关联和去重，不用于识别人。SPA 离开再返回创建新 ID，BFCache 恢复按新一次页面激活处理。
- release：生产部署的短版本标识，用于回归定位。

按事件添加 placement（如 hero、home_projects、footer、article_body、resume_header）及下文专有属性。友链沿用 target_id/target_host，当前两者均为目标域名；不重复上报 Umami 已有的浏览器、设备、国家等属性。

项目、书籍已在数据源补充稳定 slug，不用数组索引或展示标题作主键。文章使用现有 slug，简历版本使用现有 key，阅读阶段和主线使用现有 key。标签只允许仓库四个合法值，全部标签用 all。

page_view_id 不在常规面板中按值分组。默认不调用 identify，不创建跨月持久 visitor ID，不宣称能识别真实个人或精确跨设备回访。

## 4. 当前事件目录（15 类默认，7 类诊断）

P0/P1 和标注“默认”的事件默认开启；P2 为可选诊断，默认关闭。每项列出额外属性；均继承公共字段。

### 4.1 全站与流量

- 原生 pageview［P0］：首次页面加载和有效 pathname 切换，由 Provider 唯一触发 SDK 的手动 track，关闭 SDK 自动 PV。不是另建一个同名自定义事件。
- page_engaged［默认］：累计有效活跃 30 秒，每次页面访问一次；active_seconds=30。文章的有效阅读另用专门事件，不再上报多档活跃阈值。
- mobile_menu_toggle［P2］：菜单实际切换后；state=open/closed。
- theme_change［P2］：用户主动选择后；from_theme、to_theme。初始化或系统自动主题不计。

### 4.2 首页项目与对外链接

- project_impression［P0］：卡片 50% 面积连续可见 1 秒；project_id、category；每次页面访问每项目一次。
- project_click［P0］：项目 GitHub/演示入口；project_id、category、destination=github/demo、placement=home_projects。
- contact_click［P0］：Hero、Footer、About、简历联系方式；channel=email/github/x/aweme/blog、placement、resume_version（仅简历）。不发送邮箱文本或 mailto 参数。它代表联系入口点击，无法确认邮件发出或对方实际联系。
- friend_link_click［P1］：友情链接；target_id、target_host、placement=footer。
- outbound_click［P1］：未被上面语义事件覆盖的外链；target_host、target_path、placement。移除 query/hash。project_click/contact_click/friend_link_click 与本事件互斥，同一动作只产生一个事件。
- github_chart_view［P2］：GitHub 图表真实可见而非懒加载 sentinel 命中；placement=home_github。点击图表旁的个人 GitHub 入口归 contact_click。

### 4.3 博客列表与文章

- blog_filter_change［P0］：标签实际改变后；from_tag、to_tag、result_count。重复点当前标签不报。
- article_open_click［P0］：列表入口；article_slug、position、active_tag、placement=blog_list。直接从搜索引擎进文章没有此事件，使用文章原生 PV 统计访问。
- article_read_start［P0］：正文真实可见且累计有效阅读达到 5 秒；article_slug。每页面访问一次。
- article_read_qualified［P0］：深度 ≥90%，且有效阅读秒数 ≥ min(120, max(15, 预计阅读秒数 × 0.3))；article_slug、required_seconds；每页面访问一次。只是“达到阅读条件”的代理指标，不命名 read_complete。
- media_close［P2］：关闭放大层；media_type、media_id、reason=button/overlay/escape。缩放和拖动不逐步上报。
- comments_load［P2］：Giscus iframe load；article_slug。只表示 iframe 加载，不表示内容可用或评论成功。

Giscus 跨域 iframe 内的评论提交、点赞、登录不监听、不猜测。若未来官方消息协议提供明确成功信号，再单独设计并验证 origin 和消息格式。

### 4.4 简历、About 与 Inner World

- resume_version_view［P0］：初始版本展示及有效切换后的版本展示；version_id；每页面访问每版本一次。用于版本分母。
- resume_version_change［P0］：版本实际改变；from_version、to_version。重复点当前版本不报；版本切换不产生新 PV。
- 简历联系方式使用 contact_click；正文其他外链使用 outbound_click，两者携带 resume_version。
- About 社交链接使用 contact_click，不再统计章节曝光。
- book_open［P0］：展开成功；book_id、stage_id、cluster_id（当前固定主线，没有则 all）。直接换书产生新书 open，旧书 close 的 reason=switch。
- book_close［P2］：实际收起；book_id、stage_id、reason=button/toggle/switch/escape。

Footprint 当前是 Coming Soon，仅统计页面访问，不虚构地图交互。

### 4.5 质量与未来扩展

- not_found_view［P0］：404 页面出现；requested_path（脱敏，动态未知段归一为 :unknown），每次页面访问一次。不再单独采集 404 恢复点击。
- app_error［P0］：已有 app/error.tsx 展示；error_code=route_render_error、digest（仅框架提供且校验格式后）。不发完整 message/stack/用户 URL。
- resource_error［P2］：自有图片或 Mermaid 渲染失败；resource_type、resource_id、error_code。每资源每访问一次，禁止转发完整资源 URL/内容。
- 性能［P1］：线上版本验证后启用 Umami 原生 performance 功能；不手写平行的 LCP/CLS/INP 事件。不能用 page_engaged 替代原生性能指标。
- download_click、share_click、code_copy、search_submit［未来］：当前没有对应能力，不在首期接入。只有复制成功才报 code_copy；下载点击不能命名 download_success；搜索词默认不上报，仅结果数量/词长分桶。

## 5. 曝光、阅读和生命周期口径

项目曝光：卡片 50% 可见且 document 可见，连续 1 秒；隐藏或低于阈值重置稳定计时。项目曝光按同次访问每项目一次去重。章节、书籍和文章卡片不再创建曝光观察目标。

阅读活跃：页面 visible、正文与视口相交，且最近 60 秒存在 scroll/pointerdown/keydown/touchstart；进入文章时给予 60 秒初始阅读窗口。无输入超过 60 秒暂停，重新输入恢复；这是近似阅读时间，会低估静止阅读很久的用户，面板明确标注。只用 performance.now 累积 delta，后台不累计，不按 setInterval 次数推算时间。

深度按正文顶部至正文底部的相对位置计算，正文较短且完整可见可达到 100%；图片加载、字体变化后重算几何。跳到文末可触发深度，但不会绕过有效阅读时长条件。深度和时长仅在内存计算，用于 read_start 与 read_qualified，不再单独发送阈值事件。

去重主键 = page_view_id + event_name + 资源 ID + 阈值/状态。一次性曝光/阈值使用主键；主动点击不按页面永久去重，只抑制同一处理链重复触发。合法的重复点击保留。不在客户端或数据库新建跨用户长期去重键。

SPA 离开时冻结旧页面上下文、结束旧观察器和计时器，再创建新上下文。SDK 延迟期间缓存的事件携带发生时 page_path 和 URL，不能在新页面把旧事件错误归因。刷新和返回是新访问；浏览器 BFCache 恢复时重建上下文且检查原生 PV，确保恰好一次。

## 6. SDK 设计与可靠性

已实现模块：lib/analytics/events.ts 定义类型和属性；lib/analytics/client.ts 负责门禁、脱敏、队列、限流、分发；components/analytics/AnalyticsProvider.tsx 负责初始化和路由上下文；lib/analytics/exposure.ts 和 attention.ts 分别管理曝光和活跃阅读观察器。

使用类型化 trackEvent API，关键交互在现有业务处理函数中显式调用；普通链接使用 clickAttributes 标注，保持 Next Link 和原生 a 的语义。禁止在整站 document 上自动抓取所有按钮文本。

SDK 未就绪时仅在内存缓存最多 50 条、最长 10 秒，优先保留核心点击，淘汰低优先曝光；脚本失败、禁用或用户排除时直接丢弃。禁用期间不排队。事件上报不得 await 阻塞导航。队列发送使用冻结 URL 的自定义 payload 方式，实施前验证实际 3.4 tracker 签名。

不对已发送事件做业务重试：请求超时不能证明服务器没写入，Umami 不承诺按自定义 event_id 幂等。SDK 本身的发送机制需按实际版本检查；不自行增加无限重试或 localStorage 离线队列。离站事件承认可能丢失。

单页面自定义事件软上限 150；达到后停止曝光、阅读阈值等非主动事件，保留点击、书籍展开、版本/筛选切换等主动交互和 app_error，额外限流每秒最多 10 条。不递归上报 analytics_error。开发调试通过隔离浏览器截获请求检查载荷，不向生产发送。

维护开关：总开关、exposure、reading、diagnostics。无需重新定义所有事件即可停用高成本类型。作者通过本地排除标记退出统计；不发送 author=true 再试图过滤。浏览器 DNT 开启时尊重退出，provider 与 SDK 两层一致。

## 7. 分析指标与报表

建立六组视图：访问概况、项目吸引力、文章质量、简历意向、Inner World 兴趣、质量回归。

访问概况：原生 PV/访客/访问，来源域名与 UTM、入口页、设备、国家。窗口 7/30/90/365 天及全历史；时区统一 Asia/Shanghai。不要累加每日 UV 当作月 UV；匿名标识轮换和跨设备造成真实人数近似。

项目曝光点击率：同一 project_id 下，发生 project_click 且有 project_impression 的 distinct page_view_id / 曝光 distinct page_view_id。所有点击次数单独展示；未满 1 秒就点击的记录属于“未满足曝光条件点击”，不得通过补造 impression 修正分母。GitHub 与 demo 分开。

文章列表入口：按 article_slug、active_tag 查看 article_open_click 次数，不再计算文章卡片曝光点击率。直接访问文章不算列表点击。

文章阅读：展示同 article_slug 的原生 PV、article_read_start 和 article_read_qualified 次数。有效阅读次数 / 文章 PV 仅作粗略阅读比例；没有 page_context 分母，不宣称基于 page_view_id 的精确到访转化率或用户转化率。

简历版本意向率：携带相同版本的 contact_click distinct page_view_id / resume_version_view distinct page_view_id。多版本同次访问可以分别进入各版本分母；全站汇总再去重。邮箱点击只作为高意向代理。

书籍兴趣：按 book_id、stage_id 查看 book_open 次数，cluster_id 表示展开时的固定主线。不再计算书籍曝光展开率，也不单独统计主线切换。

建议漏斗：project_impression → project_click；article_open_click → article_read_start → article_read_qualified；resume_version_view → contact_click。文章漏斗匹配同一个 article_slug，跨页面按 session 关联；项目匹配同一个 project_id，不能混合 A 曝光和 B 点击。

跨页面漏斗使用 Umami 自身 session 关联、30 分钟业务观察窗口和有序步骤；page_view_id 仅关联单页面。原生后台若不支持事件属性关联或精确时间窗，面板标记原生口径；需要严格口径的指标通过 Umami API/只读 SQL 离线计算，不能声称所有自定义指标都能直接点击配置。

错误视图：app_error 按 release、page_type 汇总；错误事件率属于观测样本，不是完整服务可用率。脚本被拦截、JS 启动前崩溃无法被自身埋点看到；必要时结合 Vercel 日志和独立合成访问。

## 8. 长期保留、运维与隐私

自托管 Umami 官方说明默认无限保留，除非主动删除；数据库额度、人工 reset、迁移错误仍可造成缺失。建议初始不清理原始数据，按月评估增长；需要清理时先建立经过验证的独立日聚合和备份，不向 Umami 原始表写入自创聚合数据。

原始数据建议至少保留 24 个月，流量低且容量允许可继续保留；长期聚合保留访问量、事件量、同一口径的转化计数及 schema_version，不存 UV 的简单日累加。月级 UV 需要按原始范围重算，匿名身份策略不变也不能解释成真实个人数量。

如果线上确认为 Neon：核对现有套餐存储/计算配额、恢复窗口、连接池和数据库地域；Umami 服务与数据库尽量同区域。Scale to zero 和 Vercel 冷启动会增加首批请求延迟，验收要覆盖长时间无人访问后的首次事件，不能靠固定 ping 假装解决。

建议每日数据库备份到独立存储、每月抽样恢复演练；恢复后核对网站数量、历史最早日期、原生 PV 与事件计数。数据库原生恢复窗口不能等同于独立备份。部署升级先备份并在测试数据库验证 migration。保留 Website ID 和稳定采集域名，避免重新创建网站切断历史。

建议每周看请求失败、数据库容量趋势和事件结构；无新增事件不能直接报警“服务故障”，低流量站点应结合独立脚本加载和采集链路探测，探测写入测试 Website ID，不污染生产。

不采集输入内容、邮箱、完整 stack、IP 自定义字段、任意 DOM 文本；不跨 jiangxu.net 与 notes 子站建立用户身份关联。需要记录向 notes 的点击即可。默认禁用会话回放/热图；事件目录与用途在隐私说明中列明，原始报表不开放公共 share。

## 9. 实施阶段和验收

当前默认 15 类：page_engaged、project_impression、project_click、contact_click、friend_link_click、outbound_click、blog_filter_change、article_open_click、article_read_start、article_read_qualified、resume_version_view、resume_version_change、book_open、not_found_view、app_error。原生 PV 独立保留。

7 类可选诊断：mobile_menu_toggle、theme_change、media_close、book_close、comments_load、github_chart_view、resource_error，默认关闭。原生性能、后台报表和严格指标的离线查询仍需独立验收；离站汇总未实现。

采集所需配置已提供：Umami 稳定域名、Homepage Website ID 和生产域名；线上 tracker 已在隔离浏览器中核验。数据库套餐、备份和后台报表仍需单独验收，不影响现有事件定义。

验收清单：

- 首次进入、SPA 前进后退、刷新、BFCache 各只有一次原生 PV；内部上下文分别激活，预取链接不产生访问，不再发送 page_context。
- 目录锚点、主题、筛选、版本切换不新增 PV；快速切换路由无旧页计时/曝光泄漏。
- 同一项目反复滚动只曝光一次；小于 1 秒不算曝光；合法重复点击保留。书籍和文章卡片不再产生曝光事件。
- 项目点击不再产生 outbound_click；键盘 Enter/Space 和鼠标各执行一次。
- 文章直达文末有深度但无瞬间 qualified；隐藏标签页和空闲不累计时间；短文章、迟加载图片、无目录文章正常。
- 版本 A/B 的展示和联系事件绑定正确版本；隐藏简历版本不进入事件。章节曝光不再采集。
- Giscus 仅计可观察信号，load 不冒充提交成功。
- SDK 延迟、脚本阻断、离线、冷启动、队列满时网站交互正常；旧页队列 URL 正确，不做不安全重试。
- 本地/Preview/作者排除/DNT 不写生产；query、邮箱、stack、未知动态 URL 不泄漏。
- Umami 入库属性与事件目录一致；严格指标用测试会话验证 A 曝光+B 点击不计 A 转化，多次点击不让 CTR 超过 100%。
- 精简后按 schema_version=2 观察每 PV 的事件数、保留事件分布、存储增长和采集失败；不与旧口径混合计算，不预设虚假流量与成本。

## 10. 依据与限制

代码审查覆盖 app/layout.tsx、博客列表/文章/目录/Giscus、首页项目与社交、Navbar/Footer、About、简历版本、Inner World 书架、图片/Mermaid、404/error 和 Footprint。尚未读取线上 Umami 后台或 Neon 配置，未配置报表、未创建计划任务。原生性能采集因 SDK 后退归因限制暂未启用，P2 离站尾包未实现，详见 README.md。

官方资料（2026-10-12 查询）：

- https://docs.umami.is/docs/faq ：自托管保留、SPA、匿名身份及能力边界。
- https://docs.umami.is/docs/tracker-configuration ：域名白名单、auto-pageview、before-send、DNT、performance。
- https://docs.umami.is/docs/tracker-functions ：track、自定义 payload、事件属性限制。
- https://docs.umami.is/docs/insights ：原生分析报表；实际自托管版本可用性需验收。
- https://github.com/Jaxon1216/umami/blob/master/src/tracker/index.ts ：当前仓库 tracker 类型与实现，不能替代线上版本确认。
- https://neon.com/docs/manage/endpoints/ ：计算实例、连接和 scale to zero 管理。
