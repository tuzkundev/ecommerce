"use strict";

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const cloudinary = require("../configs/cloudinary.config");
const { s3 } = require("../configs/s3.config");
const crypto = require("node:crypto");

// upload s3

const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const randomImageName = () => crypto.randomBytes(16).toString("hex");
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: randomImageName(),
      Body: file.buffer,
      ContentType: "image/jpeg",
    });

    const result = await s3.send(command);

    return result;
  } catch (error) {
    console.error("Error upload image use s3Client", error);
  }
};

//1 upload from url image

const uploadImageFromUrl = async () => {
  try {
    const urlImage =
      "https://down-vn.img.susercontent.com/file/3707680c53e3c95f97891c4fe02e3614";
    const folderName = "product/8409",
      newFileName = "testDemo";
    const result = await cloudinary.uploader.upload(urlImage, {
      public_id: newFileName,
      folder: folderName,
    });
    return result;
  } catch (error) {
    console.error("Error--", error);
  }
};

// 2. upload from image local

const uploadImageFromLocal = async ({ path, folderName = "product/8409" }) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: "thumb",
      folder: folderName,
    });
    console.log(result);
    return {
      image_url: result.secure_url,
      shopId: 8409,
      thumb_url: await cloudinary.url(result.public_id, {
        height: 100,
        width: 100,
        format: "jpg",
      }),
    };
  } catch (error) {
    console.error("Error--", error);
  }
};

// 3. upload from image local files

const uploadImageFromLocalFiles = async ({
  files,
  folderName = "product/8409",
}) => {
  try {
    const uploadedUrl = [];

    console.log(`files::`, files, folderName);
    if (!files.length) return;

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderName,
      });

      uploadedUrl.push({
        image_url: result.secure_url,
        shopId: 8409,
        thumb_url: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          format: "jpg",
        }),
      });
    }

    console.log(result);
    return uploadedUrl;
  } catch (error) {
    console.error("Error--", error);
  }
};

module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
  uploadImageFromLocalFiles,
  uploadImageFromLocalS3,
};
