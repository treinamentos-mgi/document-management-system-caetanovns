const fs = require('node:fs');
const multer = require('multer');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { maxFileSizeBytes, storageDirectory } = require('../config');
const documentController = require('../controllers/documentController');

const router = require('express').Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename: (req, file, callback) => {
      callback(null, randomUUID());
    },
  }),
  limits: { fileSize: maxFileSizeBytes },
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;