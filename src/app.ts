import "dotenv/config";

import express, { Express, Request, Response } from "express";
import Redis from "ioredis";

import { Pool } from "pg";

const app: Express = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.POSTGRESPORT),
  host: process.env.POSTGRESHOST,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

const isPostgresAlive = async () => {
  try {
    const client = await pool.connect();
    const isClientAlive = await client.query("SELECT NOW()");

    if (!isClientAlive) {
      throw new Error("POSTGRES IS DOWN!");
    }

    client.release();
    return { success: 200 };
  } catch (e) {
    console.error(e);
  }
};

const redisClient = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

const isRedisAlive = async () => {
  try {
    const pong = await redisClient.ping();

    if (pong !== "PONG") {
      throw new Error("Redis is down!");
    }

    return { success: 200 };
  } catch (e) {
    console.error(e);
  }
};

app.get("/health", async (req: Request, res: Response) => {
  const redisHealthCheckResults = await isRedisAlive();
  const postgresHealthCheckResults = await isPostgresAlive();
  res.send({
    redis: redisHealthCheckResults,
    postgres: postgresHealthCheckResults,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
