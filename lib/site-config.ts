export const siteConfig = {
  name: "江旭",
  nameEn: "EastonJiang",
  avatar: "/avatar.jpg",
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
      name: "学习笔记站",
      description: "个人学习笔记整理与分享，包含前端服务端agent的八股面经和教程",
      tags: ["JavaScript", "文档"],
      link: "https://notes.jiangxu.net",
      github: "https://github.com/Jaxon1216/notes",
      category: "ForStudy" as const,
    },
    {
      name: "项目分析-Skill",
      description:
        "该skill通过系统分析项目结构与内容，会产出项目分析报告，包含项目的学习路线、项目的难点亮点等",
      tags: ["python", "shell"],
      github: "https://github.com/Jaxon1216/interview-analyzer-skill",
      category: "ForStudy" as const,
    },
    {
      name: "GenBI 智能数据分析平台",
      description: "基于 AI 的智能数据分析与可视化平台，支持自然语言生成图表",
      tags: ["React", "Spring Boot", "AI"],
      link: "",
      github: "https://github.com/Jaxon1216/genBI",
      category: "Resume" as const,
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
