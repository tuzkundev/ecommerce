"use strict";

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

/**
 * 1- add product to cart - user
 * 2 reduce product quantity - user
 * 3 increase product quantity - user
 * 4 get list to cart - user
 * 5 delete cart - user
 * 6 delete cart item - user
 */

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId, // tim xem co cai productId nay trong cart product (1 array)
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity, // $ => dai dien update chinh phan tu do
        },
      },
      options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }

  //1
  static async addToCart({ userId, product = {} }) {
    // check cart exist
    const userCart = await cartModel.findOne({
      cart_userId: userId,
    });

    if (!userCart) {
      // create cart
      return await CartService.createUserCart({ userId, product });
    }

    // if already have cart but cart empty
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    // if already have cart and cart is not empty, so update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  /**
   * update cart
   * shop_order_ids: [
   *  {
   *     shopId,
   *      item_products: [
   *         {
   *            quantity,
   *            shopId
   *            old_quantity,
   *            quantity,
   *            productId
   *          }
   *    ],
   *    version
   *  }
   * ]
   */
  // chinh la updateCart (+1 product trong gio hang)
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check san pham ton tai
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Can not found product");
    // neu ton tai thi so sanh xem product shop = shopId khong
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError("Product do not belong to the shop");

    if (quantity === 0) {
      return await CartService.deleteProductCart({ userId, productId });
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteProductCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cartModel.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
