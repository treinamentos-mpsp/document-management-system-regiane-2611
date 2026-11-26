const documentRepository = require('../repositories/documentRepository');
const fileRepository = require('../repositories/fileRepository');

class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.');
    this.status = 404;
  }
}

function createDocument(file, owner) {
  return documentRepository.save({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  });
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner);
}

function getDownloadInfo(id, owner) {
  const document = documentRepository.findById(id);

  if (!document || document.owner !== owner) {
    throw new DocumentNotFoundError();
  }

  return {
    filePath: fileRepository.getFilePath(document.id),
    originalName: document.originalName,
  };
}

module.exports = { createDocument, listDocuments, getDownloadInfo };
