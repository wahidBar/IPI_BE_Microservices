const ShoppingService = require("../services/shopping-service");
const { PublishUsersEvent, SubscribeMessage } = require("../utils");
const midtransClient = require("midtrans-client");
const UserAuth = require("./middlewares/auth");
const { USERS_SERVICE, STORES_SERVICE } = require("../config");
const { PublishMessage } = require("../utils");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const cors = require("cors");

// app.use(cors());

const projectRoot = path.join(__dirname, "..", "..");

function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadsFolderPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "image"
    );
    ensureDirectoryExists(uploadsFolderPath);
    cb(null, uploadsFolderPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file dengan tipe JPEG, JPG, PNG, PDF, DOC, dan DOCX yang diizinkan."
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: fileFilter,
});

module.exports = (app, channel) => {
  const service = new ShoppingService();

  SubscribeMessage(channel, service);

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    const { data } = await service.PlaceOrder({ _id, txnNumber });

    const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");

    // PublishUsersEvent(payload)
    PublishMessage(channel, USERS_SERVICE, JSON.stringify(payload));

    res.status(200).json(data);
  });

  app.get("/orders/:transactionId?", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { transactionId } = req.params;
      const { data } = await service.GetOrders(_id, transactionId ?? null);

      res.status(200).json(data);
    } catch (error) {
      next(error); // Ensure errors are passed to the next middleware
    }
  });

  app.get("/orderdetail", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const request = req.body;

      storeId = request.storeId;
      id = request.id;

      const { data } = await service.GetDetailOrder({
        _id,
        storeId: storeId || null,
        id: id || null,
      });

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.put("/update-resi/:id", UserAuth, async (req, res, next) => {
    try {
      const transactionId = req.params.id;
      const request = req.body;

      console.log(transactionId);
      console.log(request);
      const { data } = await service.UpdateDetailOrder({
        id: transactionId,
        resi: request.resi || null,
        statusId: request.statusId || null,
      });
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  });

  app.put(
    "/ajukan-batalkan/:id",
    upload.single("ajukan_batal_image"),
    async (req, res, next) => {
      try {
        const transactionId = req.params.id;
        const request = req.body;
        const batalImage = req.file;

        console.log(transactionId);
        console.log(request.ajukanbatal);
        const { data } = await service.UpdateDetailOrder({
          id: transactionId,
          statusId: request.statusId || null,
          ajukanbatal: request.ajukanbatal || null,
          alasan_pembatalan: request.alasan_pembatalan || null,
          ajukan_batal_image: batalImage.filename || null,
        });

        return res.json(data);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: error.message || "Internal Server Error" });
      }
    }
  );

  app.put(
    "/terima-pesanan/:id",
    upload.single("bukti_terima_pesanan"),
    async (req, res, next) => {
      try {
        const transactionId = req.params.id;
        const batalImage = req.file;

        console.log(transactionId);
        console.log(batalImage);
        const { data } = await service.UpdateDetailOrder({
          id: transactionId,
          statusId: 11,
          bukti_terima_pesanan: batalImage.filename,
        });

        return res.json(data);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: error.message || "Internal Server Error" });
      }
    }
  );

  app.put("/cart", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { transactionId, statusId } = req.body;
      // const transactionId = req.body.transactionId;
      console.log(transactionId);
      const data = await service.UpdateCart({
        userId: _id,
        // item: null,
        // qty: null,
        // price: null,
        // color: null,
        // size: null,
        // weight: null,
        // isRemove: false,
        transactionId: transactionId ?? null,
        statusId: statusId ?? null,
        channel,
      });

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.Delete(_id, req.body._id);

    res.status(200).json(data);
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const transactionId = req.body.transactionId;
    console.log("halooo :", transactionId);
    const { data } = await service.GetCart({
      _id,
      transactionId: transactionId ?? null,
    });
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json(data);
    }
  });

  // app.get("/cart-transaction", UserAuth, async (req, res, next) => {
  //   const { _id } = req.user;
  //   const { transactionId } = req.body;
  //   console.log("halooo");
  //   const { data } = await service.GetCart({ _id, transactionId });
  //   if (data) {
  //     return res.status(200).json(data);
  //   } else {
  //     return res.status(404).json(data);
  //   }
  // });

  app.get("/whoami", (req, res, next) => {
    return res.status(200).json({ msg: "/shoping : I am Shopping Service" });
  });

  app.get("/cartmysql", async (req, res, next) => {
    const { _id } = req.body;

    const { data } = await service.GetCartdb({ _id });

    return res.status(200).json(data);
  });

  const midtransClient = require("midtrans-client"); // Ensure midtrans-client is imported

  app.post("/payment", UserAuth, async (req, res, next) => {
    console.log("this is process payment");
    const { _id } = req.user;
    const payload = await service.GetOrderPayload(_id, "GET_USER");

    try {
      const response = await PublishMessage(
        channel,
        USERS_SERVICE,
        JSON.stringify(payload)
      );
      const user = response.data.user;

      const {
        totalbayar,
        tujuan,
        kodepospembeli,
        berat,
        paket,
        kurir,
        alamatpembeli,
      } = req.body;
      console.log("this total bayar dari semuanya", totalbayar);
      const midtransServerKey = "SB-Mid-server-KfOHtIYQdM-mZcR0GlslJk28";
      const midtransClientKey = "SB-Mid-client-O9CttO-48I-qx0KO";
      const isProduction = false;

      const shippingAddress = {
        first_name: "John",
        last_name: "Watson",
        address: "Bakerstreet 221B.",
        city: "Jakarta",
        postal_code: "51162",
        phone: "081322311801",
        country_code: "IDN",
      };

      const customerDetails = {
        first_name: user.name,
        last_name: "Customer",
        email: user.username,
        phone: user.nomor_handphone,
        billing_address: "Sby",
        shipping_address: shippingAddress,
      };

      const orderIdMidtrans = Math.floor(Math.random() * 1000000000);
      const transactionDetails = {
        order_id: orderIdMidtrans,
        gross_amount: totalbayar,
      };

      const params = {
        transaction_details: transactionDetails,
        customer_details: customerDetails,
      };

      const snap = new midtransClient.Snap({
        isProduction: isProduction,
        serverKey: midtransServerKey,
        clientKey: midtransClientKey,
      });

      const snapToken = await snap.createTransaction(params);
      console.log(snapToken);
      const pesanan = await service.saveOrder({
        user_id: _id,
        invoice: orderIdMidtrans,
        token_midtrans: snapToken.token,
        nominal: totalbayar,
      });

      const { data } = await service.GetCart({ _id });
      const cartsData = data.cart;
      carts = cartsData.filter((item) => item.dataValues.transactionId === 0);
      // console.log(tujuan);
      // console.log("Cart Data:", carts); // Log cart data
      if (!Array.isArray(carts) || carts.length === 0) {
        throw new Error("Cart items not found for user");
      }

      const mapByToko = carts.reduce((acc, item) => {
        const cartItem = item.dataValues;
        (acc[cartItem.storeId] = acc[cartItem.storeId] || []).push(cartItem);
        return acc;
      }, {});

      for (const [storeId, listProduk] of Object.entries(mapByToko)) {
        console.log(listProduk);
        console.log("hello this is new user " + storeId);
        let totalBayar = 0;
        let beratTotal = 0;

        for (const produk of listProduk) {
          console.log(kurir[storeId]);
          totalBayar +=
            parseInt(kurir[storeId].harga_paket) + parseInt(produk.price);
          beratTotal += produk.weight;
        }
        const klada = storeId;
        const Spayload = await service.GetOrderPayload2(klada, "GET_STORE");
        const storesResponse = await PublishMessage(
          channel,
          STORES_SERVICE,
          JSON.stringify(Spayload)
        );
        console.log("Stores Response:", storesResponse); // Log stores response
        const store = storesResponse.data.stores;
        console.log("Store:", store); // Log individual store
        const pesananId = pesanan.data.dataValues.id;
        console.log(pesananId);
        const detailPesanan = {
          invoice: orderIdMidtrans,
          name: user.name,
          nominal: totalBayar,
          token_midtrans: snapToken.token,
          usrid: _id,
          alamat_pembeli: alamatpembeli,
          toko_id: storeId,
          alamat_penjual: store.id_city,
          berat: parseInt(beratTotal),
          ongkir: kurir[storeId].harga_paket,
          kurir: kurir[storeId].ekspedisi,
          paket: kurir[storeId].paket,
          dari: 11,
          tujuan: tujuan,
          resi: null,
          id_bayar: 2,
          ajukanbatal: 1,
          keterangan: "Proses",
          status_id: 3,
          pesanan_id: pesananId,
          channel,
        };

        // if (!orderResult.success) {
        //   throw new Error(orderResult.message);
        // }

        // Update cart items for the current store
        // const orderResult = await service.saveOrderDetails(detailPesanan);
        await service.saveOrderDetails(detailPesanan);
        // console.log("order result ii:", orderResult.data.data.dataValues);
        // const userId = _id;
        // for (const item of listProduk) {
        //   const product = {
        //     _id: item.productId,
        //     storeInfo: {
        //       storeId,
        //     },
        //     name: item.name,
        //     banner: item.banner,
        //   };
        //   const payload = {
        //     event: "UPDATE_CART",
        //     data: {
        //       userId,
        //       product,
        //       transactionId: orderResult.data.data.dataValues.id,
        //       statusId: 3,
        //     },
        //   };

        //   await PublishMessage(channel, USERS_SERVICE, JSON.stringify(payload));
        // }
      }

      res.json({
        success: true,
        data: "Payment processed successfully",
      });
    } catch (error) {
      console.error("Error processing payment:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });
};
