export const siteConfig = {
  name: "江旭",
  nameEn: "EastonJiang",
  avatar: "/avatar1.jpg",
  title: "江旭 | 个人网站",
  description: "江旭的个人网站 - 技术博客、项目展示、在线简历",
  url: "https://jiangxu.net",
  github: "Jaxon1216",
  email: "jiangxu05@outlook.com",

  nav: [
    { label: "首页", href: "/" },
    { label: "博客", href: "/blog" },
    { label: "简历", href: "/resume" },
    { label: "关于", href: "/about" },
  ],

  footer: {
    links: [
      { label: "GitHub", href: "https://github.com/Jaxon1216" },
      { label: "TikTok", href: "https://www.tiktok.com/@jaxon1216" },
    ],
    friendLinks: [] as { label: string; href: string }[],
  },

  particles: {
    enabled: true,
    pages: ["/"],
    mobileParticleCount: 30,
    desktopParticleCount: 100,
  },

  social: [
    { label: "GitHub", href: "https://github.com/Jaxon1216" },
    { label: "Email", href: "mailto:jiangxu05@outlook.com" },
    { label: "Blog", href: "https://www.jiangxu.net/" },
    { label: "Notes", href: "https://notes.jiangxu.net/" },
    { label: "TikTok", href: "https://www.tiktok.com/@jaxon1216" },
  ],

  projects: [
    {
      name: "个人博客网站",
      description:
        "基于 Next.js 构建的个人网站，支持 MDX 博客、在线简历等功能",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      link: "https://jiangxu.net",
      github: "https://github.com/Jaxon1216/homepage",
      category: "Developing" as const,
    },
    {
      name: "TodoMVC 框架对比",
      description:
        "通过同一个 TodoMVC 项目，对比 Vanilla JS、Vue 和 React 的实现差异",
      tags: ["TypeScript", "Vue", "React"],
      link: "todo.jiangxu.net",
      github: "https://github.com/Jaxon1216/todomvc",
      category: "ForStudy" as const,
    },
    {
      name: "学习笔记站",
      description: "个人学习笔记整理与分享",
      tags: ["JavaScript", "文档"],
      link: "https://notes.jiangxu.net",
      github: "https://github.com/Jaxon1216/notes",
      category: "ForStudy" as const,
    },
    {
      name: "自习室 (Learning Duel)",
      description:
        "在线学习路线管理工具，支持多人查看、路线追踪、进度统计",
      tags: ["Next.js", "Supabase", "TypeScript"],
      link: "https://fc.jiangxu.net",
      github: "https://github.com/Jaxon1216/learning-duel",
      category: "ForStudy" as const,
    },
    {
      name: "悟空的朋友圈",
      description: "基于 OpenClaw 框架的 AI 私人助手「悟空」的朋友圈展示页面",
      tags: ["AI", "Telegram", "OpenClaw"],
      link: "https://wk.jiangxu.net",
      github: "https://github.com/Jaxon1216/wkmoments",
      category: "vibecoding" as const,
    },
    {
      name: "烟花祝福",
      description: "烟花祝福动画页面，名字逐个浮现 + 自定义祝福语，适用于各种节日场景",
      tags: ["TypeScript", "动画"],
      link: "",
      github: "https://github.com/Jaxon1216/fireworks-wishes",
      category: "vibecoding" as const,
    },
    {
      name: "Vue3 Rabbit",
      description: "基于 Vue 3 的电商实战项目",
      tags: ["Vue 3", "JavaScript"],
      link: "",
      github: "https://github.com/Jaxon1216/vue3rabbit",
      category: "resume" as const,
    },
    {
      name: "GenBI 智能数据分析平台",
      description: "基于 AI 的智能数据分析与可视化平台，支持自然语言生成图表",
      tags: ["React", "Spring Boot", "AI"],
      link: "",
      github: "https://github.com/Jaxon1216/genBI",
      category: "resume" as const,
    },
    {
      name: "MathModelHub",
      description: "美赛/ICM 综合准备资源库，包含数学建模代码、模板和数据分析笔记",
      tags: ["Python", "Jupyter", "数学建模"],
      link: "",
      github: "https://github.com/Jaxon1216/MathModelHub",
      category: "vibecoding" as const,
    },
    {
      name: "SXMap",
      description: "地图应用项目",
      tags: ["JavaScript", "地图"],
      link: "",
      github: "https://github.com/Jaxon1216/sxmap",
      category: "vibecoding" as const,
    },
  ],

  projectCategories: [
    { key: "resume", label: "简历项目" },
    { key: "vibecoding", label: "Vibe Coding" },
    { key: "ForStudy", label: "For Study" },
    { key: "Developing", label: "Developing" },
  ],
};

export type Project = (typeof siteConfig)["projects"][number];
