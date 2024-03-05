const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReviewsSchema = new Schema({
  anonymous: Boolean,
  name: String,
  displayName: String,
  gender: String,
  city: String,
  rating: Number,
  info: String,
  date: { type: Date, default: Date.now() },
  content: String,
  photos: [String],
  thumbnails: [String],
});

module.exports = mongoose.model("reviews", ReviewsSchema);
