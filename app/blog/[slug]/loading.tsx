export default function BlogPostLoading() {
  return (
    <div className="blog-reading-shell animate-pulse" aria-busy="true" aria-label="Loading article">
      <div className="blog-reading-layout" aria-hidden="true">
        <div className="blog-reading-heading">
          <div className="h-4 w-28 rounded bg-[var(--card)] mb-5" />

          <div className="blog-reading-header">
            <div className="h-20 sm:h-12 w-4/5 mx-auto rounded bg-[var(--card)]" />
            <div className="h-5 w-48 mx-auto mt-3 rounded bg-[var(--card)]" />
          </div>
        </div>

        <div className="article-toc-mobile">
          <div className="h-11 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)]" />
        </div>
        <div className="blog-reading-main space-y-4">
          <div className="h-4 w-full rounded bg-[var(--card)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--card)]" />
          <div className="h-4 w-full rounded bg-[var(--card)]" />
          <div className="h-4 w-4/6 rounded bg-[var(--card)]" />

          <div className="h-6 w-1/3 rounded bg-[var(--card)] mt-8" />

          <div className="h-4 w-full rounded bg-[var(--card)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--card)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--card)]" />

          <div className="h-32 w-full rounded-lg bg-[var(--card)] border border-[var(--card-border)] mt-4" />

          <div className="h-4 w-full rounded bg-[var(--card)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--card)]" />
        </div>
        <aside className="article-toc-desktop blog-reading-skeleton-toc space-y-3">
          <div className="h-3 w-16 rounded bg-[var(--card)] mb-5" />
          <div className="h-3 w-4/5 rounded bg-[var(--card)]" />
          <div className="h-3 w-3/5 rounded bg-[var(--card)] ml-3" />
          <div className="h-3 w-4/5 rounded bg-[var(--card)] ml-3" />
          <div className="h-3 w-2/3 rounded bg-[var(--card)]" />
        </aside>
      </div>
    </div>
  );
}
