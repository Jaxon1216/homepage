"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import { clickAttributes, viewAttributes } from "@/lib/analytics/events";
import { siteConfig, type Project } from "@/lib/site-config";

const focusStyles =
  "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]";

export function FeaturedProjects() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="projects"
      aria-labelledby="projects-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="mx-auto max-w-[880px] scroll-mt-24 py-12"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="projects-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Selected Projects
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            Tools for focus, learning, and making sense of data.
          </p>
        </div>
        <a
          href={`https://github.com/${siteConfig.github}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          {...clickAttributes("outbound_click", {
            target_host: "github.com",
            target_path: `/${siteConfig.github}`,
            placement: "home_projects",
          })}
          className={`group/repos inline-flex min-h-11 w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] ${focusStyles}`}
        >
          All repositories
          <FiArrowUpRight
            size={16}
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover/repos:-translate-y-0.5 motion-safe:group-hover/repos:translate-x-0.5"
          />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {siteConfig.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </motion.section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const primaryHref = project.link || project.github;
  const primaryLabel = project.link ? project.linkLabel : "View repository";
  const primaryDestination = primaryHref.startsWith("https://github.com/") ? "github" : "demo";
  const primaryAnalytics = clickAttributes("project_click", {
    project_id: project.id,
    category: project.category,
    destination: primaryDestination,
    placement: "home_projects",
  });

  return (
    <article
      {...viewAttributes("project_impression", {
        project_id: project.id,
        category: project.category,
      })}
      className="group/project flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--muted)]/40 hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] focus-within:border-[var(--accent)]/60 dark:bg-[var(--card)] dark:hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.6)]"
    >
      <a
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${primaryLabel}: ${project.name} (opens in a new tab)`}
        {...primaryAnalytics}
        className="relative block aspect-video shrink-0 overflow-hidden border-b border-[var(--card-border)] bg-[var(--card)] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        <Image
          src={project.preview}
          alt={project.previewAlt}
          fill
          loading="lazy"
          sizes="(min-width: 912px) 430px, (min-width: 640px) calc((100vw - 48px) / 2), calc(100vw - 32px)"
          className="object-cover transition-transform duration-500 motion-safe:group-hover/project:scale-[1.025]"
        />
      </a>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {project.kind}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {project.name}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-6 text-[var(--muted)]">
          {project.description}
        </p>

        <ul aria-label={`${project.name} technologies`} className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {project.tags.map((tag) => (
            <li key={tag} className="font-mono text-[11px] leading-5 text-[var(--muted)]">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 border-t border-[var(--card-border)] pt-1">
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${primaryLabel}: ${project.name} (opens in a new tab)`}
            {...primaryAnalytics}
            className={`group/cta inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)] ${focusStyles}`}
          >
            {primaryLabel}
            <FiArrowUpRight
              size={17}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover/cta:-translate-y-0.5 motion-safe:group-hover/cta:translate-x-0.5"
            />
          </a>
          {project.link && project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} source on GitHub (opens in a new tab)`}
              {...clickAttributes("project_click", {
                project_id: project.id,
                category: project.category,
                destination: "github",
                placement: "home_projects",
              })}
              className={`inline-flex min-h-11 items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] ${focusStyles}`}
            >
              <FiGithub size={15} aria-hidden="true" />
              Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
