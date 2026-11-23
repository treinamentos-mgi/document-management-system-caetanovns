const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config');

async function findStoredFile(storedName) {
  const filePath = path.join(storageDirectory, storedName);
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

async function removeUploadedFile(filePath) {
  await fs.unlink(filePath).catch(() => {});
}

module.exports = { findStoredFile, removeUploadedFile };