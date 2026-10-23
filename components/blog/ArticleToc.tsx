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

interface TrackPosition { x: number; top: number; bottom: number; start: number; end: number }
interface TrackGeometry { d: string; height: number; viewportHeight: number; positions: TrackPosition[] }

function TocItems({ state, onSelect }: {
  state: TocContextValue;
  onSelect?: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const { headings, currentId, startIndex, endIndex, direction, reducedMotion } = state;
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const positionedRef = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipId = useId();
  const [geometry, setGeometry] = useState<TrackGeometry | null>(null);
  const [followPaused, setFollowPaused] = useState(false);

  useEffect(() => () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  }, []);

  const pauseFollowing = () => {
    setFollowPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setFollowPaused(false), 1800);
  };

  const resumeFollowing = () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setFollowPaused(false);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!content.clientHeight || !content.clientWidth) return;
      const bounds = content.getBoundingClientRect();
      const links = Array.from(content.querySelectorAll<HTMLAnchorElement>("a"));
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const positions: TrackPosition[] = [];
      let d = "";
      links.forEach((link, index) => {
        const rect = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        const x = 8.5 + headings[index].depth * 12;
        const top = rect.top - bounds.top + parseFloat(style.paddingTop);
        const bottom = rect.bottom - bounds.top - parseFloat(style.paddingBottom);
        if (index === 0) d = `M ${x} ${top}`;
        else {
          const previous = positions[index - 1];
          d += ` C ${previous.x} ${previous.bottom + 6} ${x} ${top - 6} ${x} ${top}`;
        }
        path.setAttribute("d", d);
        const start = path.getTotalLength();
        d += ` L ${x} ${bottom}`;
        path.setAttribute("d", d);
        positions.push({ x, top, bottom, start, end: path.getTotalLength() });
      });
      const viewportHeight = viewportRef.current?.clientHeight ?? 0;
      setGeometry((previous) => previous?.d === d && previous.height === bounds.height &&
        previous.viewportHeight === viewportHeight
        ? previous : { d, height: bounds.height, viewportHeight, positions });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    if (viewportRef.current) observer.observe(viewportRef.current);
    content.querySelectorAll("a").forEach((item) => observer.observe(item));
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [headings]);

  useEffect(() => {
    if (followPaused) return;
    const frame = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (!viewport || !content || !viewport.clientHeight) return;
      const item = content.querySelectorAll("a")[direction === "up" ? startIndex : endIndex];
      if (!item) return;
      const bounds = viewport.getBoundingClientRect();
      const rect = item.getBoundingClientRect();
      const itemTop = viewport.scrollTop + rect.top - bounds.top - viewport.clientTop;
      const top = getTocScrollTop(
        viewport.scrollTop, viewport.clientHeight, itemTop,
        rect.height, viewport.scrollHeight
      );
      if (Math.abs(top - viewport.scrollTop) > 1) {
        viewport.scrollTo({ top, behavior: positionedRef.current && !reducedMotion ? "smooth" : "instant" });
      }
      positionedRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [headings, startIndex, endIndex, direction, geometry, reducedMotion, followPaused]);

  const first = geometry?.positions[startIndex];
  const last = geometry?.positions[endIndex];
  const arrowDistance = direction === "up" ? first?.start : last?.end;
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
        {geometry && first && last && (
          <li aria-hidden="true" className={styles.track}>
            <svg width="32" height={geometry.height} className={styles.trackSvg}>
              <defs><clipPath id={clipId}>
                <rect x="0" y={first.top} width="32" height={last.bottom - first.top} />
              </clipPath></defs>
              <path d={geometry.d} className={styles.trackBase} />
              <path d={geometry.d} clipPath={`url(#${clipId})`} className={styles.trackActive} />
            </svg>
            <span className={styles.arrow} data-direction={direction}
              style={{ offsetPath: `path("${geometry.d}")`, offsetDistance: `${arrowDistance ?? 0}px` }}>
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d={direction === "up" ? "M 1 5.5 L 4 2.5 L 7 5.5" : "M 1 2.5 L 4 5.5 L 7 2.5"} />
              </svg>
            </span>
          </li>
        )}
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <Link href={`#${encodeURIComponent(heading.id)}`} className={styles.item}
              style={{ paddingInlineStart: 24 + heading.depth * 12 }}
              aria-current={heading.id === currentId ? "location" : undefined}
              data-active={index >= startIndex && index <= endIndex}
              onClick={(event) => {
                if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
                  resumeFollowing();
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
    const media = window.matchMedia("(min-width: 1200px)");
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
