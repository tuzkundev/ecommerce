const { inventory } = require("../inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unKnow",
}) => {
  return await inventory.create({
    inventory_productId: productId,
    inventory_location: shopId,
    inventory_stock: stock,
    inventory_location: location,
  });
};

module.exports = {
  insertInventory,
};
