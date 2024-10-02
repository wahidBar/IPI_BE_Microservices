const mongoose = require("mongoose");
const { StoreModel } = require("../models");
const { CategorysModel } = require("../models");

//Dealing with data base operations
class StoreRepository {
  async StoreAction({
    id,
    name,
    description,
    banner,
    phone,
    city,
    id_city,
    postalCode,
    latitude,
    longitude,
    status,
  }) {
    let store;
    if (id !== null) {
      try {
        store = await StoreModel.findById(id);
        if (banner !== null) {
          store.banner = banner;
        }
        store.name = name;
        store.description = description;
        store.city = city;
        store.id_city = id_city;
        store.postalCode = postalCode;
        store.latitude = latitude;
        store.longitude = longitude;
        store.status = status;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      console.log("hskashkasha" + name);
      store = new StoreModel({
        name,
        description,
        banner,
        phone,
        city,
        id_city,
        postalCode,
        latitude,
        longitude,
        status,
      });
    }
    const storeResult = await store.save();
    return storeResult;
  }

  async CreateCategory({ name, image, icon }) {
    const category = new CategorysModel({
      name,
      image,
    });
    const categoryResult = await category.save();
    return categoryResult;
  }

  async Stores() {
    return await StoreModel.find();
  }

  async Category() {
    return await CategorysModel.find();
  }

  async FindById(id) {
    return await StoreModel.findById(id);
  }

  async FindByCategory(category) {
    const products = await ProductModel.find({ type: category });

    return products;
  }

  async FindSelectedProducts(selectedIds) {
    const products = await ProductModel.find()
      .where("_id")
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}

module.exports = StoreRepository;
