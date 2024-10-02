const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorysSchema = new Schema({
  name: String,
  images: String,
  // icon: String,
});

module.exports = mongoose.model("product-galery", CategorysSchema);
