# FIRE GAMES

A Persian-language, right-to-left video-game storefront built with Next.js App Router, React, TypeScript, Tailwind CSS 4, Supabase Auth, PostgreSQL and Supabase Storage. Prices are integer **Toman** everywhere in the database and application.

## What is implemented

- Responsive Persian storefront, theme toggle, three-slide accessible hero, platform navigation, live search/sorting/filtering, product cards and dynamic product detail pages.
- Original, abstract SVG cover illustrations included in `public/games/`. They are FIRE GAMES development placeholders, **not official game artwork**.
- Guest cart persisted in browser local storage; cart quantities and Toman totals update immediately.
- Supabase product/category/discount reads, published-product filtering, scheduled discounts, SEO metadata, sitemap and robots configuration.
- Supabase email/password registration and sign-in, customer account and private order list.
- Admin portal with server-checked admin authorization, overview metrics from database records, product create/read/update/delete, categories, scheduled discounts, order list/status updates, customer profile list, image upload and public store settings.
- PostgreSQL migration and repeatable seed for the four requested development products.
- Checkout honestly remains unavailable until a payment provider is configured. It does not create fake orders or claim payment success. The migration includes order, item snapshot and payment reference tables; no client policy permits order/payment insertion or payment confirmation.
- When Supabase variables are missing, the public catalog uses clearly identified development fixtures so the visual demo works. Admin/auth do not silently mock service operations.

## Prerequisites

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm
- A Supabase project for real database, account and admin functionality

## Install and run locally

Run these commands from the project directory (`fire_games_bot/`):

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The local preview works without credentials using the explicitly labeled development catalog. Product edits, sign-in, Storage and account data require Supabase configuration. On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env.local`. `.gitignore` excludes local environment files.

## Supabase setup

1. Create a Supabase project and open **Project Settings → API**. Copy the Project URL and the publishable (anon) key into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   This version does not require a Supabase secret/service-role key. Never put a secret/service-role key in a `NEXT_PUBLIC_` variable or browser code.

2. In the Supabase SQL Editor, run `supabase/migrations/202610190001_initial_schema.sql` once. This creates tables, constraints, indexes, RLS policies, the public `game-covers` Storage bucket and administrator-only upload rules.
3. Run `supabase/seed.sql` in the SQL Editor to add the four repeatable development products. Prices are Toman. The seed is safe to repeat by slug.
4. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add your production URL to the allowed redirect URLs. Enable email/password authentication. For production, configure SMTP and your desired email-confirmation/password-reset behavior.
5. Restart `npm run dev` after changing `.env.local`.

### Grant an administrator safely

Register a normal account at `/auth/register`. In Supabase **Authentication → Users**, copy that user's UUID. Then run the following statement as the project owner in the SQL Editor, replacing the sample UUID with the actual value (do not execute the placeholder):

```sql
insert into public.admin_roles(user_id)
values ('REPLACE_WITH_THE_AUTH_USER_UUID');
```

There is intentionally no client-facing way to grant administrator access. The `admin_roles` table has RLS and no authenticated insert/update grant. Visit `/admin/login` and sign in with that account. `is_store_admin()` and server-side route/action checks enforce authorization. Keep the Supabase project-owner account and SQL Editor private.

### Storage

The migration creates a 5 MB `game-covers` bucket, allows JPEG/PNG/WebP/SVG, permits public reads for product cover display, and restricts uploads/updates/deletes to authorized admins through Storage policies. The Media Library uploads real files to this bucket; it does not delete files that could still be referenced. Add the returned public URL to a product image field.

## Project commands

```bash
npm run dev         # development server, bound to 0.0.0.0 for previews
npm run typecheck   # strict TypeScript check
npm run lint        # ESLint
npm test            # pricing and cart business-rule tests
npm run build       # production build
npm start           # production server
```

## Pricing, discounts and order safety

- All prices are integer Toman; do not store Rial or fractional values.
- The `discounts` table controls dated sale prices. A sale is shown only when active and current. An original product price must exceed its sale price.
- The guest cart is convenience state, not a trusted pricing source. **Do not connect a payment flow directly to browser-supplied totals.** A production checkout must re-fetch product rows, verify availability/quantities and compute the total server-side inside a transaction.
- Orders retain product names/platforms and unit prices in order-item snapshots. Products can be removed without erasing order history.
- Order creation and payment confirmation are intentionally not exposed yet. Before launch, select a payment provider, implement server-side payment initiation and a signature-verified webhook, persist a provider reference, validate the amount/currency and only then mark payment verified. Never mark an order as paid from a browser redirect or admin form.
- Admin order status updates cannot mark an unpaid order completed. The database grants authenticated users update permission only on order `status`/`updated_at`, not payment fields.

## Routes

- `/` — Persian storefront
- `/games/[slug]` — database-backed dynamic product details
- `/cart`, `/checkout` — guest cart; checkout configuration notice
- `/auth/login`, `/auth/register`, `/account`, `/account/orders`
- `/admin/login`, `/admin` and management pages for products, categories, discounts, orders, customers, media and store settings

## Validation and deployment

The project has been checked with TypeScript, ESLint, unit tests and a production Next.js build (run the commands above in CI before deployment). No live Supabase project or payment-provider credentials are included, so the real database, account flows, Storage policy behavior, admin writes and payment callbacks cannot be exercised until you configure your own Supabase project.

For production, set all environment variables in the hosting provider's server environment, use HTTPS, configure `NEXT_PUBLIC_SITE_URL`, SMTP and auth redirect allowlists, apply the migration, seed only intended data, assign admins manually, review RLS policies against your own project, configure a real payment-provider webhook, and verify backup/retention and privacy/legal pages before accepting sales. Do not publish legal claims, contact details or social links until they are real and configured.
