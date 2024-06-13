"use strict";

const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");
const { BadRequestError } = require("../core/error.response");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "Ha Noi",
  }) {
    const product = await getProductById(productId);
    if (!product) {
      throw new BadRequestError("The product not exists!");
    }

    const query = {
        inventory_shopId: shopId,
        inventory_productId: productId,
      },
      updateSet = {
        $inc: {
          inventory_stock: stock,
        },
        $set: {
          inventory_location: location,
        },
      },
      options = {
        upsert: true,
        new: true,
      };

    return await inventory.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
