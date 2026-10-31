"use client";

import { mediaId, trackEvent } from "@/lib/analytics/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { FiMaximize2 } from "react-icons/fi";
import { Lightbox } from "./ZoomableImage";
import { academicMermaidConfig } from "@/lib/mermaid-theme";

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const trackedId = useRef("");
  const close = useCallback((reason: "escape" | "overlay" | "button") => {
    trackEvent("media_close", { media_type: "mermaid", media_id: trackedId.current, reason });
    setOpen(false);
  }, []);
  const openDiagram = (element: Element) => {
    if (open) return;
    trackedId.current = mediaId(element);
    setOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize(academicMermaidConfig(resolvedTheme === "dark"));
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      return mermaid.render(id, chart.trim()).then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setFailed(false);
        }
      });
    }).catch(() => {
      if (!cancelled) {
        setFailed(true);
        trackEvent("resource_error", { resource_type: "mermaid", resource_id: "diagram", error_code: "render_failed" }, "mermaid-render");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme]);

  const Container = caption ? "figure" : "div";
  return (
    <>
      <Container className="article-figure mermaid-figure">
        <div className="group relative">
          {!svg ? (
            <div className="mermaid-placeholder" role={failed ? "status" : undefined}
              aria-hidden={failed ? undefined : true}>
              {failed ? "图表暂时无法显示，请刷新重试。" : null}
            </div>
          ) : (
            <div
              className="mermaid-viewport cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              data-analytics-media="mermaid"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={caption ? `放大查看：${caption}` : "放大查看图表"}
              onClick={(event) => openDiagram(event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDiagram(event.currentTarget);
                }
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
          {svg && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white opacity-80 shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
            >
              <FiMaximize2 size={14} />
            </span>
          )}
        </div>
        {caption && <figcaption>{caption}</figcaption>}
      </Container>
      {open
        ? createPortal(
            <Lightbox svg={svg} alt={caption ?? "图表"} onClose={close} />,
            document.body
          )
        : null}
    </>
  );
}
