"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    const existing = ref.current.querySelector("iframe.giscus-frame");
    if (existing) {
      existing.remove();
    }
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "Jaxon1216/homepage");
    script.setAttribute("data-repo-id", "R_kgDORdXyGA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDORdXyGM4C3mRl");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute(
      "data-theme",
      resolvedTheme === "dark" ? "dark" : "light"
    );
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, [resolvedTheme]);

  return <div ref={ref} className="mt-12" />;
}
