"use strict";
const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inventory_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    inventory_location: { type: String, default: "unKnow" },
    inventory_stock: { type: Number, require: true }, // hang ton kho
    inventory_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    inventory_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    inventory_reservations: { type: Array, default: [] }, // dat truoc
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = { inventory: model(DOCUMENT_NAME, inventorySchema) };
