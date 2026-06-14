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
  taxaManutencao: number;
  clienteNome: string;
  valorTotal: number;
  vencimento: string;
  status: string;
  zapsignDocumentToken: string | null;
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
  const [submittingIds, setSubmittingIds] = useState<Set<number>>(new Set());

  const load = (page = 1, limit = 20, q = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("search", q);
    fetch(`/api/contratos?${params}`)
      .then((res) => res.json())
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

  async function handleSubmitSignature(contrato: ContratoListItem) {
    try {
      setSubmittingIds((prev) => new Set(prev).add(contrato.id));

      const [clienteData, contratoData, produtosResponse] = await Promise.all([
        fetch(`/api/clientes/${contrato.idCliente}`).then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar cliente");
          return res.json();
        }),
        fetch(`/api/contratos/${contrato.id}`).then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar contrato");
          return res.json();
        }),
        fetch("/api/produtos?page=1&limit=100").then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar produtos");
          return res.json();
        }),
      ]);

      const produtosData = Array.isArray(produtosResponse)
        ? produtosResponse
        : produtosResponse.data || [];

      const html = generateContrato(
        contratoData as ContratoItens,
        clienteData as Cliente,
        produtosData as Produto[]
      );

      const { default: html2pdf } = await import("html2pdf.js");

      const opt = {
        margin: 1,
        filename: `contrato-${contrato.id}.pdf`,
        pagebreak: { mode: ["css"] },
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: "cm", format: "a4", orientation: "portrait" as const },
      };

      const element = document?.createElement("div");
      element.id = "pdf-content";
      element.innerHTML = html;

      const pdfBlob = await new Promise<Blob>((resolve, reject) => {
        html2pdf()
          .set(opt)
          .from(element)
          .toPdf()
          .output("blob")
          .then((blob: Blob) => resolve(blob))
          .catch((error: Error) => reject(error));
      });

      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];

        const res = await fetch(`/api/contratos/${contrato.id}/submit-signature`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64String }),
        });

        if (!res.ok) {
          const error = await res.json();
          alert(`Erro ao enviar contrato: ${error.details || error.error}`);
          return;
        }

        const data = await res.json();
        alert(`Contrato enviado com sucesso!\n\n${data.document.message}`);
        load(result.meta.page, result.meta.limit, debouncedSearch);
      };

      reader.onerror = () => {
        throw new Error("Erro ao converter PDF para base64");
      };

      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Erro ao enviar contrato:", error);
      alert(
        "Falha ao enviar contrato: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(contrato.id);
        return next;
      });
    }
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
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      Promise.all([
        fetch(`/api/clientes/${contrato.idCliente}`).then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar cliente");
          return res.json();
        }),
        fetch(`/api/contratos/${contrato.id}`).then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar contrato");
          return res.json();
        }),
        fetch("/api/produtos?page=1&limit=100").then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar produtos");
          return res.json();
        }),
      ])
        .then((results) => {
          const [clienteData, contratoData, produtosResponse] = results;

          if (!clienteData || !contratoData || !produtosResponse) {
            alert("Erro: Dados incompletos para gerar PDF");
            return;
          }

          if (!contratoData.contrato || !contratoData.itens) {
            alert("Erro: Estrutura de dados do contrato inválida");
            return;
          }

          const produtosData = Array.isArray(produtosResponse)
            ? produtosResponse
            : produtosResponse.data || [];

          const element = document?.createElement("div");
          element.id = "pdf-content";
          element.innerHTML = generateContrato(
            contratoData as ContratoItens,
            clienteData as Cliente,
            produtosData as Produto[],
          );

          html2pdf().set(opt).from(element).save();
        })
        .catch((error) => {
          console.error("Erro ao gerar PDF:", error);
          alert("Falha ao gerar PDF: " + error.message);
        });
    } catch (error) {
      console.error("Erro ao importar html2pdf:", error);
      alert(
        "Erro ao gerar PDF: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      );
    }
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {contrato.clienteNome}
                    </p>
                    {contrato.zapsignDocumentToken === null ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        Não enviado
                      </span>
                    ) : contrato.status === 'pending' ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        Pendente de assinatura
                      </span>
                    ) : contrato.status === 'signed' ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Assinado
                      </span>
                    ) : contrato.status === 'rejected' ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        Rejeitado
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">
                    Taxa de manutenção: R$
                    {parseFloat(contrato.taxaManutencao + "").toFixed(2)}
                  </p>
                  <p className="text-sm text-muted font-semibold">
                    Valor total: R${" "}
                    {parseFloat(contrato.valorTotal + "").toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => printContrato(contrato)}
                      className={STYLE.BUTTON}
                    >
                      Imprimir
                    </button>
                    {contrato.zapsignDocumentToken === null && (
                      <button
                        onClick={() => handleSubmitSignature(contrato)}
                        disabled={submittingIds.has(contrato.id)}
                        className={`${STYLE.BUTTON} ${submittingIds.has(contrato.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {submittingIds.has(contrato.id) ? 'Enviando...' : 'Assinar'}
                      </button>
                    )}
                    {contrato.zapsignDocumentToken !== null && contrato.status === 'pending' && (
                      <button
                        onClick={async () => {
                          await fetch(`/api/contratos/${contrato.id}/signature-status`);
                          load(meta.page, meta.limit, debouncedSearch);
                        }}
                        className={STYLE.BUTTON}
                      >
                        Checar Status
                      </button>
                    )}
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
