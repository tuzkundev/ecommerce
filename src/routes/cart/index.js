"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const CartController = require("../../controllers/cart.controller");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// get amount a discount

router.post("", asyncHandler(CartController.addToCart));
router.delete("/deleteCart", asyncHandler(CartController.delete));

// authentication //
router.use(authenticationV2);

router.post("/updateCart", asyncHandler(CartController.updateCart));
router.get("", asyncHandler(CartController.listToCart));

module.exports = router;
