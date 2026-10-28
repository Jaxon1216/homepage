"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { Noto_Serif_SC } from "next/font/google";
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import { GiscusComments } from "@/components/blog/GiscusComments";
import { ArticleToc, ArticleTocProvider } from "@/components/blog/ArticleToc";
import { MottoBlock } from "@/components/common/MottoBlock";
import { useRef, type ReactNode } from "react";

const articleChinese = Noto_Serif_SC({
  variable: "--font-article-chinese",
  display: "swap",
  preload: false,
});

interface PostContentProps {
  meta: PostMeta;
  children: ReactNode;
}

export function PostContent({ meta, children }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const publicationDate = meta.date.split("-").map((part) => part.padStart(2, "0")).join("-");

  return (
    <ArticleTocProvider key={meta.slug} slug={meta.slug} contentRef={contentRef}>
      <div className={`blog-reading-shell ${articleChinese.variable}`}>
        <div className="blog-reading-layout">
          <div className="blog-reading-heading">
            <Link
              href="/blog"
              className="blog-reading-back"
            >
              <FiArrowLeft size={14} aria-hidden="true" />
              返回文章列表
            </Link>

            <header className="blog-reading-header">
              <h1 id="article-title" className="blog-reading-title">
                {meta.title}
              </h1>
              <div className="blog-reading-metadata">
                <time dateTime={publicationDate}>
                  {formatDate(meta.date)}
                </time>
                <span>{meta.readingTime}</span>
                {meta.tags.length > 0 && <span>{meta.tags.join(" / ")}</span>}
              </div>
            </header>
          </div>

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
