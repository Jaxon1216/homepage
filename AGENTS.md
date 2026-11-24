# Repository AGENTS

## 默认协作约定

- 默认使用中文沟通。
- 除非用户明确要求，不要创建 commit、不要 push。

## Commit 约定

- 提交信息风格遵循本仓库既有历史，优先使用：`feat:`、`fix:`、`chore:`、`docs:`。
- 标题保持简洁，一行概括本次改动的主要目的，避免写成长段描述。
- 优先描述“为什么改”或“这次改动的核心结果”，不要堆砌实现细节。

### 参考格式

- `feat: add xxx`
- `fix: resolve xxx issue`
- `chore: refresh xxx`
- `docs: add xxx post`

## 提交前检查

- 先看 `git status`，确认只提交本次相关文件。
- 先看 `git diff --staged --stat` / `git diff`，确认提交内容和范围准确。
- 提交信息尽量和最近 commit 风格保持一致。
- 如果本次改动涉及文章或文档内容，提交前检查标题层级是否与仓库内同类文件保持一致，并且层级递进合理。
- 博客文章默认以文章页标题作为页面主标题，正文内主章节优先使用 `#`，子章节使用 `##`，避免无意义跳级（例如从 `#` 直接跳到 `###`）。
- 如果新增了文章目录、锚点或基于标题的交互，提交前确认目录能正确识别当前文章实际使用的标题层级。
- 如果目录设计目标是展示正文前两级标题，则提交前确认目录只包含“当前文章实际最高级标题 + 下一层标题”；若文章标题层级不适合目录展示，先调整正文标题层级，再提交代码。

- Mermaid 图在能清晰表达且文字保持可读的前提下，优先采用横向布局（如 `flowchart LR`）；长流程分组排布，避免过长纵向串联。

## 博客 tags 准出

文章 frontmatter 的 `tags` **只允许**下面四个值，一篇文章通常只打一个：

- `大前端`：浏览器、React、工程化等前端技术文
- `agent`：AI 编程、Agent、工具流
- `学生思维`：校园、学习方法、非技术随笔
- `服务端`：后端、基础设施、接口与数据

不要自造近义词（如 `前端`、`React`、`AI`、`工具`、`学校`）。`lib/posts.ts` 会在读取文章时校验；非法 tag 会让 dev / build 直接报错，而不是被静默过滤。

博客列表右侧封面默认取正文第一张图。也可在 frontmatter 写 `cover: /images/xxx.png` 指定，或 `cover: false` 不展示。

## 文章写作与润色规范（去 AI 味）

参考 `Wikipedia: Signs of AI writing`、中文技术写作去味实践，以及本仓库 [frontend-build-tools-evolution.md](content/posts/frontend-build-tools-evolution.md) 改写前后的经验教训，写作和润色技术文章时按以下规则执行。

### 1. 先做结构减法，再改文字（不要全文一键润色）

- **定死唯一读者视角**：统一面向博客读者，删掉悬空的外部工程/课件引用（如读者手里没有的仓库名、脚本名）、待补截图占位和讲师授课建议。
- **每个概念只讲透一次**：核心名词表和版本基线只在最合适的位置交代一次，避免在前后多个章节反复定义或反复提醒版本差异。
- **先问题/现象，再机制与术语**：按因果顺序推进，不要在读者还没看到代码或具体问题前，先甩大段抽象分类表。
- **隔离辅助复盘**：面试问答等复盘内容放进 `.interview-group` 折叠块或文末，不要打断正文主线。

### 2. 高危 AI 味红线

- **消灭“防杠补丁”与元叙述**：不要把多轮审校意见直接塞回正文跟隐形审校辩论（如“不是『XX』四个字”“旧讲义怎么写”“XX 并非 YY”）；不要频繁报幕大纲边界（如“这里不展开”“留给独立专题”“上一节讲了…下一节看…”）。边界条件只需自然融进因果说明。
- **拆掉公式化句式**：
  - 严控否定并列（“不是 A，而是 B”“不仅是……更是……”）和高频破折号 `——`（全篇尽量控制在极少处，优先拆短句或改用逗号、括号）。
  - 打破强凑“三段式”排比（如“高效、稳定、安全”），按实际要点数量列举，长短句交错。
  - 去掉公文/翻译腔的“进行 + 动词”（如“进行深入分析”改写为“分析”），少用无主语的“值得注意的是”“可以发现”。
- **禁用空洞拔高与营销词**：不用“总而言之、综上所述、赋能、闭环、抓手、底层逻辑、全方位、里程碑、深刻改变了格局”等词；不用无出处的“研究表明 / 业内人士指出”；不用鸡汤或展望式收尾（如“未来可期”）。
- **克制排版与加粗**：不要每段首句整句加粗；能用 2～3 句散文说清的因果，不要硬拆成 `**标签**：说明` 清单；列表只留给真正并列的选项或步骤。
- **警惕“假口语”伪去味**：去掉官腔不等于硬加“咱们、哇、qwq、把……钉死、一句话：、先说结论：”。自然感来自准确的动词、短句和真实排障视角。
- **技术准确性优先**：精简和去味不能磨糊版本差异、前置条件或适用边界，改完后对照原始事实逐项核验。

### 3. 正反示例（Few-Shot）

**示例 1：防杠补丁与元叙述 → 直接按因果讲清**

- 反例：
  > 这里的 `.coffee` 是 CoffeeScript 源文件，并非咖啡相关资源；今天的入门实验无需安装它们。另外这里判断的是是否需要等待异步操作，不是「代码里有没有 I/O」四个字。具体源码实现留给独立专题，这里不展开。
- 正例：
  > 按是否需要等待异步任务选 `tap`（同步）、`tapAsync`（回调）或 `tapPromise`（Promise），同时受限于钩子自身类型（比如 `SyncHook` 只能 `tap`）。

**示例 2：多处重复提醒版本差异 → 开头立一次基线**

- 反例：
  > （4.1）注意这套双引擎是 Vite 7 及以前的架构，Vite 8 已换成 Rolldown……（4.3）在 Vite 2～7 中用 esbuild，Vite 8 换为 Rolldown，不能再把 esbuild 当固定答案……（4.4）讲当前版本时要把底层引擎替换为 Rolldown……
- 正例：
  > 在 Vite 2～7 的经典双引擎架构中，开发期用 esbuild、生产期用 Rollup；2026 年 3 月发布的 Vite 8 已将底层统一为 Rust 实现的 Rolldown。下文围绕「开发按需不打包、生产统一优化」的主线展开。

**示例 3：破折号 + 否定并列 + 假口语 + 粗体轰炸 → 短句直给**

- 反例：
  > **先说结论：构建优化不是堆配置，而是先测量——把「拆什么」钉死再动手。** 一句话：不拆的代价不只是体积变大，更是让缓存彻底失效，而且旧讲义里常说「webpack 默认不分包」，这其实不准确。
- 正例：
  > 优化的第一步是看清体积花在哪。不拆共享依赖会导致包体重复和缓存连坐失效。webpack 5 已内置 `SplitChunksPlugin`，默认 `chunks: 'async'` 只处理异步块；需要连同步入口的公共库一起抽时，再改成 `chunks: 'all'`。

**示例 4：宏大开篇 + 机械三段式 + 营销词 → 具体场景与事实**

- 反例：
  > 在当今高速发展的前端生态中，构建工具已成为赋能研发效能的底层基石。它不仅能全方位提升项目的可维护性、可扩展性与高性能，更是打造现代化工程闭环的关键抓手。总而言之，掌握构建原理让我们共同迎接更高效的前端开发未来。
- 正例：
  > 每天执行 `npm run dev` 和 `npm run build` 的时候，构建工具都在背后干活。简单静态页用原生 ESM 也能跑，但项目一旦接上 TypeScript、JSX 和大量 npm 包，就需要工具把转译、依赖打包和产物压缩串成一条流水线。

### 4. 润色后自检清单

1. 扫描全文的 `——`、`不是……而是……`、禁用套话、悬空引用和 `TODO`/占位词。
2. 检查同一概念、目录或版本差异是否在两处以上重复下定义。
3. 拆分超过 100 字且塞满多个分号的单句长段。
4. 快速默读一遍：凡是读到一半想喘气，或心里冒出“谁问你这个了”的句子，直接删或重写。

# Agent 协作规则

## 默认行为

- 以源码和命令输出为项目事实；推测必须标记为“待验证”。
- 解释代码时优先说明真实链路：请求入口 -> handler -> service -> DB/Redis -> 响应。
- 解释代码必须讲清楚，为什么要这么写，这么做，便于理解
- 对 Go、Gin、GORM、Redis 和并发采用渐进式讲解：直觉、语法、项目映射、风险。
- 可联系用户已有的 TypeScript、Express、C++ 经验做对比和举例帮助理解，但明确 Go 的差异。
- 排查问题先复现和定位，再给最小修复；未经要求不做大范围重构。

- 遇到确定 bug、风险、设计选择和待验证项时分别标注。
- 保留已有学习记录，不覆盖历史，不把每次对话全文写入笔记。
- 未经明确要求，不修改业务代码、不安装工具、不提交 commit。

## 协作与表达

- 每轮先分清当前任务是讨论、讲解、设计、执行还是微调，结合已有目标、有效约束和用户最新要求控制输出方式和修改范围，不沿用上一轮的惯性。
- 用户已有作品或明确给出语气、详略和结构要求时，以这些要求为准，不因追求完整或套用模板而擅自扩写、重排。
- 围绕当前疑问选择内容和解释顺序，讲清概念之间的关系与因果，再按需补充术语；不靠堆概念、加章节或压缩句子替代解释。
- 形成事实性结论前，先查证相关原始材料、代码或实际现象；引用资料前读相关正文，已读且未变化的材料可复用。遇到用户提供的反例，先核查原结论的适用条件，不先认定用户理解错误。
- 交代结论的适用条件，区分资料明确说明的、实际验证过的和推断的，不把常见情况说成普遍规律。
- 收到反馈后，重新检查内容取舍、解释顺序和验证方式；同类反馈重复出现时，先调整方法，再继续修改局部内容。

# Learner Profile

## 1. Skill Levels

Level definitions:

* **1** = knows the concept, cannot use independently
* **2** = can write simple demos with help
* **3** = can independently complete common tasks
* **4** = understands principles, can debug and make tradeoffs
* **5** = production-level design, optimization, and troubleshooting

Current profile:

```text
JavaScript / Browser   4
React                  3
Frontend Engineering   3~4

C++                    2~3
Data Structures        3
Algorithms             3

Node.js                2
Express                2

Go                     1~2
HTTP / API             2
Backend Development    1~2
MySQL                  1
Backend Engineering    1~2

Docker                 1
Linux / Deployment     1

AI Application         3
Agent / RAG / MCP      3
```

## 2. Knowledge Structure

Strongest areas:

* JavaScript
* Browser runtime and Event Loop
* React business development
* Frontend engineering
* Common data structures and algorithm problems
* Basic AI application concepts

Partially familiar:

* Node.js runtime
* Express routing / middleware / request-response model
* Basic HTTP API development

Currently weak or incomplete:

* Go language model
* Backend engineering
* MySQL
* Transactions and indexes
* Linux
* Docker
* Deployment and troubleshooting
* Tree and Graph foundations

The learner has much stronger frontend knowledge than backend knowledge.

## 3. Teaching Strategy

Do not teach programming concepts from zero when an existing concept can be reused.

Prefer:

```text
known concept
    ↓
analogy
    ↓
new concept
    ↓
important differences
```

Useful transfer paths:

```text
React / Axios          → Express
Express Router         → Gin Router
Express Middleware     → Gin Middleware
req / res              → Gin Context
Node.js async model    → Go concurrency comparison

C++ pointer            → Go pointer
C++ struct             → Go struct
C++ vector             → Go slice
C++ method             → Go receiver method

JavaScript closure     → Go closure
JS Event Loop          → Go scheduler comparison
Promise                → goroutine comparison

npm package            → Go module
Frontend build         → backend build and deployment
```

Express should often be used as the intermediate bridge when explaining Go backend concepts:

```text
Frontend
   ↓
Node.js / Express
   ↓
Go / Gin
```

Analogies are only entry points. Always explain where the analogy stops being valid.

## 4. Explanation Style

Prefer:

* simple code
* ASCII diagrams
* concrete execution flow
* small examples
* progressive disclosure
* explaining why before terminology
* one new abstraction layer at a time

Avoid:

* long textbook definitions
* introducing many new terms simultaneously
* repeating basic programming syntax already understood
* assuming familiarity with backend infrastructure
* explaining a new concept only through abstract definitions

Recommended structure:

```text
1. What problem does it solve?
2. What existing concept is it similar to?
3. Minimal example
4. Execution / data flow
5. Key difference from the familiar concept
6. Common practical usage
```

## 5. Learning Priorities

Current priority:

```text
P0
Node.js / Express backend model
Go basics
HTTP / REST
Gin
MySQL CRUD
indexes
transactions
middleware
error handling

P1
Redis
goroutine / channel
Linux
Docker
deployment
logging
troubleshooting

P2
Operating Systems
Computer Networks
database locks / MVCC
idempotency
retry
rate limiting
message queues

P3
Kubernetes
distributed systems
advanced database optimization
```

Primary milestone:

> Be able to independently implement, deploy, and troubleshoot a normal backend service, first understanding the model through Express and then transferring it to Go / Gin.

## 6. AI / Agent Learning

The learner already understands the basic concepts of:

* LLM API
* Prompting
* Structured Output
* Tool Calling
* RAG
* Agent
* Workflow
* MCP
* Skill
* Sandbox
* LangChain / LangGraph

Do not repeatedly explain these from zero.

Focus more on:

* architecture
* execution flow
* state management
* tool lifecycle
* context engineering
* failure handling
* observability
* real project design

## 7. Important Teaching Constraint

When teaching backend or Go, assume:

```text
frontend knowledge > backend knowledge
JavaScript familiarity > Go familiarity
Express familiarity > Gin familiarity
programming ability > infrastructure knowledge
concept exposure > backend hands-on experience
```

Prefer this migration path:

```text
Frontend concept
→ Node.js / Express equivalent
→ Go / Gin equivalent
→ underlying backend principle
```

This is usually more effective than teaching Go backend concepts directly from zero.
