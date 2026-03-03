import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "关于我",
  description: "了解更多关于江旭的信息",
};

export default function AboutPage() {
  return <AboutContent />;
}
