const express = require("express");

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
  return res.status(200).json({ msg: "Hello from Stores" });
});

app.listen(8094, () => {
  console.log("Stores is Listening to Port : 8094");
});
