"use client";

import { motion } from "framer-motion";
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiGit,
  SiPython,
  SiDocker,
} from "react-icons/si";
import { MottoBlock } from "@/components/common/MottoBlock";

const techStack = [
  { icon: SiTypescript, name: "TypeScript", color: "#3178c6" },
  { icon: SiReact, name: "React", color: "#61dafb" },
  { icon: SiNextdotjs, name: "Next.js", color: "currentColor" },
  { icon: SiTailwindcss, name: "Tailwind", color: "#06b6d4" },
  { icon: SiNodedotjs, name: "Node.js", color: "#339933" },
  { icon: SiPython, name: "Python", color: "#3776ab" },
  { icon: SiGit, name: "Git", color: "#f05032" },
  { icon: SiDocker, name: "Docker", color: "#2496ed" },
];

const education = [
  {
    school: "填写你的学校",
    degree: "填写你的专业",
    period: "20xx - 20xx",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export function AboutContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.h1 {...fadeUp} className="text-3xl font-bold mb-8">
        关于我
      </motion.h1>

      {/* Bio */}
      <motion.section {...fadeUp} className="mb-12">
        <p className="text-[var(--muted)] leading-relaxed">
          你好，我是江旭（Jaxon）。热爱技术，喜欢折腾，持续学习中。
          这个网站是我的个人空间，记录技术心得、项目实践和成长足迹。
        </p>
      </motion.section>

      {/* Tech stack */}
      <motion.section {...fadeUp} className="mb-12">
        <h2 className="text-xl font-semibold mb-6">技术栈</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-colors"
            >
              <tech.icon size={28} style={{ color: tech.color }} />
              <span className="text-sm text-[var(--muted)]">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Education */}
      <motion.section {...fadeUp} className="mb-12">
        <h2 className="text-xl font-semibold mb-6">教育背景</h2>
        {education.map((edu) => (
          <div
            key={edu.school}
            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
          >
            <h3 className="font-medium">{edu.school}</h3>
            <p className="text-sm text-[var(--muted)]">{edu.degree}</p>
            <p className="text-sm text-[var(--muted)]">{edu.period}</p>
          </div>
        ))}
      </motion.section>

      {/* Interests */}
      <motion.section {...fadeUp} className="mb-12">
        <h2 className="text-xl font-semibold mb-6">兴趣爱好</h2>
        <div className="flex flex-wrap gap-2">
          {["编程", "阅读", "开源", "旅行"].map((hobby) => (
            <span
              key={hobby}
              className="px-3 py-1.5 rounded-full text-sm bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20"
            >
              {hobby}
            </span>
          ))}
        </div>
      </motion.section>

      <MottoBlock text="Stay hungry, stay foolish." />
    </div>
  );
}
