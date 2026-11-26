# Especificação - Document Management System

> Especificação do DMS, elaborada a partir de [spec-template.md](spec-template.md).
> Escopo desta fase: documentação apenas, sem implementação de backend ou frontend.

## 1. Objetivo

Entregar uma aplicação web que permite a um usuário enviar, listar e baixar seus documentos, com armazenamento local no servidor.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário (cada documento pertence a um usuário; o usuário só vê os próprios documentos)

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, Google Drive etc.)
- Serviços de upload de terceiros
- Versionamento de documentos
- Persistência em banco de dados (metadados ficam em memória nesta fase)
- Autenticação completa (login, senha, tokens)
- Compartilhamento entre usuários, busca, edição e exclusão de documentos
- Pré-visualização de conteúdo

## 3. Requisitos funcionais

| ID    | Requisito | Critérios de aceitação |
| ----- | --------- | ---------------------- |
| RF-01 | O usuário pode enviar um documento | Envio em `multipart/form-data` com campo `file`. Sem arquivo, retorna 400. Sucesso retorna 201 com os metadados criados. |
| RF-02 | O usuário pode listar os documentos enviados | Retorna apenas os documentos do usuário informado. Lista vazia retorna 200 com `[]`. |
| RF-03 | O usuário pode baixar um documento pelo identificador | Retorna o conteúdo binário com `Content-Disposition: attachment` usando o `originalName`. Id inexistente ou de outro usuário retorna 404. |
| RF-04 | O sistema identifica o usuário em cada requisição | O `owner` é lido do header `X-User-Id`. Ausência do header retorna 400. |
| RF-05 | O sistema recusa arquivos acima do limite configurado | Arquivo maior que `MAX_UPLOAD_SIZE_MB` retorna 413 e nenhum arquivo é gravado. |

## 4. Requisitos não funcionais

| ID     | Requisito |
| ------ | --------- |
| RNF-01 | Arquivos gravados no filesystem local via `multer` com `diskStorage`, na pasta `backend/storage` |
| RNF-02 | Metadados mantidos em memória nesta fase; reiniciar o processo limpa os metadados (os arquivos permanecem em disco) |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT`, `STORAGE_DIR`, `MAX_UPLOAD_SIZE_MB` |
| RNF-04 | Erros tratados nos limites do sistema: entrada HTTP (validação) e leitura/escrita de arquivos (I/O) |
| RNF-05 | Respostas de erro no formato `{ "error": "mensagem em português" }` |
| RNF-06 | Backend em JavaScript (CommonJS) com Express; frontend em JavaScript (ESM) com React e Vite; sem TypeScript |
| RNF-07 | Testes do backend com o runner nativo `node:test` |
| RNF-08 | Reutilizar dependências já presentes nos `package.json`; novas dependências só se indispensáveis |

## 5. Modelo de dados (metadados do documento)

Entidade `Document`, mantida em memória (coleção indexada por `id`).

| Campo        | Tipo   | Descrição |
| ------------ | ------ | --------- |
| id           | string | Identificador único (UUID v4). Também é o nome do arquivo físico em `STORAGE_DIR`, sem extensão de origem, para evitar colisões |
| originalName | string | Nome original do arquivo enviado, usado no download |
| size         | number | Tamanho em bytes |
| uploadedAt   | string | Data/hora do upload em ISO 8601 (UTC) |
| owner        | string | Identificador do usuário dono, vindo do header `X-User-Id` |

Exemplo:

```json
{
  "id": "3f2c9a1e-8b7d-4c2a-9e51-0d6f2a7b8c10",
  "originalName": "contrato.pdf",
  "size": 204800,
  "uploadedAt": "2026-11-26T14:30:00.000Z",
  "owner": "user-42"
}
```

## 6. Contratos de API

Base: `/` no backend. No frontend, as chamadas usam o prefixo `/api`, removido pelo proxy do Vite.

Header comum em todos os endpoints: `X-User-Id: <string>` (obrigatório, RF-04).

### POST /upload

- Entrada: `multipart/form-data` com o campo `file`
- Sucesso `201`: metadados do documento criado

```json
{
  "id": "3f2c9a1e-8b7d-4c2a-9e51-0d6f2a7b8c10",
  "originalName": "contrato.pdf",
  "size": 204800,
  "uploadedAt": "2026-11-26T14:30:00.000Z",
  "owner": "user-42"
}
```

- Erros: `400` (sem arquivo ou sem `X-User-Id`), `413` (arquivo acima do limite), `500` (falha de gravação)

### GET /documents

- Sucesso `200`: array com os metadados dos documentos do usuário

```json
[
  {
    "id": "3f2c9a1e-8b7d-4c2a-9e51-0d6f2a7b8c10",
    "originalName": "contrato.pdf",
    "size": 204800,
    "uploadedAt": "2026-11-26T14:30:00.000Z",
    "owner": "user-42"
  }
]
```

- Erros: `400` (sem `X-User-Id`), `500`

### GET /documents/:id/download

- Entrada: `id` no caminho
- Sucesso `200`: conteúdo binário do arquivo, com `Content-Type: application/octet-stream` e `Content-Disposition: attachment; filename="<originalName>"`
- Erros: `400` (sem `X-User-Id`), `404` (id inexistente ou de outro usuário), `500` (arquivo ausente no disco)

### Erro padrão

```json
{ "error": "Documento não encontrado." }
```

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples dentro de `backend/src`:
  - `routes/`: define os endpoints e delega aos controllers
  - `controllers/`: trata entrada e saída HTTP e validação básica
  - `services/`: regras de negócio (ex.: filtro por dono, limite de tamanho)
  - `repositories/`: persistência (em memória e filesystem)
- Fluxo de dependência: `routes -> controllers -> services -> repositories`. Camadas internas não conhecem camadas externas.
- Upload com `multer` e `diskStorage`; o repositório de arquivos é a única camada que toca o disco.
- Frontend em componentes funcionais com React Hooks, organizado em `components/`, `pages/` e `services/`. Comunicação via `fetch` com prefixo `/api`.
- Armazenamento estritamente local à aplicação.

## 8. Plano de execução

Etapas na ordem de implementação. Cada etapa deve deixar o sistema funcional e testado.

1. **Base do backend**: configurar Express (CommonJS), leitura das variáveis de ambiente e middleware de erro padrão.
2. **Repositório de metadados**: coleção em memória com operações de inserir, listar por dono e buscar por id.
3. **Repositório de arquivos**: configurar `multer` com `diskStorage` em `STORAGE_DIR`, com limite de tamanho (RF-05).
4. **Serviço de documentos**: regras de upload, listagem filtrada por dono e download com verificação de propriedade.
5. **Controllers e rotas**: `POST /upload`, `GET /documents` e `GET /documents/:id/download`, com validação de `X-User-Id`.
6. **Testes do backend**: `node:test` cobrindo os cenários de aceitação de RF-01 a RF-05.
7. **Base do frontend**: estrutura Vite + React, proxy `/api` e organização de `components/`, `pages/` e `services/`.
8. **Camada de serviço no frontend**: funções `fetch` para upload, listagem e download.
9. **Telas**: formulário de upload, lista de documentos e ação de download, com mensagens de erro em português.
10. **Integração e revisão**: teste de ponta a ponta do fluxo completo e revisão contra esta especificação.

Dependências: etapas 2 e 3 podem ser feitas em paralelo. A etapa 7 pode começar após a definição dos contratos da seção 6.

## 9. Premissas e pendências

- Limite padrão de upload: `MAX_UPLOAD_SIZE_MB=10`, configurável por variável de ambiente.
- Identificação do usuário: header `X-User-Id` simples, sem autenticação nesta fase.
- Reiniciar o servidor perde os metadados; os arquivos permanecem em `STORAGE_DIR`.
