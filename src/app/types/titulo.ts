export type Titulo = {
  id: number;
  idContrato: number;
  idUnicred: string | null;
  seuNumero: string;
  valor: number;
  vencimento: string;
  status: string;
  statusUnicred: string | null;
  referenciaMes: string;
  codigoBarras: string | null;
  linhaDigitavel: string | null;
  nossoNumero: string | null;
  qrCodePix: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  mensagemErro: string | null;
  clienteNome?: string | null;
};

export type TituloDetalhe = Titulo & {
  contrato: {
    id: number;
    status: string;
    valorTotal: number;
    formalizacao: string;
    vencimento: string;
  };
  cliente: {
    razaoSocial: string;
    documento: string;
    email: string;
    telefone: string;
  };
};
