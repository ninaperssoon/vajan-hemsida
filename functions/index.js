/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const fileName = path.basename(filePath);

  // Exit if the image is already a thumbnail
  if (fileName.includes('_thumb')) {
    console.log('Already a Thumbnail.');
    return null;
  }

  // Exit if this is not an image
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  const bucket = admin.storage().bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
  };

  // Download file from bucket.
  await bucket.file(filePath).download({destination: tempFilePath});
  console.log('Image downloaded locally to', tempFilePath);

  // Generate a thumbnail using Sharp.
  const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/, '$1thumbnails/$2_thumb');
  await sharp(tempFilePath)
    .resize(200, 200) // Justera storleken på miniatyrbilden här
    .toFile(tempFilePath);

  // Upload the thumbnail to Firebase Storage.
  await bucket.upload(tempFilePath, {
    destination: thumbFilePath,
    metadata: metadata,
  });

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  return fs.unlinkSync(tempFilePath);
});
