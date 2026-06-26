const mysql = require("mysql2/promise");
const config = require("./env");

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: false
    });
  }

  return pool;
}

async function pingDatabase() {
  const [rows] = await getPool().query("SELECT 1 AS ok");
  return rows[0];
}

module.exports = {
  getPool,
  pingDatabase
};
