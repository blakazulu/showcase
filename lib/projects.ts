import type { Project } from "./types";

// `slug` is hand-authored per entry (it is the canonical URL segment used for
// routing) — it is NOT derived from `name`. Some slugs intentionally differ
// from a naive kebab-case of the name (e.g. "MortgageFix (משכנתFix)" →
// "mortgagefix"). The `slug()` helper exists only to validate URL-safety/
// uniqueness in tests, not to generate these.
//
// Copy model (truthful marketing — real features only, no invented claims):
//   tagline = hook (punchy one-liner) · short = one-sentence pitch (row summaries) ·
//   desc = long paragraph (detail pages + the expanded project row).
export const PROJECTS: Project[] = [
  { name: "CYCLE", slug: "cycle", tagline: "Your cyberpunk HIIT command center", date: "2026-06-21",
    cats: ["Web App"], vis: "Public", icon: "⏱️",
    short: "An installable, offline-first interval timer with built-in plans and its own music engine.",
    desc: "Push harder, track sharper. CYCLE is an offline-first PWA built for high-intensity training — a precision interval timer with 12 ready-made plans, a custom builder spanning 26 segment types, smart repetition, and authentic boxing-gym cues. Fuel the session with a 180+ track curated music library and live search. No app store, no setup — install it and go.",
    tech: ["Vite","Vanilla JS","Tailwind v4","Netlify Functions","Web Audio API","PWA"],
    live: "https://workouttimerpro.netlify.app", github: "https://github.com/blakazulu/Workout-Timer" },

  { name: "New Home Owner", slug: "new-home-owner", tagline: "Buy your apartment without losing your mind", date: "2026-06-19",
    cats: ["AI","Web App"], vis: "Private", icon: "🏠",
    short: "An AI command center that runs your entire Israeli apartment purchase from one dashboard.",
    desc: `Buying a home in Israel is chaos — New Home Owner (“הדירה שלי”) turns it into one calm dashboard. AI auto-classifies your contracts, payment confirmations and mortgage documents; a timeline tracks every payment from lottery draw to key handover; an AI assistant answers your purchase questions; and floor plans become 3D renders. Built on Google Cloud with passwordless sign-in and encryption. Hebrew, RTL, in beta.`,
    tech: ["TypeScript","Google Cloud","AI","Google Auth","RTL"],
    live: "https://new-home-owner.online" },

  { name: "ChatHop", slug: "chathop", tagline: "WhatsApp anyone — skip the save", date: "2026-06-09",
    cats: ["Web App"], vis: "Private", icon: "💬",
    short: "Type any number and jump straight into a WhatsApp chat — no new contact required.",
    desc: "Stop polluting your contacts for a one-off message. ChatHop opens a WhatsApp conversation with any phone number instantly — just type it and hop straight in. A tiny, no-friction utility, now on the web and as an Android app.",
    tech: ["HTML","JavaScript","Android"],
    live: "https://chathop.netlify.app",
    play: "https://play.google.com/store/apps/details?id=com.chathop.app&hl=en" },

  { name: "חשבונייה (Math Practice)", slug: "math-practice", tagline: "Ace the gifted-math entrance exam", date: "2026-05-18",
    cats: ["Education","Web App"], vis: "Public", icon: "➗",
    short: "Hebrew practice app that preps 6th graders for the gifted-math exam — 497 questions, 7 mock tests.",
    desc: "Serious prep, zero pressure. חשבונייה gets Israeli 6th graders ready for the gifted-math entrance exam with 497 original questions across 23 topics, 7 full mock exams, graduated hints, 60-minute timed tests, and a personal mistake-review queue that turns errors into mastery. Multi-user local profiles, Hebrew RTL, completely free and stored on-device.",
    tech: ["TypeScript","RTL","Local-first"],
    live: "https://adv-math-practice.netlify.app", github: "https://github.com/blakazulu/math-practice" },

  { name: "Az Ma Kore", slug: "az-ma-kore", tagline: "Make sense of the sirens", date: "2026-04-06",
    cats: ["Web App"], vis: "Private", icon: "🚨",
    short: "A dashboard that turns Israel's Home Front Command alert data into clear, city-level patterns.",
    desc: `When the sirens blur together, Az Ma Kore (“אז מה קורה”) brings clarity. It analyses Israel's Home Front Command (Pikud HaOref) alert data and visualises the patterns by city — response times, quiet windows and real-time alert info — so people can understand what's happening around them. Hebrew, RTL. Analysis only, never a substitute for official guidance.`,
    tech: ["JavaScript","Pikud HaOref data","RTL"],
    live: "https://az-ma-kore.netlify.app" },

  { name: "Lumi Kid", slug: "lumi-kid", tagline: "An AI English tutor kids actually enjoy", date: "2026-03-16",
    cats: ["Education","AI","Web App"], vis: "Private", icon: "🎓",
    short: "Personalised AI English practice for grades 3–7, with built-in Meitzav exam prep.",
    desc: `Meet “Lumi” — an AI-powered English tutor for children in grades 3–7. It adapts practice to each child and builds toward Meitzav, Israel's standardised English assessment, so progress feels like play instead of pressure. Hebrew RTL interface, made for young learners.`,
    tech: ["TypeScript","AI","RTL"],
    live: "https://lumi-kid.netlify.app" },

  { name: "Past Palette", slug: "past-palette", tagline: "See the ancient world in full color", date: "2026-02-07",
    cats: ["AI","Web App"], vis: "Public", icon: "🎨",
    short: "Photograph an artifact and let AI reconstruct its original, historically-grounded colors.",
    desc: "History wasn't beige. Past Palette reconstructs the original colors of archaeological artifacts: photograph a piece, pick a culture — Egyptian, Roman, Greek or Mesopotamian — and Google Gemini generates a historically-grounded colorized version you can explore with a before/after slider. Available in English and Hebrew.",
    tech: ["TypeScript","Google Gemini","RTL"],
    live: "https://past-palette.netlify.app", github: "https://github.com/blakazulu/past-palette" },

  { name: "Save The Past", slug: "save-the-past", tagline: "Turn artifacts into 3D, anywhere", date: "2026-02-04",
    cats: ["AI","Web App"], vis: "Public", icon: "🏺",
    short: "Snap a few phone photos and get an interactive 3D model plus AI analysis — even offline.",
    desc: "Preserve discoveries the moment you make them. Save The Past turns multi-angle phone photos of an artifact into an interactive 3D model, with AI analysis of material, estimated age and cultural context. Mobile-first, installable, and built to work offline at remote dig sites — English and Hebrew, with all data kept on-device.",
    tech: ["TypeScript","AI 3D","PWA","Offline-first"],
    live: "https://save-the-past.netlify.app", github: "https://github.com/blakazulu/save-the-past" },

  { name: "STEM Explorers", slug: "stem-explorers", tagline: "A whole STEM classroom, online", date: "2026-01-22",
    cats: ["Education","AI","Web App"], vis: "Public", icon: "🔬",
    short: "A role-based platform that connects admins, teachers, parents and students around elementary STEM.",
    desc: "STEM Explorers brings the whole school into one place — a role-based platform (admin, teacher, parent, student), each with its own themed UI, built around a pedagogical model tree, student research journals, AI-generated reports, a teacher forum with chatbot, and documentation galleries. Hebrew RTL and installable.",
    tech: ["Next.js 16","TypeScript","Firebase","Tailwind","Gemini","Botpress"],
    live: "https://stem-explorers.netlify.app", github: "https://github.com/blakazulu/stem-explorers" },

  { name: "ArcheoTriage", slug: "archeotriage", tagline: "First aid for fresh discoveries", date: "2026-01-12",
    cats: ["AI","Web App"], vis: "Public", icon: "🩺",
    short: "A field app that helps archaeologists protect artifacts the moment they're unearthed.",
    desc: "The first minutes after discovery decide an artifact's survival. ArcheoTriage is a mobile-first field companion that helps archaeologists act fast: quick-reference preservation guides by material, color-coded environmental risk warnings, AI photo identification and field documentation — all in Hebrew and English, RTL.",
    tech: ["TypeScript","AI Identification","Mobile-first"],
    live: "https://archeotriage.netlify.app", github: "https://github.com/blakazulu/ArcheoTriage" },

  { name: "KeyQuest", slug: "keyquest", tagline: "Touch-typing that plays like a game", date: "2026-01-09",
    cats: ["Education","Web App"], vis: "Public", icon: "⌨️",
    short: "A game-driven typing tutor that takes you from the home row to real fluency.",
    desc: "Drills are boring — KeyQuest makes typing a game. A structured path takes you from the home row to fluency with real-time WPM and accuracy tracking, an on-screen keyboard with finger guides, and bite-size sessions you'll actually finish. WCAG 2.2 accessible and built for all ages.",
    tech: ["Next.js","TypeScript","WCAG 2.2"],
    live: "https://keyquest-app.netlify.app", github: "https://github.com/blakazulu/KeyQuest" },

  { name: "FloatJet", slug: "floatjet", tagline: "Honest gear reviews for remote work", date: "2025-12-21",
    cats: ["Content","Web App"], vis: "Public", icon: "🛫",
    short: "Personally-tested reviews of remote-work tools and gear, with instant full-text search.",
    desc: "No affiliate fluff, just what actually works. FloatJet is a no-nonsense review site for remote-work tools, gear and guides — VPNs, project management, monitors, chairs, full home-office setups — all personally tested. A blazing-fast static site with instant full-text search.",
    tech: ["Astro 5","MDX","Tailwind 4","Pagefind","Partytown"],
    live: "https://floatjet.com", github: "https://github.com/blakazulu/floatjet" },

  { name: "AI Image Generator", slug: "ai-image-generator", tagline: "Generate images right inside your AI", date: "2025-12-20",
    cats: ["Dev Tool","AI"], vis: "Public", icon: "🖼️",
    short: "An MCP server that adds free AI image generation to Claude, Cursor and VS Code.",
    desc: "Bring image generation into the tools you already code in. This MCP server adds free AI image generation to Claude, Cursor and VS Code via HuggingFace (Stable Diffusion XL / FLUX) — natural-language prompts, specialised logo & UI/UX models, and a one-line install. Published on npm as mcp-hf-images.",
    tech: ["Node.js","MCP SDK","HuggingFace","Stable Diffusion / FLUX"],
    live: "https://image-generator-mcp.netlify.app", github: "https://github.com/blakazulu/mcp-image-server",
    npm: "https://www.npmjs.com/package/mcp-hf-images" },

  { name: "Hotjar Blocker", slug: "hotjar-blocker", tagline: "Stop Hotjar from watching you", date: "2025-11-09",
    cats: ["Extension"], vis: "Public", icon: "🛡️",
    short: "Chrome & Firefox extensions that block Hotjar tracking, recordings and heatmaps on your terms.",
    desc: "Take back your browsing. Hotjar Blocker is a pair of Chrome and Firefox extensions that block all Hotjar tracking, session recordings and heatmaps on the domains you choose — with one-click 'add current domain', a real-time block counter, on-page notifications and a synced domain list. Privacy-first and fully local.",
    tech: ["Chrome MV3","Firefox WebExtension","declarativeNetRequest"],
    live: "https://hotjarblocker.netlify.app", github: "https://github.com/blakazulu/hotjar-extensions" },

  { name: "MortgageFix (משכנתFix)", slug: "mortgagefix", tagline: "Guidance through the mortgage maze", date: "2025-07-08",
    cats: ["Web App"], vis: "Standalone", icon: "🏦",
    short: "A Hebrew site for a mortgage guidance service that helps people compare options with confidence.",
    desc: `Mortgages are confusing by design — MortgageFix (“משכנתFix”) cuts through it. A Hebrew RTL site for a mortgage guidance and consultation service that helps people compare options and make decisions with confidence. Built and deployed from Bolt.`,
    tech: ["Bolt","Static","RTL"],
    live: "https://gregarious-kashata-cbfd50.netlify.app" },

  { name: "Kiryat Begin — Desert Science", slug: "kiryat-begin-desert-science", tagline: "Science, straight from the desert", date: "2025-05-11",
    cats: ["Education","Web App"], vis: "Standalone", icon: "🏜️",
    short: "A Hebrew site for desert-themed science education at Kiryat Begin for Desert Science.",
    desc: `Science learning rooted in its landscape. A Hebrew RTL site for “קריית בגין למדע מדברי” (Kiryat Begin for Desert Science), presenting science education themed around the desert. Published via Netlify Drop.`,
    tech: ["Static","RTL"],
    live: "https://desert-tech-begin.netlify.app" },

  { name: "Search MCP", slug: "search-mcp", tagline: "Semantic code search your AI can actually use", date: null,
    cats: ["Dev Tool"], vis: "Public", icon: "🔍",
    short: "An MCP server that searches your whole codebase locally — 58× lighter than grep, zero API keys.",
    desc: "Stop flooding your context window with grep dumps. Search MCP gives your assistant true semantic search across your entire codebase — 58× fewer tokens than grep, ~400 ms results, 100% local, no API keys. Drops into Claude Desktop/Code, Cursor and Windsurf, with a standalone CLI when you want it. Your code never leaves your machine.",
    tech: ["TypeScript","MCP SDK","LanceDB","BGE Embeddings","DirectML GPU"],
    github: "https://github.com/blakazulu/search-mcp",
    npm: "https://www.npmjs.com/package/@liraz-sbz/search-mcp" },

  { name: "ScalpelPDF", slug: "scalpelpdf", tagline: "Edit PDFs, keep your privacy", date: null,
    cats: ["Dev Tool"], vis: "Fork", icon: "📄",
    short: "A Windows PDF editor — now on the Microsoft Store — with no account, no subscription and no telemetry.",
    desc: "PDF editing without the strings. ScalpelPDF is a Windows editor you can grab from the Microsoft Store, install, or run portable — no account, no subscription, no telemetry, ever. GPLv3 open source, forked from KillerPDF.",
    tech: ["C#",".NET","GPLv3"],
    github: "https://github.com/blakazulu/ScalpelPDF",
    store: "https://apps.microsoft.com/detail/9n9hn8xw4lf3" },
];
