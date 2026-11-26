const path = require('node:path');

const BYTES_PER_MB = 1024 * 1024;

module.exports = {
  storageDir: process.env.STORAGE_DIR || path.resolve(__dirname, '..', 'storage'),
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_MB || 10) * BYTES_PER_MB,
};
