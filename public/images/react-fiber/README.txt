React Fiber 配图源文件

本包包含《深入理解 React Fiber：一次更新如何变成页面变化》的十一张 SVG 源图。
原文：https://www.jiangxu.net/blog/react-fiber

图 01–10 是为本站文章原创绘制的机制图解。
图 11 参考 7km.top《fiber 树构造（基础准备）》的示例结构与图形组织重新绘制，按 React 19.3.1 校正。
所有 SVG 的文字保留为可编辑文本；引用时请注明本站原文及相应参考来源。
React 及第三方项目的名称、源码和资料版权归各自权利人。

技术核对基线：React v19.3.1，普通 ReactDOM 客户端渲染。
图中按当前主题省略无关节点；标注“省略祖先”的路径表示折叠，其余连线含义以各图图例和文字为准。
图 02 展示首次挂载：Row 的 type 是函数引用，key 来自 JSX 的 item.id，独立于 props；初始备注为“原备注”。
后续 B 状态更新与列表重排沿用同一案例。
图 11 使用独立 App / Content 类组件示例；左侧汇总逐步产生的元素，组件 render 返回与 props.children 分别标识；本例的顶层无 key、无 ref Fragment 被展开。
图 11 的 20 行代码与文章同源，补齐 import、createRoot 和挂载入口；页面须已存在 div#root 容器。
SVG 代码声明 Menlo / Consolas / monospace；当前飞书原生导出会回退到默认字体。缩进通过每行坐标保留，不依赖前导空格，文字仍可编辑。
PNG 使用真实飞书画板导出，裁去白边并做无尺寸变化的调色板压缩。
SVG 是画板创作源，可能与飞书的字体重排有细微差异。

参考资料（图 11 为参考重绘，其余用于理解与交叉核对机制）：
https://7km.top/main/fibertree-prepare/
https://github.com/wojtekmaj/react-lifecycle-methods-diagram
https://github.com/7kms/react-illustration-series
https://github.com/lizuncong/mini-react

图目：
01 一次更新全景
02 React 元素、Fiber、DOM
03 Fiber 节点字段与指针
04 beginWork / completeWork 遍历
05 current 与 workInProgress 双缓冲
06 key / type 身份匹配
07 ABCD → BDAE 列表 Diff
08 稳定 key 与 index key 的状态归属
09 时间切片与紧急更新
10 commit、生命周期与 Effects
11 ReactElement 产物、Fiber 指针与 DOM 完整总览（参考重绘）
