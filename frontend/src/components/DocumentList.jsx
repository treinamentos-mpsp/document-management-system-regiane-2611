import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, userId }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{formatSize(document.size)}</td>
            <td>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>
              <DownloadButton
                documentId={document.id}
                fileName={document.originalName}
                userId={userId}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
