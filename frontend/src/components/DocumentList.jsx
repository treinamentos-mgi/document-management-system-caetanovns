import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, isLoading, downloadingId, onDownload }) {
  if (isLoading && documents.length === 0) {
    return <p className="list-state">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="list-state empty-state">
        <span className="empty-mark" aria-hidden="true">—</span>
        <p>Nenhum documento por aqui.</p>
      </div>
    );
  }

  return (
    <ul className="document-list" aria-label="Documentos enviados">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <span className="file-mark" aria-hidden="true">FILE</span>
          <div className="document-info">
            <span className="document-name" title={document.originalName}>
              {document.originalName}
            </span>
            <span className="document-meta">
              {formatFileSize(document.size)} <span aria-hidden="true">·</span> {formatDate(document.uploadedAt)}
            </span>
          </div>
          <DownloadButton
            document={document}
            downloading={downloadingId === document.id}
            onDownload={onDownload}
          />
        </li>
      ))}
    </ul>
  );
}