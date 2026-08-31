# wsio

A link-in-bio platform. Each user claims a username and gets a public page at
`wsio.lol/<username>` that holds an ordered, themeable list of links, with
first-party view and click analytics.

## Architecture

| Part | Stack | Deploy |
| --- | --- | --- |
| `backend/` | Go 1.22 · Gin · GORM · PostgreSQL | Vercel serverless (`backend/api/main.go`), served at `api.wsio.lol` |
| `frontend/` | Next.js 16 (App Router) · React 19 · Tailwind v4 | Vercel, served at `wsio.lol` |

Auth is a JWT session cookie (`session`, scoped to `.wsio.lol`) issued by the
backend; the frontend talks to the backend directly with `credentials: "include"`.

## Data model

- **User** — account (email, bcrypt password, role).
- **Profile** — one per user: `username`, `displayName`, `bio`, `avatarUrl`, `theme`.
- **ProfileLink** — ordered links under a profile: `label`, `url`, `icon`, `position`, `active`.
- **ProfileLinkClick** / **ProfileView** — analytics events, aggregated into 24h / 7d / referrer rollups.

## API (`/api/v1`)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | — | issues session cookie |
| GET | `/auth/me` | session | current user |
| GET | `/profiles/:username` | — | public profile + visible links (records a view) |
| GET | `/click/:id` | — | records a click, 302 → link target |
| GET/PUT | `/me/profile` | session | read / upsert own profile |
| GET | `/me/profile/analytics` | session | profile rollup |
| POST | `/me/profile/links` | session | append link |
| PUT | `/me/profile/links/reorder` | session | reorder links |
| PUT/DELETE | `/me/profile/links/:id` | session | edit / remove link |
| GET | `/me/profile/links/:id/analytics` | session | per-link rollup |
| GET | `/admin/stats`, `/admin/users` | admin | system overview |

## Local development

```bash
# backend
cd backend
DATABASE_URL=postgres://... go run ./cmd        # falls back to in-memory repos if unset

# frontend
cd frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:8080' >> .env.local
npm install
npm run dev
```

## Tests

```bash
cd backend && go test ./...       # includes pkg/http/routes_test.go end-to-end lifecycle
```
