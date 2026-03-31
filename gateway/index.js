const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const proxys = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", proxy("http://localhost:8093"));
app.use(
  "/products",
  proxys.createProxyMiddleware({
    target: "http://localhost:8093",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && req.headers["content-type"] === "application/json") {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);
app.use("/users", proxy("http://localhost:8094"));
// app.use(
//   "/users",
//   proxys.createProxyMiddleware({
//     target: "http://localhost:8094",
//     changeOrigin: true,
//     onProxyReq: (proxyReq, req, res) => {
//       if (req.body && req.headers["content-type"] === "application/json") {
//         const bodyData = JSON.stringify(req.body);
//         proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
//         proxyReq.write(bodyData);
//       }
//     },
//   })
// );
app.use(
  "/stores",
  proxys.createProxyMiddleware({
    target: "http://localhost:8095",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && req.headers["content-type"] === "application/json") {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);
app.use("/shopping", proxy("http://localhost:8096"));
app.use("/", proxy("http://localhost:8093")); // products

app.listen(8092, () => {
  console.log("Gateway is Listening to Port 8092");
});

// const express = require("express");
// const cors = require("cors");
// const proxy = require("express-http-proxy");
// const { createProxyMiddleware } = require("http-proxy-middleware");
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use(
//   "/users",
//   createProxyMiddleware({ target: "http://localhost:8094", changeOrigin: true })
// );
// app.listen(8092, () => {
//   console.log("Gateway is Listening to Port 8092");
// });
