const mongoose = require("mongoose");
const { UsersModel, AddressModel, SettingModel } = require("../models");

//Dealing with data base operations
class UsersRepository {
  async About() {
    try {
      const IPI = await SettingModel.findOne();
      return IPI;
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }
  async SettingAction({
    logo,
    judul_web,
    tentang_kami,
    judul_tentang_kami,
    foto_tentang_kami,
    facebook,
    instagram,
    telepon,
    email,
    twitter,
    telegram,
    nama_web,
    alamat,
    visi,
    misi,
    slogan_web,
    banner,
    embed_ig,
    embed_ig2,
    nama_motivasi,
    jabatan_motivasi,
    isi_motivasi,
  }) {
    let setting = await SettingModel.findOne();

    if (setting) {
      // Update existing settings
      setting.logo = logo ?? setting.logo;
      setting.judul_web = judul_web;
      setting.tentang_kami = tentang_kami;
      setting.judul_tentang_kami = judul_tentang_kami;
      setting.foto_tentang_kami =
        foto_tentang_kami ?? setting.foto_tentang_kami;
      setting.facebook = facebook;
      setting.instagram = instagram;
      setting.telepon = telepon;
      setting.email = email;
      setting.twitter = twitter;
      setting.telegram = telegram;
      setting.nama_web = nama_web;
      setting.alamat = alamat;
      setting.visi = visi;
      setting.misi = misi;
      setting.slogan_web = slogan_web;
      setting.banner = banner ?? setting.banner;
      setting.embed_ig = embed_ig;
      setting.embed_ig2 = embed_ig2;
      setting.nama_motivasi = nama_motivasi;
      setting.jabatan_motivasi = jabatan_motivasi;
      setting.isi_motivasi = isi_motivasi;
    } else {
      // Create new settings if not found
      setting = new SettingModel({
        logo,
        judul_web,
        tentang_kami,
        judul_tentang_kami,
        foto_tentang_kami,
        facebook,
        instagram,
        telepon,
        email,
        twitter,
        telegram,
        nama_web,
        alamat,
        visi,
        misi,
        slogan_web,
        banner,
        embed_ig,
        embed_ig2,
        nama_motivasi,
        jabatan_motivasi,
        isi_motivasi,
      });
    }

    try {
      const settingResult = await setting.save();
      return settingResult;
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  async CreateUsers({
    name,
    username,
    password,
    phone,
    storeId,
    photo_url,
    salt,
  }) {
    const users = new UsersModel({
      name,
      username,
      password,
      salt,
      phone,
      storeId,
      photo_url,
      address: [],
    });

    const usersResult = await users.save();
    return usersResult;
  }

  async UpdateUsers({
    name,
    username,
    password,
    phone,
    storeId,
    photo_url,
    salt,
  }) {
    try {
      const user = await UsersModel.findById(id);
      if (!user) {
        throw new Error("Product not found");
      }

      user.name = name;
      user.username = username;
      user.password = password;
      user.phone = phone;
      if (photo_url !== null) {
        user.photo_url = photo_url;
      }

      const userResult = await user.save();
      console.log(userResult);
      return userResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async UpdateUser(user) {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        user._id, // Find by user id
        {
          $set: {
            // Update only the provided fields
            name: user.name,
            username: user.username,
            password: user.password,
            phone: user.phone,
            storeId: user.storeId,
            photo_url: user.photo_url,
            salt: user.salt,
          },
        },
        { new: true } // Return the updated user document
      );

      return updatedUser;
    } catch (err) {
      throw new Error("Error updating user: " + err.message);
    }
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

  async FindUsers({ username }) {
    const existingUsers = await UsersModel.findOne({ username: username });
    return existingUsers;
  }
  async findByEmail(username) {
    try {
      const existingUser = await UsersModel.find({
        email: username,
      }).populate("address");
      console.log(existingUser);
      return existingUser;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async FindUsersById({ id }) {
    try {
      const existingUsers = await UsersModel.findById(id).populate("address");
      return existingUsers;
    } catch (error) {
      console.error("Error finding user by Id:", error);
      throw error;
    }
  }

  async FindAll() {
    try {
      const existingUsers = await UsersModel.find().populate("address");
      return existingUsers;
    } catch (error) {
      console.error("Error finding user by Id:", error);
      throw error;
    }
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

  async AddCartItem(
    userId,
    product,
    qty,
    price,
    color,
    size,
    weight,
    isUpdate,
    isRemove,
    transactionId,
    statusId
  ) {
    try {
      const storeId =
        product && product.storeInfo ? product.storeInfo.storeId : null;
      console.log("AddCartItem called with:");

      const profile = await UsersModel.findById(userId);

      if (profile) {
        console.log("user found");
        let cartItem;

        // Prepare the cart item to be added or updated
        if (product) {
          cartItem = {
            product: {
              _id: product._id,
              storeId,
              name: product.name,
              color,
              size,
              weight,
              price,
              banner: product.banner,
            },
            unit: qty,
            nominal: qty * price,
          };
        } else {
          cartItem = {
            transactionId: transactionId,
            statusId: statusId,
          };
        }

        let cartItems = profile.cart;

        // Check if cart already has items
        if (cartItems.length > 0) {
          let isExist = false;
          cartItems = cartItems
            .map((item) => {
              // Update transaction and status for store
              if (
                isUpdate &&
                item.product.storeId === storeId &&
                item.transactionId === 0
              ) {
                console.log("updating transaction and status for store");
                item.transactionId = transactionId;
                item.statusId = statusId;
                isExist = true;
                return item;
              }
              // Update status based on transactionId
              else if (isUpdate && item.transactionId === transactionId) {
                console.log("updating status cart in cart");
                item.statusId = statusId;
                isExist = true;
                return item;
              }
              // Update or remove the cart item if it exists
              else if (
                !isUpdate &&
                item.product._id === product._id &&
                item.product.size === size &&
                item.product.color === color &&
                item.transactionId === 0
              ) {
                if (isRemove) {
                  console.log("removing item from cart");
                  return null; // Mark for removal
                } else {
                  console.log("updating item quantity and nominal");
                  item.unit = qty;
                  item.nominal = qty * price;
                  isExist = true;
                  return item;
                }
              }
              return item;
            })
            .filter((item) => item !== null); // Remove items marked for removal

          // If the item doesn't exist and we are not removing it, add the new item
          if (!isExist && !isRemove) {
            cartItems.push(cartItem);
          }
        } else {
          // Add the item if the cart is empty
          cartItems.push(cartItem);
        }

        // Update the user's cart in the database
        profile.cart = cartItems;
        return await profile.save();
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
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
