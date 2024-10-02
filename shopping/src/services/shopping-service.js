const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async GetCartdb({ _id }) {
    const cartItems = await this.repository.Cart(_id);
    return FormateData(cartItems);
  }

  async GetCart({ _id, transactionId }) {
    const cartItems = await this.repository.Cart(_id, transactionId);
    return FormateData(cartItems);
  }

  async UpdateCart({ userId, transactionId, statusId, channel }) {
    const defaultItem = null;
    const defaultQty = 1;
    const defaultPrice = 0.0;
    const defaultColor = null;
    const defaultSize = null;
    const defaultWeight = 0.0;
    const defaultIsRemove = false;
    const defaultIsUpdateTransaction = true;

    const cartResult = await this.repository.AddCartItem(
      userId,
      defaultItem,
      defaultQty,
      defaultPrice,
      defaultColor,
      defaultSize,
      defaultWeight,
      defaultIsRemove,
      defaultIsUpdateTransaction,
      transactionId,
      statusId,
      channel
    );
    return FormateData(cartResult);
  }
  async saveOrder({ user_id, invoice, token_midtrans, nominal }) {
    const orderResult = await this.repository.NewOrder(
      user_id,
      invoice,
      token_midtrans,
      nominal
    );
    return FormateData(orderResult);
  }

  async saveOrderDetails(detailPesanan) {
    const {
      invoice,
      name,
      nominal,
      token_midtrans,
      usrid,
      alamat_pembeli,
      toko_id,
      alamat_penjual,
      berat,
      ongkir,
      kurir,
      paket,
      dari,
      tujuan,
      resi,
      id_bayar,
      ajukanbatal,
      keterangan,
      status_id,
      pesanan_id,
      channel,
    } = detailPesanan;

    try {
      const orderResult = await this.repository.NewOrderDetail({
        invoice,
        name,
        nominal,
        token_midtrans,
        usrid,
        alamat_pembeli,
        toko_id,
        alamat_penjual,
        berat,
        ongkir,
        kurir,
        paket,
        dari,
        tujuan,
        resi,
        id_bayar,
        ajukanbatal,
        keterangan,
        status_id,
        pesanan_id,
        channel,
      });

      if (!orderResult) {
        return { success: false, message: "Cart is empty or not found" };
      }

      const payload = {
        data: orderResult,
        success: true,
        message: "success",
      };
      return FormateData(payload);
    } catch (error) {
      console.error("Error saving order details:", error.message);
      throw new Error("Error saving order details");
    }
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);

    return FormateData(orderResult);
  }
  async GetOrders(usersId, transactionId) {
    const orders = await this.repository.Orders(usersId, transactionId);
    let payload;
    if (orders) {
      payload = {
        data: orders,
        success: true,
        message: "success",
      };
    } else {
      payload = {
        data: null,
        success: false,
        message: "false",
      };
    }
    return FormateData(payload);
  }

  async GetDetailOrder(orderInput) {
    const orderdetail = await this.repository.DetailOrder(orderInput);
    let payload;
    if (orderdetail) {
      payload = {
        data: orderdetail,
        success: true,
        message: "success",
      };
    } else {
      payload = {
        data: null,
        success: false,
        message: "false",
      };
    }
    return FormateData(payload);
  }
  async UpdateDetailOrder(orderInputs) {
    const orderResult = await this.repository.UpdateDetailById(orderInputs);
    return FormateData(orderResult);
  }

  async GetOrderDetails({ _id, orderId }) {
    const orders = await this.repository.Orders(productId);
    return FormateData(orders);
  }
  async ManageCart(usersId, item, qty, price, color, size, weight, isRemove) {
    const cartResult = await this.repository.AddCartItem(
      usersId,
      item,
      qty,
      price,
      color,
      size,
      weight,
      isRemove
    );
    return FormateData(cartResult);
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    const { userId, product, qty, price, color, size, weight } = data;

    switch (event) {
      case "ADD_TO_CART":
        this.ManageCart(
          userId,
          product,
          qty,
          price,
          color,
          size,
          weight,
          false
        );
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, price, color, size, weight, true);
        break;
      default:
        break;
    }
  }

  async GetOrderPayload(userId, event) {
    // if (order) {
    const payload = {
      event: event,
      data: { userId },
    };

    return payload;
    // } else {
    //   return FormateData({ error: "No Order Available" });
    // }
  }
  async GetOrderPayload2(storeId, event) {
    // if (order) {
    const payload = {
      event: event,
      data: { storeId },
    };

    return payload;
    // } else {
    //   return FormateData({ error: "No Order Available" });
    // }
  }
}

module.exports = ShoppingService;
