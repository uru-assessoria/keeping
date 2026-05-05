import { db } from "@/db";
import { cliente, contrato, itemContrato, produto } from "@/db/schema";
import { updateContratoSchema } from "@/lib/schemas";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

function calcularVencimento(
  dataFormalizacao: string | Date,
  entidadeJuridica: boolean | null,
): string {
  const data = new Date(dataFormalizacao);
  const meses = entidadeJuridica ? 24 : 12;
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split("T")[0];
}

async function calcularValorTotal(
  itens: Array<{ idProduto: number }>,
  taxaManutencao: number,
) {
  if (itens.length === 0) return taxaManutencao;

  const produtoIds = Array.from(new Set(itens.map((item) => item.idProduto)));
  const produtosEncontrados = await db
    .select({ id: produto.id, valor: produto.valor })
    .from(produto)
    .where(inArray(produto.id, produtoIds));

  if (produtosEncontrados.length !== produtoIds.length) {
    throw new Error("Produto inválido em itens do contrato");
  }

  const valoresPorProduto = new Map(
    produtosEncontrados.map((item) => [item.id, Number(item.valor)]),
  );

  return itens.reduce((sum, item) => {
    return sum + (valoresPorProduto.get(item.idProduto) ?? 0);
  }, taxaManutencao);
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoId = Number(id);

  const rows = await db
    .select({
      id: contrato.id,
      idCliente: contrato.idCliente,
      taxaManutencao: contrato.taxaManutencao,
      formalizacao: contrato.formalizacao,
      vencimento: contrato.vencimento,
      clienteNome: cliente.razaoSocial,
      razaoSocialCliente: contrato.razaoSocialCliente,
    })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(eq(contrato.id, contratoId));

  if (rows.length === 0)
    return NextResponse.json(
      { error: "Contrato não encontrado" },
      { status: 404 },
    );

  const itens = await db
    .select({
      id: itemContrato.id,
      idContrato: itemContrato.idContrato,
      numeroProvisorio: itemContrato.numeroProvisorio,
      idProduto: itemContrato.idProduto,
    })
    .from(itemContrato)
    .where(eq(itemContrato.idContrato, contratoId));
  console.log("Dados do contrato carregados:", rows[0]);
  return NextResponse.json({ contrato: rows[0], itens });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const contratoId = Number(id);
    const data = updateContratoSchema.parse(body);

    const [existingContrato] = await db
      .select({
        idCliente: contrato.idCliente,
        taxaManutencao: contrato.taxaManutencao,
        formalizacao: contrato.formalizacao,
      })
      .from(contrato)
      .where(eq(contrato.id, contratoId));

    if (!existingContrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 },
      );
    }

    const updatedIdCliente = data.idCliente ?? existingContrato.idCliente;
    const updatedTaxaManutencao =
      data.taxaManutencao ?? Number(existingContrato.taxaManutencao);
    const updatedFormalizacao = data.formalizacao
      ? new Date(data.formalizacao)
      : existingContrato.formalizacao;

    const [clienteAtual] = await db
      .select({
        entidadeJuridica: cliente.entidadeJuridica,
        razaoSocial: cliente.razaoSocial,
      })
      .from(cliente)
      .where(eq(cliente.id, updatedIdCliente));

    if (!clienteAtual) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 400 },
      );
    }

    const itensParaCalculo = data.itens
      ? data.itens.map((item) => ({ idProduto: item.idProduto }))
      : (
          await db
            .select({ idProduto: itemContrato.idProduto })
            .from(itemContrato)
            .where(eq(itemContrato.idContrato, contratoId))
        ).map((item) => ({ idProduto: item.idProduto }));

    const valorTotal = await calcularValorTotal(
      itensParaCalculo,
      updatedTaxaManutencao,
    );
    const vencimento = calcularVencimento(
      updatedFormalizacao,
      clienteAtual.entidadeJuridica,
    );

    await db
      .update(contrato)
      .set({
        idCliente: updatedIdCliente,
        taxaManutencao: updatedTaxaManutencao,
        formalizacao: updatedFormalizacao,
        vencimento: new Date(vencimento),
        valorTotal,
        razaoSocialCliente: clienteAtual.razaoSocial,
      })
      .where(eq(contrato.id, contratoId));

    if (data.itens) {
      await db
        .delete(itemContrato)
        .where(eq(itemContrato.idContrato, contratoId));

      if (data.itens.length > 0) {
        await db.insert(itemContrato).values(
          data.itens.map((item) => ({
            idContrato: contratoId,
            numeroProvisorio: item.numeroProvisorio,
            idProduto: item.idProduto,
          })),
        );
      }
    }

    return NextResponse.json({ message: "Contrato atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar contrato",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoId = Number(id);

  await db.delete(itemContrato).where(eq(itemContrato.idContrato, contratoId));
  await db.delete(contrato).where(eq(contrato.id, contratoId));

  return NextResponse.json({ message: "Contrato excluído com sucesso" });
}
