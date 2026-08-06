# API Guide — Unicred Developers

## Autenticação

A autenticação das APIs do Marketplace é realizada com a informação de um par de tokens no cabeçalho (header) das requisições. O seguinte par de tokens é esperado em cada requisição:

- **client_id**: Identificação da APP. Sua geração ocorre no momento da criação da APP pelo painel do desenvolvedor. Seu valor pode ser visualizado na coluna Token da lista de APPs e poderá ser utilizado tanto em Sandbox quanto em Produção após a aplicação passar pelo processo de homologação.
- **access_token**: Identificação do token de acesso, que armazena as regras de acesso permitidas à APP. Sua geração ocorre em dois momentos no processo de integração com as APIs.

## Status Codes

| Código | Erro | Descrição |
| --- | --- | --- |
| 200 | OK | Sucesso. |
| 400 | Bad Request | A requisição possui parâmetro(s) inválido(s). |
| 401 | Unauthorized | O token de acesso não foi informado ou não possui acesso às APIs. |
| 404 | Not Found | O recurso informado no request não foi encontrado. |
| 413 | Request is to Large | A requisição está ultrapassando o limite permitido para o perfil do seu token de acesso. |
| 422 | Unprocessable Entity | A requisição possui erros de negócio. |
| 429 | Too Many Requests | O consumidor estourou o limite de requisições por tempo. |
| 500 | Internal Server Error | Erro não esperado; algo está quebrado na API. |
