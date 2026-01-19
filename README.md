## Customer Lookup Service

A backend API demonstrating production-grade caching patterns and observability. Features cache-aside pattern with graceful failure handling—when Redis goes down, the API seamlessly falls back to PostgreSQL.

### Features

- Cache-aside pattern with Redis for fast customer lookups
- Graceful degradation when cache is unavailable
- TTL jitter (50-70s) to prevent thundering herd on cache expiration
- PostgreSQL with connection pooling (20 max connections)
- Health check endpoint for Redis and Postgres connectivity
- Cache invalidation on write (DELETE on update pattern)
- Request tracing and metrics collection for observability

### Tech Stack

Express, TypeScript, PostgreSQL, Redis (ioredis), Docker

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/customers/:id` | Fetch customer (cache-aside) |
| GET | `/api/customers/:id/orders` | Get customer orders |
| PUT | `/api/customers/:id` | Update customer (invalidates cache) |

### Run Locally

```bash
npm install
docker-compose up    # Start Postgres, Redis, Adminer
npm run dev          # Start Express server with hot reload
```

**Service Ports:**
- Express API: `http://localhost:3000`
- Postgres: `localhost:4000`
- Redis: `localhost:6380`
- Adminer (DB viewer): `http://localhost:8080`

### Will Add

- Real-time observability dashboard (React + Vite) with Server-Sent Events
- Interactive metrics panel showing cache hits/misses/error rates
- Request trace viewer with waterfall visualization
- Job queue for async processing (BullMQ)
- Circuit breaker pattern for cascading failure prevention
- Request coalescing to handle simultaneous cache misses
