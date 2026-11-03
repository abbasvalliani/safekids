'use strict';
// metro 0.81 calls require('image-size')(pathOrBuffer) synchronously (image-size 1.x).
// image-size 2 (the patched line, >= 2.0.3) only accepts a Buffer/Uint8Array; file
// paths moved to the async image-size/fromFile. This facade keeps the 1.x call style.
// Same facade as booknok tools/compat/image-size1.
const fs = require('fs');
const { imageSize } = require('image-size-v2');

function sizeOf(input, callback) {
  if (typeof callback === 'function') {
    let result;
    try {
      result = sizeOf(input);
    } catch (err) {
      callback(err);
      return;
    }
    callback(null, result);
    return;
  }
  return imageSize(typeof input === 'string' ? fs.readFileSync(input) : input);
}

module.exports = sizeOf;
module.exports.default = sizeOf;
module.exports.imageSize = sizeOf;
