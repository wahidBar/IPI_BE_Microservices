const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  identity: String,
  street: String,
  postalCode: String,
  city: String,
  id_city: { type: Number, required: true },
  country: String,
});

module.exports = mongoose.model("address", AddressSchema);
