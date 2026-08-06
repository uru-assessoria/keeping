# Retorno de Títulos de Cobrança por Webhook — Unicred API

## Introdução


**QR Code PIX**

**Desenvolva o serviço REST**
`POST``202 + UUID`

**Homologue com os comandos cURL**
Simule chamadas reais usando os cenários de teste fornecidos antes de ir a produção.

**Cadastre o Webhook no CobExpress - Produção**
Configure a URL, as chaves e o tipo de retorno diretamente no front-end da cobrança para o deploy do serviço REST em produção.

ℹ

**Arquivo de retorno continua disponível**
Ativar o Webhook não desativa o arquivo de retorno. Ambos podem ser usados simultaneamente.

## Onde ficam as chaves?

**você mesmo define****CobExpress**

#### Chave de Autenticação

`x-api-key`

- Formato: UUID v4
- Você define o valor
- Única por inscrição

#### Chave de Criptografia

Usada como Secret Key na descriptografia AES-256. Não é enviada nas requisições — apenas armazenada no seu serviço.

- Formato: UUID v4
- Você define o valor
- Pode ser compartilhada entre inscrições

⚠

**As duas chaves não podem ter o mesmo valor**
Cada Chave de Autenticação deve referenciar uma única Chave de Criptografia, e os valores devem ser distintos entre si.

## Passo 1 — Desenvolvimento do Serviço REST

A Unicred entregará as informações da alteração do título através de um serviço REST que deve estar sobre o protocolo HTTPs. O desenvolvimento desse serviço deve seguir três pontos principais: especificações, criptografia e algumas dicas/regras básicas.

### Especificações

| Item | Requisito | Detalhe |
| --- | --- | --- |
| Método HTTP | `POST` | Outros métodos não são utilizados pela Unicred. |
| Protocolo | HTTPS (porta 443) | Certificado válido e confiável obrigatório. |
| Header recebido | `x-api-key: {Chave de autenticação – API Webhook}` | Use para identificar qual inscrição está recebendo e para obter o IV de descriptografia. |
| Content-Type recebido | `text/plain` | Body em texto criptografado (AES-256 + Base64). |
| Status de retorno | `202 Accepted` | Sempre retornar 202, inclusive em erros de processamento interno. |
| Body de retorno | UUID v4 em texto puro | Somente o UUID, sem aspas, sem JSON, sem nada mais. Ver exemplos abaixo. |
| Content-Type retornado | `text/plain` | O UUID deve ser retornado como texto puro. |
| Tempo de resposta | Máximo 5 segundos | *off-sync* |

### Atenção: formato do UUID de retorno

**sem aspas***off-sync*

Inválido — UUID entre aspas

```
`"9926e320-0e0a-43d0-b76d-972d26956d93"`
```

Válido — UUID sem aspas

```
`9926e320-0e0a-43d0-b76d-972d26956d93`
```

### O que significa off-sync?

*off-sync*

- Nenhuma nova requisição será enviada automaticamente;
- **beneficiário**
- Após correção, o fluxo de reenvio é retomado normalmente.

### Criptografia

O body de cada requisição contém as informações do título criptografadas no padrão AES-256. Para descriptografar, use as seguintes configurações:

| Cipher Mode of Encryption | **CBC** |
| --- | --- |
| Padding | **PKCS5Padding** |
| Key Size in Bits | **256** |
| Output Text Format | **Base64** |
| Enter IV | **Primeiros 16 caracteres**`x-api-key` |
| Secret Key | **Primeiros 32 caracteres** |

#### Teste de validação da descriptografia

Use os dados abaixo para verificar se sua função de descriptografia está correta:

Chave de Autenticação - API Webhookf4aecbe7-5061-4522-a1d0-26fc74a920a0

Chave de Criptografia - API Webhook3410d803-bdb4-463a-bd5b-d46ddaaba37b

Texto criptografado9liYoy9rGzjnzN0VQDGIxHtUzM7+D+Tveu2MRZrSkxk=

Resultado esperadoUnicred via Webhook

### Regras básicas do serviço

- **Autenticação:**`x-api-key`
- **Idempotência:**`uuidRequisicaoWebhook`
- **HTTPS válido:**
- **Tempo de resposta:**

### Estrutura do JSON (após descriptografia)

```
`{ "uuidInscricaoWebhook": "6c17869c-dbe3-4dd8-abc3-5bb1d2a33758", "uuidRequisicaoWebhook": "bba51828-b147-4928-b34d-211af9b3b4d0", "codigoMovimento": "03", "codigoInstrucaoOrigem": "09", "codigoRejeicao": "114", "beneficiario": { "uuidBeneficiario": "4D2FBDC4AED546EBBF093D8BE9D0F561", "agencia": "5971", "conta": "726620" }, "titulo": { "uuidTitulo": "4bc86cd358db484b8c07a79def774022", "codigoBarras": "13692983100000045555971000072662000000995231", "dataVencimento": "2024-07-28", "linhaDigitavel": "13695971070007266200000009952318298310000004555", "nossoNumero": "00000995231", "qrCodePix": "00020101021226940014br.gov.bcb.pix...", "seuNumero": "5014715", "valorTitulo": 45.55, "codigoSituacao": "01", "pagador": { "documento": "84227798035", "nomeRazaoSocial": "Grafica Unicred LTDA" } }, "credito": { "dataCredito": "2024-08-21", "valorLancamento": 95.47 }, "tarifa": { "dataTarifa": "2024-08-22", "valorTarifa": 1.10 } }`
```

ℹ

`codigoMovimento``codigoInstrucaoOrigem`

### Descrição dos campos

| Campo | Tipo (Tamanho) | Descrição |
| --- | --- | --- |
| `uuidInscricaoWebhook`obrigatório | UUID (36) | Identificador da inscrição do Webhook. |
| `uuidRequisicaoWebhook`obrigatório | UUID (36) | Identificador único do envio — use para idempotência. |
| `codigoMovimento`obrigatório | Texto (2) | Tipo de alteração do título. Ver tabela Movimentações. |
| `codigoInstrucaoOrigem`obrigatório | Texto (2) | Instrução do beneficiário que originou a alteração. Ver tabela Instruções. |
| `codigoRejeicao`opcional | Texto (3) | Motivo de rejeição da instrução. |
| Beneficiário |  |  |
| `uuidBeneficiario`obrigatório | Texto (32) | Identificador do beneficiário. |
| `agencia`obrigatório | Texto (4) | Número da agência. |
| `conta`obrigatório | Texto (6) | Número da conta corrente sem dígito. |
| Título |  |  |
| `uuidTitulo`obrigatório | UUID (32) | Identificador único do título. |
| `codigoBarras`obrigatório | Texto (44) | Código de barras sem formatação. |
| `dataVencimento`obrigatório | Data YYYY-MM-DD | Data de vencimento do título. |
| `linhaDigitavel`obrigatório | Texto (46) | Linha digitável sem formatação. |
| `nossoNumero`obrigatório | Texto (11) | Identificador do banco emissor. |
| `seuNumero`obrigatório | Texto (15) | Número de controle interno do beneficiário. |
| `valorTitulo`obrigatório | Numérico (14,2) | Valor do título. |
| `codigoSituacao`obrigatório | Texto (4) | Situação atual do título. Ver tabela Status. |
| `qrCodePix`opcional | Texto (400) | QR code para pagamento via PIX. |
| Título / Pagador |  |  |
| `documento`obrigatório | Texto (14) | CPF/CNPJ sem formatação. |
| `nomeRazaoSocial`obrigatório | Texto (40) | Nome ou razão social do pagador. |
| Crédito (quando houver repasse) |  |  |
| `dataCredito`obrigatório | Data YYYY-MM-DD | Data do lançamento do crédito na conta do beneficiário. |
| `valorLancamento`obrigatório | Numérico (14,2) | Valor pago menos a tarifa. |
| Pagamento (quando liquidado) |  |  |
| `agenciaRecebedora`obrigatório | Texto (4) | Agência que recebeu o pagamento. |
| `codigoBancoRecebedor`obrigatório | Texto (3) | Código do banco recebedor. |
| `codigoCanalLiquidacao`obrigatório | Texto (3) | Canal de pagamento. Ver tabela Canais. |
| `dataLiquidacao`obrigatório | Data YYYY-MM-DD | Data em que o título foi pago. |
| `valorAbatimento`opcional | Numérico (14,2) | Valor de abatimento aplicado. |
| `valorDesconto`opcional | Numérico (14,2) | Valor de desconto aplicado. |
| `valorMora`opcional | Numérico (14,2) | Valor de juros/multa. |
| `valorRecebido`opcional | Numérico (14,2) | Valor total pago. |
| Tarifa |  |  |
| `dataTarifa`obrigatório | Data YYYY-MM-DD | Data de aplicação da tarifa. |
| `valorTarifa`obrigatório | Numérico (14,2) | Valor da tarifa. |
| Empréstimo (caução) |  |  |
| `numeroContrato`obrigatório | Texto (10) | Número do contrato de empréstimo. |
| Protesto |  |  |
| `quantidadeDiasProtesto`obrigatório | Numérico (2) | Dias após vencimento para iniciar protesto (caução). |

## Passo 2 — Homologação

No ambiente de homologação da Unicred disponibilizamos apenas o serviço de emissão de título. Este serviço permite a homologação das chamadas do Webhook com dados reais para os eventos de emissão do título.

Para validar o desenvolvimento de outros eventos, fornecemos uma série de comandos cURL com dados fictícios, que simulam chamadas reais ao seu serviço conforme as especificações fornecidas pela Unicred.

**Chave de Criptografia**`af81d220-a717-46f2-9371-18be3777f87b`

`'SUA_URL'`
Instrução de remessa confirmada
```
`curl --request POST 'SUA_URL' \ --header 'x-api-key: dbd283c7-c6bc-4135-88bc-f9d30c679c2c' \ --header 'Content-Type: text/plain' \ --data 'r2ARrolPWr8eEjkodmd2BqiiSHBH2HeN6Y+AHu8awm5S2HwggkQKcSQTkAbv8khFCR+j81amunT3ELgokXUUQnXsaxqhGOTvjZiWv928V8RCziI5ybQ2kuQCgjNiW33Z2oUgDVHlr2XqI+4zM4HdjopwMfBvvwK+uQRkeOzY1718oqX6h2rbTWHtfyLqmCR9kl4SfO6wwhO0Z5wLLm1d+32Eh17PsouDcc3Y58kiy64BR3635ZdpCUIIDp2jdLPXWiu6FGWUFLAHSPtqsI5AHMT7KLIAbVxCVSa9oSA8WjGG9VWKYlZmy4tryS59kpCjw+WxfArhBG2xZtrHhOa290XDoK8S660CpsY+dBikN9j4mzV/XJ02pBeXlpz31pSu41atW9V73C6DDyNEjJeVdkAapaD00KT5WC8I9fwKZ5J/u6ZxBxkor1f4LkkYr1svcwpXlqEXq4ZYB5l0JcaO7MRQmwhayZ4daUqeRw0ZRMcnC1d6Dv+1tw26apWhwTgjBoMsvoqdhZByCZ3b3uSJ4CsSqYzk5Rzcw68r7vD5zlknyo2cr8IHVNiS0oMPFadYU/txj4iTybRRjXhdXTbbyS/XeAM2r2EGMHvxfwYGmqvRJ/LZ6cmt91rNdSCp1cIz95uvNvTIarap9wSQ06Sbzxya4doIr0CdPEkj7GuKGSN3/llPoBtE7/+ro0U9Yw5my/7xJNWfmEhMZmEmgP9272susCl6wu9NzrJrT/+HHI4ZodVydcPWc3OyaB1E2AaearVIhTaxqcggR80iG3N4vikDh/+JEJKTGktrcAsnkeablW1yezKnf2fz+Pw/PqDs1ac9gLS7jMPiSuwfgUuP5n8zbGBcJZ1mtMWeZn9qZLgMc/Ml0mA59PbsfMOW24Jb6kPKZgMWk4LdGDVqLnhawx8ekLVgqAOAFZaAKeq61s+0rqE98EGKszHNcvaaWpZRQ3XsC2jZRw8YuR8zvPhju0guy6oKQtDLWOygN2kL1w7J3qMkYH8qCbJ+HAh595nqGfcvKusSqgp/0tkh34IX2gjT5rcaPUDXHkZ0b4UyzY6GwzCPOx5u/ijagETF/G1TVr8gCsT+AIOamFB1YWBp/qJ8OT6o1UJy0Si5pJFRbQRCHIgraMwPajHcq+HiaTLqWeLuFX2RBQRTxppnRJFkkEuvADi0Lbe2GIGivaPmbh/CHwzyyFyE7Y++Qy2SNd8MJxhKxdtCqykoOe8Puq+qbSYF8tSgap3pQqDMx/AC637mKe+mh2ESdPFlgzWkt/ZxHkQigxpXeaiAhArvFxTEBw=='`
```

Após a execução, o JSON descriptografado deve ser:

```
`{ "uuidInscricaoWebhook": "17c61b9e-2bb1-4e44-a71a-80a441ab719a", "uuidRequisicaoWebhook": "d4db33dc-e354-4618-8ef6-495d20ecb57f", "codigoMovimento": "02", "codigoInstrucaoOrigem": "01", "beneficiario": { "uuidBeneficiario": "4D2FBDC4AED546EBBF093D8BE9D0F561", "agencia": "5971", "conta": "726620" }, "titulo": { "uuidTitulo": "40ff615cc48d47079c14360e3f5c6146", "codigoBarras": "13699982500000011625971000072662000000979112", "dataVencimento": "2024-08-31", "linhaDigitavel": "13695971070007266200000009791120998250000001162", "nossoNumero": "00000979112", "seuNumero": "5014715", "valorTitulo": 11.62, "codigoSituacao": "01", "pagador": { "documento": "84227798035", "nomeRazaoSocial": "Grafica Unicred LTDA" } }, "tarifa": { "dataTarifa": "2024-08-22", "valorTarifa": 1.10 } }`
```Liquidação do título
```
`curl --request POST 'SUA_URL' \ --header 'x-api-key: dbd283c7-c6bc-4135-88bc-f9d30c679c2c' \ --header 'Content-Type: text/plain' \ --data 'VJj+m0ATExUKcDkyn2ynXqlmI9d5G2AL+J+9ExHhoBqVwlCocN+oCnXjL2EhHy1XHoXef+BV8ilI9NKzwsHi2KgHHah0CGU0MqSQlSb6FnbxSOWZRbZHOSfWY42sHzuRWowj2bzD4b0zq9eGv52jtYJYK7pD5IOGEgolU8QbsXwG+S93jVo3iCKYg/+WWtK6AYtdym0uL9aRjsN690LnyODw5ZG2J7P16ywlUAByPrehq56z3OnPC06CY9J8AFgu5aeL1SzHghjLIP17wDxPX2UOCVSJjoT59/eaTBPyJwenfkUw/xgequLxpnAj7vL9mynaf+lyoeV22m7KoUARM/WZtPoieNnmPEAhbM8/qkvJPjjnZK1j9p/L/6BeJ99ChkvCUI8qIjxWKEPKjIPTWH3aF0o3yfckYgdTBd4xJ4I6nglYvnvsaaZbwLscBjDkozJ0WyLAbuUlUQIbRDwYO0V4yGKMpSVNbi8x5EXCM0cCU8gsJUwoBDefmJ7RmdoqG4RMUx8xBDeo5ALHO6D3EsPm3P0JRH+SeRB5eu8Y3ANDm2swxrDPIsoNs2awGadoBIROw/MtXsgEyntq1wOMK0KW8lpZ/vAPTSci/R3GDYiLr2Fo9BkmO9c6C28Nzs1jEo12HdLVG0urUjt630wgv0Xo6e4zOeJFRMtm+DlEbWyTMqm+ozolb9G+CFmxNxAAr+fk/MC+ix1giF5vGk4R/1XWfBZwL7/1koUO+umy7FpjEXF+fBcr9tMgtzSCJeG/cev6ETnZ0sI1TLJnib3YDosN3U3CARgRB+oPJ2OvKbbrL9xVWdXjRowPzMhGqffkjfhcE0WMP+ZHn0ij/n2VNjn9RAEl/00jA4iK/AN++1PJaG2G8sgiCAgEWcMFVCVYGLRWO8Tt/TiXYt9bUSUn/0mhk9uR7LUegqHHCyN6LiJLhZ8UE0BLmH5g+/Z1+VXYaAOWcmoARjqd8I6j4tiYZ8f7mZy0e41yYJ7rBkJ20uYP+NF1IjBqwEkWqD7SAogyXLi/6mBMuw0xSN59vUNrRmPsp7kZaKBtEw/YosogtpPdEITQok6ZuY0PpxfH/np79KBqBritIHYvRPTYM9+tR3Aisfo9UnmZ02cEI7fE63zgYO8JBjWO5HHk+i0DqIfK2wTx+5N7ArI/35OYlGeYV+qy+ifzcO5ZUB6XxzfGCz/GH57xwgPk6q0Ai3JrWcQ+STykRjpfMMJ8VrUXrmd9kqwUdRSKnX5e4u1N79sAyh5OlTRTUQkV+X8pV27uqGJg5MawlTtlAHiBLUY4W3y4PwI/05oXIQbthk8Q2thuQynoh3as5mnRMAznqqlNC+f1kYXzkfuKNFVEAv55L54klPfBhgcJqO7YfJXp6TjX5Ev9wExxePsJU4S1YQ6MtzSulwhaZwyC/nJVJDluQGe8b7GBa8glIhS6Wz4lNyormQhe3+yp6ySB/MCoVlrTFGA2ToIVAL9fLtQYYQBRkwLxWlnnhtTZjdPD4Et5d2YPYm/293kMZp7jEqQdDaj0Hx9OlxFQZhfuf0ksG1IdMYWaUvMBQ2rfI5diu3dg6+DxOPiH1Fk9KSOY5wP0Yvl1E8aEo7qcNQHtByDjcc6AQz/e/qqRlAb64fpd86U/lEXlBG4VxVTOKu7UTBAXEfjewaDK0inQrvVC2yPNHGNg2J0f4Lj4Cch3pCxfiga2GwQHdvo8K6XhWZ56/D8e10p1K0+a5Fk4/HIBsUYYFJ4HDum2HwaztQnqvD5dUo4fusnFGKUWXEH+MKdkeB6iag6G3mqP2tZUaVOQ3/dGb9Utx1sPqg=='`
```

JSON descriptografado esperado:

```
`{ "uuidRequisicaoWebhook": "d5f776e0-b80b-4883-8b56-d5ad1c4e7ef8", "uuidInscricaoWebhook": "9baade53-edbb-4c72-baee-e1b1d80ab8e2", "codigoMovimento": "06", "codigoInstrucaoOrigem": "00", "beneficiario": { "uuidBeneficiario": "4D2FBDC4AED546EBBF093D8BE9D0F561", "agencia": "5971", "conta": "726620" }, "titulo": { "uuidTitulo": "c3978d9dec9a4f61877329d9e7828894", "codigoBarras": "13693982500000106765971000072662000000979309", "dataVencimento": "2024-08-31", "nossoNumero": "979309", "seuNumero": "5014715", "valorTitulo": 106.76, "codigoSituacao": "03", "pagador": { "documento": "84227798035", "nomeRazaoSocial": "Grafica Unicred LTDA" } }, "credito": { "dataCredito": "2024-08-21", "valorLancamento": 95.47 }, "pagamento": { "agenciaRecebedora": "5731", "codigoBancoRecebedor": "136", "codigoCanalLiquidacao": "3", "dataLiquidacao": "2024-08-21", "valorAbatimento": 0.00, "valorDesconto": 0.00, "valorMora": 0.00, "valorRecebido": 96.76 }, "tarifa": { "dataTarifa": "2024-08-22", "valorTarifa": 1.29 } }`
```Título Caucionado
```
`curl --request POST 'SUA_URL' \ --header 'x-api-key: dbd283c7-c6bc-4135-88bc-f9d30c679c2c' \ --header 'Content-Type: text/plain' \ --data 'VJj+m0ATExUKcDkyn2ynXqlmI9d5G2AL+J+9ExHhoBq8xFcAZNqflchHLn4Xpn2fD9thRwhBU7cByvzRngfFYIAr5z188c7xOG0iNHgMZR4WFNJfRhcWDfPCL4ZjgTPPmBD8B7xxh6f/pJXSxirSY6t2Qmvpfgh78if+YPTNUdGQymYQMI8OqRPGMSp4Sf0PjlkSg3kFo2MvWRMmXTnG+0x86HSY7dBX3vu/kWSLeQVQ/3N9BRfTuxWOZBZspl6E9YcfdycSyF6cY/5UtT+Jl8j4rac0eG6tKWOFp5waIBDzKA11APFTlpfUy8B4SBkThGXI2iA2R+xbp4j84fBnEauwMtv9AD/LwFHGGowKlCmu2vylGOi0qNgLLhys8MoTtQk+rxn2DAO2EMxjo4wg/dhXj/7NO3yxXiwdgfXxmrxhZmAHO2n3gfexDEy6fgo5hZpMH0JvbM8b664IQDziyuLODEmSjlGtgkrIAzlnlqRe5r9MJgbx49GqJhVgP6OBDYduOEdXwvMhAFkMjxbFz+KVmZnN/IpwSI8v0bf3zOXTDZJmKTdSC0MxLKzkOw5OCEgB2JGBwFIhr5xRQtV9BHv+X7dS1goIpdisuVJCBaeVmKa440EGb1QmZnhKzJ9QCgOveqobp+gFBocOa/hXmhFqLeu2Mv/5BBCXN+QAXDgMd7X10xOVncMsB5VDQsSv2zIKXVyMoOmcuSobA3qqoAUq63J+POGsMwSoDQ7FkH4IZRI3fCMwn2QwVWQbmOOYxnaPGof25ZIS46R5wjQCLRyvunhej9DqZNvzRrkchtUOlbv6A4IE9eqOviNrPSxLfYLhad4N43PiFKv2sTpSaMDY9/4+CZ+Taawv3AGHkrxYK9Pz8UMHpPz5wG5tRCbwQ9Savy/PjJ61HIojZ8qxeAMO7lCNaIexqQrCUdF7cw6bpfk4YrYHaMZmKzCBq4AFPVulwy1iRPys1y4IZIL3/Qnffu+gvAEsqRBwXzdAJGwOIDQEfSYAzpD1HQD3y9YVOOqbq0z5bMZ04NIhIup6wesCCV7vzGxjkCWfSf5YdnZm7gOFZnuK1KuwrFr/UNXaXocLsJiOnMvF+wb2/oci6+RsjlM9wfhPtPhTHv47a2tvfPAhegWXS2q+9+Nb5Z/YaOf+Pvty07qHyHP0NbFIywo/iPPm4W0xPjM7DcqX2ejSyHQRJISEWrfqBMpLNZp5PXnUz/0d/6RMpKEHysWhVL+MkSDh9zjDMbXTvlrQvHmXLQIVkGMAK8zHIqVk/gi8XYyjZCvU86pF56q1COL4KQDpjMwq+0D8H2PuieW6PXYSpau6a69vnhMDpx7bu5mx'`
```

JSON descriptografado esperado:

```
`{ "uuidRequisicaoWebhook": "54bd88a9-6b3e-43f5-a2d9-65547d31b472", "uuidInscricaoWebhook": "596dfd14-9de0-47ba-8958-069d567b53ed", "codigoMovimento": "17", "codigoInstrucaoOrigem": "00", "beneficiario": { "uuidBeneficiario": "4D2FBDC4AED546EBBF093D8BE9D0F561", "agencia": "5971", "conta": "726620" }, "titulo": { "uuidTitulo": "a378f33f4baa40ac9fb9f9bf6c8e65a9", "codigoBarras": "13694982500000023465971000072662000000979236", "dataVencimento": "2024-08-31", "nossoNumero": "00000979236", "seuNumero": "5014715", "valorTitulo": 23.46, "codigoSituacao": "01", "pagador": { "documento": "84227798035", "nomeRazaoSocial": "Grafica Unicred LTDA" } }, "emprestimo": { "numeroContrato": "8059464" }, "protesto": { "quantidadeDiasProtesto": 9 } }`
```
## Passo 3 — Configuração no CobExpress

Para conseguir habilitar o serviço em produção, é necessário realizar a inscrição do Webhook no CobExpress. Para realizar a inscrição, o cooperado deverá acessar o ambiente master do CobExpress, na aba de configurações e parametrizar conforme abaixo:

ℹ

**Um cadastro por conta corrente**
O cadastro do Webhook é feito por conta corrente. Se você possui 4 contas, realize 4 cadastros separados.

| Campo no CobExpress | O que preencher | Observações |
| --- | --- | --- |
| Habilitar Webhook para Retorno? | Marcar a opção | Ativa o serviço de retorno via Webhook. |
| Endereço para Recebimento via Webhook (URL) | URL HTTPS do seu serviço | **Porta 443**[Palo Alto URL Filtering](https://urlfiltering.paloaltonetworks.com/query/)**32 dias** |
| Chave de Autenticação - API Webhook | UUID v4 definido por você | `x-api-key` |
| Chave de Criptografia - API Webhook | UUID v4 definido por você | Usada como Secret Key no AES-256 (primeiros 32 caracteres). Pode ser compartilhada entre inscrições. Valor deve ser diferente da Chave de Autenticação. |
| Versão Webhook | Versão atual disponível | Define o contrato de retorno. A Unicred comunicará novas versões quando disponíveis. |
| Tipo de Retorno via Webhook | Completo ou Parcial | **Completo:****Parcial:** |

### Navegação no CobExpress

**Configurações****selecionar a conta**
### Reprocessamento

A Unicred é responsável por assegurar a ordem cronológica no envio das alterações dos títulos. Quando um novo evento for gerado para um título que ainda tenha eventos anteriores não enviados, a Unicred priorizará o reenvio do evento mais antigo antes de processar o novo.

- **4 tentativas**
- **4 horas**
- *off-sync*

## Tabelas de Referência

### `(codigoCanalLiquidacao)`

| Código | Descrição |
| --- | --- |
| 161 | Internet Banking |
| 162 | ATM |
| 163 | Caixa |
| 164 | Retaguarda |
| 166 | Compe |
| 168 | Banco Correspondente |
| 268 | Mobile |
| 308 | Cartório |
| 333 | PIX |
| 334 | Correspondente Digital |

### `(codigoSituacao)`

| Código | Descrição |
| --- | --- |
| 01 | Aberto (título registrado e não liquidado). |
| 02 | Baixado por solicitação do Beneficiário (cedente). |
| 03 | Baixado por liquidação Intrabancária. |
| 04 | Baixado por liquidação Interbancária. |
| 05 | Baixado por decurso de prazo. |
| 06 | Baixado por envio para protesto. |
| 07 | Título deletado. |
| 08 | Baixado por solicitação da Instituição destinatária. |
| 99 | Incluído. |
| 100 | Aguardando Registro Nuclea (CIP). |
| 101 | Rejeitado Nuclea (CIP). |

### `(codigoInstrucaoOrigem)`

| Código | Descrição |
| --- | --- |
| 00 | Sem instrução a informar (movimentos 01, 06, 07, 09, 13, 14, 17, 18). |
| 01 | Remessa. |
| 02 | Pedido de Baixa. |
| 04 | Concessão de Abatimento. |
| 05 | Cancelamento de Abatimento. |
| 06 | Alteração de vencimento. |
| 09 | Protestar. |
| 10 | Baixa por Decurso de Prazo. |
| 11 | Sustar Protesto e Manter em Carteira. |
| 22 | Alteração do Seu Número. |
| 23 | Alteração de Dados do Pagador. |
| 25 | Sustar Protesto e Baixar Título. |
| 26 | Protesto Automático. |
| 27 | Negativação Automática. |
| 40 | Alteração de Status Desconto. |
| 45 | Negativar. |
| 46 | Sustar Negativação e Manter Título em Carteira. |
| 47 | Sustar Negativação e Baixar Título. |
| 50 | Alteração de Status Caução. |

### `(codigoMovimento)`

| Código | Descrição |
| --- | --- |
| 01 | Pago (título protestado pago em cartório). |
| 02 | Instrução Confirmada. |
| 03 | Instrução Rejeitada. |
| 04 | Sustado Judicial. |
| 06 | Liquidação Normal. |
| 07 | Liquidação em Condicional. |
| 08 | Sustado Definitivo. |
| 09 | Liquidação de Título Descontado. |
| 10 | Protesto Solicitado. |
| 11 | Protesto em Cartório. |
| 12 | Sustação Solicitada. |
| 13 | Título Descontado (garantia em operação de desconto). |
| 14 | Título Descontável (desistência de garantia em desconto). |
| 15 | Enviada Negativação. |
| 16 | Enviada Sustação de Negativação. |
| 17 | Título Caucionado (garantia em cobrança caucionada). |
| 18 | Título Não Selecionado (não caucionável). |

### `(codigoRejeicao)`

| Código | Descrição |
| --- | --- |
| 01 | CODIGO_BANCO_INVALIDO |
| 05 | CODIGO_DE_MOVIMENTO_INVALIDO |
| 06 | NUMERO_DE_INSCRICAO_DO_BENEFICIARIO_INVALIDO |
| 07 | AGENCIA_CONTA_INVALIDO |
| 08 | NOSSO_NUMERO_INVALIDO |
| 09 | NOSSO_NUMERO_DUPLICADO |
| 12 | TIPO_DE_DOCUMENTO_INVALIDO |
| 15 | DATA_VENCIMENTO_INVALIDA_PARA_ENVIO_GRAFICA |
| 16 | DATA_VENCIMENTO_INVALIDA |
| 17 | DATA_VENCIMENTO_ANTERIOR_A_DATA_DE_EMISSAO |
| 18 | VENCIMENTO_FORA_DO_PRAZO_DE_OPERACAO |
| 20 | VALOR_DO_TITULO_INVALIDO |
| 24 | DATA_EMISSAO_INVALIDA |
| 25 | DATA_EMISSAO_POSTERIOR_A_DATA_DE_ENTREGA |
| 26 | CODIGO_DE_JUROS_INVALIDO |
| 27 | VALOR_DE_JUROS_INVALIDO |
| 28 | CODIGO_DE_DESCONTO_INVALIDO |
| 29 | VALOR_DE_DESCONTO_INVALIDO |
| 30 | ALTERACAO_DE_DADOS_REJEITADA |
| 33 | VALOR_DO_ABATIMENTO_INVALIDO |
| 34 | VALOR_DO_ABATIMENTO_MAIOR_OU_IGUAL_AO_VALOR_DO_TITULO |
| 37 | CODIGO_PARA_PROTESTO_INVALIDO |
| 38 | PRAZO_PARA_PROTESTO_INVALIDO |
| 39 | PEDIDO_PROTESTO_NAO_PERMITIDO_PARA_TITULO |
| 40 | TITULO_COM_ORDEM_PROTESTO_EMITIDA |
| 41 | PEDIDO_CANCELAMENTO_SUSTACAO_PARA_TITULO_SEM_INSTRUCAO_PROTESTO |
| 45 | NOME_DO_PAGADOR_NAO_INFORMADO |
| 46 | NUMERO_DE_INSCRICAO_DO_PAGADOR_INVALIDO |
| 47 | ENDERECO_DO_PAGADOR_NAO_INFORMADO |
| 48 | CEP_INVALIDO |
| 49 | BAIXA_DERCUSO_PRAZO_REJEITADA_TITULO_EM_PROTESTO |
| 52 | UNIDADE_FEDERATIVA_INVALIDA |
| 57 | CODIGO_DE_MULTA_INVALIDO |
| 58 | DATA_DE_MULTA_INVALIDO |
| 59 | VALOR_DE_MULTA_INVALIDO |
| 60 | MOVIMENTO_PARA_TITULO_NAO_CADASTRADO |
| 63 | ENTRADA_PARA_TITULO_JA_CADASTRADO |
| 79 | DATA_DE_JUROS_INVALIDO |
| 80 | DATA_DE_DESCONTO_INVALIDO |
| 86 | SEU_NUMERO_INVALIDO |
| A5 | TITULO_LIQUIDADO |

## Perguntas Frequentes

Onde fica a API Key / Chave de Autenticação?

`x-api-key`

Como e onde configuro o Webhook?

**CobExpress**

Ao habilitar o Webhook o retorno via arquivo continua funcionando?

Sim. O arquivo de retorno continua disponível no CobExpress e pode ser baixado normalmente, conforme a grade habitual, desde que o sistema esteja parametrizado para usar ambos.

Como fica o crédito em conta corrente?

O crédito não é afetado — apenas a informação chega mais rápido. Pagamentos via código de barras seguem o Float bancário da carteira; pagamentos via PIX são creditados no mesmo dia.

O que acontece se meu serviço não conseguir receber uma notificação?

A Unicred garante ordem cronológica. Se houver eventos pendentes, eles serão reenviados antes dos novos. Sem novos eventos, tentativas são feitas a cada 4 horas, com até 4 tentativas por evento.

Meu retorno com UUID entre aspas está sendo rejeitado. Por quê?

`"uuid"`*off-sync*`Content-Type``text/plain`

Qual é o tempo máximo de resposta?

*off-sync*

Posso usar a mesma Chave de Criptografia em múltiplas inscrições?

Sim. A Chave de Criptografia pode ser compartilhada entre inscrições. Porém a Chave de Autenticação deve ser única por inscrição, e os valores das duas chaves devem sempre ser diferentes entre si.

