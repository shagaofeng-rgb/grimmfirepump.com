# Flame Primes Fire Pump Website

Next.js 15 App Router website for Flame Primes, an international B2B fire pump and fire pump systems website.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- Local JSON preview data layer
- Admin preview for inquiries, downloads, products and analytics

## Local Development

```bash
npm install
npm run dev
```

Local URL:

```txt
http://localhost:4174
```

## Build

```bash
npm run build
```

## Vercel Deployment

Use the Vercel **Next.js** framework preset.

Recommended settings:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Development Command: `npm run dev`
- Output Directory: leave empty / default `.next`

The project includes `vercel.json` with the same commands.

## Production Notes

- Lead data uses Neon Postgres on Vercel when `POSTGRES_URL` or `DATABASE_URL` is present.
- Local development falls back to `data/runtime/*.json` when database env vars are unavailable.
- `/admin` is password protected with `ADMIN_PASSWORD` and a signed `ADMIN_SESSION_SECRET` cookie.
- PDF downloads, inquiry forms and CTA analytics are wired into the same lead data layer.
- Email notification can be added with Resend if immediate inbox alerts are required.

## Key Routes

- `/`
- `/about`
- `/products`
- `/products/[slug]`
- `/applications`
- `/projects`
- `/factory`
- `/testing`
- `/certificates`
- `/downloads`
- `/knowledge`
- `/knowledge/[slug]`
- `/contact`
- `/admin`

## Repository

GitHub SSH remote:

```txt
git@github.com:shagaofeng-rgb/grimmfirepump.com.git
```
