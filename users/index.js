const express = require("express");

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
  return res.status(200).json({ msg: "Hello from Users" });
});

app.listen(8200, () => {
  console.log("Products is Listening to Port 8200");
});
