"use strict";

const cartModel = require("../cart.model");

const findCartById = async (cartId) => {
  return await cartModel
    .findOne({
      _id: cartId,
      cart_state: "active",
    })
    .lean();
};

module.exports = {
  findCartById,
};
