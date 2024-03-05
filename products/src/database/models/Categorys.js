const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorysSchema = new Schema({
  nama: String,
  image: String,
});

module.exports = mongoose.model("categorys", CategorysSchema);
