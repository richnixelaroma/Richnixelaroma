# Richnixelaroma

Premium perfume and attar storefront built with Express and EJS. This is a lightweight starter implementation; review the production notes below before accepting real payments or customer orders.

## Setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`, then set unique values for `SESSION_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Do not reuse the example values.
4. Run `npm start` and open <http://localhost:3000>.

The app initializes missing JSON files in `data/` and preserves existing data files. Existing malformed JSON is reported as an error instead of silently replaced.

## Environment

- `PORT`: HTTP port (default `3000`).
- `SESSION_SECRET`: required random secret, at least 32 characters.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: required owner login credentials.
- `UPI_ID`: optional UPI payment address; required to offer UPI checkout.
- `NODE_ENV=production`: enables secure session cookies (serve behind HTTPS).
- `TRUST_PROXY=true`: only set when the app is actually behind a trusted reverse proxy.

## Project layout

```text
server.js                 startup only
src/app.js                Express setup and middleware
src/config.js             required environment configuration
src/routes/               storefront and admin HTTP routes
src/services/              order and payment business logic
src/data/                  JSON persistence
src/middleware/            authentication and request protections
public/                    browser assets
views/                     EJS pages and shared templates
data/                      local JSON records
```

Run automated tests with `npm test`.

## Important production limitations

- Orders, products, coupons, and settings are stored in local JSON files. This is single-process storage with no transactional guarantees; move to a database before running multiple instances or handling meaningful sales volume.
- `express-session` uses its default in-memory store. Sessions are lost on restart and do not scale across instances; configure a durable shared session store before production.
- The in-process rate limits are per process and reset on restart. Use a shared limiter for multi-instance deployments.
- UPI links only initiate payment. They do not verify payment; reconcile payments with a payment provider/webhook before marking orders paid.
- Configure HTTPS, backups, monitoring, and a tested recovery process before handling real customer data.
