"use strict";

// Require the cloudinary library
const cloudinary = require("cloudinary").v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "dgfm6pyn1",
  api_key: "672467526961215",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log the configuration

module.exports = cloudinary;
