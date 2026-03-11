# Chirpy API

A RESTful API server built with Express.js and PostgreSQL (via Drizzle ORM) that supports user management, authentication, and chirp (short message) functionality.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

This will install all required packages:

**Runtime dependencies:** `express` ^5.2.1, `drizzle-orm` ^0.45.1, `postgres` ^3.4.8, `jsonwebtoken` ^9.0.3, `argon2` ^0.44.0

**Dev dependencies:** `typescript` ^5.9.3, `drizzle-kit` ^0.31.9, `vitest` ^4.0.18, `@types/express` ^5.0.6, `@types/jsonwebtoken` ^9.0.10, `@types/node` ^25.3.0

2. Set up your environment variables. At minimum you'll need a database connection URL (see `config.js` for the expected config shape).

3. Start the server:

```bash
node --experimental-vm-modules src/index.js
```

The server runs on `http://localhost:8080` and automatically runs database migrations on startup.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `npx tsc` | Compiles TypeScript to JavaScript in `dist/` |
| `start` | `node dist/index.js` | Runs the compiled production server |
| `dev` | `npx tsc && node dist/index.js` | Builds and starts the server in one step |
| `test` | `vitest --run` | Runs the test suite once (non-watch mode) |
| `generate` | `drizzle-kit generate` | Generates SQL migration files from schema changes |
| `migrate` | `drizzle-kit migrate` | Applies pending migrations to the database |

---

## API Reference

### Health & Admin

#### `GET /api/healthz`
Returns the readiness status of the server.

#### `GET /admin/metrics`
Returns request metrics and usage statistics.

#### `POST /admin/reset`
Resets server metrics or state. Intended for admin/testing use.

---

### Users

#### `POST /api/users`
Creates a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

#### `PUT /api/users`
Updates the authenticated user's information. Requires a valid JWT bearer token.

**Headers:**
```
Authorization: Bearer ${Access Token}
```

**Request body:**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword"
}
```

---

### Authentication

#### `POST /api/login`
Authenticates a user and returns access and refresh tokens.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "<JWT access token>",
  "refresh_token": "<refresh token>"
}
```

#### `POST /api/refresh`
Issues a new access token using a valid refresh token. Provide the refresh token as a bearer token in the `Authorization` header.

**Headers:**
```
Authorization: Bearer ${Refresh Token}
```

#### `POST /api/revoke`
Revokes a refresh token, effectively logging the user out. Provide the refresh token as a bearer token in the `Authorization` header.

**Headers:**
```
Authorization: Bearer ${Refresh Token}
```
---

### Chirps

#### `GET /api/chirps`
Retrieves all chirps. Supports optional query parameters for filtering and sorting.

#### `GET /api/chirps/:chirpId`
Retrieves a single chirp by its ID.

#### `POST /api/chirps`
Creates a new chirp. Requires a valid JWT bearer token.

**Headers:**
```
Authorization: Bearer ${Access Token}
```

**Request body:**
```json
{
  "body": "Your chirp content here"
}
```

#### `DELETE /api/chirps/:chirpId`
Deletes a chirp by ID. Requires a valid JWT bearer token. Only the chirp's author can delete it.

**Headers:**
```
Authorization: Bearer ${Access Token}
```
---

### Webhooks

#### `POST /api/polka/webhooks`
Endpoint for receiving webhook events from Polka. Requires a valid Polka API key in the `Authorization` header.

**Headers:**
```
Authorization: ApiKey ${Polka API Key}
```
---

## Static Files

The `/app` path serves static files from `src/app` and tracks request metrics via middleware.

---

## Middleware

- **Response logging** — logs all incoming requests and outgoing responses
- **Metrics tracking** — increments counters for `/app` route traffic
- **Error handling** — catches and formats errors from all route handlers
- **JSON parsing** — parses JSON request bodies automatically

---

## Tech Stack

- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM (with auto-migration on startup)