const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/shopping", proxy("http://localhost:8095"));
// app.use(
//   "/shopping",
//   createProxyMiddleware({ target: "http://localhost:8095", changeOrigin: true })
// );
app.use(
  "/stores",
  createProxyMiddleware({ target: "http://localhost:8094", changeOrigin: true })
);
// app.use("/stores", proxy("http://localhost:8094"));
app.use("/users", proxy("http://localhost:8093"));
app.use("/products", proxy("http://localhost:8092"));
app.use("/", proxy("http://localhost:8092")); // products

app.listen(8091, () => {
  console.log("Gateway is Listening to Port 8091");
});
