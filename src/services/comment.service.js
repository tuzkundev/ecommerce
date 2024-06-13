"use strict";
const CommentSchema = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils");
const { NotFoundError } = require("../core/error.response");
const { findProduct } = require("../models/repositories/product.repo");

/*
 * key features: Comment service
 * - add comment [User | Shop]
 * - get list of comment [User | Shop]
 * - delete a comment [User | Shop | Admin]
 *  */
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const comment = new CommentSchema({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await CommentSchema.findById(parentCommentId);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }
      rightValue = parentComment.comment_right;

      // update many comment
      await CommentSchema.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: {
            $gte: rightValue, // lon hon hoặc bằng
          },
        },
        {
          $inc: { comment_right: 2 },
        }
      );

      await CommentSchema.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: {
            $gt: rightValue,
          },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await CommentSchema.findOne(
        {
          comment_productId: convertToObjectIdMongodb(productId),
        },
        "comment_right",
        {
          sort: {
            comment_right: -1,
          },
        }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert to comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();
    return comment;
  }

  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
      const parent = await CommentSchema.findById(parentCommentId);
      if (!parent) throw new NotFoundError("Not found comment for product");
      const comments = await CommentSchema.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lte: parent.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({
          comment_left: 1,
        });

      return comments;
    }

    const comments = await CommentSchema.find({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_parentId: parentCommentId,
      comment_right: { $lte: parent.comment_right },
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });

    return comments;
  }

  // delete comment
  static async deleteComment({ commentId, productId }) {
    // check product Exist in database
    const foundProduct = await findProduct({
      product_id: productId,
    });
    if (!foundProduct) throw new NotFoundError("Product not found");
    //1. Xac dinh value left and right cua commentId (comment cha)
    const comment = await CommentSchema.findById(commentId);
    if (comment) throw new NotFoundError("Comment not found");

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;

    // 2. Tinh width comment
    const width = rightValue - leftValue + 1;

    //3. Xoa tat ca commentId con
    await CommentSchema.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: {
        $gte: leftValue,
        $lte: rightValue,
      },
    });

    //4 Cap nhat value left and right con lai, lay right de update, gt (lon hon)
    await CommentSchema.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: {
          $gt: rightValue,
        },
      },
      {
        $inc: {
          comment_right: -width,
        },
      }
    );

    await CommentSchema.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: {
          $gt: rightValue,
        },
      },
      {
        $inc: {
          comment_left: -width,
        },
      }
    );

    return true;
  }
}

module.exports = CommentService;
