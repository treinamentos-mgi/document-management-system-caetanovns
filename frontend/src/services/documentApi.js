async function request(path, options) {
  let response;

  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está disponível.');
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';
    try {
      const payload = await response.json();
      message = payload.error?.message || message;
    } catch {
      // A resposta pode não conter JSON, por exemplo em erros do proxy.
    }
    throw new Error(message);
  }

  return response;
}

export async function getDocuments() {
  const response = await request('/documents');
  const documents = await response.json();
  if (!Array.isArray(documents)) {
    throw new Error('A resposta da API não contém uma lista de documentos válida.');
  }
  return documents;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  return response.blob();
}