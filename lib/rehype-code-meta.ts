interface Node {
  tagName?: string;
  data?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  children?: Node[];
}

// rehype-raw rebuilds nodes and drops code fence metadata used by Mermaid and
// pretty-code titles. Carry it through HTML parsing as a temporary attribute.
export function rehypeCodeMeta({ restore = false } = {}) {
  return (tree: Node) => {
    const walk = (node: Node) => {
      if (node.tagName === "code") {
        if (restore && typeof node.properties?.dataCodeMeta === "string") {
          node.data = { ...node.data, meta: node.properties.dataCodeMeta };
          delete node.properties.dataCodeMeta;
        } else if (!restore && typeof node.data?.meta === "string") {
          node.properties = { ...node.properties, dataCodeMeta: node.data.meta };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
