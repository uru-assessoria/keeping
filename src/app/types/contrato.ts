import { ProdutoContrato } from './produto-contrato';

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
export function sqlToContratoType(json: any): Contrato {
  return {
    id: json.id,
    idCliente: json.id_cliente,
    taxaManutencao: json.valor_plano,
    formalizacao: json.formalizacao,
    vencimento: json.vencimento,
    valorTotal: json.valor_total || 0,
  } as Contrato;
}
export function contratoToSqlType(contrato: Contrato): any {
  return {
    id: contrato.id,
    id_cliente: contrato.idCliente,
    valor_plano: contrato.taxaManutencao,
    formalizacao: contrato.formalizacao,
    valor_total: contrato.valorTotal,

  };
}
