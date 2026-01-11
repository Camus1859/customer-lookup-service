import { Pool } from "pg";


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
    return { postgresSuccessful: Boolean(isClientAlive) };
  } catch (e) {
    console.error(e);
  }
};

export {isPostgresAlive, pool}