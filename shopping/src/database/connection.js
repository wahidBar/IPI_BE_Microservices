// const mongoose = require("mongoose");
// const { DB_URL } = require("../config");

// module.exports = async () => {
//   try {
//     await mongoose.connect(DB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//     });
//     console.log("Db Connected");
//   } catch (error) {
//     console.log("Error ============");
//     console.log(error);
//   }
// };
const { Sequelize } = require("sequelize");
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require("../config");

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB Connected");
  } catch (error) {
    console.error("Error ============", error);
  }
};

module.exports = { sequelize, connectDB };
