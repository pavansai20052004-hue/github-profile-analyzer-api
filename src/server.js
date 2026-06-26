const app = require("./app");
const config = require("./config/env");

app.listen(config.port, config.host, () => {
  console.log(`GitHub Profile Analyzer API running on ${config.host}:${config.port}`);
});
