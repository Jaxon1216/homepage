"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiTool,
  FiBriefcase,
  FiFolder,
  FiPhone,
  FiMail,
  FiGithub,
  FiGlobe,
} from "react-icons/fi";
import { GitHubContribution } from "@/components/home/GitHubContribution";
import { MottoBlock } from "@/components/common/MottoBlock";
import { siteConfig } from "@/lib/site-config";

interface Experience {
  title: string;
  company: string;
  period: string;
  points: string[];
}

interface ResumeProject {
  name: string;
  tech: string;
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
  };
}

const resumeVersions: ResumeVersion[] = [
  {
    key: "v2-2026",
    label: "2026 最新版",
    date: "2026-03",
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
        {
          name: "电商平台",
          tech: "Vue 3 + Vue-Router + Pinia + Axios + Element Plus",
          points: [
            "一个单页电商网站平台，支持商品展示、用户登录、购物车及订单管理等功能",
            "核心功能：独立开发了商品列表、详情展示、购物车及订单管理等一系列可复用组件",
            "工程化开发：采用 Pinia 进行全局状态管理，并配合 localStorage 实现用户状态与购物车数据持久化",
            "性能优化：通过 Vue Router 懒加载、图片懒加载、函数防抖等手段有效降低了初始加载时间与运行时的性能开销",
            "可维护架构：对 Axios 进行二次封装，统一了 API 请求与错误处理逻辑，提升了代码复用性",
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
        "安全工程专业大一学生，申请转入软件工程专业。自学编程一年，具备扎实的 C++ 和数据结构基础，熟悉 Git 工作流和前端基础技术栈。因为学校政策这学期不能转要在大二下留一级转",
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
                      <ul className="mt-1 text-sm text-[var(--muted)] list-disc list-inside">
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
                        <div>
                          <span className="font-medium">{exp.company}</span>
                          <span className="text-[var(--muted)] mx-2">{exp.title}</span>
                        </div>
                        <span className="text-sm text-[var(--muted)]">{exp.period}</span>
                      </div>
                      <ul className="mt-2 text-sm text-[var(--muted)] list-disc list-inside space-y-1">
                        {exp.points.map((p, i) => (
                          <li key={i}>{p}</li>
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
                        <span className="text-xs text-[var(--accent)]">{proj.tech}</span>
                      </div>
                      <ul className="mt-2 text-sm text-[var(--muted)] list-disc list-inside space-y-1">
                        {proj.points.map((p, i) => (
                          <li key={i}>{p}</li>
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

      <div className="mt-8">
        <GitHubContribution />
      </div>

      <MottoBlock text="Stay hungry. Stay foolish." />
    </div>
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
