const { StoreRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class StoreService {
  constructor() {
    this.repository = new StoreRepository();
  }

  async GetStoreDescription(storeId) {
    try {
      const storeResult = await this.repository.FindById(storeId);
      if (storeResult) {
        const payload = {
          stores: storeResult,
          success: true,
        };
        return FormateData(payload);
      } else {
        return FormateData({
          success: false,
          message: "No found store",
        });
      }
    } catch (error) {
      console.error("Error getting stores payload:", error);
      return FormateData({
        success: false,
        message: "An error occurred while fetching the stores",
      });
    }
  }
  async StoreAction(storeInputs) {
    const storeResult = await this.repository.StoreAction(storeInputs);
    return FormateData(storeResult);
  }
  async DeleteStore(storeId) {
    try {
      console.log("store delete service");
      const store = await this.repository.FindById(storeId);
      if (!store) {
        throw new Error("Store not found");
      }
      await store.remove();

      return { success: true, message: "Store successfully deleted" };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async CreateCategory(categoryInputs) {
    const categoryResult = await this.repository.CreateCategory(categoryInputs);
    return FormateData(categoryResult);
  }

  async GetStores() {
    try {
      const stores = await this.repository.Stores();
      if (stores) {
        const payload = {
          stores: stores,
          success: true,
        };
        return FormateData(payload);
      } else {
        return FormateData({
          success: false,
          message: "No found stores",
        });
      }
    } catch (error) {
      console.error("Error getting stores payload:", error);
      return FormateData({
        success: false,
        message: "An error occurred while fetching the stores",
      });
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

  async GetProductDescription(productId) {
    const product = await this.repository.FindById(productId);
    return FormateData(product);
  }

  async GetProductsByCategory(category) {
    const products = await this.repository.FindByCategory(category);
    return FormateData(products);
  }

  async GetSelectedProducts(selectedIds) {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async GetProductPayload(userId, { productId, qty }, event) {
    const product = await this.repository.FindById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, qty },
      };

      return FormateData(payload);
    } else {
      return FormateData({ error: "No product Available" });
    }
  }

  async SubscribeEvents(payload) {
    console.log("Triggering.... Store Events");

    payload = JSON.parse(payload);
    console.log(payload);

    const { event, data } = payload;

    const { storeId, product, order, qty, price, color, size, weight } = data;

    let response;

    switch (event) {
      case "GET_STORE":
        response = await this.GetStoreDescription(storeId);
        break;
      // case "ADD_TO_WISHLIST":
      // case "REMOVE_FROM_WISHLIST":
      //   this.AddToWishlist(userId, product);
      //   break;
      // case "ADD_TO_CART":
      //   this.ManageCart(
      //     userId,
      //     product,
      //     qty,
      //     price,
      //     color,
      //     size,
      //     weight,
      //     false
      //   );
      //   break;
      // case "REMOVE_FROM_CART":
      //   this.ManageCart(userId, product, qty, price, color, size, weight, true);
      //   break;
      // case "CREATE_ORDER":
      //   this.ManageOrder(userId, order);
      //   break;
      default:
        break;
    }
    return response;
  }
}

module.exports = StoreService;
