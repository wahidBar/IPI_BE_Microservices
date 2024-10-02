const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SettingSchema = new Schema(
  {
    logo: { type: String, required: false },
    judul_web: { type: String, required: true },
    tentang_kami: { type: String, required: false },
    judul_tentang_kami: { type: String, required: false, default: "-" },
    foto_tentang_kami: { type: String, required: false },
    facebook: { type: String, required: false, default: "-" },
    instagram: { type: String, required: false },
    telepon: { type: String, required: false },
    email: { type: String, required: false, default: "-" },
    twitter: { type: String, required: false, default: "-" },
    telegram: { type: String, required: false },
    nama_web: { type: String, required: true },
    alamat: { type: String, required: false },
    visi: { type: String, required: false },
    misi: { type: String, required: false },
    slogan_web: { type: String, required: false, default: "-" },
    banner: { type: String, required: false },
    embed_ig: { type: String, required: false },
    embed_ig2: { type: String, required: false },
    nama_motivasi: { type: String, required: false },
    jabatan_motivasi: { type: String, required: false },
    isi_motivasi: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", SettingSchema);
