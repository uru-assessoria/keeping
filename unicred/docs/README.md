# Documentação Unicred — Índice

Esta pasta contém a documentação da API Unicred convertida dos arquivos HTML originais (`unicred/auth/` e `unicred/titulos/`) para Markdown, organizada para leitura por IAs e posterior implementação no projeto Keeping ERP.

## Arquivos

| # | Documento | Conteúdo |
| --- | --- | --- |
| 01 | [API Guide](01-api-guide.md) | Visão geral da autenticação e status codes das APIs. |
| 02 | [Obtendo um Token de Acesso](02-obtendo-token.md) | Fluxo OAuth2 password grant para obter `accessToken` e `refreshToken`. |
| 03 | [Emissão de Títulos de Cobrança](03-emissao-titulos.md) | Registro unitário de títulos/boletos, payload, dicionário de campos e erros. |
| 04 | [Consulta de Títulos de Cobrança](04-consulta-titulos.md) | Consulta de status de título (`/status`) e pooling. |
| 05 | [API de Baixa para Títulos Emitidos](05-baixa-titulos.md) | Solicitação de baixa de título aberto. |
| 06 | [PDF do Boleto](06-pdf-boleto.md) | Geração e download do boleto em PDF. |
| 07 | [Retorno de Títulos por Webhook](07-webhook-titulos.md) | Especificações do serviço REST de webhook, criptografia AES-256, JSON de retorno, tabelas de referência e FAQ. |

## Variáveis de ambiente esperadas

O projeto Keeping já declara as seguintes variáveis no `.sample.env` e no `AGENTS.md`, mas a integração ainda não está implementada:

```bash
UNICRED_API_CODE=
UNICRED_API_CLIENTID=
UNICRED_API_SECRET=
UNICRED_API_USER=
UNICRED_API_PASSWORD=
UNICRED_API_BASE_URL=
UNICRED_API_ID_BENEFICIARIO=
```

## Próximos passos sugeridos para implementação

1. **Autenticação:** implementar a chamada `POST /oauth2/v2/grant-token` e cache do token (ex.: salvar em memória ou no banco com expiração).
2. **Schema de títulos:** criar a tabela `titulo` (ou `boleto`) no Drizzle vinculada ao `contrato`.
3. **Emissão:** criar API route e UI para emitir título a partir de um contrato assinado (`status = signed`).
4. **Consulta:** implementar pooling ou usar webhook para atualizar status de pagamento.
5. **PDF:** permitir download do boleto PDF.
6. **Baixa:** implementar baixa manual de títulos quando necessário.

## Origem dos HTMLs

Os arquivos originais foram salvos da documentação oficial do portal de desenvolvedores da Unicred (`https://developer.unicred.com.br/api-portal/`) e estão em `unicred/auth/` e `unicred/titulos/`.

---

Última atualização: 2026-07-23
