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
        "自学转码中的大二学生，专注前端开发，目标进大厂或外企。有 Vue 3 和 React 项目经验，熟悉前端工程化工具链。",
      education: [
        {
          school: "中国地质大学（北京）",
          degree: "安全工程 本科",
          gpa: "",
          period: "2024.09 - 至今",
          details: [
            "第17届全国大学生数学竞赛 - 北京赛区三等奖",
          ],
        },
      ],
      skills: [
        "前端: 熟悉 HTML5 及 HTML5 元素、CSS3 基本语法与布局（Flex/Grid）",
        "JavaScript: 熟悉 ES6+ 语法特性，理解 this 指向、作用域、闭包、原型链、Promise、模块化",
        "Vue 3: 完成了黑马 Vue3 小兔鲜项目，熟悉组合式 API",
        "React: 熟悉 JSX/TSX、useState、useEffect、React Router、useContext、useReducer 等",
        "工具: Git、Docker、Cursor、Vercel、npm/pnpm",
        "了解: HTTP 协议、TCP/IP、Node.js、webpack/vite",
      ],
      experience: [],
      projects: [
        {
          name: "个人博客网站 (homepage)",
          tech: "Next.js 14, TypeScript, Tailwind CSS, Framer Motion",
          points: [
            "基于 Next.js App Router 构建，支持 SSG 静态生成，SEO 友好",
            "MDX 博客系统，支持标签筛选、预计阅读时间、giscus 评论",
            "在线简历版本管理、学习路线图等多功能页面",
            "粒子动态背景、深浅主题切换、响应式设计",
          ],
        },
        {
          name: "自习室 (Learning Duel)",
          tech: "Next.js, Supabase, TypeScript",
          points: [
            "多人在线学习路线管理工具，支持创建学习路线和节点追踪",
            "基于 Supabase 实现用户认证、实时数据同步和 RLS 权限控制",
            "Timeline 可视化进度展示，支持宏观目标和多路线管理",
          ],
        },
        {
          name: "Vue3 小兔鲜电商项目",
          tech: "Vue 3, Pinia, Vue Router, Element Plus",
          points: [
            "基于 Vue 3 组合式 API 的完整电商前端项目",
            "实现了首页、分类、商品详情、购物车、订单等核心模块",
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
