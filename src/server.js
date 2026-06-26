const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`GitHub Profile Analyzer API running on port ${config.port}`);
});
