"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.clone");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_id: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.publishProductShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.unPublishProductShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY //
  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */

  /** */

  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.findAllDraftForShop(
        // req.body.product_type, de the nay la sai
        {
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.findAllPublishForShop(
        // req.body.product_type, de the nay la sai
        {
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };
  // get result search product
  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.getListSearchProduct(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  // END QUERY //
}

module.exports = new ProductController();
