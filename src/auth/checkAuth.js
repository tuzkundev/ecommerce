"use strict";

const { findById } = require("../services/apikey.service");
const apikeyModel = require("../models/apikey.model");

// const { findById } = require("../models/apikey.model");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    //kiem tra xem api key co ton tai hay khong
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error ha",
      });
    }
    // check objKey

    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error nes",
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {}
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey) {
      return res.status(403).json({
        message: "Permissions Denied",
      });
    }

    console.log("permission::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permissions Denied",
      });
    }
    return next();
  };
};

// fn la function ma chung ta se truyen vao la controller trong router
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  apiKey,
  permission,
  asyncHandler,
};
