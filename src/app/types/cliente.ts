export type Cliente = {
  id: number;
  razaoSocial: string;
  documento: string;
  dataNascimento: string;
  razaoSocialRepresentante: string | null;
  documentoRepresentante: string | null;
  email: string;
  endereco: string;
  telefone: string;
  ativo: boolean;
  entidadeJuridica: boolean;
};
