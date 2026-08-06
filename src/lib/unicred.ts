import crypto from "crypto";

const UNICRED_BASE_URL = process.env.UNICRED_API_BASE_URL?.replace(/\/$/, "");
const UNICRED_BENEFICIARIO_ID = process.env.UNICRED_API_ID_BENEFICIARIO;
const UNICRED_COOPERATIVA = process.env.UNICRED_API_CODE;
const UNICRED_API_KEY = process.env.UNICRED_API_CLIENTID;
const UNICRED_USER = process.env.UNICRED_API_USER;
const UNICRED_PASSWORD = process.env.UNICRED_API_PASSWORD;
const UNICRED_WEBHOOK_API_KEY = process.env.UNICRED_WEBHOOK_API_KEY;
const UNICRED_WEBHOOK_SECRET_KEY = process.env.UNICRED_WEBHOOK_SECRET_KEY;

export interface PagadorEndereco {
  tipoLogradouro?: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Pagador {
  nomeRazaoSocial: string;
  tipoPessoa: "F" | "J";
  tipoDocumento?: "CPF" | "CNPJ";
  numeroDocumento: string;
  nomeFantasia?: string;
  email?: string;
  endereco: PagadorEndereco;
}

export interface EmitirTituloParams {
  seuNumero: string;
  valor: number;
  vencimento: string;
  pagador: Pagador;
  nossoNumero?: string;
}

export interface UnicredTituloResponse {
  message?: string;
  timestamp?: number;
  httpStatus?: number;
  id_titulo?: string;
  url?: string;
}

export interface UnicredStatusResponse {
  codBarras?: string;
  linhaDigitavel?: string;
  nossoNumero?: string;
  dataDeVencimento?: string;
  valor?: number;
  status?: string;
  motivo?: string | null;
  qrCodePix?: string | null;
  pagamentos?: {
    data?: string;
    valor?: number;
  };
}

export interface UnicredWebhookPayload {
  uuidInscricaoWebhook: string;
  uuidRequisicaoWebhook: string;
  codigoMovimento: string;
  codigoInstrucaoOrigem: string;
  codigoRejeicao?: string;
  beneficiario: {
    uuidBeneficiario: string;
    agencia: string;
    conta: string;
  };
  titulo: {
    uuidTitulo: string;
    codigoBarras: string;
    dataVencimento: string;
    linhaDigitavel?: string;
    nossoNumero: string;
    qrCodePix?: string;
    seuNumero: string;
    valorTitulo: number;
    codigoSituacao: string;
    pagador: {
      documento: string;
      nomeRazaoSocial: string;
    };
  };
  credito?: {
    dataCredito: string;
    valorLancamento: number;
  };
  pagamento?: {
    agenciaRecebedora: string;
    codigoBancoRecebedor: string;
    codigoCanalLiquidacao: string;
    dataLiquidacao: string;
    valorAbatimento?: number;
    valorDesconto?: number;
    valorMora?: number;
    valorRecebido?: number;
  };
  tarifa?: {
    dataTarifa: string;
    valorTarifa: number;
  };
  emprestimo?: {
    numeroContrato: string;
  };
  protesto?: {
    quantidadeDiasProtesto: number;
  };
}

export function validateConfig(): void {
  if (!UNICRED_BASE_URL) {
    throw new Error("UNICRED_API_BASE_URL não configurado");
  }
  if (!UNICRED_BENEFICIARIO_ID) {
    throw new Error("UNICRED_API_ID_BENEFICIARIO não configurado");
  }
  if (!UNICRED_COOPERATIVA) {
    throw new Error("UNICRED_API_CODE não configurado");
  }
  if (!UNICRED_API_KEY) {
    throw new Error("UNICRED_API_CLIENTID não configurado");
  }
  if (!UNICRED_USER) {
    throw new Error("UNICRED_API_USER não configurado");
  }
  if (!UNICRED_PASSWORD) {
    throw new Error("UNICRED_API_PASSWORD não configurado");
  }
}

export function validateWebhookConfig(): void {
  if (!UNICRED_WEBHOOK_API_KEY) {
    throw new Error("UNICRED_WEBHOOK_API_KEY não configurado");
  }
  if (!UNICRED_WEBHOOK_SECRET_KEY) {
    throw new Error("UNICRED_WEBHOOK_SECRET_KEY não configurado");
  }
}

export async function getAccessToken(): Promise<string> {
  validateConfig();

  const response = await fetch(`${UNICRED_BASE_URL}/oauth2/v2/grant-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apiKey: UNICRED_API_KEY!,
    },
    body: JSON.stringify({
      nomeUsuario: UNICRED_USER,
      senha: UNICRED_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao autenticar na Unicred: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.accessToken as string;
}

export async function emitirTitulo(
  params: EmitirTituloParams,
): Promise<UnicredTituloResponse> {
  validateConfig();
  const token = await getAccessToken();

  const payload: Record<string, unknown> = {
    beneficiarioVariacaoCarteira: 43,
    seuNumero: params.seuNumero,
    valor: Number(params.valor.toFixed(2)),
    vencimento: params.vencimento,
    indicacaoTituloDescontavel: false,
    indicacaoTituloCaucionavel: false,
    protesto: {
      codigoParaProtesto: "NAO_PROTESTAR",
    },
    negativacao: {
      codigoParaNegativacao: "NAO_NEGATIVAR",
    },
    enviaBoletoEmail: false,
    juros: {
      codigo: "5",
    },
    multa: {
      codigo: "3",
    },
    pagador: {
      nomeRazaoSocial: params.pagador.nomeRazaoSocial,
      tipoPessoa: params.pagador.tipoPessoa,
      tipoDocumento: params.pagador.tipoDocumento,
      numeroDocumento: params.pagador.numeroDocumento,
      nomeFantasia: params.pagador.nomeFantasia,
      email: params.pagador.email,
      endereco: {
        tipoLogradouro: params.pagador.endereco.tipoLogradouro,
        logradouro: params.pagador.endereco.logradouro,
        numero: params.pagador.endereco.numero,
        complemento: params.pagador.endereco.complemento,
        bairro: params.pagador.endereco.bairro,
        cidade: params.pagador.endereco.cidade,
        uf: params.pagador.endereco.uf,
        cep: params.pagador.endereco.cep,
      },
    },
  };

  if (params.nossoNumero) {
    payload.nossoNumero = params.nossoNumero;
  }

  // Remove campos undefined/null para evitar rejeição da API
  const cleanPayload = removeNullUndefined(payload);

  const response = await fetch(
    `${UNICRED_BASE_URL}/cobranca/v2/beneficiarios/${UNICRED_BENEFICIARIO_ID}/titulos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        cooperativa: UNICRED_COOPERATIVA!,
        apiKey: UNICRED_API_KEY!,
      },
      body: JSON.stringify(cleanPayload),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao emitir título na Unicred: ${response.status} - ${error}`);
  }

  const data: UnicredTituloResponse = await response.json();
  return data;
}

export async function consultarStatus(
  idTitulo: string,
): Promise<UnicredStatusResponse> {
  validateConfig();
  const token = await getAccessToken();

  const response = await fetch(
    `${UNICRED_BASE_URL}/cobranca/v2/beneficiarios/${UNICRED_BENEFICIARIO_ID}/titulos/${idTitulo}/status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        Authorization: `Bearer ${token}`,
        cooperativa: UNICRED_COOPERATIVA!,
        apiKey: UNICRED_API_KEY!,
      },
    },
  );

  if (response.status === 202) {
    return { status: "EM_PROCESSAMENTO" };
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao consultar status do título: ${response.status} - ${error}`);
  }

  const data: UnicredStatusResponse = await response.json();
  return data;
}

export function decryptWebhook(
  encryptedPayload: string,
  apiKey: string,
  secretKey: string,
): UnicredWebhookPayload {
  const iv = apiKey.slice(0, 16);
  const key = secretKey.slice(0, 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(iv),
  );
  let decrypted = decipher.update(encryptedPayload, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted) as UnicredWebhookPayload;
}

export function mapWebhookStatus(codigoSituacao: string): string {
  const map: Record<string, string> = {
    "01": "ABERTO",
    "02": "BAIXADO",
    "03": "BAIXADO",
    "04": "BAIXADO",
    "05": "BAIXADO",
    "06": "BAIXADO",
    "07": "BAIXADO",
    "08": "BAIXADO",
    "99": "EM_PROCESSAMENTO",
    "100": "EM_PROCESSAMENTO",
    "101": "REJEITADO",
  };
  return map[codigoSituacao] || "ABERTO";
}

export function formatStatus(status?: string): string {
  const map: Record<string, string> = {
    ABERTO: "Aberto",
    LIQUIDADO: "Liquidado",
    BAIXADO: "Baixado",
    EM_PROCESSAMENTO: "Em processamento",
    REJEITADO: "Rejeitado",
  };
  return map[status || ""] || status || "Desconhecido";
}

function removeNullUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const cleaned = removeNullUndefined(value as Record<string, unknown>);
      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else if (Array.isArray(value)) {
      result[key] = value.filter((v) => v !== null && v !== undefined);
    } else {
      result[key] = value;
    }
  }
  return result;
}
