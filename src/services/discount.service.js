"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodeUnselect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("./product.service.clone");

/*
    Discount Services
    1 - Generator Discount Code  - Shop | Admin
    2 - Get Discount Amount - User
    3 - Get All Discount Code - User | Shop
    4 - Verify Discount Code - User
    5 - Delete Discount Code - Shop | Admin
    6 - Cancel Discount Code - User
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productId,
      appliesTo,
      name,
      description,
      type,
      value,
      maxUse,
      useCount,
      maxUsePerUser,
      userUse,
    } = payload;

    // kiem tra
    // if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
    //   throw new BadRequestError("Discount code has expired");
    // }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestError("startDate must be before endDate");
    }

    // create index for discount code
    // tim xem discount nay ton tai hay khong
    // const foundDiscount = checkDiscountExists({
    //   model: discountModel,
    //   filter: {
    //     discount_code: code,
    //     discount_shopId: shopId,
    //   },
    // });

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists!");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(startDate),
      discount_end_date: new Date(endDate),
      discount_max_use: maxUse,
      discount_use_count: useCount,
      discount_users_used: userUse,
      discount_max_use_per_user: maxUsePerUser,
      discount_min_order_value: minOrderValue || 0,
      discount_shopId: shopId,
      discount_is_active: isActive,
      discount_apply_to: appliesTo,
      discount_product_ids: appliesTo === "all" ? [] : productId,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    // giong voi update product
  }

  /**
   * Get product by discount code
   */

  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    userId,
    limit = 10,
  }) {
    // create index for discount_code
    // const foundDiscount = checkDiscountExists({
    //   model: discountModel,
    //   filter: {
    //     discount_code: code,
    //     discount_shopId: shopId,
    //   },
    // });

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();

    if (!foundDiscount | !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists");
    }

    const { discount_apply_to, discount_product_ids } = foundDiscount;

    let products;

    if (discount_apply_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"], // TODO: luu y xem select o day
      });
    }

    if (discount_apply_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"], // TODO: luu y xem select o day
      });
    }

    return products;
  }

  /**
   * get all discount code of shop
   */

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: shopId,
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });

    return discounts;
  }

  /**
   * Apply discount code
   * products = [
   *  {
   *    productId,
   *    shopId,
   *     quantity,
   *      name,
   *    price
   * }
   * ]
   */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    // tim xem gio hang co ton tai hay khong
    const foundDiscount = checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount does not exists");
    }

    const {
      discount_is_active,
      discount_max_use,
      discount_min_order_value,
      discount_max_use_per_user,
      discount_users_used,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError("Discount expired");
    if (!discount_max_use) throw new NotFoundError("Discount are out");

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount expired");
    }

    // check xem co set gia tri toi thieu hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount require a minium order of ${discount_min_order_value}`
        );
      }

      if (discount_max_use_per_user > 0) {
        const userUseDiscount = discount_users_used.find(
          (user) => user.userId === userId
        );
        if (userUseDiscount) {
          // ... TODO: kiem tra xem neu user nay da co trong danh sach nhung user dung discount nay
          // TH neu max_use_per_user = 1
        }
      }

      //check discount nay la fixed amount hay gi (duoc giam gia bao nhieu)
      const amount =
        discount_type === "fixed_amount"
          ? discount_value
          : totalOrder * (discount_value / 100);

      return {
        totalOrder,
        discount: amount,
        totalPrice: totalOrder - amount,
      };
    }
  }

  /** Delete discount */
  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  /** Cancel discount */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("Discount not exist");

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_use: 1,
        discount_use_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
