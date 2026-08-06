# PDF do Boleto — Unicred API

Esta funcionalidade permite consultar e gerar o boleto em formato PDF através da API. O PDF poderá ser consultado enquanto o título estiver em situação `Aberto`, ou seja, disponível para pagamento. A geração do boleto ocorre sob demanda, sendo realizada no momento da requisição. O retorno da API é unitário, permitindo a consulta de um título por vez.

## Personalização do boleto

Cooperados que utilizam a API de geração de PDF poderão personalizar o cabeçalho do boleto com o logotipo da empresa. A parametrização deve ser solicitada ao Gerente de Relacionamento.

- Quando houver logotipo configurado: o boleto será apresentado em layout customizado.
- Quando não houver configuração: será utilizado o layout padrão da Unicred.

## Endpoints

**Usar: https TLS 1.2**

- **Homologação:** `GET https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/{id_beneficiario}/titulos/{id_titulo}`
- **Produção:** `GET https://api.e-unicred.com.br/cobranca/v2/beneficiarios/{id_beneficiario}/titulos/{id_titulo}`

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
curl -X GET 'https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/B7CEE6BDC9E04C49A7437EC3E750140A/titulos/123asd456qwe789rty' \
  -H 'cache-control: no-cache' \
  -H 'apiKey: xxxxx' \
  -H 'content-type: application/json' \
  -H 'cooperativa: 0001' \
  -H "Authorization: Bearer f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211"
```

## Response

Caso o PDF já tenha sido gerado, o corpo do retorno será no formato **binário** (PDF).

## HTTP Status

| Status | Significado |
| --- | --- |
| `200 OK` | Requisição processada com sucesso. Retorna o binário do PDF. |
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
