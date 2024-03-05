const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    } else if (file.fieldname === "images") {
      uploadsFolderPath = path.join(projectRoot, "uploads", "images");
    }
    console.log(uploadsFolderPath);
    ensureDirectoryExists(uploadsFolderPath);
    cb(null, uploadsFolderPath);
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
      console.log(`Folder already exists: ${directoryPath}`);
    }
  } catch (error) {
    console.error("Error ensuring directory exists:", error);
  }
}

module.exports = (app, channel) => {
  const service = new ProductService();

  app.post(
    "/product/create",
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    async (req, res, next) => {
      try {
        const request = req.body;
        console.log(request.variants);
        // const bannerFile = req.files["banner"] ? req.files["banner"][0] : null;
        // const imagesFiles = req.files["images"] || [];

        const { data } = await service.CreateProduct({
          name: request.name,
          // banner: bannerFile ? bannerFile.path : null,
          // images: imagesFiles,
          idCategory: request.idCategory,
          short_description: request.short_description,
          complete_description: request.complete_description,
          total: request.total,
          available: request.available,
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

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

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
    const { _id } = req.user;

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body._id, qty: req.body.qty },
      "ADD_TO_CART"
    );

    // PublishUsersEvent(data);
    // PublishShoppingEvent(data);

    PublishMessage(channel, USERS_SERVICE, JSON.stringify(data));
    PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

    const response = { product: data.data.product, unit: data.data.qty };

    res.status(200).json(response);
  });

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
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
