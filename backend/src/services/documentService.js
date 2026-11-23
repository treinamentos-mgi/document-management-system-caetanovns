const { randomUUID } = require('node:crypto');
const path = require('node:path');
const documentRepository = require('../repositories/documentRepository');
const documentFileRepository = require('../repositories/documentFileRepository');

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
    await documentFileRepository.removeUploadedFile(file.path);
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

  const filePath = await documentFileRepository.findStoredFile(document.storedName);
  if (!filePath) {
    return null;
  }

  return {
    filePath,
    originalName: document.originalName,
  };
}

module.exports = { createDocument, listDocuments, findDocumentForDownload };