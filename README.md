# Ramanathan Murugappan — Portfolio Website

A neo-minimalist personal portfolio built with React 19, Vite 7, and Tailwind CSS v4. Features an interactive AI chatbot, live AI agents (JD Fit Analyzer + StackCraft), animated sections, and a full dark mode.

## Live Site

- **Custom Domain**: [https://ram96.com/](https://ram96.com/)
- **GitHub Pages**: [https://ramanathanmurugappan.github.io/protfolio/](https://ramanathanmurugappan.github.io/protfolio/)

---

## Quick Start

**Prerequisites:** Node.js 22.12.0+ (see `.nvmrc`)

```bash
# Install dependencies (from project root)
npm install

# Start development server
nvm use && npx vite --host

# Type-check only
npx tsc --noEmit

# Build for production
npx vite build

# Preview production build
npx vite preview
```

> **Note:** Run build/dev commands from the project root where `vite.config.ts` lives, not from `client/`.

---

## Project Structure

```
website_bot/
├── client/
│   ├── src/
│   │   ├── components/         # All UI components
│   │   │   ├── Hero.tsx        # Stagger text, parallax, counter stats, resume button
│   │   │   ├── AboutSection.tsx # Trivia flip cards (6 cards, swipe/tap to flip)
│   │   │   ├── Experience.tsx  # Sticky chapter split — company tabs + highlights
│   │   │   ├── Projects.tsx    # Magazine layout — hero card + 3-col grid
│   │   │   ├── TechStack.tsx   # Signal flow pipeline SVG (desktop) + badge grid (mobile)
│   │   │   ├── Achievements.tsx # Stacked cards + publications
│   │   │   ├── Education.tsx   # Degree + research card
│   │   │   ├── Contact.tsx     # Contact cards + social links
│   │   │   ├── Chatbot.tsx     # Floating chat widget (Groq LLM, persistent history)
│   │   │   ├── AITools.tsx     # Tabbed AI agents section
│   │   │   ├── JDAnalyzer.tsx  # JD Fit Analyzer — score, gaps, cover letter
│   │   │   ├── TechExplorer.tsx # StackCraft — compare tools + build pipeline
│   │   │   ├── SectionHeader.tsx # Shared header with icon + eyebrow + title
│   │   │   ├── MagneticButton.tsx # Cursor-drift wrapper for CTA buttons
│   │   │   ├── ScrollReveal.tsx # Framer Motion whileInView wrapper
│   │   │   ├── ScrollProgress.tsx # Gradient progress bar at top
│   │   │   └── CustomCursor.tsx # Dot + lagging ring cursor (desktop only)
│   │   ├── pages/
│   │   │   └── Home.tsx        # Main page — section order
│   │   ├── data/               # All static data
│   │   │   ├── hero.ts         # Headline, stats badges, skills badges
│   │   │   ├── projects.ts     # Project cards with skills tagline
│   │   │   ├── techStack.ts    # Tech categories and tools
│   │   │   ├── achievements.ts # Achievement cards + publications
│   │   │   ├── experience.ts   # Work history (3 entries)
│   │   │   ├── socialLinks.ts  # Social/contact links
│   │   │   └── brandColors.ts  # Company colors + logo paths
│   │   ├── hooks/
│   │   │   └── useCountUp.ts   # IntersectionObserver + rAF counter animation
│   │   ├── lib/
│   │   │   └── groqUtils.ts    # Groq API wrapper (groqJSON, detectInjection)
│   │   ├── contexts/           # ThemeContext (dark/light)
│   │   └── index.css           # Design system — CSS vars, utility classes
│   └── public/
│       ├── images/             # Avatar crops, company logos, project screenshots
│       └── Ramanathan_6_Yrs_Gen_AI_Architect.pdf
├── vite.config.ts
└── package.json
```

---

## Features

### Sections
| Section | Highlights |
|---|---|
| **Hero** | Stagger word reveal, parallax scroll, 4 animated counter stats, resume download |
| **About** | 6 flip cards with peek animation — tap/swipe to reveal answers |
| **Experience** | Sticky left panel with company tabs, right panel crossfades |
| **Projects** | Full-width hero card + 7-card responsive grid, lazy-loaded images |
| **Tech Stack** | Signal flow pipeline (desktop SVG) + categorised badge grid (mobile) |
| **Achievements** | Alternating stacked cards + research publications grid |
| **Education** | Animated degree card + research panel |
| **AI Agents** | JD Fit Analyzer + StackCraft (tool compare + LLM pipeline builder) |
| **Contact** | Cards + magnetic social links |

### AI / Chat Features
- **Chatbot** — Groq-powered conversational widget. Persistent localStorage history (capped at 20 msgs), 3 suggested question chips, char-by-char typing reveal, easter egg on "hire me"
- **JD Fit Analyzer** — Paste any job description; returns match score, matched skills, gaps, strengths, and a tailored cover letter opener (prompt-injection guarded)
- **StackCraft** — Add AI tools; side-by-side comparison table with Ram's pick badge + LLM-generated complete pipeline + project ideas

### UX Details
- Custom cursor (dot + ring) on desktop
- Scroll progress bar (gradient)
- SVG grain overlay for texture
- Dark mode via `.dark` class on `<html>` (next-themes)
- Magnetic buttons on CTAs and social links
- Visitor counter in footer (countapi.xyz)
- OG / Twitter card meta tags

---

## Technologies

| Layer | Tech |
|---|---|
| Framework | React 19, TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion v12 |
| Icons | Lucide React |
| UI Primitives | Radix UI |
| AI/LLM | Groq API (`groq-sdk`), Deepgram (STT) |
| Deployment | GitHub Pages, GitHub Actions |
| Node | 22.12.0 |

---

## Deployment

Auto-deployed to GitHub Pages on every push to `master` via GitHub Actions.

- Builds with Node.js 22.12.0
- Deploys with custom domain `ram96.com`
- CNAME record → `ramanathanmurugappan.github.io`

---

## Credits

Design inspired by [Bluren](https://bluren.webflow.io/)

---

Built with React, Vite, and Tailwind CSS
