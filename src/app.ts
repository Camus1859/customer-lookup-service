import "dotenv/config";

import express, { Express, Request, Response } from "express";
import Redis from "ioredis";

import { Pool } from "pg";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

    return { redisStatus: pong };
  } catch (e) {
    console.error(e);
    return { success: false, error: e };
  }
};

const checkRedisForCustomer = async (id: number) => {
  try {
    return await redisClient.get(`customer:${id.toString()}`);
  } catch (e) {
    return null;
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

app.get("/api/customers/:id", async (req, res) => {
  const customerId = Number(req.params.id);

  if (!customerId) {
    throw new Error(`Customer with id:${customerId} does not exist`);
  }

  const redisHasCustomerJSON = await checkRedisForCustomer(customerId);

  if (redisHasCustomerJSON) {
    console.log("Cache hit!");

    const redisCustomer = JSON.parse(redisHasCustomerJSON);
    res.send(redisCustomer);
  } else {
    console.log("Cache miss!");

    const query = {
      name: "fetch-customer",
      text: "SELECT * FROM customers WHERE id=$1",
      values: [customerId],
    };

    const resp = await pool.query(query);

    try {
      await redisClient.set(
        `customer:${customerId.toString()}`,
        JSON.stringify(resp.rows[0]),
        "EX",
        60
      );
    } catch (e) {
      console.log(e);
    }

    res.send(resp.rows[0]);
  }
});

app.get("/api/customers/:id/orders", async (req, res) => {
  const customerId = Number(req.params.id);

  if (!customerId) {
    throw new Error(`Customer with id:${customerId} does not exist`);
  }

  const query = {
    name: "fetch-order",
    text: "SELECT * FROM orders WHERE customer_id=$1",
    values: [customerId],
  };

  const resp = await pool.query(query);

  res.send(resp.rows);
});

app.put("/api/customers/:id", async (req, res) => {
  const customerId = Number(req.params.id);
  const name = req.body.name;

  if (!customerId) {
    throw new Error(`Customer with id:${customerId} does not exist`);
  }

  if (!name) {
    throw new Error(`Name value of:${name} is not allowed`);
  }

  const query = {
    name: "update-users-name",
    text: `UPDATE customers SET name = $1 WHERE id = $2`,
    values: [name, customerId],
  };

  const resp = await pool.query(query);

  try {
    await redisClient.del(`customer:${customerId}`);
  } catch (e) {
    console.error(e);
  }
  res.send(resp);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
