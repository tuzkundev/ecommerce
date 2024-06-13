"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required
const {
  ORDER_SUCCESS,
  ORDER_FAILED,
  PROMOTION,
  NEW_PRODUCT,
} = require("../utils/statusNotify");

const DOCUMENT_NAME = "Notifications";
const COLLECTION_NAME = "Notifications";

// Declare the Schema of the Mongo model
const notificationSchema = new Schema(
  {
    notify_type: {
      type: String,
      enum: [ORDER_SUCCESS, ORDER_FAILED, PROMOTION, NEW_PRODUCT],
      require: true,
    },
    notify_senderId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Shop",
    },
    notify_received: {
      type: Number,
      require: true,
    },
    notify_content: {
      type: String,
      require: true,
    },
    notify_options: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, notificationSchema);
