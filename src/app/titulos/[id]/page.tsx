"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar.component";
import { STYLE } from "@/app/config/style.consts";
import { TituloDetalhe } from "@/app/types/titulo";

function formatarStatus(status?: string | null): string {
  const map: Record<string, string> = {
    EM_PROCESSAMENTO: "Em processamento",
    ABERTO: "Aberto",
    LIQUIDADO: "Liquidado",
    BAIXADO: "Baixado",
    REJEITADO: "Rejeitado",
  };
  return map[status || ""] || status || "Desconhecido";
}

export default function TituloDetalhePage() {
  const params = useParams();
  const id = Number(params?.id);
  const [titulo, setTitulo] = useState<TituloDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/titulos/${id}`);
      if (!res.ok) throw new Error("Título não encontrado");
      const data = await res.json();
      setTitulo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar título");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefreshStatus() {
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/titulos/${id}/status`);
      if (!res.ok) throw new Error("Falha ao consultar status");
      await load();
    } catch (err) {
      alert("Erro ao consultar status: " + (err instanceof Error ? err.message : ""));
    } finally {
      setLoadingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className={STYLE.PAGE}>
        <Sidebar />
        <main className={STYLE.MAIN}>Carregando...</main>
      </div>
    );
  }

  if (error || !titulo) {
    return (
      <div className={STYLE.PAGE}>
        <Sidebar />
        <main className={STYLE.MAIN}>
          <p className="text-red-600">{error || "Título não encontrado"}</p>
          <Link href="/titulos" className={STYLE.BUTTON}>
            Voltar
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Detalhes do Título</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshStatus}
              disabled={loadingStatus}
              className={`${STYLE.BUTTON} ${loadingStatus ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loadingStatus ? "Atualizando..." : "Atualizar status"}
            </button>
            <Link href="/titulos" className={STYLE.BUTTON}>
              Voltar
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded border border-border p-4 bg-surface-variant">
            <h2 className="text-lg font-semibold mb-4">Dados do Título</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {formatarStatus(titulo.status)}
              </p>
              {titulo.statusUnicred && titulo.statusUnicred !== titulo.status && (
                <p>
                  <span className="font-medium">Status Unicred:</span>{" "}
                  {titulo.statusUnicred}
                </p>
              )}
              <p>
                <span className="font-medium">Seu número:</span> {titulo.seuNumero}
              </p>
              <p>
                <span className="font-medium">Mês de referência:</span>{" "}
                {titulo.referenciaMes}
              </p>
              <p>
                <span className="font-medium">Valor:</span> R${" "}
                {Number(titulo.valor).toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Vencimento:</span>{" "}
                {new Date(titulo.vencimento).toLocaleDateString("pt-BR")}
              </p>
              {titulo.nossoNumero && (
                <p>
                  <span className="font-medium">Nosso número:</span> {titulo.nossoNumero}
                </p>
              )}
              {titulo.idUnicred && (
                <p>
                  <span className="font-medium">ID Unicred:</span> {titulo.idUnicred}
                </p>
              )}
              {titulo.codigoBarras && (
                <p className="break-all">
                  <span className="font-medium">Código de barras:</span> {titulo.codigoBarras}
                </p>
              )}
              {titulo.linhaDigitavel && (
                <p className="break-all">
                  <span className="font-medium">Linha digitável:</span> {titulo.linhaDigitavel}
                </p>
              )}
              {titulo.qrCodePix && (
                <p className="break-all">
                  <span className="font-medium">QR Code PIX:</span> {titulo.qrCodePix}
                </p>
              )}
              {titulo.mensagemErro && (
                <p className="text-red-600">
                  <span className="font-medium">Erro:</span> {titulo.mensagemErro}
                </p>
              )}
            </div>
          </section>

          <section className="rounded border border-border p-4 bg-surface-variant">
            <h2 className="text-lg font-semibold mb-4">Contrato e Cliente</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Contrato:</span> #{titulo.contrato.id}
              </p>
              <p>
                <span className="font-medium">Cliente:</span> {titulo.cliente.razaoSocial}
              </p>
              <p>
                <span className="font-medium">Documento:</span> {titulo.cliente.documento}
              </p>
              <p>
                <span className="font-medium">Email:</span> {titulo.cliente.email}
              </p>
              <p>
                <span className="font-medium">Telefone:</span> {titulo.cliente.telefone}
              </p>
              <p>
                <span className="font-medium">Valor total do contrato:</span> R${" "}
                {Number(titulo.contrato.valorTotal).toFixed(2)}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
