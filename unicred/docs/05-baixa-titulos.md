# API de Baixa para Títulos Emitidos — Unicred API

**Público-alvo:** Equipe técnica do beneficiário.

Esta API permite que o beneficiário solicite a baixa de um título de cobrança registrado em sua carteira. A instrução é recebida e processada, e o resultado é informado por meio de retorno (webhook ou CNAB de retorno).

**Observação:** baixa de cobrança.

## Sobre

A API destina-se à solicitação de baixa de um título aberto e registrado na carteira do cooperado. Assim que a solicitação é registrada, o sistema retorna uma confirmação de recebimento (status `201 Created`).

**Tipo de baixa:** `SOLICITACAO_CEDENTE`.

## Pré-condições

- Usuário previamente cadastrado e autorizado a operar no ambiente de cobrança com API específica. A autenticação utiliza o mesmo usuário e senha já fornecidos para acesso às demais APIs de cobrança da Unicred.
- `apiKey` válida.
- O título deve estar em uma situação válida para baixa (status `Aberto`).

## Endpoints

**Usar: https TLS 1.2**

### Instrução de Baixa

- **Homologação:** `POST https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/{uuid_beneficiario}/titulos/{uuid_titulo}/baixa`
- **Produção:** `POST https://api.e-unicred.com.br/cobranca/v2/beneficiarios/{uuid_beneficiario}/titulos/{uuid_titulo}/baixa`

Onde:

- `{uuid_beneficiario}`: identificador do beneficiário.
- `{uuid_titulo}`: identificador do título.

## Cabeçalho da requisição

```
Authorization: Bearer {TOKEN}
cooperativa: {codigo_cooperativa}
apiKey: {apiKey}
content-type: application/json
accept: application/json
```

## Exemplo de requisição

```bash
curl --location 'https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/20B0959DD54A42569C1FDB08C4C90BD7/titulos/ba914d9bbea64ff685c78c4599536c0e/baixa' \
  --header 'accept: application/json' \
  --header 'cooperativa: 4022' \
  --header 'Authorization: Bearer token' \
  --header 'Content-Type: application/json' \
  --header 'apiKey: apikey' \
  --data '{
    "tipo": "SOLICITACAO_CEDENTE",
    "justificativa": "RECEBIDO",
    "valorRecebido": 100
  }'
```

## Corpo da requisição

```json
{
  "tipo": "SOLICITACAO_CEDENTE",
  "justificativa": "RECEBIDO",
  "valorRecebido": 123.45
}
```

## Campos do corpo

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `tipo` | Texto | Sim | Domínio: `SOLICITACAO_CEDENTE`. |
| `justificativa` | Texto | Sim | Domínio: `RECEBIDO`, `NAO_RECEBIDO`, `NAO_INFORMADO`. |
| `valorRecebido` | Numérico | Condicional | Obrigatório somente se `justificativa` for `RECEBIDO`. |

## Resposta, quando correto

**Status:** `201 Created`

```json
{
  "codigoInstrucao": "00000000000067835258"
}
```

## Domínios

### Tipo de Baixa

- `SOLICITACAO_CEDENTE`

### Justificativa

- `RECEBIDO`
- `NAO_RECEBIDO`
- `NAO_INFORMADO`

## HTTP Status

| Status | Significado |
| --- | --- |
| `201 Created` | Instrução de baixa criada com sucesso. |
| `400 Bad Request` | Requisição inválida. |
| `401 Unauthorized` | Token não é válido para a operação. |
| `403 Forbidden` | Usuário do token não possui permissão para efetuar a operação. |
| `404 Not Found` | Título não encontrado. |
| `422 Unprocessable Entity` | Requisição com erro de negócio. |
| `500 Internal Server Error` | Erro interno nos serviços da Unicred. |

## Resposta, quando erro

**Exemplo 404 — Not Found**

```json
{
  "httpStatus": 404,
  "message": "Título não encontrado para o uuid : dacb72653e3949efbb7681906a2f3d2l",
  "timestamp": 1764254793679,
  "url": "/cobranca/v2/beneficiarios/6EC2707F49F440D6A12F4C30780B206D/titulos/dacb72653e3949efbb7681906a2f3d2l/baixa",
  "errorCode": "COB005BCORE"
}
```

**Exemplo 422 — Unprocessable Entity**

```json
{
  "httpStatus": 422,
  "message": "Titulo já possui informação de pagamento em outra IF.",
  "timestamp": 1764254416058,
  "url": "cobranca/v2/beneficiarios/6EC2707F49F440D6A12F4C30780B206D/titulos/5c0fa774005a4c839ca691bfe7fd224d/baixa",
  "errorCode": "I0",
  "details": null
}
```

Ou:

```json
{
  "httpStatus": 422,
  "message": "A situação do título deve ser Aberto para executar a instrução.",
  "timestamp": 1764254731420,
  "url": "/cobranca/v2/beneficiarios/6EC2707F49F440D6A12F4C30780B206D/titulos/dacb72653e3949efbb7681906a2f3d2f/baixa",
  "errorCode": "C1",
  "details": null
}
```

## Perguntas Frequentes (FAQ)

**1. O que essa API faz?**
Permite solicitar a baixa de um título de cobrança aberto e registrado na carteira do beneficiário. A instrução é processada e confirmada por retorno de cobrança.

**2. Quem pode usar essa API?**
Usuários previamente cadastrados e autorizados no ambiente de cobrança da Unicred, com acesso ativo e `apiKey` válida associada ao beneficiário.

**3. Quais são os endpoints?**
- Homologação: `https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/{uuid_beneficiario}/titulos/{uuid_titulo}/baixa`
- Produção: `https://api.e-unicred.com.br/cobranca/v2/beneficiarios/{uuid_beneficiario}/titulos/{uuid_titulo}/baixa`

**4. O que significam `{uuid_beneficiario}` e `{uuid_titulo}`?**
Identificadores únicos do beneficiário e do título na Unicred.

**5. Quais headers devo enviar?**
- `Authorization: Bearer {TOKEN}`
- `cooperativa: {código da cooperativa}`
- `accept: application/json`
- `content-type: application/json`
- `apiKey: {apiKey do beneficiário}`

**6. Quais campos são obrigatórios no corpo?**
- `tipo` (sempre `SOLICITACAO_CEDENTE`)
- `justificativa`
- `valorRecebido` (apenas se `justificativa = RECEBIDO`)

**7. Quais justificativas são aceitas?**
`RECEBIDO`, `NAO_RECEBIDO`, `NAO_INFORMADO`.

**8. O que significa o status HTTP 201?**
A instrução de baixa foi criada com sucesso.

**9. Como posso saber o resultado final da baixa?**
O resultado final pode ser verificado no retorno de cobrança (webhook ou CNAB).

**10. Quando devo usar webhook?**
Quando há alto volume de títulos, necessidade de notificações imediatas, arquitetura distribuída ou prioridade por eficiência e performance.

**11. Quando devo usar a API de Consulta?**
Quando o sistema é simples, usa volume baixo de títulos, está em desenvolvimento ou não há infraestrutura de webhook desenvolvida.

**12. Quais erros essa API pode retornar?**
`400`, `401`, `403`, `404`, `422`, `500`.

**13. O que pode causar o erro 422?**
Principalmente situação do título diferente de `Aberto` ou dados inválidos.

**14. É possível fazer baixa em lote?**
Não. A API permite apenas instruções unitárias (título a título).

**15. O campo `valorRecebido` é sempre obrigatório?**
Não. É obrigatório apenas quando `justificativa = RECEBIDO`.

**16. Caso seja solicitada uma baixa via API e o título esteja negativado, a sustação da negativação será automática?**
Sim, a sustação da negativação será automática, baixando o título da carteira do cooperado.
