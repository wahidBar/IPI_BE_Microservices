const dotenv = require("dotenv");

// Memuat konfigurasi environment berdasarkan environment mode (dev, prod, etc)
if (process.env.NODE_ENV !== "prod") {
  console.log("Loading environment from .env file");
  const configFile = `./.env.${process.env.NODE_ENV}`.trim(); // Load env file sesuai mode
  dotenv.config({ path: configFile });
} else {
  dotenv.config(); // Default load untuk production
}

module.exports = {
  PORT: process.env.PORT,
  DB_PORT: process.env.DB_PORT,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  APP_SECRET: process.env.APP_SECRET,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  STORES_SERVICE: "stores_service",
  USERS_SERVICE: "users_service",
  SHOPPING_SERVICE: "shopping_service",
};
