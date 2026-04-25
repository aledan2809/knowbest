# knowbest — API Reference

## Authentication Endpoints

### `POST /api/auth/[...nextauth]`
NextAuth catch-all for sign-in, callback, session, signout. Uses Prisma adapter + Email Magic Link provider.

**Env dependencies:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`

### `POST /api/admin/auth`
Admin password authentication, separate from NextAuth. Uses bcrypt + JWT.

**Env dependencies:** `ADMIN_PASSWORD` (bcrypt hash), `ADMIN_SECRET` (JWT signing). Both required — throws `Error` at startup if missing.

**Request body:** `{ password: string }`
**Response 200:** `{ token: string, expiresIn: number }`
**Response 401:** `{ error: "Invalid credentials" }`

## Public Endpoints

### `POST /api/contact`
Contact form submission. Protected by Zod validation + CSRF (as of AUDIT-005/008 fix).

**Request body (validated):**
```json
{
  "name": "string (min 2)",
  "email": "valid email",
  "message": "string (min 10, max 5000)"
}
```
**Response 200:** `{ success: true, id: string }`
**Response 400:** `{ error: "Validation failed", issues: [...] }`

### `GET /api/partners`
Returns partner logo list. Currently reads hardcoded array (migration to `Partner` model pending, AUDIT-009).

**Response 200:** `Partner[]`

### `GET /api/page-content`
Returns CMS blocks for a given slug.

**Query params:** `?slug=homepage-hero`
**Response 200:** `{ slug, blocks: [...] }`

### `POST /api/ai`
AI proxy through `ai-router`. Routes to available provider (claude, gemini, etc.) based on task classification.

**Request body (validated):**
```json
{
  "prompt": "string",
  "task": "string (optional)"
}
```

## Payment Endpoints

### `POST /api/create-checkout-session`
Creates Stripe Checkout Session for subscription signup.

**Request body (validated):**
```json
{
  "priceId": "stripe_price_id",
  "successUrl": "string (url)",
  "cancelUrl": "string (url)"
}
```
**Response 200:** `{ url: string, sessionId: string }`

### `POST /api/stripe-webhook`
Handles Stripe events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

**Signature verification:** `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`

## Admin Endpoints

All require valid admin JWT in `Authorization: Bearer <token>` header.

### `GET | POST | PUT | DELETE /api/admin/projects`
CRUD on Project model.

### `GET | POST | PUT | DELETE /api/admin/partners`
CRUD on Partner model (future — currently returns mock data).

### `GET | POST | PUT | DELETE /api/admin/page-content`
CRUD on PageContent CMS blocks.

## Error Response Shape

All endpoints return consistent error structure:

```json
{
  "error": "human-readable message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": { /* optional context */ }
}
```

HTTP codes:
- `400` — validation / bad request
- `401` — auth required or invalid
- `403` — forbidden (CSRF, origin check)
- `404` — not found
- `429` — rate limited (planned, not yet implemented)
- `500` — internal
