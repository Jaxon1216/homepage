/**
 * Number article figures in source order and give tables their own sequence.
 * Run after Mermaid extraction and pretty-code so code figures stay untouched.
 */

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

interface InlineSegment {
  node: HastNode;
  image?: HastNode;
}

function tagName(node: HastNode): string | undefined {
  return node.type === "element" ? node.tagName : undefined;
}

function property(node: HastNode, name: string): unknown {
  return node.properties?.[name];
}

function text(node: HastNode): string {
  return node.type === "text" ? node.value ?? "" :
    node.children?.map(text).join("") ?? "";
}

function title(node: HastNode): string {
  for (const name of ["title", "alt"]) {
    const value = property(node, name);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isImage(node: HastNode): boolean {
  const name = tagName(node);
  return name === "img";
}

function isMermaid(node: HastNode): boolean {
  if (tagName(node) !== "div") return false;
  const classes = property(node, "className");
  return Array.isArray(classes) ? classes.includes("__mermaid__") :
    typeof classes === "string" && classes.split(/\s+/).includes("__mermaid__");
}

function isCodeFigure(node: HastNode): boolean {
  return tagName(node) === "figure" &&
    Object.prototype.hasOwnProperty.call(node.properties ?? {}, "data-rehype-pretty-code-figure");
}

function hasMedia(node: HastNode): boolean {
  return isImage(node) || isMermaid(node) ||
    (node.children?.some(hasMedia) ?? false);
}

function suppressNestedMermaidCaption(node: HastNode) {
  if (isMermaid(node) && node.properties) {
    delete node.properties["data-caption"];
    delete node.properties.dataCaption;
  }
  node.children?.forEach(suppressNestedMermaidCaption);
}

function caption(label: "图" | "表", number: number, value: string): string {
  return `${label} ${number}${value ? `\u3000${value}` : ""}`;
}

function element(name: string, children: HastNode[], properties: Record<string, unknown> = {}): HastNode {
  return { type: "element", tagName: name, properties, children };
}

function textNode(value: string): HastNode {
  return { type: "text", value };
}

/** Split phrasing wrappers too, keeping links and emphasis around their media. */
function splitInline(node: HastNode): InlineSegment[] {
  if (isImage(node)) return [{ node, image: node }];
  if (!node.children?.length || ["code", "pre", "figure", "figcaption"].includes(tagName(node) ?? "")) {
    return [{ node }];
  }

  const segments = node.children.flatMap(splitInline);
  if (!segments.some((segment) => segment.image)) return [{ node }];

  const result: InlineSegment[] = [];
  let inline: HastNode[] = [];
  const flush = () => {
    if (inline.length) result.push({ node: { ...node, children: inline } });
    inline = [];
  };
  for (const segment of segments) {
    if (segment.image) {
      flush();
      result.push({ node: { ...node, children: [segment.node] }, image: segment.image });
    } else {
      inline.push(segment.node);
    }
  }
  flush();
  return result;
}

function tableTitle(node: HastNode): string | undefined {
  if (tagName(node) !== "p") return undefined;
  return text(node).trim().match(/^表[：:]\s*(\S[\s\S]*)$/)?.[1].trim();
}

function isWhitespace(node: HastNode): boolean {
  return node.type === "text" && !(node.value ?? "").trim();
}

export function rehypeArticleCaptions() {
  return (tree: HastNode) => {
    let figureNumber = 0;
    let tableNumber = 0;

    const figure = (media: HastNode, image: HastNode) => element("figure", [
      media,
      element("figcaption", [textNode(caption("图", ++figureNumber, title(image)))]),
    ], { className: ["article-figure"] });

    const walk = (parent: HastNode) => {
      if (!parent.children) return;
      const next: HastNode[] = [];

      for (const node of parent.children) {
        const name = tagName(node);
        if (isCodeFigure(node) || ["pre", "code", "figcaption", "caption", "h1", "h2", "h3", "h4", "h5", "h6"].includes(name ?? "")) {
          next.push(node);
          continue;
        }

        // Author-owned figures retain their own structure and caption. Reserve
        // one figure number, and keep Mermaid's client renderer from nesting one.
        if (name === "figure") {
          if (hasMedia(node)) figureNumber++;
          suppressNestedMermaidCaption(node);
          next.push(node);
          continue;
        }

        if (isMermaid(node)) {
          const value = property(node, "data-caption") ?? property(node, "dataCaption");
          node.properties = {
            ...node.properties,
            "data-caption": caption("图", ++figureNumber, typeof value === "string" ? value.trim() : ""),
          };
          next.push(node);
          continue;
        }

        if (name === "p") {
          const segments = node.children?.flatMap(splitInline) ?? [];
          if (segments.some((segment) => segment.image)) {
            let inline: HastNode[] = [];
            const flush = () => {
              if (inline.some((child) => !isWhitespace(child))) next.push({ ...node, children: inline });
              inline = [];
            };
            for (const segment of segments) {
              if (segment.image) {
                flush();
                next.push(figure(segment.node, segment.image));
              } else {
                inline.push(segment.node);
              }
            }
            flush();
            continue;
          }
        }

        if (isImage(node)) {
          next.push(figure(node, node));
          continue;
        }

        if (name === "table") {
          tableNumber++;
          if (!node.children?.some((child) => tagName(child) === "caption")) {
            let sourceIndex = next.length - 1;
            while (sourceIndex >= 0 && isWhitespace(next[sourceIndex])) sourceIndex--;
            const value = sourceIndex >= 0 ? tableTitle(next[sourceIndex]) : undefined;
            if (value) next.splice(sourceIndex, 1);
            node.children = [
              element("caption", [element("span", [textNode(caption("表", tableNumber, value ?? ""))], {
                className: ["article-table-caption"],
              })]),
              ...node.children ?? [],
            ];
          }
        }

        walk(node);
        next.push(node);
      }
      parent.children = next;
    };

    walk(tree);
  };
}
