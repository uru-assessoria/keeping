"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar.component";
import { STYLE } from "@/app/config/style.consts";
import { Cliente } from "../types/cliente";
import { Produto } from "../types/produto";
import { ContratoItens } from "../types/contrato";
import { generateContrato } from "../config/document.const";

type ContratoListItem = {
  id: number;
  idCliente: number;
  valorPlano: number;
  clienteNome: string;
};

interface PaginatedContratos {
  data: ContratoListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ContratosPage() {
  const [result, setResult] = useState<PaginatedContratos>({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const load = (page = 1, limit = 20, q = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("search", q);
    fetch(`/api/contratos?${params}`)
      .then((res) => {
        return res.json();
      })
      .then(setResult);
  };

  useEffect(() => {
    load(1, 20, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleDelete(id: number) {
    if (!confirm("Confirmar exclusão deste contrato?")) return;
    const res = await fetch(`/api/contratos/${id}`, { method: "DELETE" });
    if (res.ok)
      setResult((prev) => ({
        ...prev,
        data: prev.data.filter((c) => c.id !== id),
      }));
    else alert("Falha ao excluir contrato");
  }

  const opt = {
    margin: 1,
    filename: "myfile.pdf",
    pagebreak: { mode: ["css"] },
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: "cm", format: "a4", orientation: "portrait" as const },
  };

  async function printContrato(contrato: ContratoListItem) {
    const { default: html2pdf } = await import("html2pdf.js");
    Promise.all([
      fetch(`/api/clientes/${contrato.idCliente}`).then((res) => res.json()),
      fetch(`/api/contratos/${contrato.id}`).then((res) => res.json()),
      fetch("/api/produtos").then((res) => res.json()),
    ]).then((results) => {
      const [clienteData, contratoData, produtosData] = results;
      const element = document?.createElement("div");
      element.id = "pdf-content";
      element.innerHTML = generateContrato(
        contratoData as ContratoItens,
        clienteData as Cliente,
        (produtosData.data || produtosData) as Produto[],
      );

      html2pdf().set(opt).from(element).save();
    });
  }

  const { data: contratos, meta } = result;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Contratos</h1>
          <Link href="/contratos/new" className={STYLE.BUTTON}>
            Novo contrato
          </Link>
        </header>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar contrato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={STYLE.INPUT}
          />
        </div>

        <ul className="w-full space-y-4">
          {contratos.map((contrato) => (
            <li
              key={contrato.id}
              className="rounded border border-border p-4 bg-surface-variant"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {contrato.clienteNome}
                  </p>
                  <p className="text-sm text-muted">
                    Valor do plano: R${" "}
                    {parseFloat(contrato.valorPlano + "").toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => printContrato(contrato)}
                    className={STYLE.BUTTON}
                  >
                    Imprimir
                  </button>
                  <Link
                    href={`/contratos/${contrato.id}`}
                    className={STYLE.BUTTON}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(contrato.id)}
                    className={STYLE.BUTTON_DESTRUCTIVE}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {contratos.length === 0 && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 mt-8">
            Nenhum contrato cadastrado
          </p>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => load(meta.page - 1, meta.limit, debouncedSearch)}
              disabled={meta.page <= 1}
              className={`${STYLE.BUTTON} ${meta.page <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Anterior
            </button>
            <span className="text-sm text-muted">
              Página {meta.page} de {meta.totalPages} ({meta.total} total)
            </span>
            <button
              onClick={() => load(meta.page + 1, meta.limit, debouncedSearch)}
              disabled={meta.page >= meta.totalPages}
              className={`${STYLE.BUTTON} ${meta.page >= meta.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
