import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { MottoBlock } from "@/components/common/MottoBlock";
import { ParticlesWrapper } from "@/components/home/ParticlesWrapper";

const GitHubContribution = dynamic(
  () => import("@/components/home/GitHubContribution").then((m) => m.GitHubContribution)
);

const FeaturedProjects = dynamic(
  () => import("@/components/home/FeaturedProjects").then((m) => m.FeaturedProjects)
);

export default function HomePage() {
  return (
    <>
      <ParticlesWrapper />
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <HeroSection />
        <GitHubContribution />
        <FeaturedProjects />
        <MottoBlock text="知不足而奋进，望远山而前行" />
      </div>
    </>
  );
}
