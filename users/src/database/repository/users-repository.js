const mongoose = require("mongoose");
const { UsersModel, AddressModel } = require("../models");

//Dealing with data base operations
class UsersRepository {
  async CreateUsers({ email, password, phone, salt }) {
    const users = new UsersModel({
      email,
      password,
      salt,
      phone,
      address: [],
    });

    const usersResult = await users.save();
    return usersResult;
  }

  async CreateAddress({ _id, street, postalCode, city, country }) {
    const profile = await UsersModel.findById(_id);

    if (profile) {
      const newAddress = new AddressModel({
        street,
        postalCode,
        city,
        country,
      });

      await newAddress.save();

      profile.address.push(newAddress);
    }

    return await profile.save();
  }

  async FindUsers({ email }) {
    const existingUsers = await UsersModel.findOne({ email: email });
    return existingUsers;
  }

  async FindUsersById({ id }) {
    const existingUsers = await UsersModel.findById(id).populate("address");
    // existingUsers.cart = [];
    // existingUsers.orders = [];
    // existingUsers.wishlist = [];

    // await existingUsers.save();
    return existingUsers;
  }

  async Wishlist(usersId) {
    const profile = await UsersModel.findById(usersId).populate("wishlist");

    return profile.wishlist;
  }

  async AddWishlistItem(
    usersId,
    { _id, name, desc, price, available, banner }
  ) {
    const product = {
      _id,
      name,
      desc,
      price,
      available,
      banner,
    };

    const profile = await UsersModel.findById(usersId).populate("wishlist");

    if (profile) {
      let wishlist = profile.wishlist;

      if (wishlist.length > 0) {
        let isExist = false;
        wishlist.map((item) => {
          if (item._id.toString() === product._id.toString()) {
            const index = wishlist.indexOf(item);
            wishlist.splice(index, 1);
            isExist = true;
          }
        });

        if (!isExist) {
          wishlist.push(product);
        }
      } else {
        wishlist.push(product);
      }

      profile.wishlist = wishlist;
    }

    const profileResult = await profile.save();

    return profileResult.wishlist;
  }

  async AddCartItem(usersId, { _id, name, price, banner }, qty, isRemove) {
    const profile = await UsersModel.findById(usersId).populate("cart");

    if (profile) {
      const cartItem = {
        product: { _id, name, price, banner },
        unit: qty,
      };

      let cartItems = profile.cart;

      if (cartItems.length > 0) {
        let isExist = false;
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

        if (!isExist) {
          cartItems.push(cartItem);
        }
      } else {
        cartItems.push(cartItem);
      }

      profile.cart = cartItems;

      return await profile.save();
    }

    throw new Error("Unable to add to cart!");
  }

  async AddOrderToProfile(usersId, order) {
    const profile = await UsersModel.findById(usersId);

    if (profile) {
      if (profile.orders == undefined) {
        profile.orders = [];
      }
      profile.orders.push(order);

      profile.cart = [];

      const profileResult = await profile.save();

      return profileResult;
    }

    throw new Error("Unable to add to order!");
  }
}

module.exports = UsersRepository;
