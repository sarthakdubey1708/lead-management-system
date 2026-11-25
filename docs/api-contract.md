# Lead Management System — API contract v1.0

BizLeap INC. | Web Developer Intern assignment | 25 November 2026

This is the proposed frozen interface for the Express backend and React frontend. It is a specification, not yet an implemented or tested API. Changes after frontend development begins require agreement by both sides.

## Transport and conventions

- Browser base URL: `/api`. In development Vite (port 5173) proxies `/api` to Express (port 5000). Production serves the UI and API under the same origin (Express serves the Vite build or a reverse proxy routes `/api`). No cross-origin browser API calls are required.
- Requests with a body use `Content-Type: application/json`. Responses are JSON. Send `Accept: application/json`.
- All protected endpoints require the `access_token` HTTP-only cookie. Never store JWTs in localStorage, sessionStorage or React state. Use `credentials: 'same-origin'` for fetch or equivalent Axios same-origin behavior.
- Successful response envelope: `{ "success": true, "data": ... }`. List responses also include top-level `pagination`. No-content actions use HTTP 200 with `data: null`.
- Error envelope: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Please check the submitted fields.", "fields": { "email": "Enter a valid email address." } } }`. `fields` is optional and maps field or query parameter names to strings. Do not expose stack traces.
- IDs are MongoDB ObjectId strings (`_id`). Timestamps are ISO 8601 UTC strings. Field names are camelCase and enums are case-sensitive.

## Data objects

User (safe public representation):

```json
{"_id":"674400000000000000000001","name":"Administrator","email":"admin@example.com","role":"admin"}
```

Lead (example):

```json
{
  "_id":"674400000000000000000002",
  "fullName":"Alex Morgan",
  "email":"alex.morgan@example.com",
  "phone":"+1 202-555-0101",
  "companyName":"Northstar Studio",
  "leadSource":"Website",
  "leadStatus":"New",
  "createdAt":"2026-11-25T10:00:00.000Z",
  "updatedAt":"2026-11-25T10:00:00.000Z"
}
```

| Writable field | Rules |
|---|---|
| `fullName` | String, trimmed, 2–100 characters |
| `email` | String, trimmed/lowercased, valid email, maximum 254 characters |
| `phone` | String, trimmed, 7–15 digits; optional leading `+`, spaces, parentheses and hyphens allowed; max 32 characters |
| `companyName` | String, trimmed, 1–150 characters |
| `leadSource` | `Website`, `Instagram`, `LinkedIn`, `Referral`, `Advertisement`, `Cold Calling` |
| `leadStatus` | `New`, `Contacted`, `Interested`, `Converted`, `Lost` |

All six fields required on PUT; POST allows omission of `leadStatus` (defaults to `New`). Reject unknown fields, client-supplied IDs and timestamps. Lead email is not unique; administrator email is unique. `passwordHash` never appears in responses.

## Endpoints

| Method | Path | Auth | Success |
|---|---|---|---|
| POST | `/api/auth/login` | No | 200 |
| GET | `/api/auth/me` | Yes | 200 |
| POST | `/api/auth/logout` | No (idempotent; origin check required) | 200 |
| GET | `/api/leads` | Yes | 200 |
| POST | `/api/leads` | Yes | 201 |
| GET | `/api/leads/:id` | Yes | 200 |
| PUT | `/api/leads/:id` | Yes | 200 |
| DELETE | `/api/leads/:id` | Yes | 200 |
| GET | `/api/dashboard/summary` | Yes | 200 |

### POST /api/auth/login

Request:

```json
{"email":"admin@example.com","password":"<your-seeded-admin-password>"}
```

Email required, valid; password required, nonempty string, maximum 72 UTF-8 bytes (bcrypt limit). Never trim password. Bad credentials return 401 `INVALID_CREDENTIALS` without disclosing whether the user exists. Rate-limit repeated login requests (429).

Response 200 (also sets cookie):

```json
{"success":true,"data":{"user":{"_id":"674400000000000000000001","name":"Administrator","email":"admin@example.com","role":"admin"}}}
```

### GET /api/auth/me

No request body. Returns exactly the login response shape, with current user data. Missing, expired or invalid cookie returns 401 `UNAUTHORIZED`.

### POST /api/auth/logout

No request body. Clears the cookie using matching path and options; succeeds even when missing/expired. Response:

```json
{"success":true,"data":null}
```

### GET /api/leads

Example: `/api/leads?search=alex&status=New&source=Website&page=1&limit=10`

| Query | Rules |
|---|---|
| `search` | Optional; trimmed, max 100 chars; case-insensitive literal substring across fullName, email, phone, companyName |
| `status` | Optional; one exact lead status |
| `source` | Optional; one exact lead source |
| `page` | Positive integer; default 1 |
| `limit` | Integer 1–100; default 10 |

Filters combine with AND; search fields combine with OR. Omit empty search and filters. `All` is a UI label only, not an API enum. Reject invalid enum, pagination or unknown query parameters with 400. Escape regex metacharacters and validate scalar input to prevent injection. Sort by `createdAt` descending, then `_id` descending. Empty/out-of-range pages return 200 and an empty array. `totalPages` is 0 when no matches.

Response 200 (one matching lead):

```json
{
  "success":true,
  "data":[{"_id":"674400000000000000000002","fullName":"Alex Morgan","email":"alex.morgan@example.com","phone":"+1 202-555-0101","companyName":"Northstar Studio","leadSource":"Website","leadStatus":"New","createdAt":"2026-11-25T10:00:00.000Z","updatedAt":"2026-11-25T10:00:00.000Z"}],
  "pagination":{"page":1,"limit":10,"total":1,"totalPages":1}
}
```

### POST /api/leads

Request:

```json
{"fullName":"Alex Morgan","email":"alex.morgan@example.com","phone":"+1 202-555-0101","companyName":"Northstar Studio","leadSource":"Website","leadStatus":"New"}
```

Response 201: `{ "success": true, "data": <complete Lead object> }`. Here and below angle-bracket placeholders describe the full object defined above; they are not literal JSON. Server creates ID and timestamps.

### GET /api/leads/:id

No body. Response 200: `{ "success": true, "data": <complete Lead object> }`. Invalid ObjectId format returns 400 `INVALID_ID`; valid but missing ID returns 404 `LEAD_NOT_FOUND`.

### PUT /api/leads/:id

Full update of writable fields. Send all six fields, including unchanged ones. Example status update:

```json
{"fullName":"Alex Morgan","email":"alex.morgan@example.com","phone":"+1 202-555-0101","companyName":"Northstar Studio","leadSource":"Website","leadStatus":"Contacted"}
```

Response 200: `{ "success": true, "data": <complete updated Lead object> }`. `createdAt` remains unchanged and `updatedAt` is managed by the server. Invalid/missing IDs handled as above. Any allowed status may transition to another; no mandatory workflow sequence.

### DELETE /api/leads/:id

No body. Hard deletes one record. UI should request confirmation. Invalid/missing IDs handled as above.

Response 200: `{"success":true,"data":null}`.

### GET /api/dashboard/summary

No body or filters. All current leads are included in totals and breakdowns. `leadsOverTime` reports counts of leads created each UTC day over the last 30 calendar days, including today, sorted oldest to newest. Zero-fill missing days. Deleted leads are excluded; not a historical audit log. `byStatus` and `bySource` contain every allowed enum in declared order, including zero counts.

Example response shape (illustrative counts, not hardcoded implementation; time series abbreviated for readability, actual length exactly 30):

```json
{
  "success":true,
  "data":{
    "totalLeads":40,"newLeads":12,"contactedLeads":10,"interestedLeads":8,"convertedLeads":6,"lostLeads":4,
    "byStatus":[{"status":"New","count":12},{"status":"Contacted","count":10},{"status":"Interested","count":8},{"status":"Converted","count":6},{"status":"Lost","count":4}],
    "bySource":[{"source":"Website","count":10},{"source":"Instagram","count":6},{"source":"LinkedIn","count":8},{"source":"Referral","count":7},{"source":"Advertisement","count":5},{"source":"Cold Calling","count":4}],
    "leadsOverTime":[{"date":"2026-10-27","count":1},{"date":"2026-10-28","count":2}]
  }
}
```

Conversion rate (if displayed): `totalLeads ? convertedLeads / totalLeads * 100 : 0`. Recent leads: use `GET /api/leads?limit=5`. Refresh summary after mutations. Do not infer changes from fixture counts.

## Error codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body/query or malformed JSON |
| 400 | `INVALID_ID` | Malformed lead ID |
| 401 | `INVALID_CREDENTIALS` | Login failed |
| 401 | `UNAUTHORIZED` | Missing/expired/invalid session |
| 403 | `FORBIDDEN` | Insufficient role or rejected request origin |
| 404 | `LEAD_NOT_FOUND` | Valid ID, no matching lead |
| 404 | `NOT_FOUND` | Unknown route |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Incorrect content type for a body-bearing request |
| 429 | `RATE_LIMITED` | Too many login attempts |
| 500 | `INTERNAL_ERROR` | Unexpected server failure |

Example 400:

```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Please check the submitted fields.","fields":{"email":"Enter a valid email address."}}}
```

## Authentication and security

Seed one administrator using bcryptjs (cost 12); compare submitted password with stored hash. JWT is HS256, includes `sub` (user ID), `iat`, `exp`, expires in 8 hours. Verify signature, algorithm, expiration and current administrator role on protected routes. Cookie `access_token`: HttpOnly, SameSite=Strict, Path=/api, Max-Age=28800; Secure=true in HTTPS production and false only in local HTTP development. No Domain attribute. No token returned in body. No refresh token or registration. Logout clears browser cookie; it does not revoke an already copied token, which remains valid until expiry. Use TLS in production.

For every unsafe method (POST/PUT/DELETE), validate browser Origin against exact APP_ORIGIN; reject mismatches including `null`. If Origin is absent, require an exact-origin Referer or reject (API tests should send Origin explicitly). Require JSON for requests with bodies. SameSite and origin validation mitigate CSRF; HttpOnly mitigates direct script access to token, not all XSS consequences. Do not enable permissive CORS. Limit request body size, rate-limit login, use security headers, and never log passwords/cookies. Production deployment should use same-origin HTTPS.

## Environment variables

`server/.env.example`:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lead_management
APP_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_random_64_hex_character_secret
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_private_password
```

Generate JWT secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Admin seed password must be 12+ characters and at most 72 UTF-8 bytes. Seed variables are only required when running the seed; do not expose them to the frontend. Reject placeholder secrets before startup/seed as applicable. Use production `APP_ORIGIN` with HTTPS and production MongoDB URI. Never commit actual `.env` files.

`client/.env.example`:

```dotenv
VITE_API_BASE_URL=/api
```

Vite variables are public, never put secrets there. Vite proxy target can be configured in `vite.config.js` (default `http://localhost:5000`); frontend code uses `/api`, not the direct Express origin.

## Frontend integration behavior

On initial load, call `/auth/me` with a loading state before deciding protected route access. A 401 outside the login form clears React user state and redirects to login. Login 401 shows the form error. On successful login/logout, update user state. Handle loading, empty, validation and network error states. Search debounce ~300 ms; reset page to 1 on search/filter change; omit `All` values; keep table in sync after CRUD. For status-only UI changes send full PUT payload using the current lead. On successful mutation refetch list and dashboard. Chart labels should use API enums, and `leadsOverTime.date` should be treated as a UTC date label (avoid local conversion shifting the day).

## Scope assumptions

Single administrator, shared leads, no public registration, no lead ownership, no follow-up date/reminder/task system (status tracking covers basic follow-up organization), no audit history, no separate refresh token, no enterprise role management. Leads may share email addresses. Six source options are treated as a fixed enum. Dashboard trend is UTC. Deployment optional; same-origin layout preferred. Initial seed is exactly 40 fictional leads with agreed status distribution on a fresh database; reruns insert only missing stable seed IDs and do not overwrite edited rows or remove other records.
