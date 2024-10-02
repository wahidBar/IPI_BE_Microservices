const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../../database/connection"); // Make sure this path points to your database configuration

class OrderDetail extends Model {}

OrderDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    invoice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nominal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_midtrans: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usrid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat_pembeli: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toko_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat_penjual: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    berat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ongkir: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kurir: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dari: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tujuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    kirim: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    id_bayar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ajukanbatal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    alasan_pembatalan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ajukan_batal_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.STRING,
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
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selesai: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    bukti_terima_pesanan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pesanan_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "OrderDetail",
    tableName: "order_detail",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = OrderDetail;
