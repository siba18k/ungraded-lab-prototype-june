# NcedoCare — Web App (Care Coordination Portal)

Smarter care for stronger communities.

## Overview

This is the **web-facing Care Coordination Portal** for the NcedoCare system, built for nurses, doctors, and administrators. It connects to the same Firebase backend used by the NcedoCare mobile app.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Auth + DB | Firebase (Auth, Firestore, Cloud Functions) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Language | TypeScript |

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your Firebase credentials:
```bash
cp .env.example .env.local
```

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Shared Firebase Collections

Both the mobile app and web app read/write to the same Firestore instance.
Do NOT change collection or field names without coordinating with the mobile team.

| Collection | Owner | Purpose |
|---|---|---|
| `patients` | Mobile (write) / Web (read) | User profiles + roles |
| `triageCases` | Mobile (create) / Web (update) | Core case lifecycle |
| `facilityQueues` | Cloud Functions | Real-time queue positions |
| `blockchainEvents` | Cloud Functions only | Immutable audit trail |
| `facilities` | Admin | Facility registry |

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI components (layout, nurse, doctor, shared)
├── firebase/      # Firebase service modules
├── hooks/         # Custom React hooks
├── store/         # Zustand global state
└── types/         # TypeScript interfaces (shared schema)
```

## Environment Variables

See `.env.example` for all required variables. Never commit `.env.local`.
