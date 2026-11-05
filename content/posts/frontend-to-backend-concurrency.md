---
status: draft
title: "从前端到后端：代码运行、并发与资源控制"
date: "2026-11-04"
description: "从 Promise.all 出发，沿着一个后端请求理解 Node.js 事件循环、Go GMP 调度，以及并发任务的依赖、失败和资源限制。"
tags: ["服务端"]
---

我瘫坐在椅子上，看着眼前陌生的 Go 代码，脑子里冒出一串问题：Go 代码也需要编译吗？写 Go 的时候，我需要自己管理线程吗？

写前端时，我习惯用 JavaScript 和浏览器事件循环理解异步。现在换成了 Go，代码跑在服务器上，我又想知道：一个请求进来之后，程序里的 goroutine、线程和 CPU 是怎么配合的？

后来，我掏出了 GPT-6.1 Terra Ultra，让它带着我把这些问题梳理了一遍。我把这次学到的东西毫不保留地写在这篇文章里。

假设我们要做一个页面接口：收到请求后，同时查询用户信息、历史记录和推荐内容，最后把结果拼起来返回。下面就沿着这个请求，看看 Node.js 和 Go 分别如何执行任务，以及写业务时需要考虑什么。

# 一、代码跑在哪

服务器上有一份代码，还需要启动它，才能接收请求。启动后，操作系统创建进程；进程中的线程执行实际调用到的代码。一份构建产物也可以启动多个进程，它们各自拥有普通内存和运行状态。

| | 类型检查 | 常见运行方式 |
| --- | --- | --- |
| JavaScript | 动态类型 | Node.js 使用 V8 执行 JS，运行过程中可以进行 JIT 编译和优化 |
| Go | 静态类型 | `go build` 提前编译出目标平台的可执行文件，程序运行时也有 Go runtime |
| Python | 动态类型 | 常见的 CPython 将源码转换为字节码，再由解释器执行 |

Go 可以推断类型：`count := 1` 得到的是 `int`，和 TypeScript 的类型推断有点像。外部 HTTP 参数仍需要解析和校验，例如把字符串 `"123"` 转成整数时，需要处理转换错误。

“强类型、弱类型”通常用来讨论隐式转换，定义会随语境变化。比如 JS 的 `"1" + 1` 得到 `"11"`，Go 和 Python 在这个表达式上会报错。**类型规则、编译方式和并发模型是几个不同维度**，理解一项时还需要分别看另外几项。

# 二、Nodejs并发

## 从 Node.js 的 Promise.all 开始

接着刚才的页面接口来写。假设用户访问 `GET /page/123`，处理函数从 `req.params.id` 取到用户 ID，再同时调用三个查询函数。它们各自向下游发起异步请求，返回 Promise，并接收一个取消信号。

先处理两种失败：用户信息和历史记录影响页面的主要内容，查询失败时把错误交给 Express；推荐内容允许降级，失败时返回空列表。为了避免下游一直卡住，这里还给整次查询设置了 3 秒超时：

```js
app.get('/page/:id', async (req, res, next) => {
  const { id } = req.params
  const controller = new AbortController()
  const { signal } = controller
  const timer = setTimeout(() => controller.abort(), 3000)

  try {
    const [user, history, recommendations] = await Promise.all([
      getUser(id, signal),
      getHistory(id, signal),
      getRecommendations(id, signal).catch(err => {
        if (signal.aborted) throw err // 整体已取消，让错误继续向上走
        return []                     // 推荐查询失败，降级为空列表
      }),
    ])
    res.json({ user, history, recommendations })
  } catch (err) {
    controller.abort() // 主要查询失败时，通知其他查询停止
    next(err)          // 交给 Express 错误处理中间件
  } finally {
    clearTimeout(timer)
  }
})
```

三个函数各自发起查询，`Promise.all` 等待结果，按传入的顺序汇总。查询期间，Node.js 还可以推进其他请求的 JS 回调。`getUser`、`getHistory` 和 `getRecommendations` 是这里假设已经封装好的下游查询函数。

这里的 `AbortController` 像一个取消开关：三个函数收到的 `signal` 来自同一个 controller。3 秒计时结束，或者用户信息、历史记录查询失败时，代码调用 `controller.abort()`，向尚在进行的查询发出取消信号。请求到达下游后，对方是否停止处理还取决于下游服务。

这需要查询函数配合：例如使用 `fetch` 时，将信号传入 `fetch(url, { signal })`，并按业务需要检查 `response.ok`。`Promise.all` 在一个 Promise 失败时会返回错误，其余调用是否停止，取决于调用方发出的取消信号以及下游 API 的支持。这里的 3 秒只是示例值；客户端断开后的取消也需要结合所用服务框架单独处理。

下面这张图展示三个查询都顺利完成时的过程：

![Node.js 事件循环：多个任务来源与一个 JS 主线程](/images/backend-concurrency/node-event-loop.svg)

看图时，顺着刚才的请求走：JS 主线程执行 handler，发起三个查询；网络等待期间，主线程可以执行其他回调。网络就绪后，运行时安排相应的后续逻辑回到 JS 主线程；三个结果都准备好后，handler 执行 `res.json`。

这个思路可以联系[浏览器事件循环](/blog/eventLoop)来理解。Node.js 的环境里还有 libuv：常见网络等待借助操作系统的就绪通知，部分文件、DNS 和加密工作会使用 libuv 线程池。[Node.js 官方文档](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)介绍了这两条路径。

刚才只有三个查询。假如另一个接口需要查询一批用户，直接对每个 ID 调用 `getUser`，会很快启动一大批下游请求。可以用社区库 [p-limit](https://github.com/sindresorhus/p-limit) 控制同时执行的函数数量。下面的 `ids` 是需要查询的用户 ID 列表，`signal` 沿用上面的取消信号：

```js
import pLimit from 'p-limit' // 需要单独安装 p-limit

const limit = pLimit(5)
const users = await Promise.all(
  ids.map(id => limit(() => getUser(id, signal)))
)
```

箭头函数让 `limit` 决定何时调用 `getUser`。如果每个 HTTP 请求都新建一个 `limit`，这个上限只作用于该请求；放在模块级共享，才能限制当前进程里共用它的调用。

## Go的并发

再用 Go 实现同一个页面接口。Go 里的 `go f()` 会启动一个 goroutine 来执行函数 `f`。为了等待一组 goroutine 并收集错误，这里使用需要单独引入的 `golang.org/x/sync/errgroup`：它的 `group.Go` 负责启动任务，`group.Wait` 负责等待。

下面展示 service 函数中的片段：`id` 是用户 ID；`ctx` 是 handler 传进来的请求 context，可以把超时和取消信息传给下游。三个查询函数分别返回对应的数据和 `error`。

```go
group, groupCtx := errgroup.WithContext(ctx)

var user User
var history []HistoryRecord
var recommendations []Recommendation

group.Go(func() error {
    var err error
    user, err = getUser(groupCtx, id)
    return err
})

group.Go(func() error {
    var err error
    history, err = getHistory(groupCtx, id)
    return err
})

group.Go(func() error {
    result, err := getRecommendations(groupCtx, id)
    if err != nil {
        if groupCtx.Err() != nil {
            return groupCtx.Err() // 请求已取消，结束任务
        }
        recommendations = []Recommendation{} // 推荐失败，使用空列表
        return nil
    }
    recommendations = result
    return nil
})

if err := group.Wait(); err != nil {
    return err
}
// 在这里使用 user、history 和 recommendations 组装响应
```

`errgroup.WithContext(ctx)` 创建任务组和派生的 `groupCtx`；三个 `group.Go` 各启动一个 goroutine。可以把它们理解成同时发出的三份工作：用户信息或历史记录失败会返回错误，推荐失败则采用空列表继续。每个 goroutine 写自己的结果变量，主流程调用 `Wait` 等待它们结束，再读取结果并组装响应。

`errgroup.WithContext` 在子任务返回错误时会取消派生的 context；其他任务需要使用这个 context，才能响应取消。`Wait` 会等待组里的函数返回，返回后派生 context 也会被取消。后续阶段可以继续使用原请求的 `ctx`。[errgroup 文档](https://pkg.go.dev/golang.org/x/sync/errgroup)列出了它的行为。

Python Agent 项目里，`asyncio.gather` 也能组织一组异步调用。使用支持异步 I/O 的客户端时，等待网络期间事件循环可以推进其他任务；同步阻塞函数则需要另外处理。

# 三、大名鼎鼎的GMP模型

前面的 `group.Go` 启动了三个任务。它们何时执行，又在哪里等待？Node.js 中，普通 JS 回调主要由一个事件循环线程执行；Go runtime 则负责把可运行的 goroutine 安排到操作系统线程上。下面是 Go 的 GMP 调度主干：

![Go GMP：全局队列、本地队列、P、M、CPU 与任务流转](/images/backend-concurrency/go-gmp.svg)

- **G** 是 goroutine，保存任务的执行状态。
- **M** 是操作系统线程，承载 Go 代码的执行。
- **P** 是执行 Go 代码所需的调度资源，包含本地运行队列等；P 与 M 可以重新关联。

沿着查询用户信息的 G 看一次：它就绪后会等待调度，常见情况下进入某个 P 的本地队列；与 P 关联的 M 取得任务，再由操作系统安排到 CPU 上执行。G 发出网络查询后，如果需要等待响应，就会暂时让出执行机会。网络就绪后，它重新变为可运行，再由 runtime 安排继续执行。

本地队列之外还有全局队列；任务分布不均时，调度器可以从其他 P 的队列中偷取工作。某些阻塞系统调用可能阻塞 M，runtime 可以将 P 转交给其他 M。

`GOMAXPROCS` 决定 P 的数量，限制同时执行用户 Go 代码的线程数。一个程序仍然可以有更多等待网络的 goroutine；具体调度顺序由运行时决定。[Go runtime 说明](https://go.dev/src/runtime/HACKING)

# 四、并发组之外，还有业务要决定的事

回到页面接口：用户信息和历史记录是当前接口的强依赖，推荐内容是弱依赖，可以缺省。它们可以同时查询，失败后的处理方式由这个接口的业务规则决定。强弱依赖也有观察范围：某项查询对内部函数是强依赖，上层接口仍可以选择降级。

再换一个场景：假设“推荐内容”需要先拿到用户画像，它就有了**先后依赖**：先查询画像，再查询推荐。我的 Go 项目里也有类似的分阶段并发：一组任务结束后启动依赖它的下一阶段，另一组任务则继续独立执行。

可以从这几个问题检查自己的接口：

| 问题 | 开发时要做的决定 |
| --- | --- |
| 任务怎样等待？ | `Promise.all` 或并发组负责汇总结果 |
| 任务失败怎么办？ | 返回错误，或记录失败并使用默认值 |
| 同时执行多少个？ | 为单个请求、整个进程分别设置合适的并发上限 |
| 下游能承受多少连接？ | 复用数据库连接池，并结合实例数计算总量 |
| 用户走了，任务还要等多久？ | 设置超时，把取消信号传到数据库和 HTTP 调用 |

例如，一个请求最多同时调用 2 个工具，100 个请求同时进入时，仍可能出现约 200 个下游调用。应用部署为多个进程时，每个进程的本地限制和数据库连接池也会分别计算。

线程池管理线程，连接池管理网络连接；外部 API 的每分钟请求数或 token 配额，还需要单独考虑。运行时安排任务怎样执行，业务代码决定要发起多少任务、等多久，以及失败后如何返回。
