---
status: published
title: "我眼中的 CSS 布局"
date: "2026-11-17"
description: "从正常流、BFC、盒模型、定位到 Flex，以及文字的排版、裁剪与省略。"
tags: ["大前端"]
cover: /images/css-layout/browser-rendering.png
---

# 序章：布局在渲染流程中的位置

https://www.jiangxu.net/blog/browserRendering

之前简单学了一下渲染原理，做了一张图，可以大概看下这么几个流程

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/browser-rendering.png" alt="这张图展示了浏览器的页面渲染全流程，从获取HTML字符串开始，依次经过解析HTML、样式计算、布局、分层、绘制、光栅化，最终生成像素信息。解析HTML阶段会生成DOM树，样式计算阶段结合CSS规则生成CSSOM树，两者融合得到带样式的DOM结果，完成样式计算后进入布局阶段，该阶段会计算盒子的尺寸与位置，同时标注了重回流从该阶段开始，涉及布局属性。后续流程还包括分块、绘制、分层等步骤，最终经过光栅化处理后输出像素信息，清晰呈现了浏览器从代码到可视页面的渲染逻辑。" loading="lazy" style="width:100%;height:auto;" width="4000" height="2346">
</figure>

浏览器解析 HTML 得到 DOM，解析 CSS 得到 CSSOM。样式计算会结合样式规则、层叠和继承，为元素求出计算后的样式；这些样式不会被写成 DOM 上的内联 style。

浏览器再根据元素和样式建立参与布局的盒结构，在**布局（Layout）阶段计算盒子的尺寸和位置**。这一步，就是本篇文章的重点。

你可能听过这些面试题：

1. display：none 的作用是什么？
2. 回流是什么？

本篇文章，打算讲一下我对CSS布局的理解，主要包含以下（自己遇到过的）问题和知识点：

- 文档流是个啥玩意？感觉很抽象呀？是在一个页面上的二维空间吗？
- BFC 又是啥呀，块级格式上下文 这名字真抽象，感觉也像是一个二维空间？
- 盒模型我懂，就是一个二维矩形的各个部分都起了个名字呗？
- 这个定位的口诀是啥来着？父绝子相还是子绝父相？

渲染流程与 Layout 的位置：

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/rendering-layout.svg" alt="渲染流程与 Layout 的位置" loading="lazy" style="width:100%;height:auto;">
</figure>

# 第一章：正常流与基本排列

## 正常流

我之前问 AI 时，遇到了**正常流**（Normal Flow）和“脱离正常流”这两个说法。先看正常流里的内容怎么排列。

文档流通常指正常流，也就是浏览器排列盒子的一套规则。可以先拿草稿本上的排版来理解：一行里依次放文字，放不下就换行；普通块盒则另起一行。这个比喻可以用来帮助理解排列。

比如，在默认的横排、从左到右的书写模式下，依次写两个没有额外样式的 div：两个块盒从上往下排列，各自里面的文字从左往右排。

```html
<div>A</div>
<div>B</div>
```

如果第一个 div 的内容增多、高度增加，第二个就会被往下推。正常流中的盒子会根据前面内容占用的空间继续排列。

那文字只能横着排、块只能从上往下排吗？可以用 writing-mode 改变书写模式：<br>https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Display/Flow_layout_and_writing_modes

你可以在这里体验不同的值会产生什么样的效果：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/writing-mode

```css
writing-mode: horizontal-tb;
```

writing-mode 的初始值是 horizontal-tb，内容横向排成行，各行从上往下排列。改成 vertical-rl 后，行内方向变为垂直，各列从右往左排列。

可以这样记：horizontal / vertical 表示行内排版是水平还是垂直；tb 是 top-to-bottom，rl 是 right-to-left，描述各行或各列的推进方向。行内文字的起止方向还会受到 direction 等属性影响。

<div style="display:grid;grid-template-columns:minmax(0,0.368596fr) minmax(0,0.302405fr) minmax(0,0.328999fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/writing-mode-horizontal-tb.png" alt="这张图展示了CSS写作模式参数`horizontal-tb`的实际效果演示，上方是标注出核心属性的CSS代码，用红色箭头指向`.box`选择器中的`writing-mode: horizontal-tb;`代码段。下方是点击运行后呈现的页面效果，红色箭头指向的文本区域呈现标准横排排版状态，文字从左向右逐行排列，内容为一段介绍蒙哥马利兄弟的英文段落，直观呈现了`horizontal-tb`参数对应“行内文字水平、从上到下逐行排列”的排版效果，辅助说明该CSS属性值的实际表现。" loading="lazy" style="width:100%;height:auto;" width="1610" height="892">
</figure>

</div>

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/writing-mode-vertical-rl.png" alt="这张图展示了CSS中`writing-mode: vertical-rl`属性的实际设置与生效效果：上方代码块标注了目标属性`writing-mode: vertical-rl`，红色箭头指向该属性值`vertical-rl`，直观标识出触发排版效果的核心配置。下方的文本内容应用该属性后，所有英文内容整体沿页面右侧从右向左纵向排列，文字顺序自上而下逐列排布，直观演示了该属性实现从右到左的块向、垂直行向排版的效果，印证了前文提及的该属性值的排版特性。" loading="lazy" style="width:100%;height:auto;" width="1568" height="1062">
</figure>

</div>

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/writing-mode-directions.png" alt="这张图展示了CSS中`writing-mode: vertical-rl`属性的定义与实际渲染效果，上方代码区域明确标注该属性里，纵轴对应vertical方向、行向为left到right的横向排列方向。下方的文本渲染效果里，红色箭头直观演示了文本的排列规则：带“left right”标识的红色横向箭头指向右方，体现文本行沿从左到右的水平方向排布；带“vertical”标识的红色纵向箭头指向下，体现块元素整体沿垂直方向从上到下排列，直观呈现了该CSS属性的文本排列效果，呼应了前文对`vertical-rl`属性排列规则的讲解。" loading="lazy" style="width:100%;height:auto;" width="1602" height="996">
</figure>

</div>

</div>

脱离正常流的浮动元素和绝对定位元素会在后面出现。先看另一个容易混淆的概念：BFC。

## BFC

**BFC**（Block Formatting Context，块级格式化上下文）可以先理解成一块按自己的规则处理块盒和浮动的布局区域。它规定内部块盒怎么排列、怎样包含内部浮动，以及怎样避开外部浮动。

**建立 BFC 和脱离正常流是两件事**。比如，display: flow-root 会建立新的 BFC，但盒子自身仍然在正常流中占位。下面这些常见情况会建立 BFC：

- 根元素（`html`）。
- 浮动元素，即 `float` 不为 `none` 的元素。
- 绝对定位元素，即 `position: absolute` 或 `fixed` 的元素。
- `display: inline-block`、`table-cell`、`table-caption`。下文会涉及。
- `display: flow-root` 的元素。

这里有一个经典面试题：说说你对 BFC 的理解，有什么典型应用？可以结合下面三个例子看。参考：<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_formatting_context">MDN：BFC</a>。

那BFC的应用呢？核心就几个：

可以看一下这里https://notes.jiangxu.net/docs/frontend/bagu/mineru-interview/02-css#%E6%A0%B8%E5%BF%83%E8%A7%84%E5%88%99

相关极简源码：<br>

1. **包含浮动**

普通块容器的自动高度通常不会把浮动子元素算进去。让 parent 建立 BFC 后，计算自动高度时就会包含这里的浮动子元素，边框也就能包住它。

<div style="display:grid;grid-template-columns:minmax(0,0.478049fr) minmax(0,0.521951fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

```html
<div class="parent">
  <div class="float">浮动元素</div>
</div>
```

</div>

<div style="min-width:0;">

```css
.parent {
  display: flow-root;
  border: 1px solid;
}

.float {
  float: left;
  width: 100px;
  height: 100px;
}
```

</div>

</div>

2. **margin 折叠**

在这个例子里，用 wrapper 把第二个 p 的外边距与外部隔开：

- 普通流中，相邻块盒的竖直外边距在满足条件时会折叠。这里两段文字的外边距都是正的 40px，直接相邻时，间距通常取 40px，而不是相加成 80px。
- wrapper 设置 `display: flow-root` 后，第二个 p 的外边距不再与 wrapper 折叠，也就不会穿过 wrapper 与外部的第一个 p 折叠。注意，wrapper 自己的外边距仍可能与外部相邻块折叠，不能概括成“BFC 之间的 margin 不折叠”。

<div style="display:grid;grid-template-columns:minmax(0,0.500000fr) minmax(0,0.500000fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

```html
<p class="item">第一段</p>
<div class="wrapper">
  <p class="item">第二段</p>
</div>
```

</div>

<div style="min-width:0;">

```css
.item {
  margin-block: 40px;
}

.wrapper {
  display: flow-root; /* 第二个 p 在独立的 BFC 中 */
}
```

</div>

</div>

3. **两栏布局**

浮动两栏布局中，为什么给 main 设置 flow-root，就能让它避开旁边的浮动？

aside 浮动后脱离正常流，main 仍在正常流中。main 建立 BFC 后，**它的边框盒不能与外部浮动重叠**；空间足够时，main 会排在 aside 旁边。两者内部各有自己的 BFC，但只有 aside 脱离了正常流。

```css
.aside {
  float: left;
  width: 160px;
}

.main {
  display: flow-root;
}
```

# 第二章：盒模型与块

## 两种盒模型

盒子从里到外是 `content`（内容）、`padding`（内边距）、`border`（边框）、`margin`（外边距）。

**只需要记住`box-sizing` 决定 width、height 算到哪一层**：

- <strong>content-box 只算内容，</strong>
- <strong>border-box 算到边框；</strong>
- <strong>两种都不包含 margin。</strong>

`box-sizing` 的规范初始值是 `content-box`，项目里经常统一改成 `border-box`。下面两边使用相同的尺寸声明，只切换这个值。

在设置了 padding 或 border 时，width 声明不变，切换 box-sizing 也会改变内容区和边框盒的实际尺寸；

你就记住是 xx-box 渲染出来的宽就是xx；比如 boder-box 渲染出来的宽度实际就包含了 boder内的。

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/box-model.svg" alt="两种盒模型" loading="lazy" style="width:100%;height:auto;">
</figure>

## display：盒子的外部排列与内部布局

`display` 管两件事：<strong>这个盒子自己怎么排，以及它的孩子怎么排。</strong>前者是对外，后者是对内。

盒子是浏览器排版时处理的单位，block 只是其中一种显示类型。div、span 都能生成盒子；

先看两个容易观察的区别：盒子会不会另起一行，以及设置 width、height 是否生效。

这里先讨论普通流式布局；放进 Flex、Grid 容器后，还要看对应的布局规则。

### 对外

这几个display 值比较常见，先理解这几个吧

<strong>block：自己单独占一个排列行。</strong><strong>可以设置宽高。</strong>你可以联想一下，H1，div，p这几个标签为什么独占一行了，当然是因为他们display默认设置了 block属性。官方原话

- The box will break onto a new line.
- The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/width"><u>`width`</u></a> and <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/height"><u>`height`</u></a> properties are respected.
- Padding, margin and border will cause other elements to be pushed away from the box.
- If <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/width"><u>`width`</u></a> is not specified, the box will extend in the inline direction to fill the space available in its container. In most cases, the box will become as wide as its container, filling up 100% of the space available.

<strong>inline：跟文字接着排。</strong>普通 span 这类非替换行内元素，width、height 不生效，但内容当然仍有实际尺寸。内容可以拆到多行；左右 margin、padding、border 会推开同一行的内容，上下 margin 不参与行布局。行内图片等替换元素则可以设置宽高。

<strong>inline-block：整个盒子跟文字接着排，也能设置宽高。</strong>对外，它作为一个整体参与行内排列，当前行放不下时可以整体移到下一行；对内，文字根据可用宽度和断行规则排列，可以排成多行。不要把盒子整体换行和盒子里面的文字换行混在一起。

同一份代码，只改 display，就能看到这三种效果：

<div style="display:grid;grid-template-columns:minmax(0,0.500000fr) minmax(0,0.500000fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

```html
<div class="demo">
  <span class="box">A：一二三四五六七八九</span>
  <span class="box">B：一二三四五六七八九</span>
  <span class="box">C：一二三四五六七八九</span>
</div>
```

</div>

<div style="min-width:0;">

```css
.demo { width: 340px; font-size: 16px; }
.box {
  display: block; /* 再改成 inline、inline-block */
  box-sizing: border-box;
  width: 140px;
  height: 64px;
  padding: 4px;
  margin: 4px;
  border: 2px solid;
}
```

</div>

</div>

<div style="display:grid;grid-template-columns:minmax(0,0.239075fr) minmax(0,0.468882fr) minmax(0,0.292043fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/display-block.png" alt="独占一行，有宽高" loading="lazy" style="width:100%;height:auto;" width="876" height="630">
<figcaption>独占一行，有宽高</figcaption>
</figure>

</div>

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/display-inline.png" alt="单行内，无宽高" loading="lazy" style="width:100%;height:auto;" width="836" height="302">
<figcaption>单行内，无宽高</figcaption>
</figure>

</div>

<div style="min-width:0;">

<figure class="article-figure" style="margin:0;min-width:0;">
<img src="/images/css-layout/display-inline-block.png" alt="可换行，有宽高" loading="lazy" style="width:100%;height:auto;" width="936" height="548">
<figcaption>可换行，有宽高</figcaption>
</figure>

</div>

</div>

上图“无宽高”指普通 span 设置的 width、height 不生效，并不是没有实际尺寸。再把父容器改成 display: flex，子元素就会作为 Flex 子项参与布局；下面这张图里，声明的 width 是 140px，空间不足时仍可能收缩。

### 对内

Display 属性 除了可以决定对外（对兄弟盒子，对父盒子），还可以决定子盒子怎么排列。

比如，父容器设置 display: flex 后，它的直接子元素会成为 Flex 子项（flex items），由父容器按 Flex 规则排列。父容器和子项能设置的属性不同，第四章展开。

对外可以先区分块级和行内级；对内再看是普通流式布局，还是 Flex、Grid 等布局。把这两层放在一起，就是下面这张表：

<table>
<caption style="display:none;"></caption>
<colgroup><col width="120"><col width="224"><col width="172"></colgroup><thead><tr><th><p>display</p></th><th><p>对外</p></th><th><p>对内</p></th></tr>
</thead><tbody><tr><td><p>block</p></td><td><p>块级</p></td><td><p>普通流式布局</p></td></tr>
<tr><td><p>inline</p></td><td><p>行内级；普通非替换元素设置宽高不生效，内容可跨行</p></td><td><p>普通流式布局</p></td></tr>
<tr><td><p>inline-block</p></td><td><p>行内级整体，可设置宽高；放不下时整体换行</p></td><td><p>流式布局，建立新 BFC</p></td></tr>
<tr><td><p>flow-root</p></td><td><p>块级</p></td><td><p>流式布局，建立新 BFC</p></td></tr>
<tr><td><p>flex</p></td><td><p>block块级</p></td><td><p>Flex 布局</p></td></tr>
<tr><td><p>inline-flex</p></td><td><p>行内级整体</p></td><td><p>Flex 布局</p></td></tr>
</tbody></table>

需要注意：

这里的“行内级”不只指普通 inline。inline-block、inline-flex 都是行内级，但能设置宽高；

display 的规范初始值是 inline，不继承。

不过<strong>浏览器默认样式通常把 div、p 设为 block</strong>；<strong>span、a 在没有其他声明时通常保持 inline。</strong>

其他值不赘述，感兴趣自查：grid / inline-grid 对内用网格布局，对外分别为块级 / 行内级；<strong>none 不生成布局盒子</strong>，不在文档流中占位。

# 第三章：定位

## 文档流与定位

日常开发常用 相对和绝对，其他遇到自己再查就行。<br>这个图很直观：

- **相对定位（relative）：保留在正常流中的原占位**，再按 top、left 等属性相对原位置偏移。后续内容仍按原来的占位排列。
- **绝对定位（absolute）：脱离正常流，不为后续内容保留原占位**，再根据包含块定位，因此可能与其他内容重叠。是否建立层叠上下文是另一个问题，不能理解成每个定位元素都拥有独立的 Z 轴层。

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/relative-absolute-position.svg" alt="相对定位与绝对定位" loading="lazy" style="width:100%;height:auto;">
</figure>

下面给一个表，看一下偏移参照

<table>
<caption style="display:none;"></caption>
<colgroup><col width="110"><col width="90"><col width="500"></colgroup><thead><tr><th><p>position</p></th><th><p>脱离正常流</p></th><th><p>偏移参照</p></th></tr>
</thead><tbody><tr><td><p><code>static</code>（默认）</p></td><td><p>否</p></td><td><p>不做偏移，top、left 等不起作用。</p></td></tr>
<tr><td><p><code>relative</code></p></td><td><p>否</p></td><td><p>自己在正常流中的原位置。</p></td></tr>
<tr><td><p><code>absolute</code></p></td><td><p>是</p></td><td><p>最近能建立绝对定位包含块的祖先；找不到则用初始包含块。</p></td></tr>
<tr><td><p><code>fixed</code></p></td><td><p>是</p></td><td><p>通常是浏览器视口；祖先的 transform 等属性可能改变参照。</p></td></tr>
<tr><td><p><code>sticky</code></p></td><td><p>否</p></td><td><p>最近滚动容器的可视区域；移动范围还受包含块约束。</p></td></tr>
</tbody></table>

## 应用：子绝父相

子绝父相，就是<strong>子元素用 absolute，父元素用 relative。</strong>比如，把关闭按钮放在卡片右上角：

<div style="display:grid;grid-template-columns:minmax(0,0.463415fr) minmax(0,0.536585fr);gap:12px;align-items:start;margin:1.75em 0;">

<div style="min-width:0;">

```html
<div class="card">
  卡片内容
  <button class="close">×</button>
</div>
```

</div>

<div style="min-width:0;">

```css
.card {
  position: relative;
  width: 240px;
  height: 120px;
  border: 1px solid;
}
.close {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

</div>

</div>

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/positioned-close-button.svg" alt="子绝父相：卡片右上角的关闭按钮" loading="lazy" style="width:100%;height:auto;">
</figure>

父元素设 relative，不写偏移时不会移动，正常流里的占位也还在。

子元素设 absolute 后脱离正常流，按这个父元素的 padding 边界定位：本例距离内侧上边、右边各 8px。

选 relative，是为了让父元素提供定位参照，同时保留自身占位。

去掉父元素的 relative，按钮就不一定还以这张卡片为参照。

# 第四章：Flex 与两个轴

## 基本认识

Flex 先看两个轴：<strong>flex-direction 决定主轴，另一个方向是交叉轴。</strong>row 沿行内轴，column 沿块轴。默认的横排书写模式下，row 的主轴是横向；改变 writing-mode 后，不能再固定把主轴理解成水平方向。

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/flex-axes.svg" alt="Flex 主轴与交叉轴" loading="lazy" style="width:100%;height:auto;">
</figure>

```css
.container {
  display: flex;
  height: 160px;
  gap: 12px;
  justify-content: center; /* 主轴 */
  align-items: center; /* 交叉轴 */
}
```

这两个 center 分别表示沿主轴、交叉轴是怎么对齐。都是中心居中的。

## 对齐与间距、换行与伸缩

### 对齐与间距

先区分对齐和间距：**对齐决定子项或整行怎么摆**，**gap 设置项与项、行与行之间的基础间隔**。下面对比几种常见排列：

- flex-star/end center 都是紧排
- space- between/around/evenly：也很好记

  - between涉及对称，那就是两边都贴边，中间居中
  - around是周围得意思，那就是四周都有空隙，最边上两侧占了其他均分间隙的一半
  - Evenly 顾名思义就是均分间隙了

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/flex-justify-content.svg" alt="Flex 对齐与间距" loading="lazy" style="width:100%;height:auto;">
</figure>

如果加上gap：

> 会在gap的基础上，加上各种间距语法算出来的值，

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/flex-gap.svg" alt="gap 与剩余空间分配" loading="lazy" style="width:100%;height:auto;">
</figure>

<table>
<caption style="display:none;"></caption>
<colgroup><col width="172"><col width="616"></colgroup><thead><tr><th><p>父容器属性</p></th><th><p>作用</p></th></tr>
</thead><tbody><tr><td><p><code>justify-content</code></p></td><td><p>沿主轴分配剩余空间。center 居中，space-between 把余量分到项与项之间。</p></td></tr>
<tr><td><p><code>align-items</code></p></td><td><p>控制一行内各项的交叉轴对齐。center 居中；stretch 可以拉伸交叉轴尺寸为 auto 的子项。</p></td></tr>
<tr><td><p><code>gap</code></p></td><td><p>设置项与项、行与行之间的间距。配合 space-between 时，分配余量可能让实际间距更大。</p></td></tr>
</tbody></table>

### 换行

一行放不下时，<strong>默认的 nowrap </strong>不会让子项换行，子项可能收缩，也可能溢出。

设置 wrap 后，才允许**子项整体排到下一行**。

允许换行后，再看各行在交叉轴上怎么排。这两个属性都写在父容器上：

<table>
<caption style="display:none;"></caption>
<colgroup><col width="172"><col width="531"></colgroup><thead><tr><th><p>父容器属性</p></th><th><p>作用</p></th></tr>
</thead><tbody><tr><td><p><code>flex-wrap</code></p></td><td><p><strong>默认 nowrap 不换行</strong>，wrap 允许换行。</p></td></tr>
<tr><td><p><code>align-content</code></p></td><td><p>把每一行看作一个整体，控制各行在交叉轴上的位置和间隔。</p><p>写在父容器上。需要允许换行（如 flex-wrap: wrap）；nowrap 时不生效。要看出分配余量的效果，容器还得比这些行占用的交叉轴空间更大。</p></td></tr>
</tbody></table>

例如横向 Flex 容器高 200px，两行各高 40px，没有 gap：`align-content: center` 会把剩下的 120px 分到上下两侧，各留 60px；改成 `space-between`，这 120px 就留在两行之间。<strong>align-items 管每一行里面的子项怎么对齐，align-content 管这些行怎么摆</strong>，两者都写在父容器上。

### 伸缩

<strong>下面三个伸缩属性都写在 Flex 子项上</strong>，控制该子项沿主轴变大或缩小。横向排列时，可以先按宽度来理解：

- **`flex-basis`**：伸缩前以多大尺寸为基础，例如 100px
- **`flex-grow`**：这一行还有空余空间时，<strong>子项</strong>是否增大、按多大的系数分配余量。默认 0，不主动增大。
- **`flex-shrink`**：这一行放不下时，子项是否缩小。默认 1，允许收缩；设为 0，就不参与收缩。

flex 的简写顺序是 grow、shrink、basis，默认组合是 `flex: 0 1 auto`。例如：

```css
.item {
  flex: 1 1 100px;
}
```

这表示从 100px 的基础尺寸出发，允许放大，也允许缩小。最终大小还会受到 min-width 等尺寸约束影响。

按钮、图标等如果不希望被挤小，就给<strong>这个 Flex 子项</strong>设置 `flex-shrink: 0`。

# 第五章：文字的排版、裁剪与省略

盒子和弹性布局讲完了，那么文字是怎么在页面上排列的呢？

排成一行的内容会形成一个行框；在默认横排模式下，各行从上往下排列，组成一段文字。

看一段文字的布局，可以依次问：容器给了多少宽度、文字在哪里换行；字有多大、每行占多高；

超出容器后，是继续显示、裁掉，还是用省略号提示。

下面结合这个例子来讲：

```html
<div class="text">
  一段中文 <span>行内的文字</span>
  ThisIsAnExampleOfAVeryLongWordWithoutSpaces
</div>
```

## 换行

先给这个 div 限制宽度。**`white-space: normal` 允许在合适的位置自动换行**，**`nowrap` 禁止自动换行**。

连续英文没有合适的断行位置时，即使允许换行，也可能超出容器。

```css
.text {
  width: 240px;
  white-space: normal;
  overflow-wrap: anywhere;
}
```

**`overflow-wrap: anywhere`** 允许在必要时把长 URL、连续英文从中间断开。保持 white-space: normal，去掉这条声明，可以对比长英文的溢出；再单独切换 normal / nowrap，观察是否自动换行。前面的 flex-wrap 则是让子项整体换行。

参考：<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Text/Wrapping_breaking_text">MDN：文本换行与断行</a>；<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/white-space">white-space</a>。

## 字号与行高

**`font-size` 决定字体按多大的尺度显示**，不等于笔画实际画出来的高度。

同样的 24px 字号，对比两种行高：

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/font-size-line-height.svg" alt="相同字号下的两种行高" loading="lazy" style="width:100%;height:auto;">
</figure>

```css
.text {
  font-size: 24px;
  line-height: 1.5;
}
```

在这个同一字体、字号、按默认方式对齐的纯文字例子里，**`line-height: 1.5` 对应 24 × 1.5 = 36px**。

需要注意，overflow：hidden 隐藏裁剪的是 行高外的内容。

## 内容溢出与裁剪

文字排成若干行后，内容需要的高度不一定等于容器设置的高度。

行高小<strong>，本身不会自动裁剪文字；</strong>

<strong>限制容器高度后，再由 overflow 决定超出的部分怎么显示。</strong>

为了单独比较裁剪效果，这里换成两行较短的文字，用 `<br>` 强制换行，避免自动换行改变行数。保持行高不变，把容器高度限制为 48px：

```html
<div class="crop">第一行：正常显示<br>第二行：超出高度</div>
```

```css
.crop {
  width: 240px;
  padding: 0;
  font-size: 24px;
  line-height: 1.5;
  height: 48px;
  overflow: hidden; /* 改成 visible 对照 */
}
```

两行各 36px，合计 72px。容器只有 48px 高：**visible 允许超出部分显示，hidden 裁掉超出部分**。默认值是visible。

<figure class="article-figure" style="margin:1.75em 0;">
<img src="/images/css-layout/overflow-visible-hidden.png" alt="这张真实HTML渲染截图用于直观对比不同overflow属性的内容溢出效果，所有示例的统一参数为font-size:24px、line-height:36px、容器height:48px、padding为0。左侧对应overflow:visible属性，标注出48px高度的容器底边虚线，两行总高72px，超出48px的第二行文字内容依然完整可见。右侧对应overflow:hidden属性，同样标注48px的容器底边虚线，超出48px高度的第二行内容被直接裁剪移除，没有自动生成省略号。" loading="lazy" style="width:100%;height:auto;" width="720" height="289">
</figure>

## 单行省略

前面允许文字换行，再处理高度溢出。如果希望标题始终只占一行，就**禁止自动换行，并在横向空间不足时显示省略号**。下面的 `.one-line` 用在普通 div 上：

```css
.one-line {
  width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**宽度受约束，文字不自动换行，超出部分隐藏**，改成 “...”<br><br><br>还在实习中，以上内容除了图片全是手写，算是一个简单的复习，之前背八股学的太急没打好基础，算是还债了。
