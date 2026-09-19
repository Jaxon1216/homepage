"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiTool,
  FiBriefcase,
  FiFolder,
  FiMail,
  FiGithub,
  FiGlobe,
} from "react-icons/fi";
import { SiBytedance } from "react-icons/si";
import { MottoBlock } from "@/components/common/MottoBlock";
import { siteConfig } from "@/lib/site-config";

interface Experience {
  title: string;
  company: string;
  companyIcon?: React.ComponentType<{ size?: number; className?: string }>;
  period: string;
  summary?: string;
  points: string[];
}

interface ResumeProject {
  name: string;
  role?: string;
  tech: string;
  summary?: string;
  points: string[];
}

interface ResumeVersion {
  key: string;
  label: string;
  date: string;
  header: { name: string; email: string; github: string; blog: string };
  sections: {
    summary: string;
    personalEvaluation?: string[];
    education: { school: string; degree: string; gpa: string; period: string; details: string[] }[];
    skills: string[];
    experience: Experience[];
    projects: ResumeProject[];
    openSource?: ResumeProject[];
  };
}

const resumeVersions: ResumeVersion[] = [
  {
    key: "v3-2026-internship",
    label: "2026 9月实习版",
    date: "2026-09",
    header: {
      name: siteConfig.name,
      email: "jiangxu05@outlook.com",
      github: siteConfig.github,
      blog: "jiangxu.net",
    },
    sections: {
      summary:
        "中国地质大学（北京）在读，前端开发方向；在字节跳动完成消费金融移动端 H5 实习，聚焦高流量交互、数据质量、复杂流程与多版本页面演进。",
      personalEvaluation: [
        "持续维护个人技术博客与开源项目，关注 AI 编程工具、前端工程化与可复用的开发体验",
        "具备较强的自学能力与问题排查能力，能够快速学习新技术并落地实践",
        "具备良好的英文文档阅读能力，可无障碍查阅官方文档与前沿技术资料",
      ],
      education: [
        {
          school: "中国地质大学（北京）",
          degree: "211本科",
          gpa: "",
          period: "2024.9 - 2028.7",
          details: ["第17届全国大学生数学竞赛三等奖"],
        },
      ],
      skills: [
        "深入理解事件循环、浏览器渲染等前端核心原理",
        "熟练掌握 JavaScript/TypeScript，熟悉 React、Next.js、Zustand 并有实际项目经验",
        "熟悉前端工程化与代码规范，能够使用 ESLint + Prettier + TypeScript + Husky 保障项目代码质量",
        "熟练使用 Ant Design、ECharts、ReactBits、Umami等常用组件库与工具，具备快速查阅官方文档解决问题的能力",
        "能够使用 ClaudeCode、Cursor、OpenSpec、Codex 等工具高效开发AI全栈项目",
        "了解 Go 语言基础及 Gin、GORM 生态，能够完成 RESTful API、数据持久化等基础服务端开发",
        "了解 Agent 的规划、工具调用、记忆与多 Agent 协作等设计模式，具备流式交互、上下文管理与可观测性相关实践",
        "熟悉 Git 协作与 PR 流程，掌握 CI（GitHub Actions）、Docker 容器化部署",
      ],
      experience: [
        {
          company: "字节跳动",
          companyIcon: SiBytedance,
          title: "前端开发实习生",
          period: "2026.04 - 2026.09",
          summary:
            "实习简介：参与抖音月付 Hybrid 大前端开发，贡献 7 个仓库、累计约 1.8 万行代码改造，完成 20+ 个需求的开发、联调、自测与上线。",
          points: [
            "**挂件交互**：独立开发月付频道首页固定挂件，基于原生 Touch 实现拖拽、滚动收起、边界限制、拖拽/点击判定及 WebView 误触与滚动穿透治理；**10% 流量实验**覆盖 1,461 万+曝光、产生 2.99 万次拖拽，实验组交互率较对照提升 0.168pp，核心指标无明显负向后全量上线。",
            "**曝光治理**：针对日均 1,873 万 PV 营销卡片的首屏曝光误报，封装基于 IntersectionObserver 的通用曝光 Hook，以 1px 可见触发曝光、1/3 视口可见为阈值，并在**动态布局场景**增加稳定时长复核；统一资源位口径，支持横向轮播与节点动态重挂。",
            "**弹窗全链路**：负责高访问活动页退出挽留弹窗的全链路设计与开发，接入动态资源位请求，校验关键素材并按内容子类型分流渲染；将**真实展示后的曝光、点击、关闭上报与频控**收敛至组件内部，基于 forwardRef / useImperativeHandle 编排“关闭当前弹窗 → 命中挽留条件 → 退出页面”的返回优先级，区分外跳返回与普通切后台并支持无效配置降级。",
            "**设置页改版**：参与多版本设置页跨模块重构，使用 Figma MCP 与 D2C MCP 辅助还原设计稿；复用**Prefetch → Store → Hook → UI 数据链路**聚合首屏数据，避免为单一展示字段新增请求；协同完成 30+ 文件、约 2,000 行改动，并通过线上会话回放定位版本切换中的接口异常。",
            "**Agent 上下文工程**：开展 Coding Agent 仓库级上下文工程改造，沉淀 AGENTS.md 与架构、术语、开发指南等按需文档；参考行业公开评测方法，结合真实需求任务结果与 Trae Hooks Trace 验证效果。小样本对照中，长任务耗时约从 1.5h 降至 1h、**工具调用约减半**，任务与验证过程评分均提升。",
          ],
        },
      ],
      projects: [
        {
          name: "DeerFlow 全栈 AI Agent 系统",
          role: "Contributor",
          tech: "React + Next.js + LangGraph + SSE + MCP",
          summary:
            "项目简介：DeerFlow 是基于 React、Next.js 与 LangGraph 的全栈 AI Agent 系统，支持长时流式对话、多 Agent 协作、Skill/MCP 工具扩展、持久记忆和沙箱文件产物；参与将非确定性的 Agent 执行过程收敛为可恢复、可观察、可编辑的前端状态，并联调流协议、上下文治理和运行时边界。",
          points: [
            "**增量流恢复**：参与将主聊天链路收敛为 messages-tuple、updates、custom 增量流，并基于 **SSE Last-Event-ID** 实现“缺口识别 → 持久态重载 → 原运行续接”；最多 5 次恢复重接，避免异常循环，使刷新或弱网恢复不重复执行 Agent。",
            "**状态归并**：参与前后端一致的交互状态模型，前端镜像 **LangGraph Reducer** 语义，由 SDK 单独组装消息分片、类型化归并器处理非消息更新，并为结构化人工输入保留文本降级；使实时流、检查点和历史回填可在同一渲染模型下对账。",
            "**多 Agent 调度**：参与打通子 Agent 生命周期事件、步骤持久化和前端分页回填；采用进程并发 3、单次运行总量 6、默认超时 1,800 秒及深度任务最多 150 轮的**多维预算**，使实时步骤与刷新后的历史共享同一任务时间线。",
            "**上下文治理**：参与长上下文与增量检查点治理，通过中间件生成持久摘要和近期窗口，分层注入可信系统指令与不可信外部数据；以 **Delta Channel 增量写入**、默认每 10 次更新生成快照，兼顾会话连续性与存储成本。",
            "**按需发现**：参与 Skill/MCP 渐进式能力发现，设计“名称索引 → **最多 5 个候选** → 描述或正文按需读取”的 Skill 流程，MCP 工具经检索后才提升至本轮允许集合，使能力发现受运行时授权与策略过滤约束。",
            "**沙箱安全**：参与沙箱到产物面板的安全闭环，按用户与线程隔离工作区，限制输出目录并惰性获取沙箱租约；前端采用 1 MiB Range 预览、2 MiB UTF-8 编辑上限与 **SHA-256 乐观并发**，在版本变化时保留草稿并阻止静默覆盖。",
          ],
        },
        {
          name: "个人主页",
          tech: "Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + MDX + Framer Motion",
          points: [
            "**站点地址**：**https://jiangxu.net** | 2025.09 – 维护至今",
            "**应用架构**：基于 **Next.js App Router** 架构搭建，集成博客、简历、项目展示等模块。",
            "**首屏性能**：采用服务端组件与客户端组件混合渲染，博客页面使用 **SSG 静态生成**。",
            "**内容系统**：实现 **MDX 博客系统**，支持代码高亮、标签筛选、阅读时长统计、Giscus 评论等功能。",
            "**博客产出**：持续发布 **11 篇技术博客**，覆盖浏览器原理、React 工程实践、移动端 WebView 与 AI 编程工具等主题，并通过 MDX 统一管理内容与展示。",
          ],
        },
      ],
      openSource: [
        {
          name: "MathModelAgent",
          tech: "Python + LLM Agent + Prompt Engineering",
          points: [
            "向 **5.7k Star** 的开源数学建模 Agent 项目提交并合入 **2 个 PR**，累计覆盖 25 个文件、增加 996 行 / 删除 345 行。",
            "**Prompt 架构重构（PR #54）**：将单文件 prompts.py 拆分为模块化 prompts/ 包（coordinator / modeler / coder / writer / shared），通过 __init__.py 保持向后兼容；注入竞赛级建模策略、O 奖级可视化标准与 MCM 论文写作规范，并支持按 Agent 独立配置 max_tokens。",
            "**鲁棒性与产物修复**：修复 writer 只输出“如图 X 所示”文字却未插入 Markdown 图片标签导致 docx 无图的问题；为 modeler 增加 JSON 解析失败自动 repair 重试，flows 取值改用 .get() 防 KeyError。",
            "**绘图字体与运行稳定性（PR #102）**：新增 matplotlib_setup.py 统一字体注册、以绝对路径解决 Docker 内 chdir 后中文字体注册失败；用 LLMConfigError 隔离配置错误与 JSON 重试、为 coordinator / modeler 加 MAX_JSON_RETRIES=3 上限，修复未验证配置直接启动任务时无限重试刷爆日志。",
            "**前端体验优化**：新增 useStickyScroll composable，为 ChatArea 与 NotebookArea 实现进度时间线与代码执行区的粘底自动跟踪，运行中自动滚动到最新消息。",
          ],
        },
        {
          name: "ASu-skills",
          tech: "Python + Codex Skill + Developer Experience",
          points: [
            "向 4.8k Star 的开源 Skill 仓库提交并合入“项目导学”能力，覆盖 18 个文件、增加 1,003 行 / 删除 81 行。",
            "将项目结构分析、学习路径与 STAR 面试口播串联为可复用工作流，降低新项目理解与面试准备的启动成本。",
          ],
        },
      ],
    },
  },
  {
    key: "v2-2026",
    label: "2026 4月实习版",
    date: "2026-04",
    header: {
      name: siteConfig.name,
      email: "jiangxu05@outlook.com",
      github: siteConfig.github,
      blog: "jiangxu.net",
    },
    sections: {
      summary:
        "中国地质大学（北京）在读，专注前端开发与工程化实践，有个人全栈 BI 项目与 Next.js 个人站点维护经验。",
      personalEvaluation: [
        "热爱开源技术，参与过 2k+ Star 项目贡献，个人 GitHub 拥有 10+ 完整实用项目，同时运营个人技术博客",
        "具备较强的自学能力与问题排查能力，能够快速学习新技术并落地实践",
        "具备良好的英文文档阅读能力，可无障碍查阅官方文档与前沿技术资料",
      ],
      education: [
        {
          school: "中国地质大学（北京）",
          degree: "211本科",
          gpa: "",
          period: "2024.9 - 2028.7",
          details: ["第17届全国大学生数学竞赛三等奖"],
        },
      ],
      skills: [
        "深入理解事件循环、浏览器渲染等前端核心原理",
        "熟练掌握 JavaScript/TypeScript，熟悉 React 及相关生态，了解 Vue3、Next.js 并有实际项目经验",
        "熟悉前端工程化与代码规范，能够使用 ESLint + Prettier + TypeScript + Husky 保障项目代码质量",
        "熟练使用 Ant Design、ECharts 等常用组件库与工具，具备快速查阅官方文档解决问题的能力",
        "能够使用 ClaudeCode、Cursor、OpenSpec、Codex 等工具高效开发前端项目",
        "熟悉 Git 协作与 PR 流程，掌握 CI/CD（GitHub Actions）、Docker 容器化部署",
      ],
      experience: [],
      projects: [
        {
          name: "AI驱动的数据分析平台",
          tech: "React 18 + TypeScript + Umi Max + Ant Design + ECharts + Zod + react-window",
          points: [
            "GitHub：https://github.com/Jaxon1216/GenBI | 2026.02 – 维护至今",
            "项目简介：基于 AI 大模型的智能 BI 平台，用户上传 Excel 数据后，AI 自动生成 ECharts 可视化图表与分析结论，支持同步/异步生成，可通过拖拽看板组合展示多图表",
            "设计基于 Zod 的图表 Schema 校验层，对 AI 返回的 ECharts 配置进行运行时校验、JSON 容错提取与危险字段过滤，结合 Error Boundary 兜底，实现图表渲染崩溃率为 0",
            "封装通用轮询 Hook，结合指数退避策略与 Page Visibility API 实现异步图表状态实时更新，减少约 60% 无效请求",
            "使用 react-window 虚拟滚动，支持万行级数据展示，仅渲染可视区域 DOM，渲染耗时优化至 50ms 以内",
          ],
        },
        {
          name: "个人主页",
          tech: "Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + MDX + Framer Motion",
          points: [
            "站点：https://jiangxu.net | 2025.09 – 维护至今",
            "项目简介：用于记录学习与成长历程，锻炼工程化与性能优化能力",
            "基于 Next.js App Router 架构搭建，集成博客、简历、项目展示等模块",
            "采用服务端组件与客户端组件混合渲染，博客页面使用 SSG 静态生成，优化首屏加载性能",
            "实现 MDX 博客系统，支持代码高亮、标签筛选、阅读时长统计、Giscus 评论等功能",
            "使用 Framer Motion 实现流畅的页面过渡与滚动驱动动画，通过动态导入按需加载重型组件",
            "支持深色/浅色主题切换，全站响应式适配多端设备",
          ],
        },
      ],
    },
  },
  {
    key: "v1-2025",
    label: "2025 转专业版",
    date: "2025-11",
    header: {
      name: siteConfig.name,
      email: "jiangxu05@outlook.com",
      github: siteConfig.github,
      blog: "jiangxu.net",
    },
    sections: {
      summary:
        "安全工程专业大一学生，申请转入软件工程专业。自学编程一年，具备扎实的 C++ 和数据结构基础，熟悉 Git 工作流和前端基础技术栈。因为学校政策这学期不能转要在大二下留一级转。26年04月找到实习后，决定不转了～。",
      education: [
        {
          school: "中国地质大学（北京）",
          degree: "安全工程 → 软件工程（申请转专业中）",
          gpa: "GPA 3.43/4.0",
          period: "2024.09 - 至今",
          details: [
            "高等数学 93 分，C++程序设计 91 分，英语四级 536 分",
            "大一年级绩点 3.43/4.0，位列专业第七（综测）/ 第十（综合）",
            "第24届大学生数学竞赛（北京赛区）三等奖",
            "担任班级生活委员",
          ],
        },
      ],
      skills: [
        "C++: 熟悉基本语法，MacOS 下配置编译环境，使用 VS Code / Cursor",
        "数据结构: 线性表、链表、栈、队列等，LeetCode + HDUOJ 提交 200+ 次，AC 80+ 题",
        "Git / GitHub: 所有题解托管于 GitHub，熟悉版本控制和协作流程",
        "前端基础: HTML、CSS、Docker 基础，了解 CI/CD 概念",
        "博客运维: 自建博客迁移至 Vercel，绑定域名，接入 Webhook 自动部署、全球 CDN",
        "工具: Markdown 笔记整理、MATLAB、Word、Excel",
      ],
      experience: [],
      projects: [
        {
          name: "GitHub 题解仓库",
          tech: "C++, Git, GitHub",
          points: [
            "累计提交数据结构相关题目 200 余次，通过 80+ 道",
            "涵盖 LeetCode 和 HDUOJ 题解，全部托管于 GitHub",
          ],
        },
        {
          name: "个人博客（Hexo → Vercel）",
          tech: "Hexo, GitHub Pages, Vercel",
          points: [
            "从 GitHub Pages 迁移至 Vercel，绑定自定义域名上线运行",
            "接入 Webhook 实现原子发布，配置全球 CDN 加速",
          ],
        },
      ],
    },
  },
];

export function ResumeContent() {
  const [activeVersion, setActiveVersion] = useState(resumeVersions[0].key);
  const version = resumeVersions.find((v) => v.key === activeVersion)!;
  const v = version.sections;
  const h = version.header;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Left: Timeline */}
        <div className="sm:w-48 flex-shrink-0">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
            版本历史
          </h2>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[var(--card-border)]" />
            <div className="space-y-4">
              {resumeVersions.map((ver) => {
                const isActive = ver.key === activeVersion;
                return (
                  <button
                    key={ver.key}
                    onClick={() => setActiveVersion(ver.key)}
                    className="relative flex items-center gap-3 w-full text-left group"
                  >
                    <div
                      className={`relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--background)] border-[var(--card-border)] group-hover:border-[var(--accent)]"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isActive
                            ? "text-[var(--accent)]"
                            : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                        }`}
                      >
                        {ver.label}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{ver.date}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Resume */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVersion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="border-b-2 border-[var(--accent)] pb-4 mb-6">
                <h1 className="text-3xl font-bold mb-2">{h.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                  {h.email && (
                    <span className="flex items-center gap-1">
                      <FiMail size={14} />
                      {h.email}
                    </span>
                  )}
                  <a
                    href={`https://github.com/${h.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                  >
                    <FiGithub size={14} />
                    {h.github}
                  </a>
                  {h.blog && (
                    <a
                      href={`https://${h.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                    >
                      <FiGlobe size={14} />
                      {h.blog}
                    </a>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 text-sm text-[var(--muted)] leading-relaxed">
                {v.summary}
              </div>

              {/* Education */}
              <ResumeSection icon={FiBook} title="教育背景">
                {v.education.map((edu) => (
                  <div key={edu.school} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <div>
                        <span className="font-medium">{edu.school}</span>
                        <span className="text-[var(--muted)] mx-2">{edu.degree}</span>
                        {edu.gpa && <span className="text-[var(--muted)]">{edu.gpa}</span>}
                      </div>
                      <span className="text-sm text-[var(--muted)]">{edu.period}</span>
                    </div>
                    {edu.details.length > 0 && (
                      <ul className="mt-1 text-sm text-[var(--muted)] list-disc list-inside marker:text-[var(--accent)]">
                        {edu.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </ResumeSection>

              {/* Skills */}
              <ResumeSection icon={FiTool} title="专业技能">
                <ul className="space-y-1.5 text-sm">
                  {v.skills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </ResumeSection>

              {/* Experience */}
              {v.experience.length > 0 && (
                <ResumeSection icon={FiBriefcase} title="实习经历">
                  {v.experience.map((exp) => (
                    <div key={exp.title} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          {exp.companyIcon && (
                            <exp.companyIcon size={15} className="text-[var(--accent)]" />
                          )}
                          <span className="font-medium">{exp.company}</span>
                          <span className="text-[var(--muted)] mx-1">{exp.title}</span>
                        </div>
                        <span className="text-sm text-[var(--muted)]">{exp.period}</span>
                      </div>
                      {exp.summary && (
                        <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">
                          {exp.summary}
                        </p>
                      )}
                      <ul className="mt-2 text-sm text-[var(--muted)] list-disc list-inside marker:text-[var(--accent)] space-y-1">
                        {exp.points.map((p, i) => (
                          <li key={i}>{formatResumeText(p)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {/* Projects */}
              {v.projects.length > 0 && (
                <ResumeSection icon={FiFolder} title="项目经历">
                  {v.projects.map((proj) => (
                    <div key={proj.name} className="mb-4 last:mb-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-medium">{proj.name}</h4>
                        {proj.role && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                            {proj.role}
                          </span>
                        )}
                        <span className="text-xs text-[var(--accent)]">{proj.tech}</span>
                      </div>
                      {proj.summary && (
                        <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">
                          {formatResumeText(proj.summary)}
                        </p>
                      )}
                      <ul className="mt-2 text-sm text-[var(--muted)] list-disc list-inside marker:text-[var(--accent)] space-y-1">
                        {proj.points.map((p, i) => (
                          <li key={i}>{formatResumeText(p)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {v.openSource && v.openSource.length > 0 && (
                <ResumeSection icon={FiGithub} title="开源贡献">
                  {v.openSource.map((project) => (
                    <div key={project.name} className="mb-4 last:mb-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-medium">{project.name}</h4>
                        <span className="text-xs text-[var(--accent)]">{project.tech}</span>
                      </div>
                      <ul className="mt-2 text-sm text-[var(--muted)] list-disc list-inside marker:text-[var(--accent)] space-y-1">
                        {project.points.map((point, i) => (
                          <li key={i}>{formatResumeText(point)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {v.personalEvaluation && v.personalEvaluation.length > 0 && (
                <ResumeSection icon={FiUser} title="个人评价">
                  <ul className="space-y-1.5 text-sm">
                    {v.personalEvaluation.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-[var(--muted)]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </ResumeSection>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MottoBlock text="Stay hungry. Stay foolish." />
    </div>
  );
}

function formatResumeText(content: string) {
  return (
    <>
      {content.split(/(\*\*.+?\*\*)/).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-[var(--foreground)]">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      })}
    </>
  );
}

function ResumeSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="flex items-center gap-2 text-base font-semibold mb-3 pb-2 border-b border-[var(--card-border)]">
        <Icon size={16} className="text-[var(--accent)]" />
        {title}
      </h3>
      {children}
    </section>
  );
}
