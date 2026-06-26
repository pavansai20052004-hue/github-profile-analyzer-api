const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("../src/config/env");

async function main() {
  const schemaPath = path.join(process.cwd(), "database", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8").replaceAll("github_profile_analyzer", config.db.database);
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true
  });

  try {
    await connection.query(schema);
    console.log(`Database initialized: ${config.db.database}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Database initialization failed:");
  console.error(error.message);
  process.exit(1);
});
