export type Cliente = {
  id: number;
  razaoSocial: string;
  documento: string;
  dataNascimento: string;
  razaoSocialRepresentante: string;
  documentoRepresentante: string;
  email: string;
  endereco: string;
  telefone: string;
  ativo: boolean;
  entidadeJuridica: boolean;
};
export function sqlToClienteType(json: any): Cliente {
  return {
    id: json.id,
    razaoSocial: json.razao_social,
    documento: json.documento,
    dataNascimento: json.data_nascimento,
    razaoSocialRepresentante: json.razao_social_representante,
    documentoRepresentante: json.documento_representante,
    email: json.email,
    endereco: json.endereco,
    telefone: json.telefone,
    ativo: json.ativo,
    entidadeJuridica: json.entidade_juridica,
  } as Cliente;
}
export function clienteToSqlType(cliente: Cliente): any {
  return {
    id: cliente.id,
    razao_social: cliente.razaoSocial,
    documento: cliente.documento,
    data_nascimento: cliente.dataNascimento,
    razao_social_representante: cliente.razaoSocialRepresentante,
    documento_representante: cliente.documentoRepresentante,
    email: cliente.email,
    endereco: cliente.endereco,
    telefone: cliente.telefone,
    ativo: cliente.ativo,
    entidade_juridica: cliente.entidadeJuridica,
  };
}
