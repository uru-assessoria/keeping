# Consulta de Títulos de Cobrança — Unicred API

A criação do título é um processo assíncrono, pois depende do registro junto à Câmara de Compensação Interbancária (CIP). Por isso, após a solicitação de criação, o cliente do serviço deve verificar periodicamente se o processo de criação e registro já terminou. Essa operação é conhecida como **pooling**.

A consulta de títulos de cobrança é feita de forma unitária (título a título). Essa funcionalidade pode ser substituída pelo **Webhook**.

## Endpoints

**Usar: https TLS 1.2**

- **Homologação:** `GET https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/{id_beneficiario}/titulos/{id_titulo}/status`
- **Produção:** `GET https://api.e-unicred.com.br/cobranca/v2/beneficiarios/{id_beneficiario}/titulos/{id_titulo}/status`

Onde:

- `{id_beneficiario}`: enviado na planilha de homologação/produção, identifica o cooperado beneficiário.
- `{id_titulo}`: gerado pelo sistema de cobrança da Unicred e retornado pela API de emissão de título com sucesso.

## Cabeçalho da requisição

```
Authorization: Bearer {TOKEN}
cooperativa: {codigo_cooperativa}
content-type: application/json
cache-control: no-cache
apiKey: {Access token da Aplicação do Portal API}
```

## Exemplo de requisição

```bash
curl -X GET 'https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/B7CEE6BDC9E04C49A7437EC3E750140A/titulos/123asd456qwe789rty/status' \
  -H 'cache-control: no-cache' \
  -H 'apiKey: xxxxx' \
  -H 'content-type: application/json' \
  -H 'cooperativa: 0001' \
  -H "Authorization: Bearer f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211"
```

## Corpo da resposta, quando correto

```json
{
  "codBarras": "00000000000000000000000000000000000000000000",
  "linhaDigitavel": "0000000000000000000000000000000000000000000000",
  "nossoNumero": "00000231444",
  "dataDeVencimento": "YYYY-MM-DD",
  "valor": 1.00,
  "status": "ABERTO",
  "motivo": null,
  "qrCodePix": null,
  "pagamentos": {
    "data": "YYYY-MM-DD",
    "valor": 1.00
  }
}
```

## Domínio do Status (situação do título)

| Status | Descrição |
| --- | --- |
| `ABERTO` | Título registrado na carteira do beneficiário e não liquidado, ou seja, vencido ou a vencer. |
| `BAIXADO` | Baixado da carteira do beneficiário, por solicitação dele ou por decurso de prazo. |
| `LIQUIDADO` | Pago. |
| `EM_PROCESSAMENTO` | Sendo processado e ainda não ABERTO. |

## Domínio do Motivo (refere-se ao status `BAIXADO`)

| Motivo | Descrição |
| --- | --- |
| `DECURSO_PRAZO` | Baixa por decurso de prazo. |
| `PROTESTADO` | Baixa após protesto. |
| `NULL` | Quando não existe motivo registrado. |

## Dicionário de campos

| Campo | Tipo | Tamanho | Regra |
| --- | --- | --- | --- |
| `codBarras` | Texto | 44 | — |
| `linhaDigitavel` | Texto | 46 | — |
| `nossoNumero` | Texto | 11 | — |
| `dataDeVencimento` | Data | 10 | Formato `YYYY-MM-DD`. |
| `valor` | Numérico | 14,2 | Valor do título. Para boletos com espécie 31 (Cartão de crédito – múltiplos pagamentos), o valor deve ser 0. |
| `status` | Texto | 30 | Ver domínio acima. |
| `motivo` | Texto | 20 | Refere-se ao status `BAIXADO`. |
| `qrCodePix` | Texto | 400 | Representação numérica do QR Code. Para retornar dados neste campo, deve ser solicitada à cooperativa uma atualização no cadastro do beneficiário. `null` indica que o cadastro não está atualizado ou o beneficiário não deseja QR Code em seus boletos. |
| `pagamentos` | Grupo | — | Exibido quando o status for `LIQUIDADO` (boleto espécie 21) ou `ABERTO` (boleto espécie 31 – múltiplos pagamentos). |
| `pagamentos.data` | Data | 10 | Data do pagamento do título. Formato `YYYY-MM-DD`. |
| `pagamentos.valor` | Numérico | 14,2 | Valor do pagamento realizado. Para boletos com espécie 21 (pagamento único), exibido quando `LIQUIDADO`. Para boletos com espécie 31, podem ser exibidos vários pagamentos e o status permanece `ABERTO`. |

## HTTP Status

| Status | Significado |
| --- | --- |
| `200 OK` | Requisição processada com sucesso. |
| `202 Accepted` | Resposta sem corpo, informando que o processamento ainda está em andamento. |
| `401 Unauthorized` | Token utilizado não é válido para a operação. |
| `403 Forbidden` | Usuário do token não possui permissão para efetuar a operação. |
| `404 Not Found` | Identificação do título informado não foi encontrada na base Unicred. |
| `500 Internal Server Error` | Erro interno nos serviços disponibilizados pela Unicred. |

## Corpo da resposta, quando erro

```json
{
  "message": "Ocorreu um erro.",
  "timestamp": 4456798441156,
  "httpStatus": 500,
  "url": "http://api.unicred.com.br/servico"
}
```
