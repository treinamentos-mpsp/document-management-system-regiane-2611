const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const config = require('../config');

const diskStorage = multer.diskStorage({
  destination: config.storageDir,
  // Nome interno sem extensão: evita colisões e não expõe o nome original.
  filename: (req, file, cb) => cb(null, randomUUID()),
});

const uploadMiddleware = multer({
  storage: diskStorage,
  limits: { fileSize: config.maxUploadSizeBytes },
}).single('file');

function getFilePath(storedName) {
  return path.join(config.storageDir, storedName);
}

module.exports = { uploadMiddleware, getFilePath };
