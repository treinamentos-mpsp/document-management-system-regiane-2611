const API_PREFIX = '/api';
const FALLBACK_ERROR = 'Erro ao comunicar com o servidor.';

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    return data.error || FALLBACK_ERROR;
  } catch {
    return FALLBACK_ERROR;
  }
}

async function request(path, { userId, method = 'GET', body } = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers: { 'X-User-Id': userId },
    body,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

export async function uploadDocument(file, userId) {
  const body = new FormData();
  body.append('file', file);

  const response = await request('/upload', { userId, method: 'POST', body });
  return response.json();
}

export async function listDocuments(userId) {
  const response = await request('/documents', { userId });
  return response.json();
}

export async function downloadDocument(documentId, userId) {
  const response = await request(`/documents/${encodeURIComponent(documentId)}/download`, {
    userId,
  });
  return response.blob();
}
