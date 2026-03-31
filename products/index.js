const express = require("express");

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
  return res.status(200).json({ msg: "Hello from Products" });
});

const PORT = process.env.PORT || 8093;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Products running on port ${PORT}`);
});
