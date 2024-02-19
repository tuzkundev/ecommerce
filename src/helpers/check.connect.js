"use strict";

const { default: mongoose } = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection:: ${numConnection}`);
};

// check over load connect

const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUse = process.memoryUsage().rss;

    // khong nen check max ma nen chua lai de con vao tang
    const maxConnect = numCores * 5;

    console.log(`Active connections:: ${numConnection}`);
    console.log(`Memory usage:: ${memoryUse / 1024 / 1024} MB`);

    if (numConnection > maxConnect) {
      console.log(`Connection overload detected!`);
    }
  }, _SECONDS); // monitor every 5 seconds
};

module.exports = {
  countConnect,
  checkOverload,
};
