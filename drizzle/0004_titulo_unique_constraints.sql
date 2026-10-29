-- Anti-duplicata de emissão (contrato + mês de referência) e de seu_numero,
-- substituindo a verificação SELECT-then-INSERT sujeita a race condition.
CREATE UNIQUE INDEX "titulo_contrato_mes_unique" ON "titulo" ("id_contrato", "referencia_mes") WHERE "id_contrato" IS NOT NULL;
CREATE UNIQUE INDEX "titulo_seu_numero_unique" ON "titulo" ("seu_numero");

-- A linha digitável padrão Febraban tem 47 dígitos (48 para guia de
-- arrecadação); a coluna estava em 46 e causava "value too long".
ALTER TABLE "titulo" ALTER COLUMN "linha_digitavel" TYPE varchar(48);
