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
