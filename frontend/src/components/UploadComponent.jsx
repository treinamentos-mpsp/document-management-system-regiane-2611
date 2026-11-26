import { useState } from 'react';
import { uploadDocument } from '../services/apiClient';

export default function UploadComponent({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setMessage('Selecione um arquivo.');
      return;
    }

    const form = event.currentTarget;
    setIsUploading(true);
    setMessage('');

    try {
      await uploadDocument(file, userId);
      form.reset();
      setFile(null);
      setMessage('Documento enviado com sucesso.');
      onUploaded();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(event) => setFile(event.target.files[0] ?? null)} />
      <button type="submit" disabled={!file || !userId || isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
