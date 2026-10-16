"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar.component";
import { STYLE } from "@/app/config/style.consts";

type ContratoAssinado = {
  id: number;
  clienteNome: string;
  valorTotal: number;
  status: string;
};

// Busca todas as páginas de um endpoint paginado
async function loadAllPages<T>(endpoint: string): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(`${endpoint}?limit=100&page=${page}`);
    const result = await response.json();

    allData.push(...(result.data || []));

    if (!result.meta?.totalPages || page >= result.meta.totalPages) {
      break;
    }

    page++;
  }

  return allData;
}

export default function NovoTituloPage() {
  const router = useRouter();
  const [contratos, setContratos] = useState<ContratoAssinado[]>([]);
  const [loading, setLoading] = useState(true);
  const [idContrato, setIdContrato] = useState(0);
  const [referenciaMes, setReferenciaMes] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllPages<ContratoAssinado>("/api/contratos")
      .then((data) => {
        setContratos(data.filter((c) => c.status === "signed"));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!idContrato) {
      alert("Selecione um contrato");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/titulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idContrato, referenciaMes }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erro ao emitir boleto: ${error.error || error.details || "Erro desconhecido"}`);
        return;
      }

      router.push("/titulos");
    } catch (error) {
      alert(
        "Falha ao emitir boleto: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <div className="mx-auto w-full max-w-3xl">
          <h1 className={STYLE.TITLE}>Novo Título de Cobrança</h1>

          {loading ? (
            <p className="text-sm text-muted mt-6">Carregando contratos...</p>
          ) : contratos.length === 0 ? (
            <p className="text-sm text-muted mt-6">
              Nenhum contrato assinado disponível para emissão de título.
            </p>
          ) : (
            <form className={`${STYLE.FORM} mt-6`} onSubmit={handleSubmit}>
              <div>
                <label className={STYLE.LABEL}>Contrato</label>
                <select
                  value={idContrato}
                  onChange={(event) => setIdContrato(Number(event.target.value))}
                  className={STYLE.INPUT}
                  required>
                  <option value={0}>Selecione um contrato assinado</option>
                  {contratos.map((contrato) => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.clienteNome} — R$ {Number(contrato.valorTotal).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={STYLE.LABEL}>Mês de referência</label>
                <input
                  type="month"
                  value={referenciaMes}
                  onChange={(event) => setReferenciaMes(event.target.value)}
                  className={STYLE.INPUT}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${STYLE.BUTTON_OPERATIVE} ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {submitting ? "Emitindo boleto..." : "Emitir boleto"}
                </button>
                <Link href="/titulos" className={STYLE.BUTTON}>
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
