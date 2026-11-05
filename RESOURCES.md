# 后端运行模型资源

## Knowledge

- [Node.js：Don't Block the Event Loop](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop) — 事件循环线程和 libuv 工作线程池各自执行什么；排查阻塞时使用。
- [Node.js：The Node.js Event Loop](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick) — Node 如何利用操作系统处理非阻塞 I/O，以及回调如何被调度。
- [Node.js：Worker threads](https://nodejs.org/api/worker_threads.html) — 显式创建执行 JavaScript 的 worker 线程及适用场景。
- [Python：threading](https://docs.python.org/3/library/threading.html) — Python 线程与 CPython GIL 的说明。
- [Redis：Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/) — Redis 延迟、命令执行模型及诊断方法。

## Wisdom (Communities)

- [Node.js GitHub discussions](https://github.com/nodejs/node/discussions) — 遇到可复现的 Node 运行时行为时，可查找或讨论已有问题。

## Gaps

- 后续需要补充连接池的具体驱动配置和 Go 服务运行模型的权威资料。
