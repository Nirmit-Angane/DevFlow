# DevFlow: Visual Software Architecture Planner

## Product Overview
DevFlow lets developers visually connect pages, features, APIs, and logic flows to design full application architecture before coding. It targets developers, indie hackers, and hackathon builders who want precision without boilerplate, utilizing a visual node-based editor for rapid workflow mapping.

## 3 Layer Architecture Map
1. **Layer 1 (Directives):** Found in `directives/` - Defines product constraints, goals, and logic boundaries.
2. **Layer 2 (Orchestration):** Python state management (`state_manager.py`) tracking progress through exploration, preview, and implementation phases.
3. **Layer 3 (Execution):** modular Nex.js 14 frontend built inside `app/` and configured under `execution/`. No AI reasoning happens here, just deterministic interface code.

## Design Philosophy
**Direction 4: Structured Synthwave**
- Clear, rigidly defined architecture wrapped in an engaging, retro-futuristic aesthetic.
- "Clarity, Control, and Nostalgia"
- Combines wide, futuristic display fonts (Orbitron) with highly readable body fonts (Work Sans).
- Deep purples, neon cyan signals, and vibrant orange accents denote interactive flow states.

## Audience Psychology
Builders who want precision without the boilerplate. They appreciate structured thinking but want it wrapped in an engaging, almost gamified experience. The synthwave terminal look validates their technical expertise while remaining highly playful.

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript
- Styling: Tailwind CSS, Shadcn UI
- Animation: Framer Motion (`execution/motion/variants.ts`)
- Deployment: Vercel
- Images: `next/image`
- Fonts: `next/font/google` (No external CSS imports)

## Folder Structure
```text
/
├── directives/                # Layer 1 constraints
│   └── product-devflow.md
├── state_manager.py           # Layer 2 Orchestrator
├── SKILLS/                    # Agent capabilities
├── execution/                 # Layer 3 Modules
│   ├── config/                # Design Tokens (tokens.css, fonts.ts, tailwind)
│   ├── components/            # React UI hierarchy components
│   └── motion/                # Framer variants
├── app/                       # Next.js App Router root
│   ├── page.tsx               # Landing page (Workflow concept)
│   └── demo/
│       └── page.tsx           # Interactive 10-Second Demo canvas
└── ...                        # Standard Next.js config files
```

## Mockups
The live application implements the "Structured Synthwave" aesthetic, incorporating:
- An isometric glowing background grid
- Floating neon architecture nodes
- Feature highlights with subtle box-shadow pulses

## Motion Strategy
- Interaction philosophy: 250ms duration, cubic-bezier (synthwave curve) ease.
- Entrances choreographed using Framer Motion stagger children.
- Elements fade upwards (`fadeUp`) and critical UI items pulse with an infinite glow animation (`glowPulse`) denoting active states.

## Performance Targets
- Lighthouse Score: ≥ 90 
- SVG inlining to avoid extra network requests
- Strictly `next/font/google` utilization to avoid layout shifts (FOUT)

## Deployment Guide
1. Push repository to GitHub.
2. Link the repository to your Vercel account.
3. Keep default Build settings (`npm run build`).
4. Wait 1-2 minutes for smooth and fast global edge deployment.
