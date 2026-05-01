# Portfolio 3D

An immersive 3D portfolio site. The visitor doesn't browse a page — they open a laptop and enter a digital studio.

Built with Astro + React Three Fiber. Every section is a distinct 3D environment driven entirely by scroll.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Astro v4 |
| 3D | Three.js + React Three Fiber + Drei |
| Post-processing | `@react-three/postprocessing` |
| Scroll | Lenis + normalized progress ref |
| Animations | GSAP |
| Text effects | SplitType |
| Styling | Tailwind CSS v3 |
| Physics (Sprint 5) | `@react-three/rapier` |
| Deploy | Vercel |

---

## Scenes

| # | Scene | Scroll range |
|---|---|---|
| 0 | Preloader — gold line + name typewriter | — |
| 1 | Hero — first-person approach to lit desk | 0–15% |
| 2 | Laptop opens — scroll-driven lid rotation, screen glow | 15–40% |
| 3 | Inside the screen — per-project 3D environments | 40–65% |
| 4 | About — narrative text, services as physics objects | 65–80% |
| 5 | Contact — terminal-style form, keyboard close-up | 80–100% |

---

## Project structure

```
/
├── public/
│   ├── models/          ← laptop.glb (Sprint 2)
│   ├── textures/
│   │   ├── env-studio.hdr
│   │   └── screen-preview/
│   └── fonts/
│
├── src/
│   ├── pages/
│   │   └── index.astro          ← shell, SEO, mounts React islands
│   ├── components/
│   │   ├── Preloader.astro
│   │   ├── PortfolioCanvas.tsx  ← R3F Canvas root
│   │   ├── scenes/
│   │   │   └── SceneManager.tsx
│   │   ├── three/
│   │   │   ├── Laptop.tsx
│   │   │   ├── ScreenCanvas.tsx
│   │   │   ├── ParticleDust.tsx
│   │   │   └── Postprocessing.tsx
│   │   ├── ui/
│   │   │   └── HeroText.tsx
│   │   └── cursor/
│   │       └── CustomCursor.tsx
│   ├── hooks/
│   │   ├── useScroll.ts         ← Lenis + progress ref
│   │   └── useBreakpoint.ts
│   ├── utils/
│   │   ├── mapRange.ts
│   │   ├── lerp.ts
│   │   └── webglSupport.ts
│   ├── data/
│   │   └── projects.ts
│   └── styles/
│       ├── global.css
│       └── variables.css
```

---

## Commands

```sh
npm install       # install dependencies
npm run dev       # dev server → localhost:4321
npm run build     # production build → ./dist/
npm run preview   # preview production build
```

---

## Performance targets

| Asset | Target |
|---|---|
| Laptop `.glb` | < 2 MB |
| Environment HDR | < 1 MB |
| Project screenshots | < 300 KB each (WebP) |
| JS bundle (gzip) | < 400 KB |
| LCP | < 2.5s |
| FPS desktop | 60 fps |
| FPS mobile | 30+ fps |

---

## Palette

| Name | Hex |
|---|---|
| Background | `#0A0A0F` |
| Night blue | `#2A2A3A` |
| Ivory | `#F0EBE1` |
| Antique gold | `#C8A96E` |
| Burnt orange (accent) | `#FF4D2E` |
