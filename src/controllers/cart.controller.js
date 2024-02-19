"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  /**
   * @description add to cart for user
   * @param {int} userId
   * @param {*} res
   * @param {*} next
   * @method POST
   * @url /v1/api/cart/user
   * @returns {
   *
   * }
   */

  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  updateCart = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await CartService.deleteProductCart(req.body),
    }).send(res);
  };

  listToCart = async (req, res, next) => {
    console.log("--<<<", res.query.userId);

    new SuccessResponse({
      message: "success",
      metadata: await CartService.getListUserCart(res.query),
    }).send(res);
  };
}

module.exports = new CartController();
