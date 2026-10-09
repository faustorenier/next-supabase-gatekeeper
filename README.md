# Next.js + Supabase Auth Starter

A starter for apps where **nobody gets in until an admin says so**. Users request an account through a sign-up form, an administrator reviews the request and assigns a role, and only approved users can log in.

Built with **Next.js 16** (App Router, Server Actions, `proxy.ts`), **Supabase Auth + Postgres RLS** and **Tailwind CSS 4**.

## How it works

1. **Sign-up** – a user fills in first name, last name, email, phone and password. Supabase Auth creates the account and a database trigger creates a matching row in `public.profiles` with `status = 'pending'` and no role.
2. **Review** – an admin approves the request, assigning one of three roles (`admin`, `editor`, `viewer`), or rejects it.
3. **Login** – credentials are checked first, then the profile status. Pending or rejected users are signed out immediately and shown the reason; approved users land on `/dashboard`, which shows content based on their role.
4. **Revocation** – if an admin changes a user's status while they are logged in, the next page load signs them out and sends them back to `/login` with a notice.

### Roles

| Role | Intended access |
| --- | --- |
| `admin` | Reviews sign-up requests, manages users and roles |
| `editor` | Reads and edits content |
| `viewer` | Read-only access |

### Security model

Authorization is enforced in the database, not only in the UI:

- **Row Level Security** on `profiles`: users can read only their own row; only approved admins can read all rows and update them. There are no insert/delete policies — profiles are created exclusively by the sign-up trigger.
- **No self-promotion**: users have no update policy on their own profile, and roles are never read from sign-up metadata (which the client controls).
- **`public.is_admin()`** is a `security definer` helper so admin policies can query `profiles` without recursing into RLS.
- **`proxy.ts`** refreshes the session on every request and redirects anonymous users away from protected routes. It is an optimistic check only; pages verify role and status server-side through `requireProfile()` in `lib/auth.ts` (the data access layer).
- The **secret key** is used only in `lib/supabase/admin.ts`, guarded by `server-only` so it can never end up in the client bundle.

## Project structure

```
app/
  register/        Sign-up form + server action
  login/           Login form + server action (checks approval status)
  dashboard/       Role-aware dashboard
  auth/actions.ts  Logout server action
  auth/signout/    Route handler that ends the session for revoked users
components/        Shared UI (form fields)
lib/auth.ts        Data access layer: getCurrentProfile(), requireProfile(roles?)
lib/supabase/
  client.ts        Browser client (Client Components)
  server.ts        Server client (Server Components, Server Actions)
  proxy.ts         Session refresh + route guards used by proxy.ts
  admin.ts         Secret-key client, bypasses RLS (server only)
proxy.ts           Next.js proxy (formerly middleware)
supabase/
  schema.sql       Tables, enums, trigger, RLS policies
```

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com/dashboard), then in the dashboard:

- **Authentication → Sign In / Providers → User Signups**: turn **Confirm email** off. Admin approval is the gate; email confirmation is not wired up yet.
- **Authentication → Sign In / Providers → Email**: set **Minimum password length** to `8`.
- **Authentication → URL Configuration**: set **Site URL** to `http://localhost:3000`.

### 2. Apply the schema

Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.

### 3. Create the first admin

Create a user in **Authentication → Users → Add user** (keep *Auto Confirm User* checked), then promote it from the SQL Editor:

```sql
update public.profiles
set role = 'admin', status = 'approved', first_name = 'Jane', last_name = 'Doe', reviewed_at = now()
where email = 'admin@example.com';
```

The SQL Editor runs as `postgres`, which bypasses RLS — this is the only way to bootstrap the first admin.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values from **Project Settings → Data API / API Keys**:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` (no path) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`) — server only, bypasses RLS |

### 5. Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000/register](http://localhost:3000/register) to request an account and [http://localhost:3000/login](http://localhost:3000/login) to sign in.

## Status

- [x] Database schema, trigger and RLS policies
- [x] Session handling with `proxy.ts`
- [x] Sign-up with pending status
- [x] Login gated on approval status, logout
- [x] `/dashboard` with role-specific content
- [ ] `/admin` to approve/reject requests and assign roles
- [ ] Email confirmation (requires custom SMTP)

## Notes

- **Cache Components**: `cacheComponents` is enabled, so anything that reads the session must sit inside `<Suspense>`. `getCurrentProfile()` calls `connection()` first because Supabase checks token expiry with `Date.now()`, which Next.js rejects during prerendering.
- **Test email addresses**: Supabase may reject addresses it considers fake or belonging to someone else (`email_address_invalid`). Use aliases of your own inbox, e.g. `you+editor@gmail.com`.
- **Built-in SMTP**: Supabase's default email service only delivers to members of your project's team and is heavily rate limited. Configure a custom SMTP provider before enabling email confirmation.
