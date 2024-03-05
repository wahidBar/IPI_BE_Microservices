const mongoose = require("mongoose");
const { ProductModel } = require("../models");

//Dealing with data base operations
class ProductRepository {
  async CreateProduct({
    name,
    banner,
    images,
    total,
    available,
    storeId,
    // skuId,
    variants,
  }) {
    const product = new ProductModel({
      name,
      // banner,
      quantity: {
        total,
        available,
      },
      storeInfo: {
        storeId,
      },
      // images: images.map((image) => image.path),
      variants: variants,
    });
    const productResult = await product.save();
    return productResult;
  }

  async Products() {
    return await ProductModel.find();
  }

  async FindById(id) {
    return await ProductModel.findById(id);
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

module.exports = ProductRepository;
