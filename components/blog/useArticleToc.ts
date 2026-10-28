"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ARTICLE_HEADING_OFFSET, getActiveHeadingIndex } from "@/lib/article-toc";

export interface TocHeading {
  id: string;
  text: string;
  depth: 0 | 1;
}

export interface ArticleTocState {
  ready: boolean;
  headings: TocHeading[];
  currentId: string;
  startIndex: number;
}

const EMPTY_STATE: ArticleTocState = {
  ready: false, headings: [], currentId: "", startIndex: 0,
};

export function useArticleToc(contentRef: RefObject<HTMLElement | null>, slug: string) {
  const [state, setState] = useState<ArticleTocState>(EMPTY_STATE);
  const refreshRef = useRef<() => void>(() => {});
  const initialHashRef = useRef({ hash: "", handled: false });

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let frame = 0;
    let disposed = false;
    let needsHeadings = true;
    let signature = "";
    let headings: TocHeading[] = [];
    let elements: HTMLElement[] = [];
    initialHashRef.current = { hash: window.location.hash, handled: false };

    const collectHeadings = () => {
      const all = Array.from(content.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"));
      const topLevel = Math.min(...all.map((item) => Number(item.tagName[1])));
      const selected = all.filter((item) => {
        const level = Number(item.tagName[1]);
        return item.id && item.textContent?.trim() &&
          (level === topLevel || level === topLevel + 1);
      });
      const next = selected.map((item) => ({
        id: item.id,
        text: item.textContent!.trim(),
        depth: (Number(item.tagName[1]) === topLevel ? 0 : 1) as 0 | 1,
      }));
      const nextSignature = JSON.stringify(next);
      // Mermaid also mutates the body. Rebuild only when the headings themselves change.
      if (signature !== nextSignature) {
        signature = nextSignature;
        headings = next;
      }
      elements = selected;
      needsHeadings = false;
    };

    const update = () => {
      frame = 0;
      if (disposed) return;
      if (needsHeadings) collectHeadings();
      const offset = parseFloat(getComputedStyle(content).getPropertyValue("--article-scroll-offset")) || ARTICLE_HEADING_OFFSET;
      const tops = elements.map((item) => item.getBoundingClientRect().top);
      const articleRect = content.getBoundingClientRect();
      // Reaching the end of the article should select its last section, even
      // when comments or the footer leave more space below the reading area.
      const atArticleEnd = articleRect.top < offset && articleRect.bottom <= window.innerHeight;
      const startIndex = Math.max(0, getActiveHeadingIndex(tops, offset, atArticleEnd));
      const currentId = headings[startIndex]?.id ?? "";
      setState((previous) => {
        if (previous.ready && previous.headings === headings && previous.currentId === currentId &&
          previous.startIndex === startIndex) return previous;
        return { ready: true, headings, currentId, startIndex };
      });
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    refreshRef.current = schedule;
    const mutationObserver = new MutationObserver(() => {
      needsHeadings = true;
      schedule();
    });
    mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(content);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("popstate", schedule);
    content.addEventListener("load", schedule, true);
    void document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      refreshRef.current = () => {};
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("popstate", schedule);
      content.removeEventListener("load", schedule, true);
    };
  }, [contentRef, slug]);

  useEffect(() => {
    // The narrow-screen bar must be in the layout before measuring a fragment jump.
    const frame = requestAnimationFrame(() => {
      const initial = initialHashRef.current;
      if (state.headings.length && initial.hash && !initial.handled) {
        let id = initial.hash.slice(1);
        try { id = decodeURIComponent(id); } catch { /* Keep malformed fragments harmless. */ }
        const target = document.getElementById(id);
        if (target && contentRef.current?.contains(target)) {
          initial.handled = true;
          target.scrollIntoView({ behavior: "instant", block: "start" });
        }
      }
      refreshRef.current();
    });
    return () => cancelAnimationFrame(frame);
  }, [contentRef, slug, state.headings]);
  return state;
}
