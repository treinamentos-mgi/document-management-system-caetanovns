import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import {
  downloadDocument,
  getDocuments,
  uploadDocument,
} from './services/documentApi.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setError('');

    try {
      setDocuments(await getDocuments());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getDocuments()
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(file) {
    setIsUploading(true);
    setError('');
    setNotice('');

    try {
      await uploadDocument(file);
      setNotice(`“${file.name}” enviado com sucesso.`);
      await loadDocuments();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setError('');
    setNotice('');

    try {
      const file = await downloadDocument(document.id);
      const objectUrl = URL.createObjectURL(file);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = document.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setNotice(`Download de “${document.originalName}” iniciado.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DMS</span>
        </a>
        <span className="topbar-label">ESPAÇO DE DOCUMENTOS</span>
      </header>

      <section className="workspace" aria-labelledby="page-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">BIBLIOTECA PESSOAL</p>
            <h1 id="page-title">Seus documentos</h1>
          </div>
          <button
            className="refresh-button"
            type="button"
            onClick={loadDocuments}
            disabled={isLoading}
            title="Atualizar lista"
          >
            <span aria-hidden="true">↻</span>
            Atualizar
          </button>
        </div>

        {(error || notice) && (
          <div
            className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`}
            role={error ? 'alert' : 'status'}
          >
            {error || notice}
            {error && (
              <button type="button" onClick={() => setError('')} aria-label="Fechar aviso">
                ×
              </button>
            )}
          </div>
        )}

        <div className="content-grid">
          <aside className="upload-section" aria-labelledby="upload-title">
            <div className="section-heading">
              <span className="section-index">01</span>
              <h2 id="upload-title">Adicionar arquivo</h2>
            </div>
            <UploadComponent onUpload={handleUpload} uploading={isUploading} />
          </aside>

          <section className="documents-section" aria-labelledby="documents-title">
            <div className="section-heading documents-heading">
              <div className="heading-title">
                <span className="section-index">02</span>
                <h2 id="documents-title">Arquivos</h2>
              </div>
              <span className="document-count">
                {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
              </span>
            </div>
            <DocumentList
              documents={documents}
              isLoading={isLoading}
              downloadingId={downloadingId}
              onDownload={handleDownload}
            />
          </section>
        </div>
      </section>
      <footer className="page-footer">
        <span>ARQUIVOS LOCAIS</span>
        <span>DOCUMENT MANAGEMENT SYSTEM</span>
      </footer>
    </main>
  );
}