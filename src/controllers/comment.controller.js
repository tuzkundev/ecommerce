"use strict";

// const { createComment } = require("../services/comment.service");
const { SuccessResponse } = require("../core/success.response");

class CommentController {
  createComment = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Success!",
    //   metadata: await this.createComment(req.body),
    // }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Success!",
    //   metadata: await this.getCommentsByParentId(req.query),
    // }).send(res);
  };

  deleteComment = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Success!",
    //   metadata: await this.deleteComment(req.body),
    // }).send(res);
  };
}

module.exports = new CommentController();
