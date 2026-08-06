CREATE TABLE "titulo" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_contrato" integer NOT NULL,
	"id_unicred" varchar(255),
	"seu_numero" varchar(15) NOT NULL,
	"valor" real NOT NULL,
	"vencimento" date NOT NULL,
	"status" varchar(50) DEFAULT 'EM_PROCESSAMENTO' NOT NULL,
	"status_unicred" varchar(50),
	"referencia_mes" varchar(7) NOT NULL,
	"codigo_barras" varchar(44),
	"linha_digitavel" varchar(46),
	"nosso_numero" varchar(11),
	"qr_code_pix" text,
	"data_criacao" timestamp DEFAULT now() NOT NULL,
	"data_atualizacao" timestamp DEFAULT now() NOT NULL,
	"idempotencia_webhook" varchar(255),
	"mensagem_erro" text
);
--> statement-breakpoint
ALTER TABLE "titulo" ADD CONSTRAINT "titulo_id_contrato_contrato_id_fk" FOREIGN KEY ("id_contrato") REFERENCES "public"."contrato"("id") ON DELETE no action ON UPDATE no action;