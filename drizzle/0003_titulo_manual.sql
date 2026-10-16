ALTER TABLE "titulo" ALTER COLUMN "id_contrato" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "titulo" ADD COLUMN "id_cliente" integer;
--> statement-breakpoint
ALTER TABLE "titulo" ADD COLUMN "origem" varchar(20) DEFAULT 'CONTRATO' NOT NULL;
--> statement-breakpoint
ALTER TABLE "titulo" ADD COLUMN "descricao" text;
--> statement-breakpoint
UPDATE "titulo" t
SET "id_cliente" = c."id_cliente"
FROM "contrato" c
WHERE t."id_contrato" = c."id"
  AND t."id_cliente" IS NULL;
--> statement-breakpoint
ALTER TABLE "titulo" ALTER COLUMN "id_cliente" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "titulo" ADD CONSTRAINT "titulo_id_cliente_cliente_id_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id") ON DELETE no action ON UPDATE no action;
