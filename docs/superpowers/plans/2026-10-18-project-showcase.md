# Project Showcase Implementation Plan

> **For agentic workers:** Execute in this session, with independent repository research and final code review delegated to subagents.

**Goal:** Refresh the homepage project gallery with verified metadata, PomoTimer and four original product previews, then verify and push.

**Architecture:** Keep static metadata in site-config.ts and render it through FeaturedProjects. Use local optimized images and the existing analytics helpers; avoid new dependencies and runtime GitHub requests.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion, next/image.

## Global Constraints

- Preserve existing project ids and analytics event properties.
- Use verified public project features and links.
- Preserve unrelated untracked workspace files.
- Complete browser checks before committing and pushing.

## Tasks

- [x] Read current public README and package metadata with gh CLI; record sources and image prompts in docs/project-showcase.md.
- [x] Generate four individual 3:2 product illustrations with the built-in image tool, inspect them, then optimize to local WebP assets under public/images/projects/.
- [x] Extend project metadata with preview, alt text and product category. Add PomoTimer and refresh existing descriptions and tags.
- [x] Replace text-only cards with a two-column product gallery: semantic article, responsive image, clear title, description, technology list, GitHub and optional website links. Preserve impression and click attributes.
- [x] Check the rendered homepage at desktop and mobile widths in light and dark themes, including image loading, layout, accessible link names, keyboard focus and console errors. Capture screenshots outside the repository.
- [x] Run npm run lint, npx tsc --noEmit and npm run build. Obtain an independent diff review and fix actionable findings.

## Delivery

Review git status, git diff and staged stat. Commit only related files with the repository message style and push to origin. Verify remote branch SHA equals the local commit; report the actual commit and remote verification in the final response.
