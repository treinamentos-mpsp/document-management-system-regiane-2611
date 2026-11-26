import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/apiClient';

export default function App() {
  const [userId, setUserId] = useState('user-1');
  const [documents, setDocuments] = useState([]);
  const [listError, setListError] = useState('');

  const ownerId = userId.trim();

  const refreshDocuments = useCallback(async () => {
    if (!ownerId) {
      setDocuments([]);
      return;
    }

    try {
      setDocuments(await listDocuments(ownerId));
      setListError('');
    } catch (error) {
      setListError(error.message);
    }
  }, [ownerId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Usuário (X-User-Id):{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>

      <section>
        <h2>Enviar documento</h2>
        <UploadComponent userId={ownerId} onUploaded={refreshDocuments} />
      </section>

      <section>
        <h2>Documentos</h2>
        {listError && <p role="alert">{listError}</p>}
        <DocumentList documents={documents} userId={ownerId} />
      </section>
    </main>
  );
}
