const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    name: String,
    username: String,
    password: String,
    salt: String,
    phone: String,
    address: [{ type: Schema.Types.ObjectId, ref: "address", require: true }],
    photo_url: { type: String },
    role_id: Number,
    confirm: Number,
    status: Number,
    storeId: { type: String, required: true },
    cart: [
      {
        product: {
          _id: { type: String, require: true },
          storeId: { type: String, required: true },
          name: { type: String },
          banner: { type: String },
          price: { type: Number },
          color: { type: String },
          size: { type: String },
          weight: { type: Number },
        },
        unit: { type: Number, require: true },
        nominal: { type: Number, require: true },
        transactionId: { type: Number, required: true, default: 0 },
        statusId: { type: Number, required: true, default: 3 },
      },
    ],
    wishlist: [
      {
        _id: { type: String, require: true },
        name: { type: String },
        description: { type: String },
        banner: { type: String },
        avalable: { type: Boolean },
        price: { type: Number },
      },
    ],
    orders: [
      {
        _id: { type: String, required: true },
        amount: { type: String },
        date: { type: Date, default: Date.now() },
      },
    ],
    created_at: { type: Date, default: Date.now() },
    updated_at: { type: Date, default: Date.now() },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UsersSchema);
