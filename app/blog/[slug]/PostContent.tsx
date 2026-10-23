"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft, FiClock, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import { GiscusComments } from "@/components/blog/GiscusComments";
import { ArticleToc, ArticleTocProvider } from "@/components/blog/ArticleToc";
import { MottoBlock } from "@/components/common/MottoBlock";
import { useRef, type ReactNode } from "react";

interface PostContentProps {
  meta: PostMeta;
  children: ReactNode;
}

export function PostContent({ meta, children }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  return (
    <ArticleTocProvider key={meta.slug} slug={meta.slug} contentRef={contentRef}>
      <div className="blog-reading-shell">
        <div className="blog-reading-heading">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8"
          >
            <FiArrowLeft size={14} />
            Back to posts
          </Link>

          <header className="mb-8">
            <h1
              id="article-title"
              className="mb-4 text-[1.75rem] leading-[1.35] font-semibold sm:text-[1.875rem]"
            >
              {meta.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <FiCalendar size={14} />
                {formatDate(meta.date)}
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={14} />
                {meta.readingTime}
              </span>
            </div>
            {meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded bg-[var(--accent-light)] text-[var(--accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </div>

        <div className="blog-reading-layout">
          <ArticleToc variant="mobile" />
          <div className="blog-reading-main">
            <motion.article
              aria-labelledby="article-title"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              <div
                id="post-content"
                data-analytics-article={meta.slug}
                data-analytics-reading-seconds={meta.readingSeconds}
                data-analytics-links="article_body"
                ref={contentRef}
                className="prose blog-reading-prose max-w-none"
              >
                {children}
              </div>
            </motion.article>

            <MottoBlock text="The only true wisdom is in knowing you know nothing." />
            <GiscusComments />
          </div>
          <ArticleToc variant="desktop" />
        </div>
      </div>
    </ArticleTocProvider>
  );
}
