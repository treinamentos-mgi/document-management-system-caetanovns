const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config');
const documentRepository = require('../repositories/documentRepository');

function toPublicDocument(document) {
  const { storedName, ...publicDocument } = document;
  return publicDocument;
}

async function createDocument(file, owner) {
  const document = {
    id: randomUUID(),
    originalName: path.basename(file.originalname),
    storedName: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };

  try {
    documentRepository.save(document);
  } catch (error) {
    await fs.unlink(file.path).catch(() => {});
    throw error;
  }

  return toPublicDocument(document);
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner).map(toPublicDocument);
}

async function findDocumentForDownload(id, owner) {
  const document = documentRepository.findById(id);
  if (!document || document.owner !== owner) {
    return null;
  }

  const filePath = path.join(storageDirectory, document.storedName);
  try {
    await fs.access(filePath);
  } catch {
    return null;
  }

  return {
    filePath,
    originalName: document.originalName,
  };
}

module.exports = { createDocument, listDocuments, findDocumentForDownload };