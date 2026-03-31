import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { Mermaid } from "./Mermaid";

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const child = props.children as ReactElement<{
    className?: string;
    children?: string;
  }>;

  if (
    child?.props?.className === "language-mermaid" &&
    typeof child.props.children === "string"
  ) {
    return <Mermaid chart={child.props.children} />;
  }

  return <pre {...props} />;
}

export const mdxComponents = {
  pre: Pre,
};
