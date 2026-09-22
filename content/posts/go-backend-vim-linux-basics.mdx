---
title: "写 Go 后端前，先学会这些 Vim 和 Linux 命令"
date: "2026-09-22"
description: "从确认 Go 是否安装、理解 PATH 与 GOPATH，到用 Vim 改配置、用日志和端口定位问题：整理一套 Go 后端开发刚入门就能用上的终端基本功。"
tags: ["服务端"]
cover: false
---

刚开始写 Go 后端时，很容易把每一次报错都归因于 Go：包为什么找不到、服务为什么起不来、端口为什么被占用、刚装的工具为什么提示 `command not found`。

但很多问题其实发生在 Go 代码之外：终端不知道该去哪里找命令，配置文件改了没有生效，日志没有看对，或者旧进程还占着端口。

这篇不追求把 Linux 命令背成字典，而是按一次真实的 Go 开发流程来整理：**确认环境 → 修改配置 → 启动服务 → 调接口 → 看日志 → 排查进程**。先掌握这些，已经足够解决大多数入门阶段的终端问题。

# 一、先建立一个概念：终端在做什么

终端里输入一行命令后，Shell（例如 macOS 默认常用的 zsh）大致会做三件事：

1. 解析命令和参数；
2. 按 `PATH` 中记录的目录顺序寻找可执行文件；
3. 找到后运行它，并把输出打印到终端。

所以看到 `command not found` 时，不要立刻重装工具。先判断：是工具没有安装，还是安装了但所在目录没有加入 `PATH`。

```bash
echo $PATH
```

`PATH` 是用冒号分隔的目录列表。比如 `go` 位于 `/usr/local/go/bin/go`，那么 `/usr/local/go/bin` 必须在 `PATH` 中，直接输入 `go version` 才能找到它。

## `which`、`command -v`：命令到底来自哪里

```bash
which go
which docker
command -v go
command -v git
```

这两个命令都可用于确认某个命令能否被当前 Shell 找到，以及它对应的路径。日常排查时，我更常用 `command -v`：它是 Shell 内建命令，除了可执行文件，也能识别别名和 Shell 函数。

```bash
command -v ll
command -v go
go version
```

如果 `command -v go` 没有输出，说明当前终端找不到 Go；如果它有路径而 `go version` 报错，则再检查该文件是否可执行、安装是否完整。

## 变量不是命令：`echo $xxx`

```bash
echo $HOME
echo $PATH
echo $GOPATH
```

`$` 的意思是“取变量的值”。因此 `echo $xxx` 不是执行 `xxx`，而是把变量 `xxx` 的内容打印出来。变量不存在时通常会输出空行。

设置当前终端有效的变量：

```bash
export DEMO_NAME="easton"
echo $DEMO_NAME
```

关掉这个终端窗口后，这个设置就消失了。想让它长期有效，需要把 `export` 写进 Shell 配置文件。

# 二、配置环境：`.zshrc` 与 `source`

zsh 每次启动交互终端时会读取 `~/.zshrc`。其中 `~` 是当前用户的家目录，`~/.zshrc` 就是用户级 zsh 配置文件。

```bash
vim ~/.zshrc
```

例如，Go 官方安装文档建议把 `go install` 安装工具的默认目录加入 `PATH`：

```zsh
export PATH="$PATH:$(go env GOPATH)/bin"
```

保存之后，**已经打开的终端不会自动重新读取配置**。可以重新开一个终端，也可以执行：

```bash
source ~/.zshrc
```

`source` 的作用是在**当前 Shell 进程**中执行文件内容。因此它特别适合用于重新加载刚修改的环境变量。随后马上验证：

```bash
echo $PATH
command -v 某个刚安装的工具
```

> 注意：配置文件中可以执行任意 Shell 代码。不要不看内容就 `source` 网上复制来的脚本。

# 三、Go 环境里真正要认识的几个变量

先执行下面这组命令：

```bash
go version
go env GOPATH GOROOT GOBIN GOMOD GOMODCACHE GOPROXY
```

它们比盲猜环境配置可靠得多。

## `GOROOT`：Go 工具链安装在哪里

`GOROOT` 指向 Go SDK 本身的位置，里面有编译器、标准库和 `go` 命令。正常通过安装包装好 Go 后，通常不需要手动设置它。

如果 `go version` 都无法运行，才需要从 `command -v go`、`echo $PATH` 开始检查安装路径和 `PATH`。

## `GOPATH`：今天仍然重要，但不再是项目必须放置的位置

旧教程常说 Go 项目必须放在 `$GOPATH/src`。这是早期 GOPATH 开发模式的规则；现代 Go 项目以 `go.mod` 为中心，项目可以放在任意目录。

但 `GOPATH` 并没有消失。默认通常是 `~/go`，主要影响：

- `go install` 安装的命令行工具默认放在 `$GOPATH/bin`；
- 下载的模块缓存默认在 `$GOPATH/pkg/mod`；
- 校验和数据库缓存也默认在 `GOPATH` 下。

因此最常见的问题是：

```bash
go install github.com/xxx/yyy@latest
yyy
# zsh: command not found: yyy
```

工具很可能已经装好了，只是 `$GOPATH/bin` 没有在 `PATH` 里。先验证：

```bash
go env GOPATH
ls "$(go env GOPATH)/bin"
```

确认工具在目录内后，把这一行放进 `~/.zshrc`，再执行 `source ~/.zshrc`：

```zsh
export PATH="$PATH:$(go env GOPATH)/bin"
```

如果你显式设置过 `GOBIN`，那么 `go install` 会优先使用它；此时应把 `go env GOBIN` 的输出加入 `PATH`，而不是想当然地只加 `$GOPATH/bin`。

## `go.mod` 和 `GOMOD`：我现在到底在哪个项目里

```bash
go env GOMOD
cat go.mod
go mod tidy
```

`go.mod` 定义了一个 Go Module 及其依赖。`go env GOMOD` 会告诉你当前命令上下文使用的 `go.mod` 路径；若输出 `/dev/null`，通常表示当前目录及其父目录中没有可用的 `go.mod`。

新项目可以用下面的命令初始化：

```bash
mkdir hello-go
cd hello-go
go mod init example.com/hello-go
```

`go mod tidy` 会根据代码实际使用的包补齐和清理模块依赖，并更新 `go.mod`、`go.sum`。改完依赖后，它是很常用的收尾动作。

## `GOPROXY`：依赖下载走哪里

```bash
go env GOPROXY
```

当 `go mod tidy` 或 `go test` 卡在下载依赖时，`GOPROXY` 是一个值得检查的配置。它决定 Go 获取公开模块时使用的代理列表；私有模块还常需要配合 `GOPRIVATE`、Git 凭据等设置。

不要把“下载失败”简单等同于“Go 坏了”。先记录完整报错，再分别检查网络、代理配置、私有仓库访问权限和模块版本。

# 四、Vim：只学足够修改配置和代码的部分

Vim 的难点不在命令多，而在一开始就有**模式**。先只记住两个：

- **普通模式**：移动、删除、复制等操作；刚打开 Vim 时就在这个模式。
- **插入模式**：输入文字。

从插入模式按 `Esc`，就回到普通模式。任何时候觉得“按键不对劲”，先按一次 `Esc`，再继续操作。

## 最小命令集

```text
i      在光标前进入插入模式
o      在当前行下方新开一行，并进入插入模式
Esc    回到普通模式
G      跳到文件最后一行
gg     跳到文件第一行
dd     删除当前整行
yy     复制当前整行
p      在光标后粘贴
u      撤销上一步
/词    搜索“词”，n 跳到下一个匹配
:wq    保存并退出
:q!    放弃修改并强制退出
```

这里有三个很适合练习的动作：

1. `vim ~/.zshrc` 打开配置；
2. 输入 `G` 跳到文件末尾；
3. 按 `o` 新开一行，写入配置，按 `Esc` 后输入 `:wq` 保存退出。

如果误删了整行，不必慌：按 `u` 撤销。Vim 的核心是“普通模式下按操作”，而不是一直在插入模式里打字。

# 五、Go 服务启动后，怎么确认它真的工作了

假设服务监听在 `8080` 端口。开发中最常见的闭环是：启动服务、调用接口、看日志、定位占用端口的旧进程。

## 启动、构建与测试

```bash
go run .
go build ./...
go test ./...
```

- `go run .`：构建并运行当前模块里的主程序，适合本地开发；
- `go build ./...`：构建当前模块下的所有包，适合尽早发现编译问题；
- `go test ./...`：运行当前模块下所有包的测试。

实际项目还可能用 Makefile、Docker Compose 或任务脚本启动，先看 `README.md`、`Makefile` 和 `compose.yaml`，别一上来就猜启动命令。

## 用 `curl` 调接口

```bash
curl http://localhost:8080/health
curl -i http://localhost:8080/api/users
curl -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Easton"}'
```

`curl` 能把 HTTP 状态码、响应头和响应体直接拉到终端，是验证后端接口最快的工具之一。`-i` 会把响应头也显示出来，排查 401、404、500 时很有用。

## 端口被占用：先查谁在监听

```bash
lsof -i :8080
```

看到 PID 后，再确认进程：

```bash
ps -p <PID> -o pid,ppid,command
```

确认它就是之前遗留的本地服务，才停止：

```bash
kill <PID>
```

默认 `kill` 发送的是可被程序处理的终止信号。不要一开始就用 `kill -9`；只有普通终止无效、且你确认目标进程可以被强制结束时才考虑它。

## 看日志：不要只看最后一屏

```bash
tail -f app.log
tail -n 100 app.log
grep -n "error" app.log
grep -rn "TODO" .
```

- `tail -f` 持续跟随新增日志，适合一边请求接口一边观察服务输出；按 `Ctrl + C` 退出。
- `tail -n 100` 先看最后 100 行，避免被整份日志淹没。
- `grep -n` 搜索并带上行号；`grep -rn` 可以递归搜索项目文件。

排查时，把一次请求的时间、返回状态码、服务日志和对应的进程状态放在一起看，通常比单独盯着代码更快。

# 六、一个可以照着执行的排障清单

当“刚安装的 Go 工具不能用”或“服务怎么都起不来”时，按下面顺序排查：

```bash
# 1. 当前目录和项目识别
pwd
ls -la
go env GOMOD

# 2. Go 与工具是否能被 Shell 找到
command -v go
go version
go env GOPATH GOROOT GOBIN GOPROXY
echo $PATH

# 3. 依赖和编译是否正常
go mod tidy
go test ./...

# 4. 服务是否被旧进程或端口阻塞
lsof -i :8080
ps aux | grep '[g]o'

# 5. 请求接口并观察日志
curl -i http://localhost:8080/health
tail -f app.log
```

其中 `ps aux | grep '[g]o'` 里的 `[g]o` 是一个小技巧：它仍能匹配命令行中的 `go`，但不会匹配 `grep` 自己那一行。

# 七、先把终端当作观察工具

学这些命令的目标不是显得“很会 Linux”，而是让每个猜测都能被快速验证：

- 不确定工具有没有安装，就用 `command -v`；
- 不确定配置有没有加载，就用 `echo $PATH` 和 `source ~/.zshrc`；
- 不确定当前是不是 Go Module，就用 `go env GOMOD`；
- 不确定服务是否启动，就用 `curl`、日志和 `lsof`。

Go 后端开发的很多问题，本质都是“程序现在处于什么状态”。能熟练地观察文件、环境、进程、端口和日志，写业务代码时会踏实很多。

进一步阅读：

- [Go 官方安装说明](https://go.dev/doc/install)
- [Go Modules Reference](https://go.dev/ref/mod)
- [Go 官方 GOPATH 说明](https://go.dev/wiki/GOPATH)
