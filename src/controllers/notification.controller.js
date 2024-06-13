"use strict";

const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  getListNotifyByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metadata: await NotificationService.getListNotifyByUser(req?.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
