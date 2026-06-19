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

## Important Production Note

The current admin, inquiry, download-gate and analytics features use a local JSON preview store. On Vercel this falls back to `/tmp`, which is suitable only for functional preview. Before final production launch, connect:

- Supabase Postgres for persistent inquiries, downloads and analytics events
- Supabase Auth for `/admin`
- Supabase Storage or Vercel Blob for media and PDF files
- Resend for inquiry email notification

## Key Routes

- `/`
- `/about`
- `/products`
- `/products/ul-fire-pump-systems`
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
git@github.com:shagaofeng-rgb/flameprimes.com.git
```
