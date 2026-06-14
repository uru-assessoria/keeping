CREATE TABLE "zapsign_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_contrato" integer NOT NULL,
	"document_token" varchar(255) NOT NULL,
	"signer_token" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"email" varchar(255) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"sign_url" text NOT NULL,
	"signed_file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"signed_at" timestamp,
	CONSTRAINT "zapsign_document_document_token_unique" UNIQUE("document_token")
);
--> statement-breakpoint
ALTER TABLE "contrato" ALTER COLUMN "formalizacao" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "produto" ALTER COLUMN "valor" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "contrato" ADD COLUMN "razao_social_cliente" varchar(255);--> statement-breakpoint
ALTER TABLE "contrato" ADD COLUMN "taxa_manutencao" real NOT NULL;--> statement-breakpoint
ALTER TABLE "contrato" ADD COLUMN "valor_total" real NOT NULL;--> statement-breakpoint
ALTER TABLE "contrato" ADD COLUMN "vencimento" date NOT NULL;--> statement-breakpoint
ALTER TABLE "zapsign_document" ADD CONSTRAINT "zapsign_document_id_contrato_contrato_id_fk" FOREIGN KEY ("id_contrato") REFERENCES "public"."contrato"("id") ON DELETE no action ON UPDATE no action;