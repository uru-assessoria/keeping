# Obtendo um Token de Acesso — Unicred API

Toda e qualquer chamada às APIs da Unicred precisa ser autenticada. Esta API fornece mecanismos para autenticar chamadas e emitir um token de acesso. O token de acesso deve ser usado nas chamadas subsequentes às outras APIs.

O processo de autenticação de usuários é baseado no protocolo OAuth2. Entretanto, apenas o tipo de grant **password** é suportado atualmente. O protocolo de comunicação é o **HTTPS** (TLS 1.2).

## Parâmetros necessários

- **nomeUsuario**: Nome de usuário fornecido pela Unicred.
- **senha**: Senha fornecida pela Unicred.
- **apiKey**: API key da aplicação no portal de desenvolvedores.

## Endpoints

- **Homologação:** `POST https://api.e-unicred.com.br/homolog/oauth2/v2/grant-token`
- **Produção:** `POST https://api.e-unicred.com.br/oauth2/v2/grant-token`

## Exemplo em Homologação

```bash
curl -H "apiKey: xxxxx" -X POST -v https://api.e-unicred.com.br/homolog/oauth2/v2/grant-token \
  -d '{"nomeUsuario": "USERNAME", "senha": "PASSWORD"}'
```

## Exemplo em Produção

```bash
curl -H "apiKey: xxxxx" -X POST -v https://api.e-unicred.com.br/oauth2/v2/grant-token \
  -d '{"nomeUsuario": "USERNAME", "senha": "PASSWORD"}'
```

Caso ainda não tenha recebido essas credenciais, entre em contato com a área de Arquitetura Corporativa ou Segurança da Informação para solicitar.

## Cenários de Uso

### Autenticação realizada com sucesso

**Status:** `200`

**Resposta:**

```json
{
  "accessToken": "[CONTEÚDO PARA USAR NAS CHAMADAS SUBSEQUENTES]",
  "tokenExpirationTime": 2700,
  "refreshToken": "[CONTEÚDO PARA USAR PARA REVALIDAR O TOKEN]",
  "refreshTokenExpirationTime": 1800
}
```

- `tokenExpirationTime` é em segundos.
- O `refreshToken` deve ser utilizado quando o resultado do horário da requisição + o tempo em segundos expirar.

### Request inválida

**Status:** `422`

**Resposta:**

```json
{
  "message": "Requisição inválida",
  "timestamp": 1548165557775,
  "httpStatus": 422,
  "url": "https://api.e-unicred.com.br/homolog/oauth2/v2/grant-token",
  "body": [
    { "field": "senha", "message": "senha é mandatório para utilizar este recurso" }
  ]
}
```

### Acesso negado ou usuário e senha não conferem

**Status:** `401`

**Resposta:**

```json
{
  "message": "Erro na autenticação. Usuário de senha não conferem",
  "timestamp": 1548165657155,
  "url": "https://api.e-unicred.com.br/homolog/oauth2/v2/grant-token",
  "httpStatus": 401
}
```

Havendo a garantia no lado do consumidor que usuário e senha conferem, entre em contato com a Unicred para avaliar o problema.

### Erro inesperado

**Status:** `500` (pode ser outro código diferente de 200)

**Resposta:**

```json
{
  "message": "Erro interno ao executar autenticação",
  "timestamp": 1548165657155,
  "url": "https://api.e-unicred.com.br/homolog/oauth2/v2/grant-token",
  "httpStatus": 500
}
```

Este cenário deveria ocorrer em situações excepcionais, erros momentâneos internos, etc. Caso ocorra, contate o suporte da Unicred.

## Variáveis de ambiente no projeto Keeping

```bash
UNICRED_API_USER=
UNICRED_API_PASSWORD=
UNICRED_API_CLIENTID=
UNICRED_API_SECRET=
UNICRED_API_CODE=
UNICRED_API_BASE_URL=https://api.e-unicred.com.br/homolog  # ou produção
```

> Nota: O projeto Keeping já declara algumas variáveis `UNICRED_*`, mas o fluxo de autenticação ainda não está implementado. A `apiKey` é o `access_token` / `client_id` gerado no portal de desenvolvedores da Unicred.
