const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CartSchema = new Schema({
  usersId: { type: String },
  items: [
    {
      product: {
        _id: { type: String, require: true },
        name: { type: String },
        desc: { type: String },
        banner: { type: String },
        type: { type: String },
        unit: { type: Number },
        price: { type: Number },
        suplier: { type: String },
      },
      unit: { type: Number, require: true },
    },
  ],
});

module.exports = mongoose.model("cart", CartSchema);

// "use strict";

// const { Sequelize } = require("sequelize");
// const db = new Sequelize("db_portfolio", "root", "wahid112*", {
//   host: "localhost",
//   dialect: "mysql",
// });

// const { DataTypes } = Sequelize;
// const Cart = db.define(
//   "cart",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     produk_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     variant1: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     variant2: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     intv1: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     intv2: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     harga: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     jumlah: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     id_transaksi: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     resi: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     status_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//     },
//   },
//   {
//     sequelize: db,
//     modelName: "Cart",
//     tableName: "keranjang",
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// module.exports = Cart;
