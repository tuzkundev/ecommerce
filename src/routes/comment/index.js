"use strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const CommentController = require("../../controllers/comment.controller");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// authentication //
router.use(authenticationV2);

router.post("", asyncHandler(CommentController.createComment()));
router.get("", asyncHandler(CommentController.getCommentsByParentId()));
router.delete("", asyncHandler(CommentController.deleteComment()));

module.exports = router;
