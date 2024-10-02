const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  USERS_SERVICE,
  SHOPPING_SERVICE,
  STORES_SERVICE,
} = require("../config");
const StoreService = require("../services/store-service");
const {
  PublishUsersEvent,
  PublishShoppingEvent,
  PublishMessage,
  SubscribeMessage,
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
  const service = new StoreService();
  SubscribeMessage(channel, service);

  app.get("/:id", async (req, res, next) => {
    const storeId = req.params.id;
    console.log("toko id");
    try {
      const { data } = await service.GetStoreDescription(storeId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error });
    }
  });

  app.get("my-store", UserAuth, async (req, res, next) => {
    const storeId = req.user;
    console.log("toko id");
    try {
      const { data } = await service.GetStoreDescription(storeId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error });
    }
  });

  app.post("/create-store", upload.single("banner"), async (req, res, next) => {
    try {
      const storeId = req.params.id;
      const request = req.body;
      const bannerFile = req.file;
      console.log("File: ", req.file); // Log the file details
      const { data } = await service.StoreAction({
        id: storeId ? storeId : null,
        name: request.name,
        description: request.description,
        banner: bannerFile ? bannerFile.filename : null,
        city: request.city,
        id_city: request.id_city,
        phone: request.phone,
        postalCode: request.postalCode,
        latitude: request.latitude,
        longitude: request.longitude,
        status: request.status,
      });
      res.json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  });

  app.put("/update/:id", upload.single("banner"), async (req, res) => {
    try {
      const storeId = req.params.id;
      const request = req.body;
      const bannerFile = req.file; // Access the uploaded file

      // Debugging logs
      console.log("File: ", bannerFile);
      console.log("Body: ", request);

      const { data } = await service.StoreAction({
        id: storeId,
        name: request.name,
        description: request.description,
        banner: bannerFile ? bannerFile.filename : null, // Include filename if file is uploaded
        city: request.city,
        id_city: request.id_city,
        phone: request.phone,
        postalCode: request.postalCode,
        latitude: request.latitude,
        longitude: request.longitude,
        status: request.status,
      });

      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.delete("/delete-store/:id", async (req, res, next) => {
    const storeId = req.params.id;
    try {
      const { data } = await service.DeleteStore(storeId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/whoami", (req, res, next) => {
    return res.status(200).json({ msg: "/ or /products : I am store Service" });
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetStores();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
