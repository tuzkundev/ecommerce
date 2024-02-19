"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const discountController = require("../../controllers/discount.controller");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// get amount a discount

router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list-product-code",
  asyncHandler(discountController.getAllDiscountCodeWithProduct)
);

// authentication //
router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscount));
router.get("", asyncHandler(discountController.getAllDiscountCode));

module.exports = router;
