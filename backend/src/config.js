const path = require('node:path');

const configuredMaxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE_BYTES, 10);

module.exports = {
  storageDirectory: process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : path.resolve(__dirname, '../storage'),
  maxFileSizeBytes: Number.isSafeInteger(configuredMaxFileSize) && configuredMaxFileSize > 0
    ? configuredMaxFileSize
    : 10 * 1024 * 1024,
};