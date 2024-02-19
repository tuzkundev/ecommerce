"use strict";

// luu tru token tu ngay nao de de kiem tra

const { Schema, model } = require("mongoose"); // Erase if already required
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var productSchema = new Schema(
  {
    product_name: {
      // quan jean cao cap
      type: String,
      require: true,
    },
    // trang thai api nay co hoat dong hay khong
    product_thumb: {
      type: String,
      require: true,
    },
    // co quyen truy cap api nay hay khong
    product_description: String,
    product_slug: String, // quan-jean-cao-cap

    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    //more
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be above 1.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false, // khi chung ta dung find or findOne thi se khong lay gia tri san pham nay
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false, // khi chung ta dung find or findOne thi se khong lay gia tri san pham nay
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// create index for search

productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: runs before .save() and .create()

// truoc khi di vao ham save hay create thi vao ham nay
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

//Export the model
module.exports = model(DOCUMENT_NAME, productSchema);

// clothings
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

// electronics schema]

const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "furniture",
    timestamps: true,
  }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronics", electronicSchema),
  furniture: model("Furniture", furnitureSchema),
};
