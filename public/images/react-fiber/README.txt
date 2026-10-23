React Fiber 配图源文件

本包包含《深入理解 React Fiber：一次更新如何变成页面变化》的十张 SVG 源图。
原文：https://www.jiangxu.net/blog/react-fiber

这些图是为本站文章原创绘制的机制图解，图中文字保留为可编辑文本。
原创配图版权归本站作者；引用时请注明作者与原文链接。
React 及第三方项目的名称、源码和资料版权归各自权利人。

技术核对基线：React v19.3.1，普通 ReactDOM 客户端渲染。
图中按当前主题省略无关节点；虚线或文字“省略祖先”表示经过折叠。
图 02 展示首次挂载：Row 的 type 是函数引用，key 来自 JSX 的 item.id，独立于 props；初始备注为“原备注”。
后续 B 状态更新与列表重排沿用同一案例。
PNG 使用真实飞书画板导出，裁去白边并做无尺寸变化的调色板压缩。
SVG 是画板创作源，可能与飞书的字体重排有细微差异。

参考项目仅用于理解与交叉核对机制，没有复制参考项目原图：
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
