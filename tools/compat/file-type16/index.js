'use strict';
// @jimp/core 0.16 (via @andreekeberg/imagedata, used by vision-js-node in the
// api) calls file-type 16's `FileType.fromBuffer(buffer)` only to pick an image
// decoder. Every file-type from 13 to < 21.3.1 carries GHSA-5v7r-6r5c-r473, and
// the patched 21.x line is ESM-only with a different API. jimp 0.16 decodes
// only BMP, GIF, JPEG, PNG and TIFF, so this dependency-free facade detects
// exactly those (plus WebP, so an unsupported WebP keeps jimp's "Unsupported
// MIME type" error) by their magic bytes, returning file-type 16's
// { ext, mime } shape, and undefined otherwise (jimp then falls back to the
// file extension, as it does when file-type returns nothing).
//
// Dependency-free on purpose: Nx 23's pruned api lockfile (generatePackageJson)
// drops the dependency edges of a file: package whose lockfile snapshot carries a
// peer suffix (as it would with file-type 21 / phin 3 underneath), failing the build.
const fs = require('fs');

const startsWith = (buf, bytes, offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

function detect(input) {
  if (!input) return undefined;
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input.buffer || input);
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { ext: 'jpg', mime: 'image/jpeg' };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: 'png', mime: 'image/png' };
  if (startsWith(buf, ascii('GIF'))) return { ext: 'gif', mime: 'image/gif' };
  if (startsWith(buf, ascii('RIFF')) && startsWith(buf, ascii('WEBP'), 8)) return { ext: 'webp', mime: 'image/webp' };
  if (startsWith(buf, [0x49, 0x49, 0x2a, 0x00]) || startsWith(buf, [0x4d, 0x4d, 0x00, 0x2a])) {
    return { ext: 'tif', mime: 'image/tiff' };
  }
  if (startsWith(buf, [0x42, 0x4d])) return { ext: 'bmp', mime: 'image/bmp' };
  return undefined;
}

module.exports = {
  fromBuffer: async (input) => detect(input),
  fromFile: async (path) => {
    const fd = await fs.promises.open(path, 'r');
    try {
      const { buffer, bytesRead } = await fd.read(Buffer.alloc(12), 0, 12, 0);
      return detect(buffer.subarray(0, bytesRead));
    } finally {
      await fd.close();
    }
  },
  extensions: new Set(['jpg', 'png', 'gif', 'webp', 'tif', 'bmp']),
  mimeTypes: new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp']),
};
