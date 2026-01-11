import { redisClient } from "./redis";

const checkRedisForCustomer = async (id: number) => {
  try {
    return await redisClient.get(`customer:${id.toString()}`);
  } catch (e) {
    return null;
  }
};

const setCustomerToRedisWithTTL = async (id: number, resp: any) => {
  const TTL = Math.floor(Math.random() * (70 - 50) + 50);

  await redisClient.set(
    `customer:${id.toString()}`,
    JSON.stringify(resp.rows[0]),
    "EX",
    TTL
  );
};

const deleteCustomerRedisCache = async (id: number) => {
  await redisClient.del(`customer:${id}`);
};

export {
  checkRedisForCustomer,
  setCustomerToRedisWithTTL,
  deleteCustomerRedisCache,
};
