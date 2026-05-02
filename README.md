# Reservations API

REST API for managing amenity reservations built with NestJS, Prisma, and PostgreSQL.

## Task

Build an API that exposes data from two CSV files (amenity.csv, reservations.csv) and implements:

1. GET /amenities/:id/reservations?date=<timestamp> — list of reservations for a specific amenity on the given day (timestamp can be any time during that day).
2. GET /users/:id/reservations — all reservations for a user, grouped by day.
3. POST /csv/parse — upload a CSV file and receive JSON (works for amenity.csv and reservations.csv).

Bonus: Register/login with JWT; the /csv/parse endpoint requires authentication.

---

## Implemented

- All 3 mandatory endpoints + auth bonus (register/login with JWT).
- Data persisted in PostgreSQL via Prisma; CSV data is seeded on startup (seed script).
- Auth endpoints: POST /auth/register and POST /auth/login — login returns an accessToken (Bearer JWT).
- Input validation using Zod and global error handling.
- Docker + docker-compose, health checks, rate limiting, request body size limits, and structured logging (pino).
- Unit and e2e tests included in the repository.

---

## Endpoints

### Auth

#### `POST /auth/register`

Register a new user. Returns `201 Created` on success.

**Request**
```json
{
  "username": "user1",
  "password": "mypassword"
}
```

**Validation:** `username` 3–32 chars, `password` min 8 chars.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"mypassword"}'
```

---

#### `POST /auth/login`

Login and receive a Bearer JWT token. Returns `200 OK` on success.

**Request**
```json
{
  "username": "user1",
  "password": "mypassword"
}
```

**Response**
```json
{
  "accessToken": "<JWT>"
}
```

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"mypassword"}'
```

---

### Reservations

#### `GET /amenities/:id/reservations?date=<timestamp>`

Returns reservations for a specific amenity on the given day.
`date` can be any Unix timestamp (ms) or ISO string — any moment within the desired day.

```bash
curl "http://localhost:3000/amenities/123/reservations?date=1672531200000"
```

---

#### `GET /users/:id/reservations`

Returns all reservations for a user, grouped by day.

```bash
curl "http://localhost:3000/users/456/reservations"
```

---

### CSV

#### `POST /csv/parse` 🔒 *(requires JWT)*

Upload a CSV file (`amenity.csv` or `reservations.csv`) and receive parsed JSON.

```bash
curl -X POST http://localhost:3000/csv/parse \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@amenity.csv"
```

---

## Data and database

- On first run the service seeds CSV data into the database (see pnpm seed).
- Prisma is used to access PostgreSQL. Make sure DATABASE_URL in .env is set before running.

---

## Running

Docker (recommended):

```bash
docker compose up --build
```

Local development:

```bash
pnpm install
cp .env.example .env
# Windows: copy .env.example .env
docker compose up -d postgres
pnpm exec prisma migrate deploy
pnpm seed
pnpm start:dev
```

API is available at: http://localhost:3000 (check PORT in .env)

---

## Tests

```bash
pnpm test        # unit tests
pnpm test:e2e    # e2e tests (requires postgres)
```

---

## Common issues

- 404 Cannot GET /auth/login — you made a GET request; /auth/login only accepts POST. Use POST for /auth/login.
- 409 on registration — username already taken.
- 401/403 on /csv/parse — missing or invalid JWT.

---
