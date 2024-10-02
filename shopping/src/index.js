const express = require("express");
const { PORT } = require("./config");
const { connectDB, sequelize } = require("./database/connection");
const expressApp = require("./express-app");
const { OrderDetail } = require("./database/models");

const StartServer = async () => {
  const app = express();

  await connectDB();

  console.log("ajlali");
  await expressApp(app);
  app.use("/uploads", express.static("uploads"));
  app
    .listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
