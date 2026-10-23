import type { ComponentPropsWithoutRef } from "react";
import { Mermaid } from "./Mermaid";
import { ZoomableImage } from "./ZoomableImage";

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return <pre {...props} className={`${props.className ?? ""} not-prose`} />;
}

function Figure(
  props: ComponentPropsWithoutRef<"figure"> & {
    "data-rehype-pretty-code-figure"?: string;
  }
) {
  if ("data-rehype-pretty-code-figure" in props) {
    return <figure {...props} className="not-prose my-4" />;
  }
  return <figure {...props} />;
}

function Div(props: ComponentPropsWithoutRef<"div">) {
  if (
    props.className === "__mermaid__" &&
    typeof props.children === "string"
  ) {
    return <Mermaid chart={props.children} />;
  }
  return <div {...props} />;
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      className="table-wrapper"
      role="region"
      aria-label="表格，可左右滚动"
      tabIndex={0}
    >
      <table {...props} />
    </div>
  );
}

export const mdxComponents = {
  pre: Pre,
  figure: Figure,
  div: Div,
  img: ZoomableImage,
  table: Table,
  ArticleImage: ZoomableImage,
};
