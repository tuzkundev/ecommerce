"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const InventoryController = require("../../controllers/inventory.controller");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// authentication //
router.use(authenticationV2);

router.post("", asyncHandler(InventoryController.addStockToInventory));

module.exports = router;
