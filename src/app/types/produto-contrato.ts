export type ProdutoContrato = {
  id: number;
  idContrato: number;
  numeroProvisorio: string;
  idProduto: number;
};

export function sqlToProdutoContratoType(json: any): ProdutoContrato {
  return {
    id: json.id,
    idContrato: json.id_contrato,
    numeroProvisorio: json.numero_provisorio,
    idProduto: json.id_produto,
  } as ProdutoContrato;
}

export function produtoContratoToSqlType(
  produtoContrato: ProdutoContrato,
): any {
  return {
    id: produtoContrato.id,
    id_contrato: produtoContrato.idContrato,
    numero_provisorio: produtoContrato.numeroProvisorio,
    id_produto: produtoContrato.idProduto,
  };
}
