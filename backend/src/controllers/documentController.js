const documentService = require('../services/documentService');

function getOwner(req) {
  const requestedOwner = req.get('X-User-Id');
  return requestedOwner && requestedOwner.trim() ? requestedOwner.trim() : 'local-user';
}

async function upload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo "file".',
      },
    });
  }

  try {
    const document = await documentService.createDocument(req.file, getOwner(req));
    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function list(req, res, next) {
  try {
    return res.json(documentService.listDocuments(getOwner(req)));
  } catch (error) {
    return next(error);
  }
}

async function download(req, res, next) {
  try {
    const document = await documentService.findDocumentForDownload(req.params.id, getOwner(req));
    if (!document) {
      return res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento não encontrado.',
        },
      });
    }

    return res.download(document.filePath, document.originalName, (error) => {
      if (!error || res.headersSent) {
        return;
      }

      const notFound = error.code === 'ENOENT';
      return res.status(notFound ? 404 : 500).json({
        error: {
          code: notFound ? 'DOCUMENT_NOT_FOUND' : 'DOWNLOAD_FAILED',
          message: notFound
            ? 'Documento não encontrado.'
            : 'Não foi possível baixar o documento.',
        },
      });
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { upload, list, download };