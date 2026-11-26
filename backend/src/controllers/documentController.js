const documentService = require('../services/documentService');

function requireUserId(req, res, next) {
  const owner = (req.get('X-User-Id') || '').trim();

  if (!owner) {
    return res.status(400).json({ error: 'O header X-User-Id é obrigatório.' });
  }

  req.owner = owner;
  next();
}

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo no campo "file".' });
  }

  const document = documentService.createDocument(req.file, req.owner);
  res.status(201).json(document);
}

function listDocuments(req, res) {
  res.json(documentService.listDocuments(req.owner));
}

function downloadDocument(req, res, next) {
  const { filePath, originalName } = documentService.getDownloadInfo(req.params.id, req.owner);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.download(filePath, originalName, (err) => {
    if (err && !res.headersSent) {
      next(err);
    }
  });
}

module.exports = { requireUserId, uploadDocument, listDocuments, downloadDocument };
