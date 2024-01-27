const mongoose = require("mongoose");
const { DB_URL } = require("../config");

module.exports = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Db Connected");
  } catch (error) {
    console.log("Error ============");
    console.log(error);
  }
};

// const { Sequelize } = require("sequelize");

// const db = new Sequelize("db_ikmp", "root", "wahid112*", {
//   host: "localhost",
//   dialect: "mysql",
// });

// const databaseConnection = async () => {
//   try {
//     await db.authenticate();
//     console.log(
//       "Connection to the database has been established successfully."
//     );
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };

// module.exports = {
//   db,
//   databaseConnection, // Export the function for connection
// };
