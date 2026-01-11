import "dotenv/config";

import express, { Express, Request, Response } from "express";
import { isPostgresAlive } from "./db/postgres";
import { isRedisAlive } from "./cache/redis";
import {
  getCustomerById,
  getOrdersByCustomerId,
  updateCustomerByIdAndName,
} from "./db/customerQueries";
import {
  checkRedisForCustomer,
  deleteCustomerRedisCache,
  setCustomerToRedisWithTTL,
} from "./cache/cacheQueries";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
    const resp = await getCustomerById(customerId);

    try {
      await setCustomerToRedisWithTTL(customerId, resp);
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

  const resp = await getOrdersByCustomerId(customerId);

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

  const resp = await updateCustomerByIdAndName(customerId, name);

  try {
    await deleteCustomerRedisCache(customerId);
  } catch (e) {
    console.error(e);
  }
  res.send(resp);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
