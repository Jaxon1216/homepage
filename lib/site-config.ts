export const siteConfig = {
  name: "江旭",
  nameEn: "EastonJiang",
  avatar: "/avatar.jpg",
  title: "EastonJiang | Personal Site",
  description: "EastonJiang's personal site — blog, projects, and an online resume.",
  url: "https://jiangxu.net",
  github: "Jaxon1216",
  email: "jiangxu05@outlook.com",

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Resume", href: "/resume" },
    { label: "About", href: "/about" },
  ],

  footer: {
    contactLinks: [
      {
        label: "GitHub",
        href: "https://github.com/Jaxon1216",
        type: "github" as const,
      },
      {
        label: "jiangxu05@outlook.com",
        href: "mailto:jiangxu05@outlook.com",
        type: "email" as const,
      },
      {
        label: "Aweme",
        href: "https://v.douyin.com/WKSr3QRFYMQ/?utm_campaign=client_share&app=aweme&utm_medium=ios&tt_from=more&utm_source=more",
        type: "aweme" as const,
      },
    ],
    friendLinks: [
      { label: "🍔✌️ - God", href: "https://woleigefou.xyz" },
      { label: "困醒 - 全栈神", href: "https://kunxing-blog.top" },
      {
        label: "acye - 全栈神",
        href: "https://ye-guan-xing.github.io/",
      },
    ],
  },

  particles: {
    enabled: true,
    pages: ["/"],
    mobileParticleCount: 30,
    desktopParticleCount: 100,
  },
  projects: [
    {
      name: "Study Notes",
      description:
        "Notes on frontend, backend, and agents, including interview prep and tutorials.",
      tags: ["JavaScript", "Docs"],
      link: "https://notes.jiangxu.net",
      github: "https://github.com/Jaxon1216/notes",
      category: "ForStudy" as const,
    },
    {
      name: "Project Analyzer",
      description:
        "A skill that reads a codebase and writes a study path, plus the hard parts and highlights.",
      tags: ["python", "shell"],
      github: "https://github.com/Jaxon1216/interview-analyzer-skill",
      category: "ForStudy" as const,
    },
    {
      name: "GenBI",
      description: "An AI analytics platform that turns natural language into charts.",
      tags: ["React", "Spring Boot", "AI"],
      link: "",
      github: "https://github.com/Jaxon1216/genBI",
      category: "resume" as const,
    },
  ],

  projectCategories: [
    { key: "resume", label: "Resume" },
    { key: "vibecoding", label: "Vibe Coding" },
    { key: "ForStudy", label: "For Study" },
    { key: "Developing", label: "Developing" },
  ],
};

export type Project = (typeof siteConfig)["projects"][number];
