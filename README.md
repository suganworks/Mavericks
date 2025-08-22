<p align="center">
	<img src="public/Maverick logo.svg" alt="Mavericks" width="140" />
	<br/>
	<strong>Mavericks Coding Platform</strong>
	<br/>
	<em>Modern, secure, gamified hackathon & learning environment</em>
</p>

<p align="center">
	<a href="#"><img alt="Build" src="https://img.shields.io/badge/CI-GitHub_Actions-blue" /></a>
	<a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-green" /></a>
	<img alt="Node" src="https://img.shields.io/badge/Node-20.x-43853d" />
	<img alt="Status" src="https://img.shields.io/badge/Status-Active-success" />
</p>

---

## 1. Overview
Mavericks is a full‑stack front-end oriented platform for coding challenges, secure hackathons, and skill progression. It combines Supabase authentication + data, secure assessment flows, AI helpers, and a futuristic glassmorphic UI with real‑time style animations.

## 2. Feature Matrix
| Domain | Highlights |
|--------|-----------|
| Authentication | Supabase email auth, profile enrichment, avatars |
| Hackathons | Dedicated tables, registration, scoring flows, end-time enforcement |
| Assessments | Code + MCQ flows with security wrapper |
| Security | Tab visibility, dev tools lock, copy/paste prevention, auto submit |
| Gamification | XP → badges, gems, animated podium leaderboard |
| Admin | Admin elevation script, dashboards, seed & verify scripts |
| UI/FX | Tailwind + Framer Motion + GSAP, particle & dynamic gradient backgrounds |
| AI | Gemini API integration points (concept, resume helpers) |
| Tooling | Vite, ESLint, Vitest, GitHub Actions CI |

## 3. Tech Stack
React 19 • Vite 7 • TailwindCSS • Supabase (Auth/Postgres/Storage) • Framer Motion • GSAP • Monaco & CodeMirror • Chart.js • Vitest • Lucide Icons • Gemini API.

## 4. Directory Layout (condensed)
```
src/
	components/      # UI building blocks & backgrounds
	pages/           # Route-level screens (Dashboard, Hackathon, Leaderboard ...)
	hooks/           # Security + UX hooks
	contexts/        # Auth provider
	utils/           # Monaco security config, helpers
	data/            # Static seed data (avatars, moods)
scripts/           # DB setup / seeding / admin utilities
supabase/migrations/  # SQL schema evolution
```

## 5. Security (Hackathon Focus)
Core anti‑cheat controls (details in `HACKATHON_SECURITY.md`):
* Tab/window switch detection (warnings → auto submission)
* Dev tools shortcuts blocked (F12, Ctrl+Shift+I/J/C)
* Editor hardening (no copy/paste, undo/redo, find/replace, context menu)
* Timed end lock & forced submission
* Central `HackathonSecurityWrapper` + `useHackathonSecurity` hook
* Monaco secure options in `monacoSecurityConfig.js`

## 6. Gamification
Badges, XP tiers, gem visualization (XP buckets), animated top‑3 podium with 3D hover and glassmorphism, skill badges (with random fallback generation when missing data).

## 7. Environment Setup
Clone & install:
```
git clone <repo_url>
cd Mavericks
npm install
```
Copy and fill env:
```
cp .env.example .env   # (Windows PowerShell: Copy-Item .env.example .env)
```
Edit `.env` with your Supabase & optional Gemini keys. Never prefix the service key with `VITE_` and never expose it to the client.

### Required Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=public_anon_key
SUPABASE_SERVICE_KEY=service_role_key_for_scripts_only
```
Optional:
```
VITE_GEMINI_KEY=ai_api_key
VITE_APP_ENV=development
```

## 8. Database & Migrations
Timestamped SQL files live in `supabase/migrations/`. Apply via Supabase CLI:
```
supabase db push
```
Seed baseline data:
```
npm run db:setup
npm run db:seed
```

## 9. Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint code quality pass |
| `npm test` | Run Vitest suite (headless) |
| `npm run add-admin -- <email>` | Promote existing user to admin |
| `npm run db:setup` | Create DB objects (tables etc.) |
| `npm run db:seed` | Seed problem set |
| `npm run db:insert-problems` | Insert additional problems |

Supplemental (manual): `create-analytics-table.js`, `create-hackathon-tables.js`, `verify-hackathon-setup.js`, etc.

## 10. Development Workflow
1. Create feature branch (`feat/<slug>`)
2. Implement & keep diffs focused
3. Run lint + tests
4. Open PR (template auto-applied)
5. CI (GitHub Actions) runs lint, build, tests

## 11. Testing
Vitest + jsdom configured. Sample test in `__tests__/sample.test.js`.
Run watch mode: `npm run test:watch`.

## 12. Architecture Notes
* React function components & hooks modularize logic
* Security isolated in hook/wrapper for drop‑in usage
* Monaco + CodeMirror allow secure vs. rich modes
* Animations via Framer Motion for layout/interaction; GSAP reserved for complex timelines

## 13. Deployment
Deployed via Vercel (see `vercel.json`). Ensure only public keys use `VITE_` prefix. Regenerate compromised keys promptly.

## 14. Roadmap (Excerpt)
* Real‑time updates (presence, live leaderboard)
* Edge/serverless challenge evaluation
* Analytics dashboard (difficulty, completion funnels)
* AI code feedback (rate limited)
* PWA + offline solved challenge viewer
* E2E tests (Playwright)

## 15. Contributing
See `CONTRIBUTING.md`. Conventional Commits encouraged. Provide screenshots for UI changes. Tests for logic modifications.

## 16. Code of Conduct
Governed by `CODE_OF_CONDUCT.md` — be excellent to each other.

## 17. Security Policy
Report privately (see `SECURITY.md`). Do not open public issues for vulnerabilities.

## 18. Troubleshooting Quick Table
| Symptom | Checklist |
|---------|-----------|
| 401 errors | Correct URL/key? Supabase project running? |
| Admin script fails | User exists? Service key present? |
| Security not triggering | Wrapper mounted? `isActive` true? |
| Copy/paste works | Using secure challenge workspace path? |
| Build fails | Node >= 18, clean `node_modules`, retry install |

## 19. License
MIT – see `LICENSE`.

## 20. References
* `HACKATHON_SECURITY.md`
* `IMPLEMENTATION_SUMMARY.md`
* Supabase Docs – https://supabase.com/docs
* Vite Docs – https://vitejs.dev/guide/

---
Keep this document current as features evolve. PRs improving clarity are welcome.
