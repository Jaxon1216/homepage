import type { ReadingStage } from "@/lib/reading";

export const university = {
  key: "university",
  label: "大学阶段",
  labelEn: "University",
  period: "",
  premise: "高中读了很多“看世界”的书，大学目前开始读“怎么在世界里行动”的书。",
  clusters: [],
  summary: [],
  books: [
    {
      title: "这世界既残酷也温柔",
      author: "孙宇晨",
      progress: "finished",
      clusters: [],
      theme:
        "它更像个人成长、自传式的励志随笔，核心围绕主动选择、拥抱不确定性、个人奋斗、财富自由，以及互联网时代的机会。",
      takeaway:
        "世界不会因为你年轻就自动给你机会，但年轻最大的优势，是还有大量试错和主动选择的空间。",
    },
    {
      title: "毛泽东选集",
      author: "毛泽东",
      progress: "partial",
      clusters: [],
      theme:
        "只读了一部分，这里记成选读，不算读完。如果后面继续读，可以留意一种贯穿很多篇目的方法：不要只从抽象原则出发，而要调查现实、判断主要矛盾、根据具体条件决定行动。不同文章的时代背景和论述对象差别很大，不能收成一套现代通用规则。",
    },
  ],
} satisfies ReadingStage;
