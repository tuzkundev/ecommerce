"use strict";

const { BadRequestError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

class CheckoutService {
  /**
   * payload shop_order_ids
   *
   * shop_order_ids: {
   *      [
   *         shopId,
   *         shop_discount: [
   *              {
   *                     shopId,
   *                      discountId,
   *                      codeId
   *              }
   *          ],
   *          item_products: [
   *                 {
   *                      price,
   *                         quantity,
   *                      productId
   *                  }
   *          ]
   *      ]
   * }
   *
   */

  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cart Id co ton tai hay khong
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exists");

    const checkout_order = {
        totalPrice: 0, // tong tien hang
        feeShip: 0, // phi van chuyen
        totalDiscount: 0, // tong tien discount,
        totalCheckout: 0, // tong thanh toan
      },
      shop_order_ids_new = [];

    // tinh tong tien bill
    for (let index = 0; index < shop_order_ids.length; index++) {
      const { shopId, shop_discounts = [], item_products } = shop_order_ids[i];
      // check product available
      const checkProductSever = await checkProductByServer(item_products);
      if (!checkProductSever[0]) throw new BadRequestError("order wrong!!!");

      // tong tien don hang
      const checkoutPrice = checkProductSever.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // tong tien truoc khi xu ly
      checkout_order.totalPrice = +checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice, // tien sau khi giam gia
        item_products: checkProductSever,
      };

      // neu shop_discounts ton tai > 0, check xem co hop le hay khong
      if (shop_discounts.length > 0) {
        // gia su chi co 1 discount
        //get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductSever,
        });

        // tong discount giam gia
        checkout_order.totalDiscount += discount;

        // neu tien giam gia > 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;
