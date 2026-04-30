import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const cliente = pgTable('cliente', {
  id: serial('id').primaryKey(),
  razaoSocial: varchar('razao_social', { length: 255 }).notNull(),
  documento: varchar('documento', { length: 50 }).notNull(),
  dataNascimento: date('data_nascimento').notNull(),
  razaoSocialRepresentante: varchar('razao_social_representante', { length: 255 }),
  documentoRepresentante: varchar('documento_representante', { length: 50 }),
  email: varchar('email', { length: 255 }).notNull(),
  endereco: text('endereco').notNull(),
  telefone: varchar('telefone', { length: 50 }).notNull(),
  ativo: boolean('ativo').notNull().default(true),
  entidadeJuridica: boolean('entidade_juridica').notNull().default(false),
});

export const clienteRelations = relations(cliente, ({ many }) => ({
  contratos: many(contrato),
}));

export const contrato = pgTable('contrato', {
  id: serial('id').primaryKey(),
  idCliente: integer('id_cliente')
    .notNull()
    .references(() => cliente.id),
  valorPlano: real('valor_plano').notNull(),
  formalizacao: timestamp('formalizacao', { mode: 'date' }).notNull(),
});

export const contratoRelations = relations(contrato, ({ one, many }) => ({
  cliente: one(cliente, {
    fields: [contrato.idCliente],
    references: [cliente.id],
  }),
  itens: many(itemContrato),
}));

export const itemContrato = pgTable('item_contrato', {
  id: serial('id').primaryKey(),
  idContrato: integer('id_contrato')
    .notNull()
    .references(() => contrato.id),
  numeroProvisorio: varchar('numero_provisorio', { length: 50 }).notNull(),
  idProduto: integer('id_produto')
    .notNull()
    .references(() => produto.id),
});

export const itemContratoRelations = relations(itemContrato, ({ one }) => ({
  contrato: one(contrato, {
    fields: [itemContrato.idContrato],
    references: [contrato.id],
  }),
  produto: one(produto, {
    fields: [itemContrato.idProduto],
    references: [produto.id],
  }),
}));

export const produto = pgTable('produto', {
  id: serial('id').primaryKey(),
  franquia: varchar('franquia', { length: 255 }).notNull(),
  operadora: varchar('operadora', { length: 100 }).notNull(),
  valor: real('valor').notNull(),
  portabilidade: boolean('portabilidade').notNull().default(false),
  descricao: text('descricao').notNull(),
});

export const produtoRelations = relations(produto, ({ many }) => ({
  itens: many(itemContrato),
}));

export const usuario = pgTable('usuario', {
  id: serial('id').primaryKey(),
  login: varchar('login', { length: 255 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
  admin: boolean('admin').notNull().default(false),
  ativo: boolean('ativo').notNull().default(true),
});
