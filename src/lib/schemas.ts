import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const createClienteSchema = z.object({
  razaoSocial: z.string().min(1).max(255),
  documento: z.string().min(1).max(50),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  razaoSocialRepresentante: z.string().max(255).optional().or(z.literal('')),
  documentoRepresentante: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().max(255),
  endereco: z.string().min(1),
  telefone: z.string().min(1).max(50),
  entidadeJuridica: z.boolean().default(false),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

export const createProdutoSchema = z.object({
  franquia: z.string().min(1).max(255),
  operadora: z.string().min(1).max(100),
  valor: z.coerce.number().positive(),
  portabilidade: z.boolean().default(false),
  descricao: z.string().min(1),
});

export const updateProdutoSchema = createProdutoSchema.partial();

export type CreateProdutoInput = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoInput = z.infer<typeof updateProdutoSchema>;

export const itemContratoSchema = z.object({
  numeroProvisorio: z.string().min(1).max(50),
  idProduto: z.coerce.number().positive(),
});

export const createContratoSchema = z.object({
  idCliente: z.coerce.number().positive(),
  valorPlano: z.coerce.number().positive(),
  formalizacao: z.string().datetime(),
  itens: z.array(itemContratoSchema).default([]),
});

export const updateContratoSchema = z.object({
  idCliente: z.coerce.number().positive().optional(),
  valorPlano: z.coerce.number().positive().optional(),
  formalizacao: z.string().datetime().optional(),
  itens: z.array(itemContratoSchema).optional(),
});

export type CreateContratoInput = z.infer<typeof createContratoSchema>;
export type UpdateContratoInput = z.infer<typeof updateContratoSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
