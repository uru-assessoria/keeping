import { ProdutoContrato } from "./produto-contrato";

export type Contrato = {
  id: number;
  idCliente: number;
  razaoSocialCliente: string;
  taxaManutencao: number;
  formalizacao: string;
  valorTotal: number;
  vencimento?: string;
  status:"pending" | "signed" | "rejected";
  zapsignDocumentToken?: string;
};

export type ContratoItens = {
  id: number;
  contrato: Contrato;
  itens: ProdutoContrato[];
};
