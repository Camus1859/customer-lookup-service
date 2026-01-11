import Redis from "ioredis";

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

    return { redisSuccessful: pong === "PONG" };
  } catch (e) {
    console.error(e);
    return { success: false, error: e };
  }
};

export { redisClient, isRedisAlive };
