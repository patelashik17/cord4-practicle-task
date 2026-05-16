# Payout Management MVP

#App tour: https://jam.dev/c/8b823b8d-0faa-41ae-a5af-dac1f6a7ee4a

Full-stack payout management system — Next.js 15, MongoDB, Tailwind CSS, JWT auth.

## Demo Credentials

| Role    | Email              | Password |
|---------|--------------------|----------|
| OPS     | ops@demo.com       | ops123   |
| FINANCE | finance@demo.com   | fin123   |


## Run Locally (< 5 min)

```bash
git clone <repo-url> && cd payout-mvp
npm install
cp .env.example .env.local   # fill in MONGODB_URI + JWT_SECRET
npm run dev
curl -X POST http://localhost:3000/api/seed   # seed once
```

Open http://localhost:3000

## Stack
- Next.js 15 App Router + Tailwind CSS
- MongoDB Atlas + Mongoose
- JWT via HttpOnly cookies (role enforced server-side)

## Status Flow
Draft → Submitted → Approved / Rejected (reason required)

## Deploy to Vercel
1. Push to GitHub, import on vercel.com
2. Set env vars: MONGODB_URI, JWT_SECRET
3. Deploy, then call /api/seed once
