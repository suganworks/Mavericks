<p align="center">
	<img src="public/Maverick logo.svg" alt="Mavericks" width="140" />
</p>

# Mavericks Coding Platform

Modern, secure, gamified coding & hackathon platform with real‑time leaderboards, AI helpers, challenge workspace, and robust proctoring / anti‑cheat features.

## ✨ Core Highlights

| Area | Capabilities |
|------|--------------|
| Auth & Profiles | Supabase auth, profile fields, gamification stats, avatars |
| Challenges | Coding + MCQ assessments, problem seeding scripts |
| Hackathons | Dedicated schema, registration, scoring, security wrapper |
| Security | Tab switch detection, dev tools blocking, copy/paste & context‑menu lock, timed auto‑submit |
| Gamification | XP → badges, gems, levels, animated futuristic leaderboard podium |
| Admin | Separate dashboard, analytics (table & future metrics), data seeding & management scripts |
| UI / UX | Vite + React 19, Tailwind 3, glassmorphism + 3D motion (Framer Motion), particle & dynamic backgrounds |
| AI | Gemini / Generative AI integration placeholder (see API key env) |

## 🧱 Tech Stack

- React 19 + Vite 7 (ESM)
- TailwindCSS + PostCSS
- Supabase (Auth, Postgres, Storage, SQL migrations)
- Framer Motion, GSAP (animations)
- Monaco & CodeMirror (editor experiences)
- Chart.js (analytics visualizations)
- Lucide Icons / React Icons
- Gemini (@google/generative-ai) integration

## 📂 Project Structure (excerpt)

```
├── index.html
├── src/
│  ├── main.jsx                # App bootstrap
│  ├── App.jsx                 # Route shell
│  ├── auth.js                 # Auth helpers
│  ├── supabaseClient.js       # Supabase init
│  ├── components/             # Reusable UI (Navbar, Security Wrappers, Backgrounds…)
│  ├── contexts/               # Auth context
│  ├── hooks/                  # Security & UX hooks
│  ├── pages/                  # Route pages (Dashboard, Leaderboard, Hackathon…)
│  ├── utils/                  # Monaco security config, helpers
│  └── data/                   # Static seed data (avatars, moods etc.)
├── scripts/                   # Node scripts (db setup, seeding, admin, hackathon)
├── supabase/migrations/       # SQL migration files
├── HACKATHON_SECURITY.md      # Detailed security feature docs
├── IMPLEMENTATION_SUMMARY.md  # Implementation log for security
├── webServerApiSettings.json  # API settings (if any consumer tooling)
└── vercel.json                # Deployment config
```

## 🔐 Security & Anti‑Cheat (Hackathons)

Implemented controls (summary – see `HACKATHON_SECURITY.md` for full detail):

- Tab / window switch detection (warnings → auto submit)
- Copy / paste, drag-drop, context menu, undo/redo, find/replace blocked in editors
- Dev tools (F12, Ctrl+Shift+I/J/C) blocked with feedback
- Timed hackathon end validation & forced submission
- Central `HackathonSecurityWrapper` & `useHackathonSecurity` hook
- Hardened Monaco configuration via `monacoSecurityConfig.js`

## 🏅 Gamification

- XP accumulation → badge progression
- Gem rendering (XP buckets) with animated glow
- Futuristic glassmorphic leaderboard with 3‑podium layout & motion
- Skill badges & random fallback skill generation for incomplete profiles

## 🛠️ Available NPM Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Launch Vite dev server |
| `build` | Production build (dist/) |
| `preview` | Preview built site locally |
| `lint` | Run ESLint over project |
| `add-admin` | Promote a registered user to admin (`node scripts/add_admin.js <email>`) |
| `db:setup` | Create baseline database objects |
| `db:seed` | Seed core problem sets |
| `db:insert-problems` | Insert problems from data definitions |

Supplementary scripts (manual execution):

```
node scripts/create-analytics-table.js
node scripts/create-hackathon-tables.js
node scripts/create-submissions-table.js
node scripts/insert-hackathon-data.js
node scripts/insert-hackathon-sample-data.js
node scripts/update-hackathon-registrations.js
node scripts/verify-hackathon-setup.js
```

## ⚙️ Environment Variables

Place in a local `.env` (Vite uses `VITE_` prefix for exposure in client):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=service_role_key_for_admin_scripts

# Optional / future integrations
VITE_GEMINI_API_KEY=google_generative_ai_key
VITE_APP_ENV=development
```

Admin / seeding Node scripts run server‑side; they require `SUPABASE_SERVICE_KEY` (never expose in client bundle).

## 🚀 Local Development

1. Clone repo
2. Install deps: `npm install`
3. Create `.env` with required keys
4. (Optional) Run migrations via Supabase CLI or dashboard
5. Seed data (problems, hackathon tables): `npm run db:setup` then `npm run db:seed`
6. Start dev server: `npm run dev`
7. Open: http://localhost:5173 (default Vite port)

### Adding an Admin User

Ensure user has signed up first, then:
```
npm run add-admin -- user@example.com
```
Or directly:
```
node scripts/add_admin.js user@example.com
```

## 🗄️ Database & Migrations

SQL migrations reside in `supabase/migrations/` with timestamped filenames (users, admin, problems, hackathon, analytics, profile extensions). Apply using Supabase CLI:
```
supabase db push
```
Or manually execute SQL in the Supabase dashboard. Keep new schema changes additive and generate a new timestamped file.

## 🧪 Quality & Tooling

- ESLint (React, hooks) – run `npm run lint`
- TypeScript types not yet adopted (future enhancement)
- Suggest adding Jest / Vitest for logic tests (not included yet)

## 🧩 Architecture Notes

- Thin React pages orchestrate data + layout; reusable visual atoms live in `components/`
- Security logic isolated in hook + wrapper for composability
- Monaco & CodeMirror coexist (allow language flexibility & secure mode separation)
- Animations use Framer Motion for 3D hover / entrance + GSAP for complex timelines (where needed)

## 🛡️ Deployment (Vercel)

`vercel.json` present – typical flow:

1. Set environment variables in Vercel project (Production / Preview / Dev scopes)
2. `npm run build` executed by Vercel
3. Output in `dist/` automatically served

Ensure no server secrets (service key) leak into client bundle; only set public keys with `VITE_` prefix for frontend.

## 📈 Roadmap (Suggested)

- Add serverless edge functions for secure evaluation hooks
- Real‑time presence & live scoreboard updates
- Enhanced analytics dashboard (challenge difficulty trends)
- AI code feedback & hints (rate‑limited)
- Progressive Web App (offline viewing of solved challenges)
- Dark / light theme toggle abstraction
- Unit + E2E (Playwright) test suite

## 🤝 Contributing

1. Fork & branch (`feat/short-description`)
2. Keep patches focused & small
3. Run lint before PR
4. Update docs if behavior changes

## 📝 License

License not specified yet. Add one (e.g., MIT or AGPL) depending on distribution intent.

## ❓ Troubleshooting

| Issue | Check |
|-------|-------|
| 401 / auth failures | Valid Supabase URL & anon key? Clock skew? |
| Admin script fails | `SUPABASE_SERVICE_KEY` set? User exists? |
| Security warnings not triggering | Is `HackathonSecurityWrapper` wrapping page? `isActive` true? |
| Copy/paste still works | Confirm running in secure challenge workspace path |
| Build fails on memory | Close extra editors, ensure Node >= 18 |

## 📜 References

- `HACKATHON_SECURITY.md` – deep dive on anti‑cheat
- `IMPLEMENTATION_SUMMARY.md` – verified feature list
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev/guide/

---
For internal onboarding & external contributors – keep this README updated as features evolve.
