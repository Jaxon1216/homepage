import { HeroSection } from "@/components/home/HeroSection";
import { GitHubContribution } from "@/components/home/GitHubContribution";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { MottoBlock } from "@/components/common/MottoBlock";
import { ParticlesWrapper } from "@/components/home/ParticlesWrapper";

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
