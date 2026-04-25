const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "task_manager",
  password: "11111", // ganti sesuai pgAdmin
  port: 5432,
});

module.exports = pool;