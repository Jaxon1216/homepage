# Project showcase assets

## Sources checked on 2026-10-18

Metadata was read using `gh api` and `gh repo view` as the authenticated public account `Jaxon1216`. Only public repositories are represented.

- PomoTimer: [product specification](https://github.com/Jaxon1216/PomoTimer/blob/main/docs/product-spec.md), [renderer styles](https://github.com/Jaxon1216/PomoTimer/blob/main/apps/desktop/src/renderer/styles.css), [desktop dependencies](https://github.com/Jaxon1216/PomoTimer/blob/main/apps/desktop/package.json), [releases](https://github.com/Jaxon1216/PomoTimer/releases). Offline Electron/React/SQLite desktop timer; in-app brand POMODOT. Camera presence detection is not a current feature.
- Study Notes: [dependencies](https://github.com/Jaxon1216/notes/blob/main/package.json), [AI explanation guide](https://github.com/Jaxon1216/notes/blob/main/content/docs/dev/tools/ai-explain.mdx). Next.js/Fumadocs/TypeScript knowledge base with a text-selection AI explanation sidebar. The established [custom domain](https://notes.jiangxu.net) returned HTTP 200.
- Project Analyzer: [current README](https://github.com/Jaxon1216/interview-analyzer-skill/blob/main/README_EN.md), [package metadata](https://github.com/Jaxon1216/interview-analyzer-skill/blob/main/package.json). An agent skill and install CLI producing source-grounded resume points, lessons and interview answers. Older web UI images are explicitly historical.
- GenBI: [Go dependencies](https://github.com/Jaxon1216/GenBI/blob/main/backend/go.mod), [analysis UI](https://github.com/Jaxon1216/GenBI/blob/main/frontend/src/pages/AddChart/index.tsx), [dashboard](https://github.com/Jaxon1216/GenBI/blob/main/frontend/src/pages/Dashboard/index.tsx). React/Go/ECharts; the old Spring Boot mention is stale. No verified public demo was found.

## Asset production

These are illustrated product concepts based on current features, not screenshots. Generated with the built-in ImageGen tool, then resized and encoded as 1440 × 960 WebP images using Sharp. The image ratio is 3:2; matching card containers reserve layout space. Next Image supplies responsive variants and lazy loading. All meaningful project information and actions remain HTML text.

Final assets live in `public/images/projects/`. The four files are `pomotimer.webp`, `study-notes.webp`, `project-analyzer.webp`, and `genbi.webp`.

## Verification

- `npm run build`: passed; all 23 routes generated.
- `npx tsc --noEmit`: passed.
- `npm run lint`: no errors; the existing unused `clsx` warning in `lib/utils.ts` remains.
- Browser checks used the production server at 1440 × 1000, 390 × 844, and 740 × 320. Desktop renders two columns, mobile one column, with no horizontal overflow. All four image resources loaded successfully. Light and dark themes and visible keyboard focus were inspected.
- A 10% section visibility threshold hid the tall gallery on short landscape viewports. Reproduced at 740 × 320, then changed the trigger to `amount: "some"`; the same production check confirmed opacity returns to 1.
- The original project impression and click attributes remain; release/source links use the GitHub destination and Notes uses the demo destination.
- Independent code and asset review found no remaining required changes.

## Final prompts

### pomotimer

Use case: ui-mockup. Create one polished product illustration for a developer portfolio project card, landscape 3:2 aspect ratio, 1536 by 1024. Product: PomoTimer, an offline Electron focus timer whose in-app brand is POMODOT. Faithful core UI: a small ivory desktop application window with rounded corners, thin coral circular progress ring, very large monospaced '30:00' centered, small 'FOCUS' caption, three simple round play / skip / reset icons beneath, small daily activity bars and a compact desktop timer widget overlapping near lower right. Window brand text exactly 'POMODOT'. Background warm cream #f4f1eb, near black #242321, coral #e4584f, soft peach shadows. Art direction: refined editorial product showcase, almost front-on orthographic window, slight 3D paper depth, sharp legible primary typography, generous negative space around window. Main window occupies central 76% width and 74% height, leave safe margin all sides for card cropping. No laptop or physical desk, no people, no tomato objects, no invented scores or AI features, no marketing headings, no watermark. This is a concept illustration of the product interface, not a photograph.

### study-notes

Use case: ui-mockup. Create one polished editorial product illustration for a personal developer portfolio card, landscape 3:2 aspect ratio, 1536 by 1024. Product: Easton Notes, a Next.js and Fumadocs personal developer knowledge base covering Frontend, Backend, Algorithms and Agents, with text-selection AI explanation. Show one carefully composed front-facing browser-like white documentation window with subtle rounded corners floating on very pale mint background. Window top brand exactly 'Easton Notes', left narrow navigation tree with simple short labels 'Frontend', 'Backend', 'Algorithms', 'Agents'; center clean article titled 'React Hooks' with short abstract body lines and a beautiful dark syntax-highlighted small code block; right a small pale mint assistant panel labeled 'Explain' with a few short abstract lines and tasteful sparkle icon. Pale mint #eaf4ef, deep forest #17493b, slate text, small teal accents. Sharp interface, crisp edges, quiet soft shadows, subtle paper depth, premium software editorial aesthetic, not heavy gradients. Main window occupies central 80% width, around 72% height, generous safe outer margins on every side for responsive crop. No laptop, no desk, no human, no extra labels outside UI, no fake usage numbers, no watermark.

### project-analyzer

Use case: ui-mockup. Create one refined concept product illustration for a developer portfolio project card, landscape 3:2 aspect ratio, 1536 by 1024. Product: Project Analyzer, an agent skill that reads a real source-code repository then generates a resume brief, source-code course and interview Q&A documents; it has NO web dashboard. Show a dark navy terminal/code editor window on the left and three crisp white Markdown document sheets fanning gently to the right, connected by a thin precise blue arrow. Terminal has restrained syntax-highlighted abstract code lines, folder-tree strokes and a single clear prompt text '> analyze project'. Document sheet titles exactly 'Resume', 'Source Guide', 'Interview Q&A'; beneath use tiny abstract horizontal lines, a small code snippet and neat bullet dots, no long unreadable paragraphs. Ice blue #edf3ff background, ink navy #17243f, cobalt #3867d6 highlights. Almost front-on with a very mild paper perspective, considered negative space, soft realistic shadows, crisp well-designed editorial product aesthetic. All objects occupy the central 80% of canvas width and 72% height with safe margins. No browser navigation, no fake charts or web dashboard, no laptop, no people, no external marketing text, no watermark.

### genbi

Use case: ui-mockup. Create one polished product concept illustration for a developer portfolio project card, landscape 3:2 aspect ratio, 1536 by 1024. Product: GenBI, a React and Go AI data analysis application: upload spreadsheet, type analysis goal, generate ECharts charts and an analysis summary, organize charts in a dashboard. Show a single front-facing modern web application window with clean ivory white content on a deep midnight-blue studio backdrop #15263b. In window header text exactly 'GenBI'. Left compact navigation column with simple icons and short text 'Analyze', 'Charts', 'Dashboard'. Main workspace: small spreadsheet upload tile at upper left with green sheet icon, input bar with text 'Analyze sales trends', central blue bar chart beside a clear blue/teal line chart, bottom compact analysis insight card using abstract text lines. Balanced professional Ant Design-style spacing, blue #467cf2 accents and subtle cyan. Window occupies central 80% width and 72% height, all key content within safe margins. Quiet architectural soft shadow, crisp orthographic UI, refined editorial composition with subtle depth. No fake KPI or revenue numbers, no customer logos, no laptop, no people, no extra marketing text outside window, no watermark.
