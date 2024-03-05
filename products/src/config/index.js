const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: 8092,
  DB_URL: "mongodb://localhost:27017/ipi_product",
  APP_SECRET: "jg_youtube_tutorial",
  BASE_URL: process.env.BASE_URL,
  EXCHANGE_NAME: "ONLINE_SHOP",
  MSG_QUEUE_URL:
    "amqps://zdsrcaes:N9XkBves01In8ASXWK7A8oGSDUIa-21x@octopus.rmq3.cloudamqp.com/zdsrcaes",
  USERS_SERVICE: "users_service",
  SHOPPING_SERVICE: "shopping_service",
};
