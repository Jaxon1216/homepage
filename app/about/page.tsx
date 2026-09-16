import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About",
  description: "More about EastonJiang",
};

export default function AboutPage() {
  return <AboutContent />;
}
