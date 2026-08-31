# Deployment

`wsio` is one repo, two Vercel projects (both owned by `atluixx`, both connected
to `github.com/atluixx/wsio` on the `master` branch):

| Project | Root Directory | Runtime | Domain | Live |
| --- | --- | --- | --- | --- |
| `wsio-front` | `frontend` | Next.js | `wsio.lol` (+ `www`) | ✅ |
| `wsio-back` | `backend` | Go serverless (`api/main.go`) | `api.wsio.lol` | ✅ |

Domains, DNS (`wsio.lol` is registered through Vercel), and most env vars are
already configured. A `git push` to `master` triggers a production deploy of
whichever subtree changed.

## Local link

`.vercel/` is git-ignored. Link once per machine with repo-level linking:

```bash
vercel link --repo --yes        # from the repo root; links both projects
```

Then deploy a subtree from its directory:

```bash
cd backend  && vercel deploy --prod --yes
cd frontend && vercel deploy --prod --yes
```

(Per-directory `vercel link` also works but breaks `vercel deploy` from inside
the subdir, because the project's Root Directory is already `backend`/`frontend`
— use `--repo` linking.)

## Environment variables

### `wsio-front`
| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.wsio.lol` |
| `NEXT_PUBLIC_APP_URL` | `https://wsio.lol` |

Stale `STRIPE_*` / `NEXT_PUBLIC_STRIPE_*` vars are still present but unused —
safe to delete (`vercel env rm ...`).

### `wsio-back`
| Key | Status | Notes |
| --- | --- | --- |
| `DATABASE_URL` | set | Postgres DSN. Without it the API silently falls back to in-memory repos. `DATABASE_DSN` also accepted. |
| `ADMIN_INITIAL_EMAIL` | set | account with this email is auto-promoted to `admin`. |
| `COOKIE_DOMAIN` | set | `.wsio.lol`. |
| `JWT_SECRET` | **NOT set** | falls back to an insecure hard-coded default in `pkg/auth/jwt.go`. Set a real one and redeploy — it must be stable across deploys or all sessions invalidate: `vercel env add JWT_SECRET production` (paste `openssl rand -hex 48`). |

Stale `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` are unused — safe to delete.

Schema: GORM `AutoMigrate` runs on cold start (`users`, `profiles`,
`profile_links`, `profile_link_clicks`, `profile_views`) — no migration step.

## Cross-domain auth

Browser calls `api.wsio.lol` directly with `credentials: "include"`. The backend
issues `session` with `Domain=wsio.lol; SameSite=None; Secure`, so `wsio.lol`
sends it back. Only works on real `*.wsio.lol` HTTPS hosts — not `*.vercel.app`
preview URLs.

Smoke test:
```bash
curl -sS https://api.wsio.lol/                              # {"service":"wsio link-in-bio API","status":"online","version":"2.0"}
curl -sS -o /dev/null -w '%{http_code}\n' https://api.wsio.lol/api/v1/profiles/nobody   # 404
curl -sS -o /dev/null -w '%{http_code}\n' https://wsio.lol/  # 200
```

## Local development

```bash
cd backend  && DATABASE_URL=postgres://... go run ./cmd
cd frontend && echo 'NEXT_PUBLIC_API_URL=http://localhost:8080' >> .env.local && npm install && npm run dev
```
