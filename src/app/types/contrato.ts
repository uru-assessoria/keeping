import { ProdutoContrato } from './produto-contrato';

export type Contrato = {
  id: number;
  idCliente: number;
  valorPlano: number;
  formalizacao: string;
  vencimento?: string;
};
export type ContratoItens = {
  id: number;
  contrato: Contrato;
  itens: ProdutoContrato[];
};
export function sqlToContratoType(json: any): Contrato {
  return {
    id: json.id,
    idCliente: json.id_cliente,
    valorPlano: json.valor_plano,
    formalizacao: json.formalizacao,
    vencimento: json.vencimento,
  } as Contrato;
}
export function contratoToSqlType(contrato: Contrato): any {
  return {
    id: contrato.id,
    id_cliente: contrato.idCliente,
    valor_plano: contrato.valorPlano,
    formalizacao: contrato.formalizacao,
  };
}
