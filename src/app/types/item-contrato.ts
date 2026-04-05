export type ItemContrato = {
  id: number;
  idContrato: number;
  numeroProvisorio: string;
  franquia: string;
  operadora: string;
  valor: number;
  portabilidade: string;
};
export function sqlToContratoType(json: any): ItemContrato {
  return {
    id: json.id,
    idContrato: json.id_contrato,
    numeroProvisorio: json.numero_provisorio,
    franquia: json.franquia,
    operadora: json.operadora,
    valor: json.valor,
    portabilidade: json.portabilidade,
  } as ItemContrato;
}
export function contratoToSqlType(itemContrato: ItemContrato): any {
  return {
    id: itemContrato.id,
    id_contrato: itemContrato.idContrato,
    numero_provisorio: itemContrato.numeroProvisorio,
    franquia: itemContrato.franquia,
    operadora: itemContrato.operadora,
    valor: itemContrato.valor,
    portabilidade: itemContrato.portabilidade,
  };
}
