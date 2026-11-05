# 前端性能文章计划

当前状态：指标正文已通过事实审稿，按 humanizer-zh 润色后移入博客文章目录，未 commit、未 push。
原生 CSR / SSR 示例已定稿；脱敏源码包已制作并完成解压校验。

2026-11-03 按用户反馈补充了获取方式说明：区分刷新录制、运行时录制、实时指标与 API 采集；LCP 先解释对应 DOM 元素，再讲资源与优化。

## 文章目标与结构

标题：**《前端性能指标怎么看、怎么优化》**。
正文：`content/posts/frontend-performance-metrics.md`。
正文以“Chrome 哪里看 → 沿哪段定位 → 哪种改动解决问题”为主，不为各项指标分别增加实验。

| 顺序 | 指标 | 查看与定位重点 | 优化方向 |
| --- | --- | --- | --- |
| 加载 | TTFB | document 的 Timing 与导航计时；区分请求等待段和完整导航 TTFB | 重定向、连接、缓存、服务端处理与取数 |
| 加载 | FCP | Performance 的 FCP 标记及对应画面 | 内容交付、阻塞样式与脚本、字体 |
| 加载 | LCP | 候选元素、资源发现、下载与呈现阶段 | 提前发现资源、合理尺寸与编码、减少渲染等待 |
| 交互 | INP | 真实交互的输入延迟、处理耗时与呈现延迟 | 减少竞争任务、先反馈、分片和降低更新成本 |
| 交互辅助 | TBT | Lighthouse 的测量区间与长任务阻塞部分 | 减少启动脚本与初始化，不替代 INP |
| 稳定性 | CLS | 会话窗口、偏移事件与受影响元素 | 预留空间、稳定插入位置、匹配字体尺寸 |

核心 Web 指标为 LCP、INP、CLS；阈值按官方资料，线上统计真实访问的 p75，移动端与桌面端分开。
INP 是每次访问的代表值；CLS 取累计分数最高的会话窗口；TBT 明确工具与测量区间。

## 获取方式与 LCP 定位

- 本地诊断这些标准指标不需要先写 API。FCP/LCP 要覆盖加载，CLS 只覆盖观察窗口，INP 要有实际交互；TBT 的报告入口以 Lighthouse 为主。
- API 用于自动采集、监控与调试。正文给出原始 Performance 条目和 web-vitals 回调的对照，不把原始条目直接叫作最终指标。
- LCP 的对象是合格可见内容对应的 DOM 元素；JS bundle 可影响它，但不是候选元素。
- 明确时间值、候选记录、entry.element 的区别；可见面积不等于文件字节数，LCP 时间不等于图片下载时长。
- 说明 Chrome 实时页 LCP element 与录制中的节点定位步骤；提供只用于查看候选的 PerformanceObserver 示例。
- 这些是文章说明和代码示例，不新增实验，不给原生 SSR 示例增加依赖。

## 唯一案例：原生 CSR 与 SSR

项目：`/Users/bytedance/code/Easton/frontend-performance-lab/simple-ssr`。
使用原生 Node HTTP、JavaScript 与共享模板，无构建步骤、React、人为延迟或指标看板。

- `/ssr`：每次请求读取本地 fixture，由服务端生成主体 HTML 后返回。
- `/csr`：返回公共壳与空内容容器，客户端请求 `/api/product` 后用同一纯模板生成内容。
- 两端采用相同 CSS、客户端脚本和最终主体结构；脚本负责绑定计数按钮。
- SSR 首次加载不重复请求产品数据；禁用 JS 后仍可看到主体，依赖脚本的交互不生效。

案例只解释内容在哪里生成、怎样送达浏览器，不报告性能提升幅度。
FCP、LCP 可能因内容提前交付而受益，但公共壳已触发 FCP 时，两版也可能接近。
服务端取数与渲染可能增加 TTFB；INP、TBT 仍取决于客户端工作；CLS 仍取决于尺寸与更新。
原生事件绑定称为事件就绪；React 水合仅在真实框架的性能边界中解释。

## 案例观察与源码交付

- 看 Doc → Response：比较原始响应中的主体内容，不用 Elements 代替服务器返回内容。
- 看 Fetch/XHR：CSR 有产品数据请求，SSR 不额外发起该请求；公共 CSS/JS 仍正常加载。
- 区分公共壳的 FCP、主体 DOM 出现与按钮绑定，不把它们混成一个“首屏完成”。
- 按正文需要选用已有页面与响应素材，不另设性能录制截图任务。
- 脱敏源码包：`public/downloads/native-csr-ssr-demo.zip`，已制作并解压校验。
- 包内 README 提供启动方式、阅读顺序和 Network 观察步骤；示例端口为 `4174`。

## 文章位置与验证

按用户要求迁入 `content/posts/`，不再维护旧草稿副本。博客路由为 `/blog/frontend-performance-metrics`，文章会进入博客列表。
frontmatter 与既有 SSR 案例保留；根据用户的新问题增加获取方式表、API 对照和 LCP 子章节。
使用 `tags: ["大前端"]`，正文主章节 `#`、子章节 `##`，LCP 内部用连续的 `###`，Mermaid 保留横向布局。
本轮 Markdown、标题层级、两段 JavaScript 示例语法和本地资源检查通过；正文前两级对应 15 个目录项。生产构建、更新后的正式文章页、博客列表和源码下载均通过验证。
本地博客：`http://127.0.0.1:3000/blog/frontend-performance-metrics`，不再使用旧 `4176` 临时审阅页。
后续编辑保持指标实用教程为主，案例服务于交付链路解释，不预设线上收益。
不创建 commit、不 push。

## 参考背景与核查依据

下列两篇作为选题背景；本轮 web 工具无法直接读取其正文，具体指标口径按本轮官方核查。

- [常见的前端性能指标及指标优化](https://bytetech.info/articles/7245974979743842364)
- [前端性能优化入门](https://bytetech.info/articles/7259571591137689660)
- [Web Vitals](https://web.dev/articles/vitals)
- [Chrome Performance](https://developer.chrome.com/docs/devtools/performance/reference)
- [INP](https://web.dev/articles/inp)
- [CLS](https://web.dev/articles/cls)
- [TBT](https://web.dev/articles/tbt)
