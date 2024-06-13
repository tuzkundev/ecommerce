"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const notificationController = require("../../controllers/notification.controller");
const router = express.Router();

// authentication //
router.use(authenticationV2);

router.get("", asyncHandler(notificationController.getListNotifyByUser()));

module.exports = router;
