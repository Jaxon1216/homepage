// Website IDs and the script URL are public configuration, not credentials.
export const umamiConfig = {
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? '81d59058-21eb-4930-9426-5a685a3cb2e2',
  scriptUrl: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? 'https://umami.jiangxu.net/script.js',
  domains: ['jiangxu.net', 'www.jiangxu.net'],
  release: (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 12),
  exposure: process.env.NEXT_PUBLIC_ANALYTICS_EXPOSURE !== 'false',
  reading: process.env.NEXT_PUBLIC_ANALYTICS_READING !== 'false',
  diagnostics: process.env.NEXT_PUBLIC_ANALYTICS_DIAGNOSTICS === 'true',
};
