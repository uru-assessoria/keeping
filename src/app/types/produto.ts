export type Produto = {
  id: number;
  franquia: string;
  operadora: string;
  valor: number;
  portabilidade: boolean;
  descricao: string;
};

export function sqlToProdutoType(json: any): Produto {
  return {
    id: json.id,
    franquia: json.franquia,
    operadora: json.operadora,
    valor: json.valor,
    portabilidade: json.portabilidade,
    descricao: json.descricao,
  } as Produto;
}

export function produtoToSqlType(produto: Produto): any {
  return {
    id: produto.id,
    franquia: produto.franquia,
    operadora: produto.operadora,
    valor: produto.valor,
    portabilidade: produto.portabilidade,
    descricao: produto.descricao,
  };
}
