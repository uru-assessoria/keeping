# Emissão de Títulos de Cobrança — Unicred API

API destinada à emissão (registro) de títulos de cobrança de forma unitária (título a título).

## Endpoints

**Usar: https TLS 1.2**

- **Homologação:** `POST https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/{id_beneficiario}/titulos`
- **Produção:** `POST https://api.e-unicred.com.br/cobranca/v2/beneficiarios/{id_beneficiario}/titulos`

O `{id_beneficiario}` será enviado na planilha de homologação e de produção, e identifica o cooperado beneficiário de cobrança.

## Cabeçalho da requisição

```
Authorization: Bearer {TOKEN}
cooperativa: {codigo_cooperativa}
apiKey: {Access token da Aplicação do Portal API}
content-type: application/json
```

## Corpo da requisição

```json
{
  "beneficiarioVariacaoCarteira": 43,
  "seuNumero": "123sdf",
  "valor": 150.93,
  "vencimento": "2020-10-17",
  "indicacaoTituloDescontavel": false,
  "indicacaoTituloCaucionavel": false,
  "protesto": {
    "codigoParaProtesto": "DIAS_UTEIS",
    "diasParaProtesto": 15
  },
  "negativacao": {
    "codigoParaNegativacao": "DIAS_UTEIS",
    "diasParaNegativar": 15
  },
  "enviaBoletoEmail": false,
  "nossoNumero": "00000231444",
  "desconto": {
    "indicador": 0,
    "dataLimite": "2020-01-10",
    "valor": 0
  },
  "juros": {
    "codigo": 0,
    "dataInicio": "2020-01-10",
    "valor": 0
  },
  "multa": {
    "codigo": 0,
    "dataInicio": "2020-01-10",
    "valor": 0
  },
  "mensagensFichaCompensacao": ["string", "string", "string", "string", "string", "string"],
  "pagador": {
    "nomeRazaoSocial": "Fulano de Tal",
    "tipoPessoa": "F",
    "tipoDocumento": "CPF",
    "numeroDocumento": "01011001001",
    "nomeFantasia": "Fulano",
    "email": "fulano@detal.com",
    "endereco": {
      "tipoLogradouro": "Rua",
      "logradouro": "Rua IV",
      "numero": "1001",
      "complemento": "Casa 01",
      "bairro": "Centro",
      "cidade": "Porto Alegre",
      "uf": "RS",
      "cep": "92000100"
    }
  }
}
```

**Importante:** Para campos não obrigatórios, caso não exista dado significativo, não informe o campo no corpo da requisição. Não informe conteúdo igual a `null` ou brancos em campos não obrigatórios.

## Exemplo de requisição

```bash
curl -X POST https://api.e-unicred.com.br/homolog/cobranca/v2/beneficiarios/B7CEE6BDC9E04C49A7437EC3E750140A/titulos \
  -H "Authorization: Bearer f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211394f9d93dk211" \
  -H "cooperativa: 0001" \
  -H "apiKey: xxxxxxx" \
  -H "content-type: application/json" \
  -d '{
    "beneficiarioVariacaoCarteira": 43,
    "seuNumero": "123",
    "valor": 100.00,
    "vencimento": "2017-10-01",
    "nossoNumero": "00000231444",
    "pagador": {
      "nomeRazaoSocial": "Fulano de Tal",
      "tipoPessoa": "F",
      "numeroDocumento": "01418014077"
    }
  }'
```

## Dicionário de campos

| Campo | Tipo | Tamanho | Obrigatório | Regra |
| --- | --- | --- | --- | --- |
| `beneficiarioVariacaoCarteira` | Numérico | 10,0 | Sim | Para boletos com espécie 31 (Cartão de crédito), configurar beneficiário com variação carteira Cartão de crédito. Carteira permite pagamento máximo e mínimo de qualquer valor, sem cobrança de juros, multa e sem desconto/protesto. |
| `seuNumero` | Texto | 15 | Sim | Número de controle interno do beneficiário. |
| `valor` | Numérico | 10,2 | Sim | Valor do título. Para boletos com espécie 31 (Cartão de crédito), deve ser 0. |
| `vencimento` | Data | 10 | Sim | Formato `YYYY-MM-DD`. |
| `indicacaoTituloDescontavel` | Booleano | — | Não | Indica se o título pode ser utilizado como garantia de operação de desconto futura. Domínio: `True`/`False`. Default: `False`. Para boletos com espécie 31, informar `False`. |
| `indicacaoTituloCaucionavel` | Booleano | — | Não | Indica se o título pode ser utilizado como garantia de operação de caução futura. Domínio: `True`/`False`. Default: `False`. Para boletos com espécie 31, informar `False`. |
| `protesto.codigoParaProtesto` | Texto | 13 | Não | Domínio: `DIAS_CORRIDOS`, `DIAS_UTEIS`, `NAO_PROTESTAR`. Default: `NAO_PROTESTAR`. Se `NAO_PROTESTAR`, não informar `diasParaProtesto`. |
| `protesto.diasParaProtesto` | Numérico | 2 | Não | 01 a 99. Obrigatório se `codigoParaProtesto` for `DIAS_CORRIDOS` ou `DIAS_UTEIS`. |
| `negativacao.codigoParaNegativacao` | Texto | 13 | Não | Domínio: `DIAS_CORRIDOS`, `DIAS_UTEIS`, `NAO_NEGATIVAR`. Default: `NAO_NEGATIVAR`. Se `NAO_NEGATIVAR`, não informar `diasParaNegativar`. |
| `negativacao.diasParaNegativar` | Numérico | 3 | Não | 03 a 360. Obrigatório se `codigoParaNegativacao` for `DIAS_CORRIDOS` ou `DIAS_UTEIS`. |
| `enviaBoletoEmail` | Booleano | — | Não | Default: `False`. Se `True`, o campo `pagador.email` é obrigatório. Para boletos com espécie 31, informar `False`. |
| `nossoNumero` | Numérico | 11 | Não | Somente números. Sugestão: não informar durante homologação; deixar o sistema gerar. |
| `desconto.indicador` | Numérico | 1 | Não* | Domínio: `0` = Isento, `1` = Valor Fixo. Obrigatório se houver desconto. |
| `desconto.dataLimite` | Data | 10 | Não* | Formato `YYYY-MM-DD`. Obrigatório se `desconto.indicador = 1`. |
| `desconto.valor` | Numérico | 14,2 | Não* | Obrigatório se `desconto.indicador = 1`. |
| `juros.codigo` | Texto | 1 | Não* | Domínio: `1` = Valor Diário (R$), `2` = Taxa diária (%), `3` = Taxa Mensal (%), `5` = Isento. Para boletos com espécie 31, deve ser `5`. |
| `juros.dataInicio` | Data | 10 | Não* | Formato `YYYY-MM-DD`. Obrigatório se `juros.codigo <> 5`. |
| `juros.valor` | Numérico | 10,2 | Não* | Obrigatório se `juros.codigo <> 5`. |
| `multa.codigo` | Texto | 1 | Não* | Domínio: `1` = Valor Fixo (R$), `2` = Taxa (%), `3` = Isento. Para boletos com espécie 31, deve ser `3`. |
| `multa.dataInicio` | Data | 10 | Não* | Formato `YYYY-MM-DD`. Obrigatório se `multa.codigo <> 3`. |
| `multa.valor` | Numérico | 10,2 | Não* | Obrigatório se `multa.codigo <> 3`. |
| `mensagensFichaCompensacao` | Array | 6 | Não | Máximo de 6 mensagens, cada uma com até 80 caracteres. |
| `pagador.nomeRazaoSocial` | Texto | 40 | Sim | Nome ou razão social do pagador. |
| `pagador.tipoPessoa` | Texto | 1 | Sim | `F` = Pessoa Física, `J` = Pessoa Jurídica. |
| `pagador.tipoDocumento` | Texto | 4 | Não | Domínio: `CPF`, `CNPJ`. |
| `pagador.numeroDocumento` | Texto | 14 | Sim | Somente números, sem espaços. |
| `pagador.nomeFantasia` | Texto | 256 | Não* | Obrigatório para pessoa jurídica. |
| `pagador.email` | Texto | 60 | Não | E-mail válido no padrão `nome@dominio`. Não informar brancos ou NULL. |
| `pagador.endereco.tipoLogradouro` | Texto | 25 | Não | Ver tipos de logradouros permitidos. |
| `pagador.endereco.logradouro` | Texto | 60 | Sim | — |
| `pagador.endereco.numero` | Texto | 5 | Não | — |
| `pagador.endereco.complemento` | Texto | 30 | Não | — |
| `pagador.endereco.bairro` | Texto | 40 | Não | — |
| `pagador.endereco.cidade` | Texto | 50 | Sim | — |
| `pagador.endereco.uf` | Texto | 2 | Sim | Valores válidos: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO. |
| `pagador.endereco.cep` | Texto | 8 | Sim | Somente números, validado conforme base dos Correios. |

## Resposta de sucesso

**Status HTTP:** `200 OK`

**Exemplo 1:** Identificação alfanumérica do título na Unicred (`id_titulo:0000008d56aa461796227f0e30c7f5f2`).

**Exemplo 2:**

```json
{
  "message": "OK",
  "timestamp": 4456798441156,
  "httpStatus": 200,
  "id_titulo": "0000008d56aa461796227f0e30c7f5f2",
  "url": "http://api.unicred.com.br/servico"
}
```

## HTTP Status

| Status | Significado |
| --- | --- |
| `200 OK` | Requisição processada com sucesso. |
| `401 Unauthorized` | Token utilizado não é válido para a operação. |
| `403 Forbidden` | Usuário do token não possui permissão para efetuar a operação. |
| `422 Unprocessable Entity` | Dados submetidos não são válidos. O corpo da resposta traz o motivo. |
| `500 Internal Server Error` | Erro interno nos serviços da Unicred. |

## Corpo da resposta quando erro

```json
{
  "message": "Ocorreu um erro.",
  "timestamp": 4456798441156,
  "httpStatus": 500,
  "url": "http://api.unicred.com.br/servico"
}
```

```json
{
  "message": "Erro ao validar atributo.",
  "timestamp": 4456798441156,
  "httpStatus": 422,
  "url": "http://servicos-tst.e-nicred.com.br/cobranca/v2/beneficiarios/A6CEF85F56044262B226CE2006CA325F/Titulos",
  "body": [
    { "Fields": "pagador.endereco.numero", "message": "O número do endereço do pagador deve conter no máximo 5 caracteres." }
  ]
}
```

## Possíveis erros de negócio (422)

- O nome ou razão social do beneficiário original é obrigatório.
- O nosso número `${nossoNumero}` já está sendo usado em outro título.
- O número do endereço do pagador deve conter no máximo 5 caracteres.
- Nosso número `${nossoNumero}` inválido.
- O nome do pagador é obrigatório.
- O tipo de pessoa do pagador é obrigatório.
- CPF inválido.
- CNPJ inválido.
- O nome fantasia é obrigatório para pagador do tipo pessoa jurídica.
- O CEP `${cep}` é inválido.
- A UF é obrigatória.
- A UF `${uf}` é inválida.
- A cidade é obrigatória.
- O endereço é obrigatório.
- Data de vencimento `${vencimento}` deve ser maior ou igual à data atual.
- Data de vencimento inválida. Data máxima até 10 anos.
- Data de vencimento menor que a mínima para envio para a Gráfica.
- O Seu Número é obrigatório.
- O valor do título deve ser maior que zero.
- Título não pode receber configuração de protesto automático pois possui negativação automática configurada.
- Título não pode receber configuração de negativação automática pois possui protesto automático configurado.
- Beneficiário não autorizado a enviar títulos para negativação.
- Beneficiário não autorizado a operar com produto Caução.
- Beneficiário não autorizado a operar com produto Protesto.
- Beneficiário não autorizado a operar com produto Negativar.
- Beneficiário não autorizado a operar com produto Desconto.
