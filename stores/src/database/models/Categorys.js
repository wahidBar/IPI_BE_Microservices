const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorysSchema = new Schema({
  name: String,
  image: String,
  // icon: String,
});

module.exports = mongoose.model("categorys", CategorysSchema);
