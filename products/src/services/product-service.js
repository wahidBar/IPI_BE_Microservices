const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async GetProducts() {
    const products = await this.repository.Products();

    let categories = {};

    products.map(({ type }) => {
      categories[type] = type;
    });

    return FormateData({
      products,
      categories: Object.keys(categories),
    });
  }

  async GetSelectedProducts(selectedIds) {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async GetProductByToko(tokoId) {
    const product = await this.repository.FindByTokoId(tokoId);
    return FormateData(product);
  }

  async GetProductsByCategory(category) {
    const products = await this.repository.FindByCategory(category);
    return FormateData(products);
  }

  async GetProductDescription(productId) {
    const product = await this.repository.FindById(productId);
    return FormateData(product);
  }
  async CreateProduct(productInputs) {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormateData(productResult);
  }

  async UpdateProduct(productInputs) {
    const productResult = await this.repository.UpdateFindById(productInputs);
    return FormateData(productResult);
  }
  async DeleteProduct(productId) {
    try {
      console.log("product delete service");
      const product = await this.repository.FindById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      await product.remove();

      return { success: true, message: "Product successfully deleted" };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async GetCategory() {
    const categories = await this.repository.Category();

    // products.map(({ type }) => {
    //   categories[type] = type;
    // });

    return FormateData({
      categories,
      //   categories: Object.keys(categories),
    });
  }

  async GetCategoryDescription(categoryId) {
    const category = await this.repository.FindCategoryById(categoryId);
    return FormateData(category);
  }

  async CreateCategory(categoryInputs) {
    const categoryResult = await this.repository.CreateCategory(categoryInputs);
    return FormateData(categoryResult);
  }

  async DeleteCategory(categoryId) {
    try {
      console.log("category delete service");
      const category = await this.repository.FindCategoryById(categoryId);
      if (!category) {
        throw new Error("Product not found");
      }

      await category.remove();

      return { success: true, message: "Product successfully deleted" };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async AddNewGalery(_id, userInputs) {
    const { name, images } = userInputs;

    const galeryResult = await this.repository.CreateGalery({
      _id,
      name,
      images,
    });

    return FormateData(galeryResult);
  }

  async GetProductPayload(
    userId,
    { productId, qty, color, size, weight },
    event
  ) {
    try {
      const product = await this.repository.FindById(productId);
      if (product) {
        const getPriceByVariant = (product, color, size) => {
          const variant = product.variants.find(
            (v) => v.color === color && v.size === size
          );
          return variant ? variant.price : null;
        };
        const price = getPriceByVariant(product, color, size);
        // console.log(price);
        if (price) {
          const payload = {
            event: event,
            data: { userId, product, price, qty, color, size, weight },
            success: true,
          };
          return FormateData(payload);
        } else {
          return FormateData({
            success: false,
            message: "No matching variant found",
          });
        }
      } else {
        return FormateData({
          success: false,
          message: "No Product Found !",
        });
      }
    } catch (error) {
      console.error("Error getting product payload:", error);
      return FormateData({
        success: false,
        message: "An error occurred while fetching the product",
      });
    }
  }
}

module.exports = ProductService;
