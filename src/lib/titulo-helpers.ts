import { Pagador } from "@/lib/unicred";

export function limparDocumento(documento: string): string {
  return documento.replace(/\D/g, "");
}

export function ultimoDiaDoMes(referenciaMes: string): string {
  const [ano, mes] = referenciaMes.split("-").map(Number);
  // Date.UTC evita o desvio de 1 dia que new Date(ano, mes, 0) + toISOString()
  // (local -> UTC) pode causar em fusos negativos (ex. horário de Brasília).
  const data = new Date(Date.UTC(ano, mes, 0));
  return data.toISOString().split("T")[0];
}

// Ordem de progressão dos status de título. Usada para impedir que uma
// consulta de status (polling) desfaça um status mais avançado já aplicado
// por webhook (ex.: polling atrasado trazendo EM_PROCESSAMENTO depois de um
// LIQUIDADO já confirmado).
const STATUS_RANK: Record<string, number> = {
  EM_PROCESSAMENTO: 0,
  ABERTO: 1,
  LIQUIDADO: 2,
  BAIXADO: 2,
  REJEITADO: 2,
  CANCELADO: 2,
};

export function deveAplicarNovoStatus(statusAtual: string, novoStatus: string): boolean {
  const atual = STATUS_RANK[statusAtual] ?? 0;
  const novo = STATUS_RANK[novoStatus] ?? 0;
  return novo >= atual;
}

export function gerarSeuNumero(idContrato: number, referenciaMes: string): string {
  const numero = `C${idContrato}-${referenciaMes.replace("-", "")}`;
  return numero.slice(0, 15);
}

export function gerarSeuNumeroManual(idCliente: number): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const numero = `M${idCliente}-${timestamp}`;
  return numero.slice(0, 15);
}

export function parseEndereco(endereco: string) {
  const padrao = /^(.*?),?\s*(\d+)\s*-?\s*(.*?)\s*-?\s*(.*?)\s*-\s*([A-Z]{2})\s*(\d{8})?$/i;
  const match = endereco.match(padrao);

  if (match) {
    return {
      logradouro: match[1]?.trim() || endereco,
      numero: match[2]?.trim() || "0",
      bairro: match[3]?.trim() || "Centro",
      cidade: match[4]?.trim() || "Cidade",
      uf: match[5]?.toUpperCase() || "SP",
      cep: limparDocumento(match[6] || "00000000"),
    };
  }

  return {
    logradouro: endereco,
    numero: "0",
    bairro: "Centro",
    cidade: "Cidade",
    uf: "SP",
    cep: "00000000",
  };
}

export interface ClientePagador {
  razaoSocial: string;
  documento: string;
  email: string;
  endereco: string;
  entidadeJuridica: boolean;
  razaoSocialRepresentante: string | null;
}

export function montarPagador(cliente: ClientePagador): Pagador {
  const documento = limparDocumento(cliente.documento);
  const tamanhoEsperado = cliente.entidadeJuridica ? 14 : 11;
  if (documento.length !== tamanhoEsperado) {
    throw new Error(
      `${cliente.entidadeJuridica ? "CNPJ" : "CPF"} do cliente "${cliente.razaoSocial}" inválido: esperado ${tamanhoEsperado} dígitos, recebido ${documento.length}`,
    );
  }

  const endereco = parseEndereco(cliente.endereco);

  return {
    nomeRazaoSocial: cliente.razaoSocial,
    tipoPessoa: cliente.entidadeJuridica ? "J" : "F",
    tipoDocumento: cliente.entidadeJuridica ? "CNPJ" : "CPF",
    numeroDocumento: documento,
    nomeFantasia: cliente.entidadeJuridica
      ? cliente.razaoSocialRepresentante || cliente.razaoSocial
      : undefined,
    email: cliente.email,
    endereco: {
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      cep: endereco.cep,
    },
  };
}
