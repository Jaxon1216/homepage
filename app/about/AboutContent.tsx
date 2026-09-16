"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  FiBook,
  FiBookOpen,
  FiCode,
  FiCpu,
  FiGithub,
  FiGlobe,
  FiLayers,
  FiMail,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";
import { siteConfig } from "@/lib/site-config";
import { MottoBlock } from "@/components/common/MottoBlock";

interface Skill {
  name: string;
  level: string;
  fill: number;
}

const skillLegend = [
  "1 · concept only",
  "2 · demo with help",
  "3 · independent",
  "4 · principles & tradeoffs",
  "5 · production-ready",
];

const skillGroups: { title: string; icon: typeof FiCode; skills: Skill[] }[] = [
  {
    title: "Frontend",
    icon: FiCode,
    skills: [
      { name: "JavaScript / Browser", level: "L4", fill: 4 },
      { name: "React", level: "L3", fill: 3 },
      { name: "Frontend Engineering", level: "L3~4", fill: 3 },
    ],
  },
  {
    title: "Foundations",
    icon: FiLayers,
    skills: [
      { name: "C++", level: "L2~3", fill: 2 },
      { name: "Data Structures", level: "L3", fill: 3 },
      { name: "Algorithms", level: "L3", fill: 3 },
    ],
  },
  {
    title: "Backend",
    icon: FiTrendingUp,
    skills: [
      { name: "Node.js / Express", level: "L2", fill: 2 },
      { name: "HTTP / API", level: "L2", fill: 2 },
      { name: "Go", level: "L1~2", fill: 1 },
      { name: "MySQL", level: "L1", fill: 1 },
      { name: "Backend Engineering", level: "L1~2", fill: 1 },
    ],
  },
  {
    title: "AI & Infra",
    icon: FiCpu,
    skills: [
      { name: "AI Application", level: "L3", fill: 3 },
      { name: "Agent / RAG / MCP", level: "L3", fill: 3 },
      { name: "Docker", level: "L1", fill: 1 },
      { name: "Linux / Deployment", level: "L1", fill: 1 },
    ],
  },
];

const toolsAndPlatforms = [
  { label: "Editors", items: ["Cursor", "VS Code", "Trae", "Claude Code", "Codex"] },
  { label: "Build", items: ["Webpack", "Rspack"] },
  { label: "DevOps", items: ["Docker", "CI"] },
];

const contacts = [
  { icon: FiMail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: FiGithub, label: "GitHub", value: `github.com/${siteConfig.github}`, href: `https://github.com/${siteConfig.github}` },
  { icon: FiGlobe, label: "Blog", value: "EastonJiang's blog", href: "https://www.jiangxu.net" },
  { icon: FiBookOpen, label: "Notes", value: "EastonJiang's notes", href: "https://notes.jiangxu.net" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AboutContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="border-b-2 border-[var(--accent)] pb-4 flex items-center gap-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0"
          >
            <Image
              src={siteConfig.avatar}
              alt={siteConfig.nameEn}
              width={80}
              height={80}
              className="rounded-full object-cover ring-2 ring-[var(--accent)]/30"
              priority
              quality={100}
              unoptimized
            />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Hi, I&apos;m {siteConfig.nameEn}</h1>
            <p className="text-sm text-[var(--muted)]">Frontend-focused · leveling up toward full-stack</p>
          </div>
        </div>
      </motion.div>

      {/* Skills */}
      <Section icon={FiCode} title="Skills">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--muted)] mb-5">
          {skillLegend.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {skillGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <group.icon size={16} className="text-[var(--accent)] flex-shrink-0" />
                <h3 className="text-sm font-semibold">{group.title}</h3>
              </div>
              <div className="space-y-3">
                {group.skills.map((skill) => (
                  <SkillRow key={skill.name} skill={skill} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Tools & Platforms */}
      <Section icon={FiTool} title="Tools & Platforms">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {toolsAndPlatforms.map((group) => (
            <motion.div key={group.label} variants={fadeUp}>
              <p className="text-sm font-medium mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full text-sm bg-[var(--card)] border border-[var(--card-border)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Education & Awards */}
      <Section icon={FiBook} title="Education & Awards">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
        >
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="font-medium">China University of Geosciences (Beijing)</span>
              <span className="text-[var(--muted)] mx-2">B.Eng. in Safety Engineering, in progress</span>
            </div>
            <span className="text-sm text-[var(--muted)]">Sep 2024 – Present</span>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">17th China Undergraduate Mathematics Competition · Third Prize (Beijing Division)</p>
        </motion.div>
      </Section>

      {/* Contact */}
      <Section icon={FiMail} title="Contact">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {contacts.map((item) => (
            <motion.a
              key={item.label}
              variants={fadeUp}
              href={item.href}
              target={item.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-colors group"
            >
              <item.icon size={16} className="text-[var(--accent)] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)]">{item.label}</p>
                <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                  {item.value}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </Section>

      <MottoBlock text="Obsessed is a word the lazy use to describe the dedicated." />
    </div>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs mb-1">
        <span>{skill.name}</span>
        <span className="text-[var(--accent)] font-medium">{skill.level}</span>
      </div>
      <div className="flex gap-1" aria-label={`${skill.name} ${skill.level}`}>
        {[1, 2, 3, 4, 5].map((point) => (
          <span
            key={point}
            className={`h-1.5 flex-1 rounded-full ${
              point <= skill.fill ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-base font-semibold mb-4 pb-2 border-b border-[var(--card-border)]">
        <Icon size={16} className="text-[var(--accent)]" />
        {title}
      </h2>
      {children}
    </section>
  );
}
