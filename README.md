# BizLeap Lead Management System

The API implements administrator authentication, lead CRUD, list search and filters, pagination, dashboard totals, and a 30-day UTC trend. Requests and responses follow [API contract v1.0](docs/api-contract.md).

## Requirements

Use Node.js 22.13+ or 24 LTS, PowerShell, and a running MongoDB server. The default ports are 27017 for MongoDB, 5000 for Express, and 5173 for Vite.

## Backend

From the repository root in a PowerShell terminal:

```powershell
Set-Location server
npm.cmd install
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in the local `server/.env` as `JWT_SECRET`. Add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to that file and choose your own credentials. The password needs at least 12 characters and at most 72 UTF-8 bytes. Use quotes in `.env` if the password intentionally contains surrounding spaces or a `#`. Set `MONGODB_URI` for your local database. Keep `server/.env` private.

```powershell
npm.cmd run seed
npm.cmd run dev
```

The seed creates one administrator and 40 fictional leads on an empty database. Rerunning it preserves the existing administrator and edits to sample leads. Use the credentials supplied during the first successful seed to sign in. Changing the seed variables later does not rotate the stored administrator credentials. The seed variables are required for `npm.cmd run seed` only. Express needs `JWT_SECRET` at startup.

## Frontend

From the repository root in a second PowerShell terminal:

```powershell
Set-Location client
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards relative `/api` requests to Express. The browser sends the HTTP-only session cookie with same-origin requests. Login, logout, and lead writes require an exact `APP_ORIGIN` match or a same-origin Referer when the Origin header is absent. Use the origin configured in `APP_ORIGIN` when opening the frontend.

## Sessions and HTTPS

Sessions expire after eight hours. Logout clears the browser cookie. An existing copy of a token stays valid until it expires while the administrator record retains its admin role and the signing key stays the same. Login is limited to `LOGIN_RATE_LIMIT` attempts per IP every 15 minutes per API process, defaulting to 10.

Express listens on `127.0.0.1`. For production, set `NODE_ENV=production` and `APP_ORIGIN` to the exact public HTTPS origin. The same-host TLS reverse proxy must serve the frontend and forward `/api` from that origin to Express. Configure it to replace incoming `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` with trusted request values. The login limiter uses the forwarded client IP in this setup.

## Checks

From the repository root in PowerShell:

```powershell
Set-Location server
npm.cmd run lint
npm.cmd test
```

The integration suite signs in with a generated test administrator in an isolated, randomly named MongoDB database. It pings MongoDB before the API checks and drops the test database afterward. By default it uses `mongodb://127.0.0.1:27017`. Set `$env:MONGODB_TEST_URI` if you use a different MongoDB server for tests. The connection needs permission to create and drop the temporary database.

To check the frontend scaffold, run `npm.cmd run build` and `npm.cmd run lint` from `client/`.
