"use strict";

const jwt = require("jsonwebtoken");
const { asyncHandler } = require("./checkAuth");
const { AuthFailureError, NotFoundError } = require("../core/error.response");

// service
const { findByUserId } = require("../services/keytoken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await jwt.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "2 days",
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   *
   * 1 - Check userId missing?
   * 2 - get access token
   * 3 - verify token
   * 4 - check user exits in db
   * 5 - check keyStore with this userId
   * 6 - OK all => return next()
   */
  //1
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  //5
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  //2
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  //3
  try {
    const decodeUser = jwt.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid User");
    }
    req.keyStore = keyStore;
    console.log("----key Store++++++", req.keyStore);
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   *
   * 1 - Check userId missing?
   * 2 - get access token
   * 3 - verify token
   * 4 - check user exits in db
   * 5 - check keyStore with this userId
   * 6 - OK all => return next()
   */
  //1
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  //5
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  //2
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
      const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid User");
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;

      return next();
    } catch (error) {
      throw error;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  //3
  try {
    const decodeUser = jwt.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid User");
    }
    req.keyStore = keyStore;
    req.user = decodeUser; // {userId, email}
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await jwt.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
