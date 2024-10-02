const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// const Schema = mongoose.Schema;
//
// const ProductSchema = new Schema({
//   name: String,
//   desc: String,
//   banner: String,
//   type: String,
//   unit: Number,
//   price: Number,
//   available: Boolean,
//   suplier: String,
// });

const Schema = mongoose.Schema;
const StoreSchema = new Schema({
  name: { type: String },
  description: { type: String },
  banner: { type: String, required: true },
  phone: { type: String },
  city: { type: String, required: true },
  id_city: { type: Number, required: true },
  postalCode: { type: Number, required: true },
  latitude: { type: String },
  longitude: { type: String },
  status: { type: Number, required: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("store", StoreSchema);
