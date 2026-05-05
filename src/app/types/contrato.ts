import { ProdutoContrato } from "./produto-contrato";

export type Contrato = {
  id: number;
  idCliente: number;
  taxaManutencao: number;
  formalizacao: string;
  vencimento?: string;
  valorTotal: number;
};

export type ContratoItens = {
  id: number;
  contrato: Contrato;
  itens: ProdutoContrato[];
};
