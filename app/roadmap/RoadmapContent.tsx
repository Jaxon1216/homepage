"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MottoBlock } from "@/components/common/MottoBlock";
import roadmapData from "@/content/roadmap.json";

export function RoadmapContent() {
  const [activeRoute, setActiveRoute] = useState(0);
  const route = roadmapData.routes[activeRoute];
  const nodes = route?.nodes ?? [];
  const total = nodes.length;
  const completed = nodes.filter((n) => n.completed).length;
  const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">路线图</h1>
      <MottoBlock text="知不足而奋进，望远山而前行" className="!py-4 !text-left" />

      {/* Goals */}
      {roadmapData.goals.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[var(--muted)] mb-2">宏观目标</p>
          <div className="flex flex-wrap gap-2">
            {roadmapData.goals.map((goal) => (
              <span
                key={goal}
                className="px-3 py-1 rounded-full text-sm bg-[var(--card)] border border-[var(--card-border)]"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Route tabs */}
      <div className="mb-6">
        <p className="text-xs text-[var(--muted)] mb-2">学习路线</p>
        <div className="flex flex-wrap gap-2">
          {roadmapData.routes.map((r, i) => (
            <button
              key={r.name}
              onClick={() => setActiveRoute(i)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeRoute === i
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <motion.div
        key={activeRoute}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {nodes.length === 0 ? (
          <p className="text-[var(--muted)] text-sm py-8">暂无学习节点</p>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)] mb-4">
              进度: {completed}/{total} ({rate}%)
            </p>

            <div className="flex flex-col">
              {nodes.map((node, i) => (
                <div key={`${node.title}-${i}`} className="flex gap-4">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1.5 border-2 transition-colors ${
                        node.completed
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--background)] border-[var(--card-border)]"
                      }`}
                    />
                    {i < nodes.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[40px] ${
                          node.completed
                            ? "bg-[var(--accent)]/40"
                            : "bg-[var(--card-border)]"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-medium text-sm ${
                          node.completed
                            ? "text-[var(--accent)] line-through"
                            : ""
                        }`}
                      >
                        {i + 1}. {node.title}
                      </span>
                      {node.tag && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent)]">
                          {node.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
