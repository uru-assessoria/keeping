import { ProdutoContrato } from './produto-contrato';

export type Contrato = {
  id: number;
  idCliente: number;
  valorPlano: number;
  formalizacao: string;
};

export type ContratoItens = {
  id: number;
  contrato: Contrato;
  itens: ProdutoContrato[];
};
