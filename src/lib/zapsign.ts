const ZAPSIGN_API_URL = "https://api.zapsign.com.br/api/v1";
const ZAPSIGN_API_KEY = process.env.ZAPSIGN_APIKEY;
const ZAPSIGN_CELLPHONENUMBER_TEST = process.env.ZAPSIGN_CELLPHONENUMBER_TEST;
const ZAPSIGN_EMAIL_TEST = process.env.ZAPSIGN_EMAIL_TEST;
const ZAPSIGN_ADM_NAME = process.env.ZAPSIGN_ADM_NAME;
const ZAPSIGN_ADM_EMAIL = process.env.ZAPSIGN_ADM_EMAIL;
const ZAPSIGN_ADM_PHONE = process.env.ZAPSIGN_ADM_PHONE;
export interface SubmitSignatureParams {
  pdfBase64: string;
  documentName: string;
  signerEmail: string;
  signerName: string;
  signerPhone?: string;
}

export interface ZapsignDocument {
  open_id: number;
  token: string;
  status: string;
  name: string;
  original_file: string;
  signed_file: string | null;
  created_at: string;
  last_update_at: string;
  signers: Array<{
    token: string;
    sign_url: string;
    status: string;
    name: string;
    email: string;
    phone_country: string;
    phone_number: string;
    signed_at: string | null;
  }>;
}

/**
 * Validates that the Zapsign API keys are configured
 */
export function validateApiKey(): void {
  if (!ZAPSIGN_API_KEY) {
    throw new Error(
      "ZAPSIGN_APIKEY not configured in environment variables"
    );
  }
  if (!ZAPSIGN_CELLPHONENUMBER_TEST) {
    throw new Error(
      "ZAPSIGN_CELLPHONENUMBER_TEST not configured in environment variables"
    );
  }
  if (!ZAPSIGN_EMAIL_TEST) {
    throw new Error(
      "ZAPSIGN_EMAIL_TEST not configured in environment variables"
    );
  }
}

/**
 * Submits a document for signature via Zapsign API
 */
export async function submitForSignature(
  params: SubmitSignatureParams
): Promise<ZapsignDocument> {
  validateApiKey();

  const { pdfBase64, documentName, signerEmail, signerPhone, signerName } = params;

  // Extract phone number from ZAPSIGN_CELLPHONENUMBER_TEST
  // Format: +5548999593343 -> 48999593343
  const phoneNumber = signerPhone!.replace(/[^0-9]/g, "");
  const phoneCountry = "55";
  const email = signerEmail;

  const payload = {
    name: documentName,
    base64_pdf: pdfBase64,
    signers: [
      {
        name: signerName,
        email: email,
        phone_country: phoneCountry,
        phone_number: phoneNumber,
        send_automatic_email: true,
        send_automatic_whatsapp: true,
        //sandbox:true
      },
      {
        name: ZAPSIGN_ADM_NAME,
        email: ZAPSIGN_ADM_EMAIL,
        phone_country: phoneCountry,
        phone_number: ZAPSIGN_ADM_PHONE,
        send_automatic_email: true,
        send_automatic_whatsapp: true,
        //sandbox:true
      },
    ],
  };

  const response = await fetch(`${ZAPSIGN_API_URL}/docs/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZAPSIGN_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('error',await response.text());
    const error = await response.json();
    console.error('error',error);
    throw new Error(
      `Zapsign API error: ${response.status} - ${JSON.stringify(error)}`
    );
  }

  const data: ZapsignDocument = await response.json();
  return data;
}

/**
 * Gets the current status of a document from Zapsign
 */
export async function getDocumentStatus(
  documentToken: string
): Promise<ZapsignDocument> {
  validateApiKey();

  const response = await fetch(`${ZAPSIGN_API_URL}/docs/${documentToken}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ZAPSIGN_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Zapsign API error: ${response.status} - ${JSON.stringify(error)}`
    );
  }

  const data: ZapsignDocument = await response.json();
  return data;
}

/**
 * Formats the document status for UI display
 */
export function formatDocumentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pendente de Assinatura",
    completed: "Assinado",
    signed: "Assinado",
    cancelled: "Cancelado",
    rejected: "Rejeitado",
  };

  return statusMap[status] || status;
}

/**
 * Checks if a document is fully signed
 */
export function isDocumentSigned(document: ZapsignDocument): boolean {
  return (
    document.status === "completed" ||
    document.status === "signed" ||
    (document.signers && document.signers.every((s) => s.signed_at))
  );
}
