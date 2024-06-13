"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keytoken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "00001", // SHOP
  WRITER: "00002", // WRITE
  EDITOR: "00003", //EDITOR
  ADMIN: "00004", //ADMIN
};

class AccessService {
  /**
   * refresh token
   *  1. get refreshToken, user, keyStore through header
   *  2. check refreshToken get from header is match with keyStore.refreshToken from header
   *  3. check shop exist through email from user get in header by findByEmail
   *  4. create new token pair with keyStore.publickey and keyStore.privateKey
   *  5. update keyStore by set new refreshToken and add refreshTokenUsed is refresh params
   */

  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
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
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  /**
   * 1 - Check email in db
   * 2 - match password use bcrypt compare
   * 3 - create accessToken and refreshToken and save
   * 4 - generate token
   * 5 - get data return login
   */
  static login = async ({ email, password }) => {
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

  /**
   * Sign up
   *  1. check shop exist through email in shopModel db
   *  2. hash password by bcrypt
   *  3. create account by shopModel.create()
   *  4. create key store by private key (client) and public key (sever) by crypto
   *  5. create token pair
   */

  static signUp = async ({ name, email, password }) => {
    // try {
    // check email exists
    console.log("----", name, email, password);
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
      // can sua lai thanh khong co metadata do duplicate chu metadata
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
