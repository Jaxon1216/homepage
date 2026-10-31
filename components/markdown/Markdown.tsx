import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import { rehypeCodeMeta } from "@/lib/rehype-code-meta";
import { rehypeArticleCaptions } from "@/lib/rehype-article-captions";
import { rehypeMermaid } from "@/lib/rehype-mermaid";
import { markdownComponents } from ".";

// Articles are trusted repository content. Parse embedded HTML so details/summary
// remain native elements, while Markdown inside them is rendered normally.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeCodeMeta)
  .use(rehypeRaw)
  .use(() => rehypeCodeMeta({ restore: true }))
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings)
  .use(rehypeMermaid)
  .use(rehypePrettyCode, {
    theme: { dark: "one-dark-pro", light: "github-light" },
    keepBackground: false,
  })
  .use(rehypeArticleCaptions)
  .use(rehypeReact, { Fragment, jsx, jsxs, components: markdownComponents });

export async function Markdown({ source }: { source: string }) {
  const file = await processor.process(source);
  return file.result;
}
