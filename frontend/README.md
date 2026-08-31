# wsio — frontend

Next.js 16 (App Router) frontend for wsio, the link-in-bio platform. See the
[repo README](../README.md) for the full picture.

## Routes

- `/` — marketing landing
- `/register`, `/login` — auth
- `/dashboard` — profile editor + drag-to-reorder link manager + analytics
- `/admin` — system overview (admin role only)
- `/[username]` — public profile page (server-rendered, no app chrome)

App pages live under the `(app)` route group, which supplies the navbar/footer
chrome. The public `/[username]` page sits outside it so profiles render clean.

## Setup

```bash
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8080' >> .env.local   # your local backend
npm run dev
```

`NEXT_PUBLIC_API_URL` defaults to `https://api.wsio.lol`.
`NEXT_PUBLIC_APP_URL` (optional) sets the canonical origin for metadata/sitemap.

## Build

```bash
npm run build
```
