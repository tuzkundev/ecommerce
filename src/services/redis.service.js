"use strict";

const redis = require("redis");
const { promisify } = require("util");
const { createClient } = require("redis");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo"); // chuyen doi 1 ham thanh 1 ham async await
const redisClient = redis.createClient();

// redisClient.ping((err, result) => {
//   if (err) {
//     console.error("Error connecting to Redis::", err);
//   } else {
//     console.log("Connected to Redis");
//   }
// });

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setEx).bind(redisClient);

const acquireLock = async (productId, quantity, cardId) => {
  const key = `lock_v2024_${productId}`; // key de khi ai mua hang thi giu
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    // tao 1 key thang nao giu key duoc thanh toan
    const result = await setnxAsync(key, expireTime);
    console.log(`result:::`, result);
    if (result === 1) {
      // thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });
      if (isReservation.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      // thu lai cho den 10 lan
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
