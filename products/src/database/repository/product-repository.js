const mongoose = require("mongoose");
const { ProductModel, CategorysModel, ProductGalery } = require("../models");

//Dealing with data base operations
class ProductRepository {
  async CreateProduct({
    _id,
    name,
    short_description,
    complete_description,
    banner,
    category,
    images,
    total,
    available,
    storeId,
    // skuId,
    variants,
  }) {
    const productsWithDiscount = variants.map((variant) => ({
      ...variant,
      discount_price: variant.price - variant.price * (variant.discount / 100),
    }));
    const product = new ProductModel({
      _id,
      name,
      short_description,
      complete_description,
      category,
      banner,
      quantity: {
        total: total,
        available,
      },
      storeInfo: {
        storeId,
      },
      variants: variants,
      variants: productsWithDiscount,
    });
    const productResult = await product.save();
    console.log(productResult);
    return productResult;
  }

  async UpdateFindById({
    id,
    name,
    short_description,
    complete_description,
    banner,
    category,
    images,
    total,
    available,
    storeId,
    variants,
  }) {
    const productsWithDiscount = variants.map((variant) => ({
      ...variant,
      discount_price: variant.price - variant.price * (variant.discount / 100),
    }));
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      product.name = name;
      product.short_description = short_description;
      product.complete_description = complete_description;
      if (banner !== null) {
        product.banner = banner;
      }
      if (category) {
        product.category = category;
      }
      product.images = images;
      product.quantity.total = total;
      product.quantity.available = available;
      product.storeInfo.storeId = storeId;
      product.variants = productsWithDiscount;

      const productResult = await product.save();
      console.log(productResult);
      return productResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async CreateCategory({ name, image, icon }) {
    const category = new CategorysModel({
      name,
      image,
    });
    const categoryResult = await category.save();
    return categoryResult;
  }

  async CreateGalery({ _id, name, images }) {
    const product = await ProductModel.findById(_id);

    if (product) {
      const newGalery = new ProductGalery({
        // name,
        images,
      });

      await newGalery.save();

      product.images.push(newGalery);
    }

    return await product.save();
  }

  async Products() {
    return await ProductModel.find().populate(["images", "category"]);
  }
  async FindById(id) {
    try {
      const product = await ProductModel.findById(id).populate([
        "images",
        "category",
      ]);
      return product || null;
    } catch (error) {
      console.error("Error finding product by ID:", error);
      return null;
    }
  }
  async FindByTokoId(tokoId) {
    return await ProductModel.find({ "storeInfo.storeId": tokoId }).populate([
      "images",
      "category",
    ]);
  }

  async Category() {
    return await CategorysModel.find();
  }
  async FindCategoryById(id) {
    return await CategorysModel.findById(id);
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
