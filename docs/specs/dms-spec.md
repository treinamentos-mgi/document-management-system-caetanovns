# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem documentos armazenados no filesystem local, mantendo os metadados em memória nesta fase.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador.
- Registro de nome original, tamanho, data de envio e proprietário.
- Armazenamento dos arquivos em `backend/storage`, usando Multer com `diskStorage`.
- Interface React para upload, listagem e download.
- Verificação de saúde do backend pelo endpoint existente `GET /health`.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Persistência dos metadados em banco de dados.
- Autenticação, autorização robusta ou gestão de credenciais.
- Versionamento, edição, exclusão ou compartilhamento de documentos.
- Busca, paginação e filtros avançados.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando o campo multipart `file`. |
| RF-02 | O sistema gera um identificador único e um nome interno de armazenamento que não depende do nome enviado pelo usuário. |
| RF-03 | O sistema registra os metadados do documento após salvar o arquivo localmente. |
| RF-04 | O usuário pode listar os metadados dos documentos associados à sua identidade de requisição. |
| RF-05 | A listagem retorna documentos do mais recente para o mais antigo. |
| RF-06 | O usuário pode baixar um documento pelo identificador, recebendo o nome original no download. |
| RF-07 | O sistema retorna erro apropriado quando o arquivo está ausente, é inválido, excede o limite ou não pertence ao usuário da requisição. |
| RF-08 | A interface apresenta estados de carregamento, sucesso e erro para upload, listagem e download. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados somente no filesystem local com Multer `diskStorage`. |
| RNF-02 | O diretório padrão é `backend/storage`; pode ser sobrescrito por `STORAGE_DIR`. |
| RNF-03 | Os metadados são mantidos em memória e se perdem quando o processo backend reinicia. |
| RNF-04 | O limite padrão de upload é 10 MiB e pode ser configurado por `MAX_FILE_SIZE_BYTES`. |
| RNF-05 | A porta é configurada por `PORT`, com padrão `3000`. |
| RNF-06 | O frontend consome a API pelo prefixo `/api`; o proxy atual do Vite remove esse prefixo ao encaminhar para o backend. |
| RNF-07 | O backend segue o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-08 | A solução não adiciona provedores externos de arquivos ou dependências sem necessidade. |
| RNF-09 | Erros da API usam uma estrutura JSON consistente, exceto respostas de download bem-sucedidas. |

## 5. Modelo de dados

### Metadados mantidos pelo backend

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | UUID do documento. |
| `originalName` | string | Nome original fornecido no upload; usado no download. |
| `storedName` | string | Nome aleatório gerado para o arquivo local; nunca exposto na API. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora UTC em ISO 8601. |
| `owner` | string | Identificador do usuário associado à requisição. |

### Representação pública

A API retorna `id`, `originalName`, `size`, `uploadedAt` e `owner`. O campo `storedName` e caminhos locais não são expostos.

## 6. Contratos de API

Todas as rotas abaixo são acessadas pelo frontend sob `/api`. No desenvolvimento, o proxy Vite remove `/api` antes de encaminhar a chamada ao backend.

### Identidade da requisição

Nesta fase, o backend recebe o identificador por `X-User-Id`. Esse valor serve apenas como identidade de demonstração e não comprova autenticação. A implantação para múltiplos usuários não deve tratar esse mecanismo como controle de acesso seguro.

### `POST /api/upload`

- Entrada: `multipart/form-data`, campo obrigatório `file`; cabeçalho obrigatório `X-User-Id`.
- Sucesso: `201 Created`, corpo com os metadados públicos do documento.
- Erros: `400` para arquivo ausente ou requisição inválida; `413` para arquivo acima do limite; `500` para falha inesperada de armazenamento.

### `GET /api/documents`

- Entrada: cabeçalho obrigatório `X-User-Id`.
- Sucesso: `200 OK`, array de metadados do usuário; array vazio quando não houver documentos.
- Ordenação: `uploadedAt` decrescente.
- Erros: `400` para identidade ausente ou inválida; `500` para falha inesperada.

### `GET /api/documents/:id/download`

- Entrada: identificador na URL e cabeçalho obrigatório `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário com `Content-Disposition: attachment` e nome original.
- Erros: `404` quando o documento não existe, não pertence ao usuário ou o arquivo não está disponível; `400` para identificador inválido; `500` para falha inesperada de leitura.

### Formato de erro

    {
      "error": {
        "code": "DOCUMENT_NOT_FOUND",
        "message": "Documento não encontrado."
      }
    }

Os códigos devem ser estáveis; as mensagens destinadas ao usuário devem estar em português.

## 7. Decisões arquiteturais e riscos

- `routes` registram endpoints e encaminham requisições aos controllers.
- `controllers` validam entrada HTTP, chamam serviços e montam respostas.
- `services` implementam as regras de upload, listagem e download.
- `repositories` encapsulam acesso aos arquivos locais e ao registro de metadados em memória.
- O Multer com `diskStorage` grava arquivos usando nomes internos gerados; o nome original fica somente nos metadados.
- O upload só é considerado concluído após persistência do arquivo e registro dos metadados. Se o registro falhar após a gravação, o arquivo recém-criado deve ser removido.
- Como os metadados são voláteis, após reiniciar o backend os arquivos podem permanecer no disco sem registros correspondentes.
- `X-User-Id` pode ser falsificado. Autenticação e autorização reais são pré-requisitos para uso multiusuário fora de um ambiente local ou demonstrativo.
- O tipo MIME enviado pelo cliente não é confiável e não deve ser tratado como validação de segurança.
- Falhas de leitura, gravação e remoção devem ser tratadas nos limites do sistema e não expor caminhos internos.

## 8. Plano de execução

1. **Preparar o backend:** definir configuração por ambiente e responsabilidades nas camadas de rotas, controllers, serviços e repositórios.  
   **Aceite:** configuração local documentada; camadas mantêm dependências no sentido definido.

2. **Implementar upload:** configurar Multer `diskStorage`, limite de tamanho, nome interno seguro e registro de metadados em memória.  
   **Aceite:** upload válido retorna `201`; arquivo e metadados são associados; entradas inválidas e arquivos grandes retornam erros apropriados.

3. **Implementar listagem e download:** filtrar pela identidade da requisição, ordenar a listagem e transmitir o arquivo com o nome original.  
   **Aceite:** usuário lista e baixa somente documentos associados à sua identidade; ausências retornam `404`.

4. **Construir a interface React:** incluir formulário de upload, lista de documentos e ação de download usando o serviço HTTP existente ou a criar.  
   **Aceite:** interface consome `/api`, atualiza a listagem após upload e exibe estados de erro e carregamento.

5. **Validar integração e comportamento:** ampliar testes backend com o runner nativo do Node e verificar os fluxos integrados com o frontend.  
   **Aceite:** testes cobrem upload, listagem, download, validações e falhas relevantes; build do frontend conclui sem erros.

6. **Revisar operação e documentação:** registrar variáveis de ambiente, limites, execução local e limitações de identidade e persistência.  
   **Aceite:** documentação permite executar a aplicação localmente e explicita perda dos metadados no reinício e ausência de autenticação.