const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  console.log("ini" + process.env.NODE_ENV);
  const configFile = `./.env.${process.env.NODE_ENV}`.trim();
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}
// console.log(PORT);

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  BASE_URL: process.env.BASE_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  USERS_SERVICE: "users_service",
  SHOPPING_SERVICE: "shopping_service",
};
