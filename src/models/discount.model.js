"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      require: true,
    },
    discount_description: {
      type: String,
      require: true,
    },
    discount_type: {
      type: String,
      default: "fixed_amount",
    },
    discount_value: {
      type: Number,
      require: true,
    },
    discount_code: {
      type: String,
      require: true,
    },
    discount_start_date: {
      // ngay bat dau
      type: Date,
      require: true,
    },
    discount_end_date: {
      // ngay ket thuc
      type: Date,
      require: true,
    },
    discount_max_use: {
      // so luong discount duoc ap dung
      type: Number,
      require: true,
    },
    discount_use_count: {
      // so luong discount duoc su dung
      type: Number,
      require: true,
    },
    discount_users_used: {
      // nhung user da su dung
      type: Array,
      default: [],
    },
    discount_max_use_per_user: {
      // so luong toi da moi user su dung discount nay
      type: Number,
      require: true,
    },
    discount_min_order_value: {
      type: Number,
      require: true,
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_apply_to: {
      type: String,
      require: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: {
      // so san pham duoc ap dung
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
