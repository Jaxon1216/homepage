"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { siteConfig, type Project } from "@/lib/site-config";

export function FeaturedProjects() {
  const [activeTab, setActiveTab] = useState(siteConfig.projectCategories[0].key);

  const filtered = siteConfig.projects.filter((p) => p.category === activeTab);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16"
    >
      <h2 className="text-2xl font-bold text-center mb-8">精选项目</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {siteConfig.projectCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === cat.key
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--card-border)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filtered.length === 0 ? (
            <p className="col-span-2 text-center text-[var(--muted)] py-8">
              暂无项目，敬请期待
            </p>
          ) : (
            filtered.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold group-hover:text-[var(--accent)] transition-colors">
          {project.name}
        </h3>
        <div className="flex gap-2">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={16} />
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              aria-label="Live link"
            >
              <FiExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--muted)] mb-3 leading-relaxed">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded bg-[var(--accent-light)] text-[var(--accent)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
