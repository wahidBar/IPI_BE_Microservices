// const dotEnv = require("dotenv");

// if (process.env.NODE_ENV == "dev") {
//   const configFile = `./.env.${process.env.NODE_ENV}`;
//   dotEnv.config({ path: configFile });
// } else {
//   console.log("halo");
//   dotEnv.config();
// }

// module.exports = {
//   PORT: 8003,
//   // DB_URL: process.env.MYSQL_DATABASE, // Change this line to use MySQL database
//   // DB_HOST: process.env.MYSQL_HOST, // Add this line for MySQL host
//   // DB_PORT: process.env.MYSQL_PORT, // Add this line for MySQL port
//   // DB_USER: process.env.MYSQL_USER, // Add this line for MySQL user
//   // DB_PASSWORD: process.env.MYSQL_PASSWORD, // Add this line for MySQL password
//   APP_SECRET: "jg_youtube_tutorial",
//   BASE_URL: process.env.BASE_URL,
//   DB_HOST: "localhost",
//   DB_PORT: 3306,
//   DB_URL: "db_ikmp",
//   DB_USER: "root",
//   DB_PASSWORD: "wahid112*",
//   EXCHANGE_NAME: "ONLINE_SHOP",
//   USERS_SERVICE: "users_service",
//   SHOPPING_SERVICE: "shopping_service",
//   MSG_QUEUE_URL: "amqp://guest:guest@localhost:5672",
// };
const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: 8095,
  DB_URL: "mongodb://localhost:27017/ipi_shopping",
  APP_SECRET: "jg_youtube_tutorial",
  BASE_URL: process.env.BASE_URL,
  EXCHANGE_NAME: "ONLINE_SHOP",
  MSG_QUEUE_URL:
    "amqps://zdsrcaes:N9XkBves01In8ASXWK7A8oGSDUIa-21x@octopus.rmq3.cloudamqp.com/zdsrcaes",
  USERS_SERVICE: "users_service",
  SHOPPING_SERVICE: "shopping_service",
};
// MONGODB_URI='mongodb://localhost:27017/ipi_users'

// MSG_QUEUE_URL='amqps://zdsrcaes:N9XkBves01In8ASXWK7A8oGSDUIa-21x@octopus.rmq3.cloudamqp.com/zdsrcaes'
