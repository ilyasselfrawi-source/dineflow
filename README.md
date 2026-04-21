# DineFlow 🍽️

A full-stack, production-ready **restaurant QR dine-in ordering system** built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and SQLite/PostgreSQL.

Customers scan a QR code on their table, open the menu in their phone browser, place an order, and staff receive it instantly — no app installation required.

---

## Features

### Customer Experience
- Scan QR code → instant menu in browser
- Browse by category with smooth scroll navigation
- Search menu items
- Item detail sheet with options, extras, and special notes
- Persistent cart with quantity controls
- Server-validated order submission (prices never trusted from client)
- Order confirmation page with order number

### Admin Dashboard
- Secure login (JWT sessions via NextAuth)
- Dashboard overview with today's stats and revenue
- Live order list with SSE real-time updates (no page refresh needed)
- Order detail view with one-tap status progression
- Table management with QR code generation, PNG/SVG download, and printable cards
- Full menu management: categories, items, options, extras
- Restaurant open/close toggle
- Settings: name, logo, currency, tax, WiFi info, branding color

### System
- Server-side price calculation — client totals are never trusted
- Order item snapshots (frozen at order time — menu changes don't affect history)
- Idempotency token prevents duplicate order submissions
- SSE for real-time order push to staff dashboard
- Zod validation on all API inputs
- Role-based access: Admin vs Staff

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | NextAuth.js v4 (Credentials) |
| Validation | Zod |
| Real-time | Server-Sent Events (SSE) |
| QR Codes | `qrcode` npm package |
| Fonts | Playfair Display + DM Sans |

---

## Project Structure

```
dineflow/
├── app/
│   ├── (customer)/          # Customer-facing pages (no auth)
│   │   ├── menu/[tableSlug]/     # Main ordering page
│   │   ├── order-confirmation/[orderId]/
│   │   ├── table-error/          # Invalid/inactive QR
│   │   └── closed/               # Restaurant closed page
│   ├── (admin)/             # Admin/staff pages (auth required)
│   │   ├── login/
│   │   └── admin/
│   │       ├── page.tsx          # Dashboard
│   │       ├── orders/
│   │       ├── tables/
│   │       ├── menu/
│   │       └── settings/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── orders/               # Public: submit order
│       ├── sse/                  # Real-time stream
│       └── admin/                # Protected admin endpoints
├── components/
│   ├── customer/            # MenuPage, CartDrawer, ItemDetailModal, etc.
│   └── admin/               # Sidebar, OrdersClient, TablesClient, etc.
├── lib/
│   ├── auth/authOptions.ts
│   ├── db/prisma.ts
│   ├── validators/          # Zod schemas
│   ├── services/            # orderService, tableService, menuService, settingsService
│   ├── sse/sseEmitter.ts
│   └── utils/               # formatters, qrUtils
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts             # Route protection
└── types/next-auth.d.ts
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (min 32 chars) | — |
| `NEXTAUTH_URL` | Full URL of your app | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public URL (used in QR codes) | `http://localhost:3000` |

---

## Setup & Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local — the defaults work for local SQLite dev
```

### 3. Set up database
```bash
# Push schema to SQLite (creates dev.db)
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dineflow.com` | `admin123` |
| Staff | `staff@dineflow.com` | `staff123` |

**Change these immediately in production!**

---

## Testing the Customer Flow

After seeding, your tables will have slugs like `table-t1-xxxxxxxx`.

1. Go to **Admin → Tables & QR**
2. Click **QR Code** on any table
3. Copy the URL shown (e.g. `http://localhost:3000/menu/table-t1-abc123`)
4. Open it in your phone browser (or a new browser tab)
5. Browse, add items, and place an order
6. Watch it appear in **Admin → Orders** in real time

---

## Database Management

```bash
# View DB in browser
npm run db:studio

# Reset and reseed
npm run db:reset

# Create a migration (production workflow)
npm run db:migrate
```

---

## Production Deployment

### Switch to PostgreSQL

1. Provision a PostgreSQL database (Supabase, Railway, Neon, etc.)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `DATABASE_URL` in your production environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Seed if needed: `npm run db:seed`

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard. Make sure `NEXT_PUBLIC_APP_URL` matches your production domain so QR codes point to the right URL.

### Deploy to Railway / Render / Fly.io
All work well. Use PostgreSQL add-ons. Set env vars. Run `prisma migrate deploy` as a build step.

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- Admin routes are protected by NextAuth middleware
- All order totals are recalculated server-side — client prices are ignored
- Item availability is verified server-side at order submission
- Table slugs use random nanoid suffixes (not guessable sequential IDs)
- Idempotency tokens prevent duplicate order submission on retry/refresh
- Notes are stored as text (Prisma parameterized queries prevent SQL injection)
- NEXTAUTH_SECRET must be a strong random string in production (min 32 chars)
- Rate limiting is not included in the MVP — add it via middleware or an API gateway

---

## Known Limitations

1. **Single-instance SSE**: The SSE emitter is in-process. For multi-instance deployments (e.g. multiple serverless functions), replace with Redis pub/sub (see upgrade notes below).
2. **Image upload**: Item images use URLs only. Local file upload can be added with Cloudinary/S3.
3. **No payment**: Payment processing is not included — designed for pay-at-table or tab-based billing.
4. **No role granularity beyond Admin/Staff**: Role-based permissions are basic — more granular ACL can be added.
5. **Polling fallback**: If SSE disconnects, the client auto-reconnects. A polling fallback for older browsers is not included.
6. **No multi-restaurant**: One database = one restaurant. Multi-tenancy would require schema changes.

---

## Upgrade Path / Future Features

| Feature | Approach |
|---|---|
| Multi-instance real-time | Replace `sseEmitter.ts` with Redis pub/sub (ioredis + BullMQ or Upstash) |
| File image upload | Add Cloudinary or S3 presigned URL upload to MenuItem form |
| Online payment | Add Stripe `PaymentIntent` in `orderService.submitOrder` |
| Kitchen Display Screen | New `/kitchen` route consuming SSE, shows only NEW/PREPARING orders |
| Waiter call button | Add `CallRequest` model + SSE event type `CALL_REQUEST` |
| Customer order tracking | Add `/order-status/[orderId]` polling page using order id |
| Multilingual UI | `next-intl` for i18n, language toggle in customer header |
| Receipt printing | Use `react-to-print` with a receipt component in order detail |
| WhatsApp notifications | Twilio/WhatsApp Business API webhook on order create |
| PWA | Add `next-pwa`, `manifest.json`, service worker |
| Analytics | Extend `getDashboardStats` with revenue charts using Recharts |
| Inventory | Add `stock` field to `MenuItem`, decrement on order submission |

---

## Architecture Notes

- The customer flow (`/menu/[tableSlug]`) is a **server-rendered** page that passes data to a client component for interactivity. This gives fast initial load + full React interactivity.
- The admin dashboard uses **server components for initial data**, then **client components** for SSE, filters, and mutations — matching Next.js best practices.
- All business logic (pricing, validation, availability checks) lives in `lib/services/` — keeping API routes thin.
- The SSE singleton survives Next.js hot-reload in development via the `globalThis` pattern, same as the Prisma client.
