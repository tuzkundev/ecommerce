"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const uploadController = require("../../controllers/upload.controller");
const { uploadDisk, uploadMemory } = require("../../configs/multer.config");
const router = express.Router();

router.post("/product", asyncHandler(uploadController.uploadFile));
router.post(
  "/product/thumb",
  uploadDisk.single("file"),
  asyncHandler(uploadController.uploadFileThumb)
);
router.post(
  "/product/multiple",
  uploadDisk.array("files", 3),
  asyncHandler(uploadController.uploadImageFromLocalFiles)
);

router.post(
  "/product/bucket",
  uploadMemory.single("file"),
  asyncHandler(uploadController.uploadImageFromLocalS3)
);

module.exports = router;
