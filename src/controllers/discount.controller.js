"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId, // lay bang token
      }),
    }).send(res);
  };

  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId, // lay bang token
      }),
    }).send(res);
  };

  getAllDiscountCodeWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await DiscountService.getAllDiscountCodeWithProduct({
        ...req.query,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    });
  };
}

module.exports = new DiscountController();
