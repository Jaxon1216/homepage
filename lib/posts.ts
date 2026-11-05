import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export const POST_TAG_ALLOWLIST = [
  "大前端",
  "agent",
  "学生思维",
  "服务端",
] as const;

export type PostTag = (typeof POST_TAG_ALLOWLIST)[number];

const POST_TAG_SET = new Set<string>(POST_TAG_ALLOWLIST);

type PostStatus = "draft" | "published";

function parsePostStatus(slug: string, status: unknown = "draft"): PostStatus {
  if (status === "draft" || status === "published") return status;
  throw new Error(`[${slug}] 非法 status: ${String(status)}。请使用 draft 或 published。`);
}

function assertAllowedTags(slug: string, tags: string[]): string[] {
  const invalid = tags.filter((tag) => !POST_TAG_SET.has(tag));
  if (invalid.length > 0) {
    throw new Error(
      `[${slug}] 非法 tag: ${invalid.join(", ")}。准出列表：${POST_TAG_ALLOWLIST.join(" / ")}`
    );
  }
  return tags;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  cover?: string;
  readingTime: string;
  readingSeconds: number;
}

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

function resolveCover(data: Record<string, unknown>, content: string): string | undefined {
  if (data.cover === false || data.cover === "") return undefined;
  if (typeof data.cover === "string" && data.cover.trim()) {
    return data.cover.trim();
  }
  return content.match(MARKDOWN_IMAGE_RE)?.[1];
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const posts: PostMeta[] = [];
  for (const filename of fs.readdirSync(postsDirectory)) {
    if (!filename.endsWith(".md")) continue;
    const post = getPostBySlug(path.basename(filename, ".md"));
    if (post) posts.push(post.meta);
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const status = parsePostStatus(slug, data.status);
  const tags = assertAllowedTags(slug, data.tags || []);
  if (status === "draft") return null;

  const stats = readingTime(content);

  return {
    meta: {
      slug,
      title: data.title || slug,
      date: data.date || "",
      description: data.description || "",
      tags,
      cover: resolveCover(data, content),
      readingTime: stats.text,
      readingSeconds: stats.time / 1000,
    },
    content,
  };
}

export function getAllTags(): string[] {
  const used = new Set(getAllPosts().flatMap((post) => post.tags));
  return POST_TAG_ALLOWLIST.filter((tag) => used.has(tag));
}
