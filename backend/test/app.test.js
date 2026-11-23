const { test } = require('node:test');
const assert = require('node:assert/strict');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = fsSync.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDirectory;
const app = require('../src/app');

test('uploada, lista e baixa documentos por proprietário', async () => {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo de teste']), 'relatorio.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'alice' },
      body: formData,
    });
    assert.equal(uploadResponse.status, 201);
    const document = await uploadResponse.json();
    assert.equal(document.originalName, 'relatorio.txt');
    assert.equal(document.size, 17);
    assert.equal(document.owner, 'alice');
    assert.equal(Object.hasOwn(document, 'storedName'), false);

    const listResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'alice' },
    });
    assert.deepEqual(await listResponse.json(), [document]);

    const otherOwnerResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'bob' },
    });
    assert.deepEqual(await otherOwnerResponse.json(), []);

    const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
      headers: { 'X-User-Id': 'alice' },
    });
    assert.equal(downloadResponse.status, 200);
    assert.equal(await downloadResponse.text(), 'conteudo de teste');
    assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.txt/);

    const forbiddenDownload = await fetch(`${baseUrl}/documents/${document.id}/download`, {
      headers: { 'X-User-Id': 'bob' },
    });
    assert.equal(forbiddenDownload.status, 404);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await fs.rm(storageDirectory, { recursive: true, force: true });
  }
});
