const { Sequelize } = require("sequelize");
const { DB_URL, DB_USER, DB_PORT, DB_NAME, DB_PASSWORD } = require("../config");

console.log(
  `Connecting to DB at ${DB_URL}:${DB_PORT}/${DB_NAME} with user ${DB_USER}`
);

// Membuat instance Sequelize untuk koneksi ke database MySQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_URL,
  port: DB_PORT,
  dialect: "mysql", // Dialect MySQL
});

const connectDB = async () => {
  try {
    await sequelize.authenticate(); // Mencoba untuk terkoneksi ke database
    console.log("DB Connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
