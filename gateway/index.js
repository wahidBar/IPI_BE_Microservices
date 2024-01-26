const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", proxy("http://localhost:8005"));
app.use("/shopping", proxy("http://localhost:8006"));
app.use("/products", proxy("http://localhost:8100"));
app.use("/", proxy("http://localhost:8100")); // products

app.listen(8091, () => {
  console.log("Gateway is Listening to Port 8091");
});
