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
  category: [
    {
      idCategory: { type: Number },
      nama: String,
      image: String,
    },
  ],
  short_description: String,
  complete_description: String,
  quantity: {
    total: { type: Number },
    available: { type: Number },
  },
  orders: String,
  storeInfo: {
    storeId: { type: Number },
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
  images: [String],
  reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  variants: {
    options: [
      {
        id: Number,
        name: String,
        values: [
          {
            id: Number,
            name: String,
            displayName: String,
            image: String,
          },
        ],
      },
    ],
    prices: [
      {
        skuId: { type: String },
        optionValueIds: String,
        availableQuantity: Number,
        currency: String,
        discount_status: Number,
        discount: Number,
        originalPrice: {
          formatedAmount: String,
          value: Number,
        },
        dicountPrice: {
          formatedAmount: String,
          value: Number,
        },
      },
    ],
  },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  view_count: Number,
});

module.exports = mongoose.model("product", ProductSchema);
