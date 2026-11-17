# Richnixelaroma

Premium perfume and attar storefront built with Express and EJS. Before taking real payments or customer orders, review the production notes below.

## Setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`, then set unique values for `SESSION_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Never use example credentials.
4. Run `npm start` and open <http://localhost:3000>.

The default persistence adapter is JSON and initializes missing files in `data/` without overwriting existing files. Malformed JSON is reported as an error.

## Data adapter

Set `DATA_ADAPTER=json` (the default) to use local JSON persistence. The application data facade in `src/data/store.js` consumes an adapter contract (`initialize(defaults)`, `get(collection, fallback)`, and `set(collection, value)`) so a SQLite or PostgreSQL adapter can be added without changing route/service callers. No SQL adapter is included yet; JSON remains the active backend until one is implemented and explicitly selected.

## Frontend

Browser code is split into ES modules under `public/js/`: `storefront.js`, `cart.js`, `checkout.js`, and `admin.js`, with `app.js` as the page initializer. Checkout totals are verified server-side from catalog prices and active coupons; browser-provided prices are never trusted.

## Environment

- `PORT`: HTTP port (default `3000`).
- `SESSION_SECRET`: required random secret, at least 32 characters.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: required owner login credentials.
- `UPI_ID`: optional UPI payment address; required to offer UPI checkout.
- `DATA_ADAPTER`: `json` (default; other adapters are not included).
- `NODE_ENV=production`: enables secure session cookies (serve behind HTTPS).
- `TRUST_PROXY=true`: only set when the app is behind a trusted reverse proxy.

Run automated tests with `npm test`.

## Production limitations

- JSON storage is single-process persistence without transactions. Use a proper database adapter before running multiple application instances.
- `express-session` uses its default in-memory store; sessions are lost on restart and do not scale across instances.
- Rate limits are in-process and reset on restart.
- UPI links only initiate payment. They do not verify payment; reconcile with a payment provider/webhook before marking orders paid.
- Configure HTTPS, backups, monitoring, and tested recovery procedures before handling real customer data.
