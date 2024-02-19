"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // publicKey duoc sinh ra boi thuat tuan bat doi xung => Buffer (chua dc hash) => chuyen ve string de luu vao db khong thi loi
      // const publicKeyString = publicKey.toString();
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens.publicKey : null;
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true }; // neu ma chua co thi se insert moi con co roi thi se update
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: userId });
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.findByIdAndRemove(id);
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken });
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ user: userId });
    //findByIdAndDelete
    //Types.ObjectId(userId)
  };
}

module.exports = KeyTokenService;
