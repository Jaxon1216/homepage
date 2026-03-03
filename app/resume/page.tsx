import type { Metadata } from "next";
import { ResumeContent } from "./ResumeContent";

export const metadata: Metadata = {
  title: "在线简历",
  description: "江旭的在线简历",
};

export default function ResumePage() {
  return <ResumeContent />;
}
