import type { Metadata } from "next";
import { RoadmapContent } from "./RoadmapContent";

export const metadata: Metadata = {
  title: "路线图",
  description: "学习计划与成长路线",
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
