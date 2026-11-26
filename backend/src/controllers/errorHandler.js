const multer = require('multer');

function mapMulterError(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return { status: 413, message: 'O arquivo excede o limite de tamanho permitido.' };
  }
  return { status: 400, message: 'Requisição de upload inválida.' };
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const { status, message } = mapMulterError(err);
    return res.status(status).json({ error: message });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
