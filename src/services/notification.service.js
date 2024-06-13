"use strict";

const notificationModel = require("../models/notification.model");
const {
  ORDER_SUCCESS,
  ORDER_FAILED,
  PROMOTION,
  NEW_PRODUCT,
} = require("../utils/statusNotify");

class NotificationService {
  static pushNotifyToSystem = async ({
    type = ORDER_SUCCESS,
    receiveId = 1,
    senderId = 1,
    options = {},
  }) => {
    let notify_content;

    if (type === NEW_PRODUCT) {
      notify_content = `@@@ vừa mới thêm một sản phẩm: @@@@`;
    } else if (type === PROMOTION) {
      notify_content = `@@@ vừa mới thêm một voucher: @@@@`;
    }

    const newNotify = notificationModel.create({
      notify_type: type,
      notify_received: receiveId,
      notify_senderId: senderId,
      notify_content,
      notify_options: options,
    });

    return newNotify;
  };

  static getListNotifyByUser = async ({
    userId = 1,
    type = "All",
    isRead = 0,
  }) => {
    const match = { notify_received: userId };
    if (type !== "All") {
      match["notify_type"] = type;
    }

    return await notificationModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          notify_type: 1,
          notify_senderId: 1,
          notify_received: 1,
          notify_content: {
            $concat: [
              {
                $substr: ["$notify_options.shop_name", 0, -1],
              },
              " vừa mới thêm một sản phẩm mới: ", // language
              {
                $substr: ["$notify_options.product_name", 0, -1],
              },
            ],
          },
          notify_options: 1,
          createAt: 1,
        },
      },
    ]);
  };
}

module.exports = NotificationService;
