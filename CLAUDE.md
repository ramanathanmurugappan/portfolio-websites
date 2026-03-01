# CLAUDE.md — Portfolio Website

This file gives Claude context for working on this codebase.

---

## Stack

- **React 19** + **TypeScript** + **Vite 7** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion v12** — already installed
- **Lucide React** — icon library (replaces all emoji strings)
- **Groq SDK** — LLM calls via `groqJSON()` in `client/src/lib/groqUtils.ts`
- **pnpm** is the package manager. Claude cannot run `pnpm` directly — use `npx tsc` and `npx vite` instead.

---

## Dev Commands

Run from the **project root** (where `vite.config.ts` lives), NOT from `client/`:

```bash
npx vite --host          # dev server
npx vite build           # production build
npx tsc --noEmit         # type-check (run from client/ directory)
```

---

## Key Files

| File | Purpose |
|---|---|
| `client/src/pages/Home.tsx` | Section order — the single page |
| `client/src/components/` | All UI components |
| `client/src/data/` | Static data (hero, projects, tech, achievements, experience, social, brandColors) |
| `client/src/lib/groqUtils.ts` | `groqJSON<T>()`, `detectInjection()`, `MAX_JD_INPUT` |
| `client/src/index.css` | Design system — CSS vars, utility classes, dark mode |
| `client/public/images/` | Avatar crops, company logos, project screenshots |

---

## Design System Rules

### Colors
- Background: `#ffffff` / `#0a0a0a` (dark)
- Card surface: `#f7f7f7` / `#1a1a1a` (dark)
- Inner surface: `#ffffff` / `#141414` (dark)
- Blue accent: `#1e6ef4`
- Muted text: `rgba(0,0,0,0.35)` / `rgba(255,255,255,0.35)` (dark)

### Dark Mode
- Applied via `.dark` class on `<html>` (next-themes)
- **Never use** scattered inline `dark:bg-[...]` Tailwind variants for new components
- Use the CSS utility package in `index.css` (section 11): `agent-panel`, `agent-surface`, `agent-chip`, `agent-label`, `agent-thead-row`, `agent-tbody-row`
- For section-level dark mode, add `.dark .my-class { ... }` in `index.css`

### CSS Utility Classes
- `.card-hover` — transition + `translateY(-4px)` lift + shadow + blue border tint on hover
- `.agent-panel` — AI section card background + border + hover lift (same as card-hover)
- `.agent-surface` — inner input/nested background
- `.agent-chip` — interactive pill (tool badge)
- `.agent-label` — 11px uppercase tracking label
- `.btn-shimmer` — shimmer sweep animation on buttons
- `.animate-gradient-text` — animated gradient text (Hero subtitle)
- `.grain-overlay` — fixed SVG noise texture
- `.nav-glass` — glassmorphism nav blur

### Framer Motion (v12)
- Use **direct props** (`initial`, `whileInView`, `transition`) — NOT Variants objects
- `ease` in `transition` must be a string literal (`'easeOut'`, `'linear'`) or number tuple `as [n,n,n,n]`
- String ease values in Variants objects cause TS errors in v12

### Icons
- All emojis in the UI have been replaced with **Lucide React** icons
- `SectionHeader` accepts `icon?: ReactNode` — renders before eyebrow text at `size={12}`
- Section icon map: About→`User`, Experience→`Briefcase`, Projects→`FolderOpen`, TechStack→`Layers`, Achievements→`Trophy`, Education→`GraduationCap`, AITools→`BrainCircuit`

---

## Sections (in order)

1. **Hero** — stagger word reveal, parallax scroll, 4 animated counter stats, resume download button
2. **About** — 6 flip cards with peek animation (IntersectionObserver), tap/swipe support
3. **Experience** — sticky chapter split: left company tabs + right achievements list
4. **Projects** — magazine layout: hero card + 7-card 3-col grid, lazy-loaded images
5. **TechStack** — signal flow SVG pipeline (desktop) + badge grid (mobile)
6. **Achievements** — alternating avatar cards + research publications
7. **Education** — degree card + research card
8. **AI Agents** — tabbed: JD Fit Analyzer + StackCraft
9. **Contact** — cards + magnetic social links + visitor counter footer

---

## AI Agents Architecture

### Chatbot (`Chatbot.tsx`)
- Groq-powered, localStorage history (cap 20 msgs), char-by-char typing reveal
- Suggested chips shown when `messages.length === 1`
- Easter egg triggers on input containing "hire me" / "hire you"

### JD Fit Analyzer (`JDAnalyzer.tsx`)
- `groqJSON<JDResult>()` call with prompt-injection guard (`detectInjection()`)
- User input wrapped in `<job_description>` XML tags before sending to LLM
- Returns: `overallScore`, `matchLabel`, `matchedSkills`, `gaps`, `strengths`, `coverLetterOpener`

### StackCraft (`TechExplorer.tsx`)
- Compare table: `groqJSON<CompareResult>()` — 11 distinct categories, "Ram's pick" badge
- Pipeline: fully LLM-driven via `buildPipelinePrompt()` — no hardcoded pipeline
- Stale pick warning when user changes tools after building pipeline

---

## Known Issues

- `client/src/components/ui/input.tsx` and `ui/textarea.tsx` have pre-existing TS errors (`@/hooks/useComposition` missing) — these are not blocking and should be ignored
- `npx tsc --noEmit` must be run from the `client/` directory

---

## Deployment

- GitHub Pages, auto-deployed on push to `master` via GitHub Actions
- Live at `ram96.com`
- Build output: `dist/` at project root
