export type Contrato = {
  id: number;
  idCliente: number;
  valorPlano: number;
};
export function sqlToContratoType(json: any): Contrato {
  return {
    id: json.id,
    idCliente: json.id_cliente,
    valorPlano: json.valor_plano,
  } as Contrato;
}
export function contratoToSqlType(contrato: Contrato): any {
  return {
    id: contrato.id,
    id_cliente: contrato.idCliente,
    valor_plano: contrato.valorPlano,
  };
}
