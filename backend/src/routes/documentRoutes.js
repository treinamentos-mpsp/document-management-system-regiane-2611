const express = require('express');
const { uploadMiddleware } = require('../repositories/fileRepository');
const {
  requireUserId,
  uploadDocument,
  listDocuments,
  downloadDocument,
} = require('../controllers/documentController');

const router = express.Router();

router.post('/upload', requireUserId, uploadMiddleware, uploadDocument);
router.get('/documents', requireUserId, listDocuments);
router.get('/documents/:id/download', requireUserId, downloadDocument);

module.exports = router;
