"use client";

import {
  createContext, useContext, useEffect, useId, useMemo, useRef, useState,
  type MouseEvent, type ReactNode, type RefObject,
} from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { FiChevronDown, FiList } from "react-icons/fi";
import { getTocScrollTop } from "@/lib/article-toc";
import { useArticleToc, type ArticleTocState } from "./useArticleToc";
import styles from "./ArticleToc.module.css";

interface TocContextValue extends ArticleTocState { reducedMotion: boolean }
const TocContext = createContext<TocContextValue | null>(null);

export function ArticleTocProvider({ contentRef, slug, children }: {
  contentRef: RefObject<HTMLElement | null>;
  slug: string;
  children: ReactNode;
}) {
  const state = useArticleToc(contentRef, slug);
  const reducedMotion = useReducedMotion() === true;
  const value = useMemo(() => ({ ...state, reducedMotion }), [state, reducedMotion]);
  return <TocContext.Provider value={value}>{children}</TocContext.Provider>;
}

interface IndicatorPosition { top: number; height: number }
type FollowMode = "auto" | "manual" | "navigation";

function TocItems({ state, onSelect }: {
  state: TocContextValue;
  onSelect?: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const { headings, currentId, reducedMotion } = state;
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const followTargetRef = useRef<{ id: string; top: number } | null>(null);
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null);
  const [followMode, setFollowMode] = useState<FollowMode>("auto");

  const pauseFollowing = () => {
    const viewport = viewportRef.current;
    // Stop an in-flight automatic scroll before handing control to the reader.
    viewport?.scrollTo({ top: viewport.scrollTop, behavior: "instant" });
    followTargetRef.current = null;
    setFollowMode("manual");
  };

  useEffect(() => {
    if (followMode !== "manual") return;
    const resumeOnDocumentScroll = (event: Event) => {
      if (event.target === document || event.target === window) setFollowMode("auto");
    };
    window.addEventListener("scroll", resumeOnDocumentScroll, { passive: true });
    return () => window.removeEventListener("scroll", resumeOnDocumentScroll);
  }, [followMode]);

  useEffect(() => {
    if (followMode !== "navigation") return;
    // The clicked link already has a visible place in the directory. Wait for
    // anchor scrolling to settle rather than following intermediate sections.
    let previousY = window.scrollY;
    let stableFrames = 0;
    let frame = 0;
    const check = () => {
      const y = window.scrollY;
      stableFrames = y === previousY ? stableFrames + 1 : 0;
      previousY = y;
      if (stableFrames >= 3) setFollowMode("auto");
      else frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [followMode]);

  useEffect(() => {
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (!content || !viewport) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!viewport.clientHeight || !viewport.clientWidth) return;
      const item = content.querySelector<HTMLAnchorElement>('[aria-current="location"]');
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const bounds = content.getBoundingClientRect();
      const style = getComputedStyle(item);
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);
      const position = {
        top: rect.top - bounds.top + paddingTop,
        height: rect.height - paddingTop - paddingBottom,
      };
      setIndicator((previous) => previous?.top === position.top && previous.height === position.height
        ? previous : position);

      if (followMode !== "auto") return;
      const viewportBounds = viewport.getBoundingClientRect();
      const itemTop = viewport.scrollTop + rect.top - viewportBounds.top - viewport.clientTop;
      const top = getTocScrollTop(
        viewport.scrollTop, viewport.clientHeight, itemTop, rect.height, viewport.scrollHeight
      );
      const previousTarget = followTargetRef.current;
      if (Math.abs(top - viewport.scrollTop) > 1 &&
        (previousTarget?.id !== currentId || Math.abs(previousTarget.top - top) > 1)) {
        followTargetRef.current = { id: currentId, top };
        viewport.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    observer.observe(viewport);
    const item = content.querySelector('[aria-current="location"]');
    if (item) observer.observe(item);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [headings, currentId, followMode, reducedMotion]);

  return (
    <nav ref={viewportRef} aria-label="本文目录" className={styles.viewport}
      tabIndex={0}
      onWheel={pauseFollowing}
      onTouchMove={pauseFollowing}
      onPointerDown={pauseFollowing}
      onKeyDown={(event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) {
          pauseFollowing();
        }
      }}>
      <ul ref={contentRef} className={styles.items}>
        {indicator && (
          <li aria-hidden="true" className={styles.indicator}
            style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height }} />
        )}
        {headings.map((heading) => (
          <li key={heading.id}>
            <Link href={`#${encodeURIComponent(heading.id)}`} className={styles.item}
              style={{ paddingInlineStart: 16 + heading.depth * 12 }}
              aria-current={heading.id === currentId ? "location" : undefined}
              onClick={(event) => {
                if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
                  followTargetRef.current = null;
                  setFollowMode("navigation");
                }
                onSelect?.(event, heading.id);
              }}>
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ArticleToc({ variant }: { variant: "desktop" | "mobile" }) {
  const state = useContext(TocContext);
  if (!state) throw new Error("ArticleToc must be inside ArticleTocProvider");
  return variant === "desktop" ? <DesktopToc state={state} /> : <MobileToc state={state} />;
}

function DesktopToc({ state }: { state: TocContextValue }) {
  if (!state.ready) {
    return <aside className={`article-toc-desktop ${styles.desktop}`} aria-hidden="true">
      <p className={styles.title}><FiList size={15} />本文目录</p>
    </aside>;
  }
  if (!state.headings.length) return null;
  return (
    <aside className={`article-toc-desktop ${styles.desktop}`} aria-label="文章导航">
      <p className={styles.title}><FiList size={15} aria-hidden="true" />本文目录</p>
      <TocItems state={state} />
    </aside>
  );
}

function MobileToc({ state }: { state: TocContextValue }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const measurePanel = () => {
      frame = 0;
      const container = containerRef.current;
      if (!container) return;
      const available = Math.max(0, window.innerHeight - container.getBoundingClientRect().bottom - 16);
      container.style.setProperty("--toc-panel-height", `${available}px`);
    };
    const schedulePanel = () => {
      if (!frame) frame = requestAnimationFrame(measurePanel);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", schedulePanel, { passive: true });
    window.addEventListener("resize", schedulePanel);
    schedulePanel();
    const media = window.matchMedia("(min-width: 1280px)");
    const onBreakpoint = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", schedulePanel);
      window.removeEventListener("resize", schedulePanel);
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  if (!state.ready) {
    return <div className={`article-toc-mobile ${styles.mobile}`} aria-hidden="true">
      <div className={styles.trigger}><FiList size={15} />本文目录</div>
    </div>;
  }
  if (!state.headings.length) return null;
  const current = state.headings[state.startIndex];
  const onSelect = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    setOpen(false);
    requestAnimationFrame(() => {
      const heading = document.getElementById(id);
      if (!heading) return;
      if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
  };
  return (
    <div ref={containerRef} className={`article-toc-mobile ${styles.mobile}`}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
      <button ref={triggerRef} type="button" className={styles.trigger}
        aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <FiList size={15} aria-hidden="true" />
        <span className={styles.triggerLabel}>本文目录</span>
        <span className={styles.currentTitle}>{current?.text}</span>
        <FiChevronDown size={15} aria-hidden="true" className={open ? styles.expandedIcon : undefined} />
      </button>
      {open && <div id={panelId} className={styles.panel}><TocItems state={state} onSelect={onSelect} /></div>}
    </div>
  );
}
