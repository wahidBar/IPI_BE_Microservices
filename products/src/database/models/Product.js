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
const ProductSchema = new Schema({
  name: { type: String },
  banner: { type: String },
  category: [{ type: Schema.Types.ObjectId, ref: "categorys" }],
  short_description: { type: String },
  complete_description: { type: String },
  quantity: {
    total: { type: Number },
    available: { type: Number },
  },
  orders: String,
  storeInfo: {
    storeId: { type: String },
    name: String,
    logo: String,
    storeNumber: Number,
    isTopRated: Boolean,
    ratingCount: Number,
    rating: String,
  },
  ratings: {
    totalStar: Number,
    averageStar: String,
    totalStartCount: Number,
    fiveStarCount: Number,
    fourStarCount: Number,
    threeStarCount: Number,
    twoStarCount: Number,
    oneStarCount: Number,
  },
  images: [{ type: Schema.Types.ObjectId, ref: "product-galery" }],
  reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  variants: [
    {
      optionValueIds: String,
      color: String,
      size: String,
      weight: Number,
      availableQuantity: Number,
      currency: String,
      discount_status: Number,
      discount: Number,
      price: Number,
      discount_price: Number,
    },
  ],
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  view_count: Number,
});

module.exports = mongoose.model("product", ProductSchema);
