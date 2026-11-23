import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload, uploading }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;

    const uploaded = await onUpload(file);
    if (uploaded) {
      setFile(null);
      inputRef.current.value = '';
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="visually-hidden"
        id="document-file"
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
      />
      <label className="file-picker" htmlFor="document-file">
        <span className="upload-icon" aria-hidden="true">↑</span>
        <span className="file-picker-title">{file ? 'Arquivo selecionado' : 'Escolher arquivo'}</span>
        <span className="file-picker-name">{file ? file.name : 'Selecione no seu dispositivo'}</span>
      </label>
      <button className="primary-button" type="submit" disabled={!file || uploading}>
        {uploading ? 'Enviando...' : 'Enviar documento'}
        {!uploading && <span aria-hidden="true">↗</span>}
      </button>
    </form>
  );
}