"use strict";

// luu tru token tu ngay nao de de kiem tra

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "ApiKey";
const COLLECTION_NAME = "ApiKeys";

// Declare the Schema of the Mongo model
var apiKeySchema = new Schema(
  {
    key: {
      type: String,
      require: true,
      uniqueId: true,
    },
    // trang thai api nay co hoat dong hay khong
    status: {
      type: Boolean,
      default: true,
    },
    // co quyen truy cap api nay hay khong
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);
