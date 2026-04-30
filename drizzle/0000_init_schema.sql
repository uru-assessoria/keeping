CREATE TABLE "cliente" (
	"id" serial PRIMARY KEY NOT NULL,
	"razao_social" varchar(255) NOT NULL,
	"documento" varchar(50) NOT NULL,
	"data_nascimento" date NOT NULL,
	"razao_social_representante" varchar(255),
	"documento_representante" varchar(50),
	"email" varchar(255) NOT NULL,
	"endereco" text NOT NULL,
	"telefone" varchar(50) NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"entidade_juridica" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contrato" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_cliente" integer NOT NULL,
	"valor_plano" numeric(10, 2) NOT NULL,
	"formalizacao" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_contrato" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_contrato" integer NOT NULL,
	"numero_provisorio" varchar(50) NOT NULL,
	"id_produto" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto" (
	"id" serial PRIMARY KEY NOT NULL,
	"franquia" varchar(255) NOT NULL,
	"operadora" varchar(100) NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"portabilidade" boolean DEFAULT false NOT NULL,
	"descricao" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" varchar(255) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "usuario_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_id_cliente_cliente_id_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_contrato" ADD CONSTRAINT "item_contrato_id_contrato_contrato_id_fk" FOREIGN KEY ("id_contrato") REFERENCES "public"."contrato"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_contrato" ADD CONSTRAINT "item_contrato_id_produto_produto_id_fk" FOREIGN KEY ("id_produto") REFERENCES "public"."produto"("id") ON DELETE no action ON UPDATE no action;