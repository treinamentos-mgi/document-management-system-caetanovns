---
description: Implementa um fluxo React integrado à API via fetch e /api, com estados de carregamento, sucesso e erro.
name: criar-fluxo-frontend
argument-hint: descreva o fluxo frontend que deseja implementar
agent: agent
---

# Criar fluxo frontend

Implemente o fluxo React descrito a seguir: `${input:fluxo:descreva o fluxo frontend}`.

Antes de editar, examine os componentes, serviços e estilos próximos ao ponto de integração, além das instruções do projeto. Preserve os padrões existentes e limite as alterações ao fluxo solicitado.

Requisitos:

- Use componentes funcionais com React Hooks e mantenha responsabilidades claras.
- Integre a API com `fetch` pelo prefixo `/api`, reutilizando o serviço existente ou criando funções em `frontend/src/services` quando necessário.
- Reutilize componentes e evite duplicar chamadas, validações ou apresentação de estados.
- Trate estados de carregamento, sucesso, erro e, quando aplicável, lista vazia.
- Apresente mensagens ao usuário em português e trate erros no limite da comunicação com a API.
- Use HTML semântico, rótulos acessíveis e controles utilizáveis por teclado.
- Siga os estilos e a estrutura atuais do frontend; não adicione dependências sem necessidade.
- Atualize somente os componentes, serviços e estilos necessários para integrar o fluxo.
- Execute o build ou os testes de frontend disponíveis e corrija falhas causadas pela alteração.
