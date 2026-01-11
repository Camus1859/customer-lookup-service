import { pool } from "./postgres";

const getCustomerById = async (id: number) => {
  console.log("Cache miss!");

  const query = {
    name: "fetch-customer",
    text: "SELECT * FROM customers WHERE id=$1",
    values: [id],
  };

  return await pool.query(query);
};

const updateCustomerByIdAndName = async (id: number, name: string) => {
  const query = {
    name: "update-users-name",
    text: `UPDATE customers SET name = $1 WHERE id = $2`,
    values: [name, id],
  };

  return await pool.query(query);
};

const getOrdersByCustomerId = async (id: number) => {
      const query = {
        name: "fetch-order",
        text: "SELECT * FROM orders WHERE customer_id=$1",
        values: [id],
      };

     return await pool.query(query);
}

export { getCustomerById, updateCustomerByIdAndName, getOrdersByCustomerId };
