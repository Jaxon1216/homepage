export const siteConfig = {
  name: "江旭",
  nameEn: "Jaxon",
  title: "江旭 | 个人网站",
  description: "江旭的个人网站 - 技术博客、项目展示、在线简历",
  url: "https://jiangxu.net",
  github: "Jaxon1216",
  email: "",
  
  nav: [
    { label: "首页", href: "/" },
    { label: "博客", href: "/blog" },
    { label: "简历", href: "/resume" },
    { label: "路线图", href: "/roadmap" },
    { label: "关于", href: "/about" },
  ],

  footer: {
    links: [
      { label: "GitHub", href: "https://github.com/Jaxon1216" },
    ],
    friendLinks: [] as { label: string; href: string }[],
  },

  particles: {
    enabled: true,
    pages: ["/"], // which pages show particles background
    mobileParticleCount: 30,
    desktopParticleCount: 100,
  },

  projects: [
    {
      name: "个人博客网站",
      description: "基于 Next.js 14 构建的个人网站，支持 MDX 博客、在线简历、路线图等功能",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      link: "https://jiangxu.net",
      github: "https://github.com/Jaxon1216/myblog-next",
      category: "resume" as const,
    },
  ],

  projectCategories: [
    { key: "resume", label: "简历项目" },
    { key: "vibecoding", label: "Vibe Coding" },
  ],
};

export type Project = (typeof siteConfig)["projects"][number];
