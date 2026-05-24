# Robokorda 10th Anniversary Invitation Platform

Full-stack private invitation platform built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, MySQL, Font Awesome, and custom JWT admin auth.

## Features

### Guest Experience
- Personalized invitation route: `/invite/[token]`
- Guest greeting by name
- RSVP code verification
- RSVP status: Accept / Decline / Maybe
- Gender selection: Male / Female / Prefer not to say
- Meal selection with quantity limits
- Table selection with capacity limits
- Overbooking prevention with transactional RSVP submission
- Event sections: Hero, Countdown, Schedule, Venue, RSVP, Gallery, FAQ, Footer
- Dark/light mode toggle persisted in localStorage

### Admin Experience
- Secure admin auth at `/admin/login`
- Protected dashboard routes with JWT cookie + middleware
- Dashboard metrics at `/admin/dashboard`
- Guest management at `/admin/guests`
  - Create
  - Edit
  - Delete
  - CSV import
  - Search + status filtering
  - Personalized invite link copy
  - Invitation message generator + copy
  - WhatsApp and Email share actions
- Meal management at `/admin/meals`
- Table management at `/admin/tables`
- Gallery management at `/admin/gallery`
- Event settings at `/admin/settings`
- QR code check-in flow at `/admin/checkin`

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Font Awesome React
- Prisma ORM
- MySQL
- Zod validation
- bcrypt password hashing
- jose JWT signing/verification

## Project Structure

```txt
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/
      auth/login
      auth/logout
      invite/[token]
      rsvp
      admin/dashboard-stats
      admin/guests
      admin/guests/[id]
      admin/meals
      admin/meals/[id]
      admin/tables
      admin/tables/[id]
      admin/gallery
      admin/gallery/[id]
      admin/settings
      admin/checkin/[guestId]
    invite/[token]
    admin/login
    admin/dashboard
    admin/guests
    admin/meals
    admin/tables
    admin/gallery
    admin/settings
    admin/checkin
  components/
    admin/admin-shell.tsx
    invite/invite-client.tsx
    theme-toggle.tsx
    toast-provider.tsx
  lib/
    auth.ts
    prisma.ts
    require-admin.ts
    utils.ts
    validators.ts
  middleware.ts
.env.example
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your MySQL connection details.

4. Run migrations:

```bash
npx prisma migrate dev
```

5. Seed database:

```bash
npx prisma db seed
```

6. Run development server:

```bash
npm run dev
```

## Default Seed Credentials

- Admin email: `admin@robokorda.com`
- Admin password: `Admin@12345`

## Seeded Event Data

- Event: Robokorda 10th Anniversary
- Date: 2026-12-12
- Time: 18:00
- Venue: Robokorda Innovation Centre, Harare, Zimbabwe
- Meals:
  - Beef Dinner
  - Chicken Dinner
  - Vegetarian Plate
  - Vegan Plate
  - Dessert Box
- Tables:
  - Table 1
  - Table 2
  - Table 3
  - VIP Table
  - Sponsors Table

## Important Security Notes

- Admin APIs are protected by JWT session cookie and middleware checks.
- Public invite URLs use `inviteToken`, not guest IDs.
- Passwords are stored as bcrypt hashes.
- RSVP submission rejects duplicate submissions.
- Meal and table reservations are capacity-checked in a DB transaction.
