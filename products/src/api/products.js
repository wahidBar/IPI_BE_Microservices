const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ObjectId } = require("mongodb"); // Import ObjectId from MongoDB library

const { USERS_SERVICE, SHOPPING_SERVICE } = require("../config");
const ProductService = require("../services/product-service");
const {
  PublishUsersEvent,
  PublishShoppingEvent,
  PublishMessage,
} = require("../utils");
const UserAuth = require("./middlewares/auth");
const { log } = require("console");

const projectRoot = path.join(__dirname, "..", "..");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadsFolderPath;
    if (file.fieldname === "banner") {
      uploadsFolderPath = path.join(projectRoot, "uploads", "banner");
    }
    if (file.fieldname === "image-category") {
      uploadsFolderPath = path.join(projectRoot, "uploads", "image-category");
    } else if (file.fieldname === "images") {
      uploadsFolderPath = path.join(projectRoot, "uploads", "images");
    }
    console.log(uploadsFolderPath);
    ensureDirectoryExists(uploadsFolderPath);
    const relativePath = path.relative(projectRoot, uploadsFolderPath);
    console.log(relativePath);
    cb(null, relativePath);
    // ensureDirectoryExists(uploadsFolderPath);
    // cb(null, uploadsFolderPath);
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    } catch (error) {
      console.error("Error in filename function:", error);
      cb(error);
    }
  },
});

const fileFilter = function (req, file, cb) {
  const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/; //filter file types
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new Error(
        "Hanya file dengan tipe JPEG, JPG, PNG, PDF, DOC, dan DOCX yang diizinkan."
      )
    );
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batasan ukuran file (dalam bytes), contoh disini 2 MB
  fileFilter: fileFilter,
});

// const uploads = multer({ dest: "uploads/" }); // Tentukan direktori penyimpanan file

function ensureDirectoryExists(directoryPath) {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Folder created: ${directoryPath}`);
    } else {
      const {
        name,
        category,
        short_description,
        complete_description,
        orders,
      } = req.body;
      console.log(`Folder already exists: ${directoryPath}`);
    }
  } catch (error) {
    console.error("Error ensuring directory exists:", error);
  }
}

module.exports = (app, channel) => {
  const service = new ProductService();

  // get all
  app.get("/", async (req, res, next) => {
    console.log(999);
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  //get selected product
  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // get by toko_id
  app.get("/find/by/toko", async (req, res, next) => {
    const tokoId = req.query.toko_id;
    console.log(tokoId);
    try {
      const { data } = await service.GetProductByToko(tokoId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // get by category_id
  app.get("/find/by/category", async (req, res, next) => {
    try {
      const { data } = await service.GetProductsByCategory();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // create product
  app.post(
    "/create",
    // upload.fields([
    //   { name: "banner", maxCount: 1 },
    //   { name: "images", maxCount: 5 },
    // ]),
    upload.single("banner"),
    async (req, res, next) => {
      try {
        const request = req.body;
        const bannerFile = req.file; //
        console.log("babisajksa");

        if (!bannerFile) {
          return res.status(400).json({ error: "Banner file is missing" });
        }
        // const bannerFile = req.files["banner"] ? req.files["banner"][0] : null;

        // const imagesFiles = req.files["images"] || [];
        const { data } = await service.CreateProduct({
          name: request.name,
          banner: bannerFile ? bannerFile.filename : null,
          // images: imagesFiles,
          category: request.category,
          short_description: request.short_description,
          complete_description: request.complete_description,
          total: request.total,
          available: request.total,
          orders: request.orders,
          storeId: request.storeId,
          // skuId: request.skuId,
          variants: request.variants,
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

  app.put("/update/:id", upload.single("banner"), async (req, res, next) => {
    try {
      const productId = req.params.id;
      const request = req.body;
      const bannerFile = req.file;

      const { data } = await service.UpdateProduct({
        id: productId,
        name: request.name,
        banner: bannerFile ? bannerFile.filename : null,
        category: request.category,
        short_description: request.short_description,
        complete_description: request.complete_description,
        total: request.total,
        available: request.total,
        orders: request.orders,
        storeId: request.storeId,
        variants: request.variants,
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  });

  // delete product by id
  app.delete("/delete/:id", async (req, res, next) => {
    const productId = req.params.id;
    try {
      const { data } = await service.DeleteProduct(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // CATEGORY
  app.get("/category/get", async (req, res, next) => {
    console.log(9991);
    // const type = req.params.type;
    try {
      const { data } = await service.GetCategory();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  //get selected category
  app.get("/category/get/:id", async (req, res, next) => {
    const categoryId = req.params.id;
    console.log("aku");
    try {
      const { data } = await service.GetCategoryDescription(categoryId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post(
    "/category/create",
    upload.fields([{ name: "image-category", maxCount: 1 }]),
    async (req, res) => {
      try {
        const request = req.body;
        console.log(request);

        const img = req.files["image-category"]
          ? req.files["image-category"][0]
          : null;
        const { data } = await service.CreateCategory({
          name: request.name,
          image: img ? img.filename : null,
          icon: request.icon,
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
  app.post(
    "/category/update",
    upload.fields([{ name: "image-category", maxCount: 1 }]),
    async (req, res) => {
      try {
        const request = req.body;
        console.log(request);

        const img = req.files["image-category"]
          ? req.files["image-category"][0]
          : null;
        const { data } = await service.CreateCategory({
          name: request.name,
          image: img ? img.name : null,
          icon: request.icon,
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
  // delete category
  app.delete("/category/delete/:id", async (req, res, next) => {
    const categoryId = req.params.id;
    try {
      const { data } = await service.DeleteCategory(categoryId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // GALERY
  app.post(
    "/galery/create",
    upload.single("images"),
    async (req, res, next) => {
      const product_id = req.query.product_id;
      const { name } = req.body;
      const images = req.file;

      const { data } = await service.AddNewGalery(product_id, {
        name,
        images: images ? images.filename : null,
      });
      return res.status(200).json(data);
    }
  );

  app.post("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  app.put("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body._id },
      "ADD_TO_WISHLIST"
    );

    // PublishUsersEvent(data);
    PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));

    res.status(200).json(data.data.product);
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_WISHLIST"
    );
    // PublishUsersEvent(data);
    PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));

    res.status(200).json(data.data.product);
  });

  app.put("/cart", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      let instruction = "ADD_TO_CART";

      if (req.body.delete) {
        instruction = "REMOVE_FROM_CART";
      }

      const { data } = await service.GetProductPayload(
        _id,
        {
          productId: req.body._id,
          qty: req.body.qty,
          color: req.body.color,
          size: req.body.size,
          weight: req.body.weight,
        },
        instruction
      );
      console.log(data);
      if (data.success === true) {
        PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));
        PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

        const response = {
          product: data.data.product,
          unit: data.data.qty,
          price: data.data.price,
          weight: data.data.weight,
        };

        res.json(response);
      } else {
        console.error("Error:", data.error || "Unknown error");
        res.status(400).json({
          success: false,
          message: data.error || "An unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      next(error);
    }
  });

  // app.put("/cart", UserAuth, async (req, res, next) => {
  //   const { _id } = req.user;

  //   const { data } = await service.GetProductPayload(
  //     _id,
  //     { productId: req.body._id, qty: req.body.qty },
  //     "ADD_TO_CART"
  //   );

  //   PublishUsersEvent(data);
  //   PublishShoppingEvent(data);

  //   PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));
  //   PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

  //   const response = { product: data.data.product, unit: data.data.qty };

  //   res.status(200).json(response);
  // });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_CART"
    );

    // PublishUsersEvent(data);
    // PublishShoppingEvent(data);

    PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));
    PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

    const response = { product: data.data.product, unit: data.data.qty };
    res.status(200).json(response);
  });

  app.get("/whoami", (req, res, next) => {
    return res
      .status(200)
      .json({ msg: "/ or /products : I am products Service" });
  });

  //get Top products and category
};
