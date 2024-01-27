const mongoose = require("mongoose");
const { OrderModel, CartModel } = require("../models");
const { v4: uuidv4 } = require("uuid");

//Dealing with data base operations
class ShoppingRepository {
  async Orders(usersId) {
    const orders = await OrderModel.find({ usersId });

    return orders;
  }

  async Cart(user_id) {
    const cartItems = await CartModel.find({ user_id: user_id });

    if (cartItems) {
      return cartItems;
    }

    throw new Error("Data Not found!");
  }

  async AddCartItem(usersId, item, qty, isRemove) {
    // return await CartModel.deleteMany();

    const cart = await CartModel.findOne({ usersId: usersId });

    const { _id } = item;

    if (cart) {
      let isExist = false;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        cartItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.unit = qty;
            }
            isExist = true;
          }
        });
      }

      if (!isExist && !isRemove) {
        cartItems.push({ product: { ...item }, unit: qty });
      }

      cart.items = cartItems;

      return await cart.save();
    } else {
      return await CartModel.create({
        usersId,
        items: [{ product: { ...item }, unit: qty }],
      });
    }
  }

  async CreateNewOrder(usersId, txnId) {
    //required to verify payment through TxnId

    const cart = await CartModel.findOne({ usersId: usersId });

    if (cart) {
      let amount = 0;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        //process Order

        cartItems.map((item) => {
          amount += parseInt(item.product.price) * parseInt(item.unit);
        });

        const orderId = uuidv4();

        const order = new OrderModel({
          orderId,
          usersId,
          amount,
          status: "received",
          items: cartItems,
        });

        cart.items = [];

        const orderResult = await order.save();
        await cart.save();
        return orderResult;
      }
    }

    return {};
  }
}

module.exports = ShoppingRepository;
