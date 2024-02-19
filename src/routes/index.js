"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");

const router = express.Router();

// kiem tra xem api day co dung version có mình không

// check apiKey
router.use(apiKey);
// check permission
router.use(permission("0000"));

router.use("/v1/api/checkout", require("./checkout"));
router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/cart", require("./cart"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

// router.get("/", (req, res, next) => {
//   res.status(200).json({
//     message: "Mai yeu NPL",
//   });
// });

module.exports = router;
