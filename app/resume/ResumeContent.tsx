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
} from "react-icons/fi";
import { GitHubContribution } from "@/components/home/GitHubContribution";
import { siteConfig } from "@/lib/site-config";

const resumeVersions = [
  {
    key: "v2-2026",
    label: "2026 最新版",
    date: "2026-03",
    header: {
      name: siteConfig.name,
      phone: "12345678910",
      email: "your@email.com",
    },
    sections: {
      summary:
        "热爱技术的开发者，专注前端开发和全栈实践，持续学习中。",
      education: [
        {
          school: "某某大学",
          degree: "软件工程 本科",
          gpa: "GPA: x.x",
          period: "20xx.09 - 20xx.06",
          details: ["相关课程、奖项等"],
        },
      ],
      skills: [
        "前端: 熟悉 HTML 及 HTML5 元素、CSS 及 CSS3 基本语法与布局",
        "JavaScript: 熟悉 ES6 语法特性，理解 this 指向性问题、作用域、闭包、原型链",
        "React: 熟悉 React 框架，掌握 React-hooks、Redux 等进行协作开发",
        "工具: 了解 webpack、Git、Docker、Linux 基本使用",
        "后端: 了解 HTTP 协议、TCP/IP 协议、Node.js",
      ],
      experience: [
        {
          title: "Web 前端开发实习生",
          company: "某某公司 · 北京",
          period: "20xx.07 - 20xx.01",
          points: [
            "负责的工作内容和技术实现",
            "取得的成果和数据指标",
          ],
        },
      ],
      projects: [
        {
          name: "个人博客网站",
          tech: "Next.js, TypeScript, Tailwind CSS",
          points: [
            "基于 Next.js 14 App Router 构建的个人网站",
            "支持 MDX 博客、在线简历、路线图等功能模块",
          ],
        },
      ],
    },
  },
  {
    key: "v1-2025",
    label: "2025 版本",
    date: "2025-01",
    header: {
      name: siteConfig.name,
      phone: "",
      email: "",
    },
    sections: {
      summary: "这是早期版本的简历，记录来时路。",
      education: [
        {
          school: "某某大学",
          degree: "软件工程 本科",
          gpa: "",
          period: "20xx.09 - 20xx.06",
          details: [],
        },
      ],
      skills: [
        "JavaScript, HTML, CSS",
        "Node.js",
        "Git",
      ],
      experience: [],
      projects: [],
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
      {/* Timeline version selector */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Left: Timeline */}
        <div className="sm:w-48 flex-shrink-0">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
            版本历史
          </h2>
          <div className="relative">
            {/* Timeline line */}
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
                    {/* Dot */}
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

        {/* Right: Resume content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVersion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Resume header - traditional style */}
              <div className="border-b-2 border-[var(--accent)] pb-4 mb-6">
                <h1 className="text-3xl font-bold mb-2">{h.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                  {h.phone && (
                    <span className="flex items-center gap-1">
                      <FiPhone size={14} />
                      {h.phone}
                    </span>
                  )}
                  {h.email && (
                    <span className="flex items-center gap-1">
                      <FiMail size={14} />
                      {h.email}
                    </span>
                  )}
                  <a
                    href={`https://github.com/${siteConfig.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                  >
                    <FiGithub size={14} />
                    {siteConfig.github}
                  </a>
                </div>
              </div>

              {/* Education */}
              <ResumeSection icon={FiBook} title="教育背景">
                {v.education.map((edu) => (
                  <div key={edu.school} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <div>
                        <span className="font-medium">{edu.school}</span>
                        <span className="text-[var(--muted)] mx-2">{edu.degree}</span>
                        {edu.gpa && (
                          <span className="text-[var(--muted)]">{edu.gpa}</span>
                        )}
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
                      <span className="text-[var(--accent)] mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
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
