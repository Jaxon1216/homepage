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

我们先做一个页面接口：用户访问 `GET /page/123`，服务端同时查询用户信息、历史记录和推荐内容，最后拼成一个响应。从这个接口出发，看看 Node.js 和 Go 怎么组织任务，以及运行时如何让这些任务跑起来。

# 一、代码跑在哪里？

前端项目 build 后，会产生浏览器可以加载的静态资源。Go 后端也有构建过程：`go build` 将源码编译成目标平台的可执行文件；部署并启动它，操作系统便创建一个进程。进程里有内存、连接和线程，线程执行程序当前走到的代码。

同一份可执行文件可以启动多个进程，也可以部署到多台机器上。先只看一个进程：它可以同时处理多个请求。比如用户 A 和用户 B 都访问了页面接口，他们会走同一套处理逻辑，但各有自己的用户 ID 和查询结果。线程执行共享代码时，各自记录着当前执行到哪里；如果任务访问了同一份可变数据，就要考虑并发安全。

所以，线程可以执行同一段代码的不同调用。一个请求需要怎样的执行资源，取决于语言运行时和程序的写法。

我顺手把几个容易混在一起的概念放在这里：

| 维度 | JavaScript / Node.js | Go | Python（以 CPython 为例） |
| --- | --- | --- | --- |
| 类型检查 | 动态类型，运行时检查 | 静态类型，编译时检查 | 动态类型，运行时检查 |
| 常见运行方式 | V8 执行 JS，并通过 JIT 编译优化 | `go build` 提前编译，运行时由 Go runtime 协助调度和管理内存 | 源码通常先转为字节码，再由解释器执行 |
| 常见网络并发 | 异步 API、Promise | goroutine | `asyncio` 与异步客户端 |

类型、编译和并发是各自独立的维度。静态类型意味着程序在运行前就会检查很多类型问题，Go 的 `count := 1` 也能推断出类型。动态类型则让值的类型在运行过程中参与检查。

表中的 JIT 指即时编译：程序运行期间，V8 可以把经常执行的代码编译成机器码并优化。Go 常见的做法则是在部署前，通过 `go build` 编译出可执行文件。

“强类型、弱类型”常用来讨论隐式转换，具体划分会随语境变化。比如 JS 的 `"1" + 1` 得到 `"11"`，Go 和 Python 都要求先处理类型不匹配。到了后端入口，请求参数仍然是外部输入，Go 服务也需要解析并校验它。

# 二、先用熟悉的 Node.js 处理请求

## 三个查询如何并发？

假设我们用 Express 写接口，`app` 是已经创建好的服务，`app.get` 注册一条路由。用户访问 `/page/123` 时，Express 会调用后面的处理函数（handler），其中 `req.params.id` 的值是 `"123"`。

页面需要的三份数据存放在其他服务中。我们假设已经封装了 `getUser(id)`、`getHistory(id)` 和 `getRecommendations(id)`：每个函数发起一次网络查询，并返回 Promise。下面的代码省略了服务启动和这些查询函数的实现。

```js
app.get('/page/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const [user, history, recommendations] = await Promise.all([
      getUser(id),
      getHistory(id),
      getRecommendations(id),
    ])
    res.json({ user, history, recommendations })
  } catch (err) {
    next(err)
  }
})
```

三个函数被调用后分别发起查询，`Promise.all` 等待它们的结果，最后按传入顺序汇总。查询成功后，`res.json` 把三份数据拼成 JSON 发回浏览器；遇到错误时，`next(err)` 把错误交给 Express 的错误处理中间件。

假设每个查询都要等待 100 毫秒，这些等待时间可以重叠；实际响应时间还会受到被查询的服务、网络和其他工作的影响。

这里的**并发**是多个任务在同一段时间内推进；**并行**是多个任务在同一时刻分别占用不同 CPU 核执行。网络查询的大部分时间在等待，因此即使普通 JS 代码主要由一个事件循环线程执行，Node.js 也能同时处理许多网络请求。

## 等待的时候，Node.js 在做什么？

下面的图先画出**一个查询**的去程和回程。刚才的代码发起了三个查询，可以把它们想成三条类似的路径：

![Node.js 事件循环：多个任务来源与一个 JS 主线程](/images/backend-concurrency/node-event-loop-whiteboard.png)

从左上角的蓝框开始看：JS 主线程执行 handler，调用查询函数；网络操作交给 Node.js 和操作系统处理，等待期间主线程可以执行其他就绪的 JS。图中紫色区域表示事件循环的几个阶段，网络就绪后，相关操作会在事件循环的配合下继续推进。

当查询最终完成，它的 Promise 就有了结果；绿色框里的微任务会安排相应的后续代码执行。三个查询都完成后，`Promise.all` 的结果就绪，`await` 后面的 `res.json` 才能继续。网络“就绪”表示连接可以继续读写，接收完整响应可能需要多次读写。

图里的事件循环和 JS 主线程是在描述同一套执行过程：事件循环负责安排何时处理回调，普通 JS 代码由图中这条主线程执行。`timers`、`poll / I/O` 和 `check` 是其中几个阶段；读这篇文章时，先跟住网络查询和 Promise 的路径就够了。

这和我熟悉的[浏览器事件循环](/blog/eventLoop)有相通的地方：一条 JS 主线程配合异步任务，等待期间继续处理其他工作。Node.js 使用 V8 执行 JS，libuv 协助处理事件循环和异步工作；常见网络 I/O 借助操作系统的就绪通知，部分文件、DNS 和加密任务会使用 libuv 线程池。因此，平时说的“Node.js 单线程”，主要指一个事件循环上的普通 JS 执行，并非整个进程只有一条线程。[Node.js 官方说明](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)

如果 handler 里有一段很长的同步计算，主线程会忙于执行它，其他 JS 回调也需要等待。需要并行处理 CPU 密集任务时，可以考虑 Worker Threads 或独立进程。

# 三、换 Go 写同一个接口

Go 里可以用 `go f()` 启动一个 goroutine，让函数 `f` 作为一个并发任务运行。HTTP 服务处理请求时，Go 标准库的 `net/http` 会在 goroutine 中调用 handler；handler 内部还可以按需要启动更多 goroutine。goroutine 是 Go 运行时调度的任务，下面简称 G。

三个查询如何等待结果、处理错误？这里用 [`errgroup`](https://pkg.go.dev/golang.org/x/sync/errgroup) 组织任务，它需要单独引入 `golang.org/x/sync/errgroup`。下面是一个返回 `error` 的业务函数片段，省略了函数签名和查询函数的实现。

`id` 是上层传进来的用户 ID；`ctx` 是 Go 的 context，用来向下游传递截止时间和取消信号，可以先联系 JS 的 `AbortSignal` 理解。`User`、`HistoryRecord`、`Recommendation` 是示例中定义好的数据类型。三个查询函数各返回两个值：查询结果和 `error`；成功时错误通常为 `nil`。

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
    var err error
    recommendations, err = getRecommendations(groupCtx, id)
    return err
})

if err := group.Wait(); err != nil {
    return err
}
// 三个查询都成功，可以使用各自的结果组装响应。
```

代码里，`:=` 用来声明变量；`var err error` 声明一个错误变量，`user, err = getUser(...)` 接收函数的两个返回值。每个 `group.Go` 启动一个 goroutine，执行一次查询；`group.Wait()` 等待三个任务全部结束，返回第一个非 `nil` 错误。都成功时，它返回 `nil`，代码才会继续组装响应。

和 `Promise.all` 放在一起看，还有一个等待上的区别：Promise 一旦被拒绝，`Promise.all` 就会返回错误；`group.Wait()` 会等组里的函数都返回，再返回错误。`errgroup` 发出的取消信号可以让支持取消的查询尽早结束。

这里三个任务各自写入不同的结果变量，等全部结束后再读取。如果多个 goroutine 同时读写同一份数据，就要考虑同步，例如用 mutex（互斥锁）保护这份数据。

把 goroutine 和熟悉的 Promise 放在一起看：Promise 表示异步操作的结果，goroutine 是 Go runtime 调度的一段并发执行任务。`errgroup` 则帮我们管理一组 goroutine 的等待和错误。

有了这段代码，下一个问题就来了：**三个 goroutine 是三条线程吗？发起网络查询后，它们又去了哪里？**

# 四、GMP：goroutine 如何跑起来

## 先看全景

图里的绿色圆形是 G，也就是刚才启动的 goroutine；橙色 P 是 Go 运行时的调度资源，蓝色 M 是操作系统线程。我们把查询用户信息的任务标成 G1。图中的箭头展示任务可能经过的路径，包含不同时间发生的情况。

![Go GMP 全景：全局队列、本地队列、P、M、CPU、工作窃取与网络等待](/images/backend-concurrency/gmp-overview.png)

图里有三种角色：

- **G（goroutine）**：一份可以被调度的任务，保存自己的执行状态。例如上面的 `getUser` 任务。
- **M（machine）**：操作系统线程。Go 代码最终由线程执行，操作系统再把线程安排到 CPU 上。
- **P（processor）**：Go runtime 的调度资源，包含本地运行队列等信息。M 取得 P 后，才能执行普通 Go 代码；P 是运行时概念，CPU 是硬件执行资源。

可以把 P 想成一个带待办队列的工作台，M 是使用工作台的线程，G 是一项项工作。M 和 P 的关联会变化；G 继续执行时也未必回到原来的线程。

从图的中间往下看：每个 P 有本地运行队列，运行时还有全局运行队列。队列中的 G 已经可以运行，正在等待执行机会。一个 M 取得 P 后，可以执行其中的 G；操作系统再调度 M 到 CPU 上运行。

图中设置 `GOMAXPROCS = 2`，表示运行时有两个 P，可以同时执行最多两个普通 Go 代码任务。等待中的 goroutine 可以更多，进程中的线程数和网络连接数也有各自的情况。[Go runtime 说明](https://go.dev/src/runtime/HACKING)

平时写 Go 后端，我们主要创建和组织 goroutine，由 Go runtime 调度线程；同时要自己决定任务的超时、失败处理和资源上限。

## 跟着查询用户信息的 G 走一遍

接下来把总图中的 G1 单独拿出来，按图中四格从左往右看：

![查询用户信息的 goroutine：创建、执行、网络等待和恢复](/images/backend-concurrency/gmp-journey.png)

1. **创建**：执行 `group.Go`，创建一个负责 `getUser` 的 G，等待调度。
2. **运行**：G 获得执行机会，由关联了 P 的 M 执行；操作系统负责调度 M。
3. **等待**：查询需要等待网络响应时，G 进入等待状态。对于 Go runtime 支持的常见网络 I/O，运行时借助网络轮询机制等待就绪，M 可以继续执行其他可运行的 G。
4. **恢复**：网络连接可以继续读写时，G 重新成为可运行状态，等待被调度，再从等待处继续执行。数据可能还要经过多次读写才能收齐。

图里展示的是一种常见路径。真正的执行顺序由运行时和操作系统决定。一次 HTTP 查询还会涉及客户端连接池、网络协议和下游服务；图中先聚焦 Go 进程内的调度。

## 一边忙，一边闲：工作窃取

![工作窃取：空闲的 P 从另一个 P 的本地队列获取任务](/images/backend-concurrency/gmp-stealing.png)

如果 P1 的队列里还有多个待运行的 G，P2 暂时找不到工作，调度器可以让 P2 从 P1 的本地队列取走一部分任务。这叫**工作窃取**，目的是让可用的执行资源更均衡地参与工作。全局队列、网络就绪事件等也是调度器寻找任务时会考虑的来源；这里的图只突出窃取这个场景。

还有一种不同的等待：程序有时需要通过系统调用向操作系统请求服务，某些调用会让 M 本身阻塞。运行时可能将 P 交给其他 M，继续执行可运行的 G。这里与上面通过网络轮询等待的路径有所区别。[Go 调度器源码](https://go.dev/src/runtime/proc.go)

# 五、实际写后端，还需要决定什么？

回到页面接口。刚才的示例为了看清并发过程，把三个查询都当成必需结果。实际业务里，我们需要先确定它们之间的关系。

假设用户信息、历史记录是页面必需的，推荐内容可以缺省：前两项是这个接口的**强依赖**，推荐是**弱依赖**。如果推荐又需要先查询用户画像，那么画像和推荐之间还有先后顺序。这些关系来自业务需求，需要我们设计。

项目里也可能把任务分成两组：一组并行准备用户信息和画像，等这组结束后再启动依赖画像的推荐查询；另一组历史查询可以独立推进。分组帮助我们表达等待关系，强依赖还是弱依赖则由各任务的错误处理来表达。

`Promise.all` 遇到一个失败会返回错误，其他已经启动的操作可能仍在执行。Node.js 可以用 `AbortController` 发出取消信号，查询函数和底层客户端要支持并响应这个信号。Go 示例中的 `errgroup.WithContext` 在子任务返回错误时会取消派生的 `groupCtx`；其他查询同样需要接收并响应 context。`Wait` 会等待所有任务结束，返回时也会取消派生 context，后续步骤可以继续使用原来的 `ctx`。弱依赖可以在对应任务中记录错误、提供默认值，并向任务组返回 `nil`，让页面继续组装。

除了成功和失败，我会顺手问自己这几件事：

| 要决定什么 | 例子 |
| --- | --- |
| 一次等多久？ | 给整次请求或下游调用设置超时，并向下游传递取消信号 |
| 同时发起多少任务？ | 批量查询时使用并发限制；Node.js 可用 `p-limit`，Go 可用 `errgroup.SetLimit` 或信号量 |
| 数据库连接有多少？ | 配置和复用连接池；连接池管理的是应用到数据库等服务的连接 |
| 多实例总量是多少？ | 每个进程中的数据库句柄通常各有连接池；本地并发上限也各自生效，需要把实例数一起算进去 |
| 共享数据怎么保护？ | 避免并发读写冲突，必要时使用锁等同步手段 |

连接池可以联系页面接口来理解：Go 服务启动后，程序里的数据库客户端可以与数据库服务建立多条网络连接，并通过连接池管理和复用它们。多个请求需要查数据时，会从池里借用可用连接；连接都在使用时，后来的查询可能需要等待。一个进程可以创建多个客户端或连接池，其他服务实例也有各自的池。

例如，Go 标准库的 `database/sql` 中，应用可以在初始化数据库句柄 `db` 时调用 `db.SetMaxOpenConns(10)`，限制该句柄同时打开的连接数。这里的 10 只是示例，实际值要结合实例数量和数据库容量设置。

再看任务数量。假设页面接口需要批量查询一组用户，Node.js 中可以用 `p-limit` 限制当前进程共享的并发数（需要单独安装）：

```js
import pLimit from 'p-limit'

const limit = pLimit(5) // 模块级：当前进程内，共用这个 limit 的调用合计最多 5 个

async function loadUsers(ids) {
  return Promise.all(ids.map(id => limit(() => getUser(id))))
}
```

传给 `limit` 的是函数，由它决定什么时候调用 `getUser`。如果把 `limit` 移进 `loadUsers`，每次调用都会创建一个新的限制器，上限就变成每次调用各 5 个。

Go 中可以在每次请求创建的任务组上设置上限，例如只看任务是否成功：

```go
var group errgroup.Group
group.SetLimit(5) // 当前 group 中最多 5 个任务同时运行

for _, id := range ids {
    id := id
    group.Go(func() error {
        _, err := getUser(ctx, id)
        return err
    })
}
if err := group.Wait(); err != nil {
    return err
}
```

这个 group 属于单次请求。达到上限时，后续的 `group.Go` 调用会等待已有任务结束后再启动；`Wait` 等待整组任务完成。假设每个请求最多同时发起 5 个查询，100 个请求同时进入时，仍可能有约 500 个查询在推进。需要保护整个进程时，可以让请求共用一个限流器；部署多个进程后，还要计算总量，或结合下游的统一限流。线程池管理线程，连接池管理连接；外部服务的请求速率、Token 配额也需要单独考虑。

Python Agent 项目里也有类似问题：使用异步 HTTP 客户端时，可以用 `asyncio.gather` 组织多个调用，并用 semaphore 限制并发；同步阻塞操作放进异步函数后仍会占住事件循环，需要结合线程、进程或异步客户端处理。超时、取消、降级和下游配额同样需要由应用设计。

从浏览器到服务端，任务之间的关系始终需要我们决定。理解运行时后，也能看见任务和线程、CPU、网络连接是怎样配合的。

GMP 图解部分参考了 [刘丹冰 Aceld 的 Go 协程调度系列](https://www.bilibili.com/video/BV19r4y1w7Nx/?p=3)，并结合 Go runtime 资料重新整理。
