const xUrl = "https://x.com/EastonJiang05";

export const siteConfig = {
  name: "江旭",
  nameEn: "EastonJiang",
  avatar: "/avatar.jpg",
  title: "EastonJiang | Personal Site",
  description: "EastonJiang's personal site — blog, projects, and an online resume.",
  url: "https://jiangxu.net",
  github: "Jaxon1216",
  email: "jiangxu05@outlook.com",
  x: xUrl,

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Resume", href: "/resume" },
    { label: "Inner World", href: "/inner-world" },
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
        label: "X",
        href: xUrl,
        type: "x" as const,
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
      { label: "地山谦", href: "https://dishanqian-blog.pages.dev/" },
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
      id: "pomotimer",
      name: "PomoTimer",
      kind: "Desktop app",
      description:
        "An offline focus timer with automatic idle detection, a desktop widget, and a record of time well spent.",
      tags: ["Electron", "React", "SQLite"],
      preview: "/images/projects/pomotimer.webp",
      previewAlt: "Illustrated PomoTimer desktop window with a coral focus ring and a compact timer widget.",
      link: "https://github.com/Jaxon1216/PomoTimer/releases",
      linkLabel: "Download app",
      github: "https://github.com/Jaxon1216/PomoTimer",
      category: "vibecoding" as const,
    },
    {
      id: "study-notes",
      name: "Study Notes",
      kind: "Knowledge base",
      description:
        "A growing developer knowledge base, from frontend to agents, with an AI sidebar to explain as you read.",
      tags: ["Next.js", "Fumadocs", "TypeScript"],
      preview: "/images/projects/study-notes.webp",
      previewAlt: "Illustrated Easton Notes documentation with a navigation tree, code example, and AI explanation sidebar.",
      link: "https://notes.jiangxu.net",
      linkLabel: "Visit site",
      github: "https://github.com/Jaxon1216/notes",
      category: "ForStudy" as const,
    },
    {
      id: "project-analyzer",
      name: "Project Analyzer",
      kind: "Agent skill",
      description:
        "Turn a real codebase into resume highlights, a source-code learning path, and interview answers grounded in the project.",
      tags: ["Agent Skills", "Node.js", "Python"],
      preview: "/images/projects/project-analyzer.webp",
      previewAlt: "Concept illustration of a code terminal producing resume, source guide, and interview Markdown documents.",
      link: "",
      linkLabel: "",
      github: "https://github.com/Jaxon1216/interview-analyzer-skill",
      category: "ForStudy" as const,
    },
    {
      id: "genbi",
      name: "GenBI",
      kind: "AI analytics",
      description: "Upload a spreadsheet, describe your question, and turn data into AI-generated charts, insights, and dashboards.",
      tags: ["React", "Go", "ECharts"],
      preview: "/images/projects/genbi.webp",
      previewAlt: "Illustrated GenBI workspace with a spreadsheet upload, analysis prompt, bar chart, and line chart.",
      link: "",
      linkLabel: "",
      github: "https://github.com/Jaxon1216/GenBI",
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
