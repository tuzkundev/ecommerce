"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keytoken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "00001", // SHOP
  WRITER: "00002", // WRITE
  EDITOR: "00003", //EDITOR
  ADMIN: "00004", //ADMIN
};

class AccessService {
  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    console.log(
      "--->>>> log keyStore =>>>>>>",
      keyStore,
      "--->>>> log user =>>>>>>",

      user,
      "--->>>> log refreshToken =>>>>>>",

      refreshToken
    );

    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Forbidden");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop not registered");

    // check user
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered 2");

    // create a new token pair
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken, // da duoc su dung de lay token moi roi
      },
    });

    return {
      user,
      tokens,
    };
  };

  static handleRefreshToken = async (refreshToken) => {
    /**
     * 1 - Check token is use?
     * 2 -
     */

    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      // decode to see who use this token
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // neu co thi xoa user luon
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Forbidden");
    }

    const holderToken = KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered 1");

    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      foundToken.privateKey
    );
    // check user
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered 2");

    // create a new token pair
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await holderToken.update({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken, // da duoc su dung de lay token moi roi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    console.log("--->>>>>>>+++++ key res", keyStore);
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  /**
   * 1 - Check email in db
   * 2 - match password
   * 3 - create accessToken and refreshToken and save
   * 4 - generate token
   * 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("PASSWORD INCORRECT");

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      metadata: {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: foundShop,
        }),
        token: tokens,
      },
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // check email exists
    const alreadyShop = await shopModel.findOne({ email }).lean();

    if (alreadyShop) {
      throw new BadRequestError("Error: Shop already registered");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: hashPassword,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // day la crypto ma hoa phuc tap dung cho cong nghe lon
      // created privateKey, publicKey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: "xxx",
          message: "publicKeyString error",
        };
      }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString);

      //create token pair
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          token: tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   console.error(error);
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
