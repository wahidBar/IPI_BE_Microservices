const UsersService = require("../services/users-service");
const UserAuth = require("./middlewares/auth");
const { SubscribeMessage } = require("../utils");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..", "..");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadsFolderPath;
    if (file.fieldname === "photo_url") {
      uploadsFolderPath = path.join(projectRoot, "uploads", "photo_url");
    }
    if (
      file.fieldname === "banner" ||
      file.fieldname === "foto_tentang_kami" ||
      file.fieldname === "logo"
    ) {
      uploadsFolderPath = path.join(projectRoot, "uploads", "setting");
    }
    console.log(uploadsFolderPath);
    ensureDirectoryExists(uploadsFolderPath);
    const relativePath = path.relative(projectRoot, uploadsFolderPath);
    console.log(relativePath);
    cb(null, relativePath);
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
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

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
  const service = new UsersService();

  SubscribeMessage(channel, service);

  app.get("/about", async (req, res, next) => {
    const { data } = await service.About();

    res.json(data);
  });

  app.post(
    "/setting",
    UserAuth,
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "foto_tentang_kami", maxCount: 5 },
      { name: "logo", maxCount: 1 },
    ]),
    async (req, res, next) => {
      const bannerFile = req.files["banner"] ? req.files["banner"][0] : null;
      const fototentangKamiFile = req.files["foto_tentang_kami"]
        ? req.files["foto_tentang_kami"][0]
        : null;
      const logoFile = req.files["logo"] ? req.files["logo"][0] : null;
      const request = req.body;
      const { data } = await service.Setting({
        logo: logoFile ? logoFile.filename : null,
        judul_web: request.judul_web,
        tentang_kami: request.tentang_kami,
        judul_tentang_kami: request.judul_tentang_kami,
        foto_tentang_kami: fototentangKamiFile
          ? fototentangKamiFile.filename
          : null,
        facebook: request.facebook,
        instagram: request.instagram,
        telepon: request.telepon,
        email: request.email,
        twitter: request.twitter,
        telegram: request.telegram,
        nama_web: request.nama_web,
        alamat: request.alamat,
        visi: request.visi,
        misi: request.misi,
        slogan_web: request.slogan_web,
        banner: bannerFile ? bannerFile.filename : null,
        embed_ig: request.embed_ig,
        embed_ig2: request.embed_ig2,
        nama_motivasi: request.nama_motivasi,
        jabatan_motivasi: request.jabatan_motivasi,
        isi_motivasi: request.isi_motivasi,
      });
      res.json(data);
    }
  );

  app.post("/signup", upload.single("photo_url"), async (req, res, next) => {
    const photo_url = req.file;
    const request = req.body;
    const { data } = await service.SignUp({
      name: request.name,
      username: request.username,
      password: request.password,
      phone: request.phone,
      storeId: request.storeId,
      photo_url: photo_url ? photo_url.filename : null,
    });
    res.json(data);
  });

  app.put(
    "/update",
    UserAuth,
    upload.single("photo_url"),
    async (req, res, next) => {
      try {
        const { _id } = req.user; // Ensure _id is extracted from the authenticated user
        const photo_url = req.file;
        const request = req.body;

        // Call the updateUser service with the provided data
        const { data } = await service.updateUser({
          id: _id, // Use the authenticated user id
          name: request.name,
          username: request.username,
          password: request.password,
          phone: request.phone,
          storeId: request.storeId, // Include storeId if it's part of the request
          photo_url: photo_url ? photo_url.filename : null, // Handle file upload properly
        });

        // Send the updated data in the response
        res.json(data);
      } catch (error) {
        next(error); // Pass any errors to error handling middleware
      }
    }
  );

  app.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    const { data } = await service.SignIn({ username, password });

    res.json(data);
  });

  app.get("/ByUsername", async (req, res, next) => {
    const { username } = req.body;

    // const username = String(email);
    console.log(username);
    const { data } = await service.FindByUsername(username);
    return res.status(200).json(data);
  });

  app.post("/address", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    const { street, postalCode, city, country } = req.body;

    const { data } = await service.AddNewAddress(_id, {
      street,
      postalCode,
      city,
      country,
    });

    res.json(data);
  });

  app.get("/profile", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetProfile({ _id });
    res.json(data);
  });

  app.get("/all-user", async (req, res, next) => {
    const { data } = await service.AllUser();
    res.json(data);
  });

  app.get("/shoping-details", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetShopingDetails(_id);

    return res.json(data);
  });

  app.get("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetWishList(_id);
    return res.status(200).json(data);
  });

  app.get("/whoami", (req, res, next) => {
    return res.status(200).json({ msg: "/users : I am Users Service" });
  });
};
