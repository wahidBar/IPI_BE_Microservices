const multer = require("multer");
const path = require("path");
const fs = require("fs");

const StoreService = require("../services/store-service");
const { SubscribeMessage } = require("../utils");

const UserAuth = require("./middlewares/auth");

// const projectRoot = path.join(__dirname, "..", "..");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bannerDir = path.join(__dirname, "uploads", "banner");
    if (!fs.existsSync(bannerDir)) {
      fs.mkdirSync(bannerDir, { recursive: true });
    }
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `banner-${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa gambar dengan format JPEG atau PNG"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

function ensureDirectoryExists(directoryPath) {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Folder created: ${directoryPath}`);
    } else {
      console.log(`Folder already exists: ${directoryPath}`);
    }
  } catch (error) {
    console.error("Error ensuring directory exists:", error.message);
    throw error; // Propagate the error
  }
}

module.exports = (app, channel) => {
  const service = new StoreService();
  SubscribeMessage(channel, service);

  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetStores();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

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

  app.post(
    "/create-store",
    upload.single("banner"),
    UserAuth,
    async (req, res, next) => {
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
    }
  );

  app.post("/update/:id", upload.single("banner"), async (req, res) => {
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

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ message: err.message });
    } else if (err) {
      res.status(400).json({ message: err.message });
    } else {
      next();
    }
  });
};
