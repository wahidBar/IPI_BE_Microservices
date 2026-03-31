const express = require("express");

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
  return res.status(200).json({ msg: "Hello from Stores" });
});

const PORT = process.env.PORT || 8095;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stores running on port ${PORT}`);
});
