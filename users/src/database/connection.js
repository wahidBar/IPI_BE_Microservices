const mongoose = require("mongoose");
const { DB_URL } = require("../config");
const { UsersModel } = require("../database/models");
const { GeneratePassword, GenerateSalt } = require("../utils");

module.exports = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Db Connected");
    const existingAdmin = await UsersModel.findOne({
      username: "wahid@admin.com",
    });
    if (!existingAdmin) {
      const salt = await GenerateSalt();
      const userPassword = await GeneratePassword("wahid112", salt);
      const newAdmin = new UsersModel({
        username: "wahid@admin.com",
        password: userPassword,
        salt: salt,
        role_id: 1,
      });
      await newAdmin.save();
      console.log("Admin user created successfully!");
    } else {
      // console.log("ANY");
    }
  } catch (error) {
    console.error("Error ============ ON DB Connection");
    console.log(error);
  }
};
