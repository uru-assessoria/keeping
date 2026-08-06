"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar.component";
import { STYLE } from "@/app/config/style.consts";
import { Titulo } from "@/app/types/titulo";

interface PaginatedTitulos {
  data: Titulo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "EM_PROCESSAMENTO", label: "Em processamento" },
  { value: "ABERTO", label: "Aberto" },
  { value: "LIQUIDADO", label: "Liquidado" },
  { value: "BAIXADO", label: "Baixado" },
  { value: "REJEITADO", label: "Rejeitado" },
];

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

function corStatus(status?: string | null): string {
  switch (status) {
    case "ABERTO":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "LIQUIDADO":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "BAIXADO":
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";
    case "REJEITADO":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  }
}

export default function TitulosPage() {
  const [result, setResult] = useState<PaginatedTitulos>({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [referenciaMes, setReferenciaMes] = useState("");
  const [loadingStatus, setLoadingStatus] = useState<number | null>(null);

  const load = (page = 1, limit = 20, q = "", status = "", mes = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("search", q);
    if (status) params.set("status", status);
    if (mes) params.set("referenciaMes", mes);

    fetch(`/api/titulos?${params}`)
      .then((res) => res.json())
      .then(setResult);
  };

  useEffect(() => {
    load(1, 20, debouncedSearch, statusFilter, referenciaMes);
  }, [debouncedSearch, statusFilter, referenciaMes]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Polling a cada 30s para atualizar status (complementa o webhook)
  useEffect(() => {
    const interval = setInterval(() => {
      load(result.meta.page, result.meta.limit, debouncedSearch, statusFilter, referenciaMes);
    }, 30000);
    return () => clearInterval(interval);
  }, [result.meta.page, result.meta.limit, debouncedSearch, statusFilter, referenciaMes]);

  async function handleRefreshStatus(id: number) {
    try {
      setLoadingStatus(id);
      const res = await fetch(`/api/titulos/${id}/status`);
      if (!res.ok) throw new Error("Falha ao consultar status");
      load(result.meta.page, result.meta.limit, debouncedSearch, statusFilter, referenciaMes);
    } catch (error) {
      alert("Erro ao consultar status: " + (error instanceof Error ? error.message : ""));
    } finally {
      setLoadingStatus(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Confirmar exclusão deste título?")) return;
    const res = await fetch(`/api/titulos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setResult((prev) => ({
        ...prev,
        data: prev.data.filter((t) => t.id !== id),
      }));
    } else {
      alert("Falha ao excluir título");
    }
  }

  const { data: titulos, meta } = result;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Títulos de Cobrança</h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={STYLE.INPUT}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={STYLE.INPUT}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="month"
            placeholder="Mês de referência"
            value={referenciaMes}
            onChange={(e) => setReferenciaMes(e.target.value)}
            className={STYLE.INPUT}
          />
        </div>

        <ul className="w-full space-y-4">
          {titulos.map((titulo) => (
            <li
              key={titulo.id}
              className="rounded border border-border p-4 bg-surface-variant">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {titulo.clienteNome || `Contrato #${titulo.idContrato}`}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${corStatus(
                        titulo.status,
                      )}`}>
                      {formatarStatus(titulo.status)}
                    </span>
                    {titulo.statusUnicred && titulo.statusUnicred !== titulo.status && (
                      <span className="text-xs text-muted">
                        Unicred: {titulo.statusUnicred}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    Seu número: {titulo.seuNumero}
                  </p>
                  <p className="text-sm text-muted">
                    Mês de referência: {titulo.referenciaMes}
                  </p>
                  <p className="text-sm text-muted font-semibold">
                    Valor: R$ {Number(titulo.valor).toFixed(2)}
                  </p>
                  {titulo.nossoNumero && (
                    <p className="text-sm text-muted">
                      Nosso número: {titulo.nossoNumero}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRefreshStatus(titulo.id)}
                    disabled={loadingStatus === titulo.id}
                    className={`${STYLE.BUTTON} ${loadingStatus === titulo.id ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {loadingStatus === titulo.id ? "Atualizando..." : "Atualizar status"}
                  </button>
                  <Link href={`/titulos/${titulo.id}`} className={STYLE.BUTTON}>
                    Detalhes
                  </Link>
                  <button
                    onClick={() => handleDelete(titulo.id)}
                    className={STYLE.BUTTON_DESTRUCTIVE}>
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {titulos.length === 0 && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 mt-8">
            Nenhum título cadastrado
          </p>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => load(meta.page - 1, meta.limit, debouncedSearch, statusFilter, referenciaMes)}
              disabled={meta.page <= 1}
              className={`${STYLE.BUTTON} ${meta.page <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
              Anterior
            </button>
            <span className="text-sm text-muted">
              Página {meta.page} de {meta.totalPages} ({meta.total} total)
            </span>
            <button
              onClick={() => load(meta.page + 1, meta.limit, debouncedSearch, statusFilter, referenciaMes)}
              disabled={meta.page >= meta.totalPages}
              className={`${STYLE.BUTTON} ${meta.page >= meta.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}>
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
