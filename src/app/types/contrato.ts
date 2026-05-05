import { ProdutoContrato } from "./produto-contrato";

export type Contrato = {
  id: number;
  idCliente: number;
  razaoSocialClietne: string;
  taxaManutencao: number;
  formalizacao: string;
  valorTotal: number;
  vencimento?: string;
};

export type ContratoItens = {
  id: number;
  contrato: Contrato;
  itens: ProdutoContrato[];
};
