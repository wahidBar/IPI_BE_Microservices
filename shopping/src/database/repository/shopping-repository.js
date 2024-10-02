const mongoose = require("mongoose");
const { OrderModel, CartModel, OrderDetailModel } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { USERS_SERVICE } = require("../../config");
const { PublishMessage } = require("../../utils");
const { Op } = require("sequelize");

//Dealing with data base operations
class ShoppingRepository {
  async Orders(usersId, transactionId) {
    let orders;
    if (transactionId == null) {
      orders = await OrderModel.findAll({
        where: { user_id: usersId },
      });
    } else {
      orders = await OrderModel.findAll({
        where: { user_id: usersId, id: transactionId },
      });
    }
    return orders;
  }

  async DetailOrder({ _id, storeId, id }) {
    let orders;
    if (storeId) {
      orders = await OrderDetailModel.findAll({
        where: { toko_id: storeId },
      });
      if (id) {
        orders = await OrderDetailModel.findOne({
          where: { toko_id: storeId, id: id },
        });
      }
    } else {
      orders = await OrderDetailModel.findAll({
        where: { usrid: _id },
      });
    }

    return orders;
  }
  async UpdateDetailById({
    id,
    resi,
    statusId,
    ajukanbatal,
    alasan_pembatalan,
    ajukan_batal_image,
    bukti_terima_pesanan,
  }) {
    let orders;
    if (resi) {
      console.log("kirimPesanan");
      orders = await OrderDetailModel.update(
        { resi: resi, updated_at: new Date(), status_id: 10 },
        {
          where: {
            id: id,
            resi: null,
          },
        }
      );
    }
    if (ajukanbatal == 1) {
      console.log("pengajuanBatal");
      orders = await OrderDetailModel.update(
        {
          keterangan: "Pengajuan Batal",
          ajukanbatal: ajukanbatal,
          alasan_pembatalan: alasan_pembatalan,
          ajukan_batal_image: ajukan_batal_image,
          updated_at: new Date(),
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
    if (statusId == 5) {
      console.log("batalkanPesanan");
      orders = await OrderDetailModel.update(
        {
          status_id: statusId,
          updated_at: new Date(),
          keterangan: "Ddibatalkan",
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
    if (bukti_terima_pesanan !== null) {
      console.log("terimaPesanan");
      orders = await OrderDetailModel.update(
        {
          status_id: 11,
          updated_at: new Date(),
          keterangan: "selesai",
          bukti_terima_pesanan: bukti_terima_pesanan,
        },
        {
          where: {
            id: id,
            status_id: { [Op.in]: [2, 10] }, // Perbaikan di sini
            ajukanbatal: 0,
          },
        }
      );
    }

    return orders;
  }

  async Cart(userId, transactionId) {
    let cartItems;
    if (transactionId == null) {
      cartItems = await CartModel.findAll({
        where: { userId: userId },
      });
    } else {
      cartItems = await CartModel.findAll({
        where: { userId: userId, transactionId: transactionId },
      });
    }
    const data = {
      cart: cartItems.length > 0 ? cartItems : null,
      success: cartItems.length > 0,
    };
    return data;
  }

  async AddCartItem(
    userId,
    item,
    qty,
    price,
    color,
    size,
    weight,
    isRemove,
    isUpdateTransaction,
    transactionId,
    statusId,
    channel
  ) {
    console.log(userId);
    console.log(transactionId);
    console.log(statusId);
    console.log(isUpdateTransaction);
    try {
      if (isUpdateTransaction) {
        await CartModel.update(
          { statusId: statusId },
          {
            where: {
              userId: userId,
              transactionId: transactionId,
            },
          }
        );
        let updateData = { status_id: statusId };

        if (statusId == 10) {
          updateData = { status_id: statusId, keterangan: "Dikirim" };
        }
        if (statusId == 11) {
          updateData = { status_id: statusId, keterangan: "Selesai" };
        }
        if (statusId == 5) {
          updateData = { status_id: statusId, keterangan: "Dibatalkan" };
        }

        await OrderDetailModel.update(updateData, {
          where: {
            usrid: userId,
            id: transactionId,
          },
        });
        await OrderModel.update(
          { updated_at: new Date() },
          {
            where: {
              user_id: userId,
              id: transactionId,
            },
          }
        );
        const payload = {
          event: "UPDATE_CART",
          data: {
            userId: userId,
            transactionId: transactionId,
            statusId: statusId,
          },
        };

        await PublishMessage(channel, USERS_SERVICE, JSON.stringify(payload));
        return {
          message: "Cart And Order Update successfully updated successfully.",
        };
      } else {
        let cartItem = await CartModel.findOne({
          where: {
            userId: userId,
            productId: item._id,
            color: color,
            size: size,
            transactionId: 0,
          },
        });
        if (cartItem) {
          if (isRemove) {
            await CartModel.destroy({
              where: {
                userId: userId,
                productId: item._id,
                color: color,
                size: size,
                transactionId: 0,
              },
            });
            console.log("Item Delete");
            return { message: "Item removed from cart successfully." };
          } else {
            await CartModel.update(
              { unit: qty, Nominal: parseInt(qty) * parseInt(price) },
              {
                where: {
                  userId: userId,
                  productId: item._id,
                  color: color,
                  size: size,
                  transactionId: 0,
                },
              }
            );
            return { message: "Cart updated successfully." };
          }
        } else {
          console.log("halooisoa");
          console.log(item.storeInfo.storeId);
          await CartModel.create({
            userId: userId,
            productId: item._id,
            storeId: item.storeInfo.storeId,
            name: item.name,
            banner: item.banner,
            short_description: item.short_description,
            color: color,
            size: size,
            weight: weight,
            price: price,
            unit: qty,
            nominal: parseInt(qty) * parseInt(price),
          });
          return { message: "Item added to cart successfully." };
        }
      }
    } catch (error) {
      console.error("Error in adding item to cart:", error);
      throw error;
    }
  }

  async NewOrder(user_id, invoice, token_midtrans, nominal) {
    //required to verify payment through TxnId

    const cart = await CartModel.findAll({
      where: {
        userId: user_id,
      },
    });

    if (cart) {
      const order = await OrderModel.create({
        user_id: user_id,
        invoice: invoice,
        token_midtrans: token_midtrans,
        nominal: nominal,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return order;
    }
  }

  async NewOrderDetail(orderDetails) {
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
    } = orderDetails;

    try {
      const cart = await CartModel.findAll({
        where: {
          userId: usrid,
          transactionId: 0,
          storeId: toko_id,
        },
      });

      console.log("this cart", cart);

      if (!cart || cart.length === 0) {
        console.error("Cart is empty or not found");
        return null;
      }
      const order = await OrderDetailModel.create({
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
      });

      // Mengosongkan keranjang belanja

      await CartModel.update(
        { transactionId: order.id },
        { where: { userId: usrid, transactionId: 0, storeId: toko_id } }
      );
      const product = {
        storeInfo: {
          storeId: toko_id,
        },
      };
      console.log("this user id =", usrid);
      const payload = {
        event: "UPDATE_CART",
        data: {
          userId: usrid,
          product,
          transactionId: order.id,
          statusId: 3,
        },
      };

      await PublishMessage(channel, USERS_SERVICE, JSON.stringify(payload));

      return order;
    } catch (error) {
      console.error("Error creating new order detail:", error.message);
      throw new Error("Error creating new order detail");
    }
  }
}

module.exports = ShoppingRepository;
