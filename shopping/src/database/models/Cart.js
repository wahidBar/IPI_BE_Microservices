// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const CartSchema = new Schema({
//   usersId: { type: String },
//   items: [
//     {
//       product: {
//         _id: { type: String, require: true },
//         name: { type: String },
//         desc: { type: String },
//         banner: { type: String },
//         type: { type: String },
//         unit: { type: Number },
//         price: { type: Number },
//         color: { type: String },
//         size: { type: String },
//         suplier: { type: String },
//       },
//       unit: { type: Number, require: true },
//     },
//   ],
// });

// module.exports = mongoose.model("cart", CartSchema);

const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../../database/connection");

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nominal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "cart",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Cart;
