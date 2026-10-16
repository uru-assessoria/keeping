"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar.component";
import { STYLE } from "@/app/config/style.consts";
import { Cliente } from "@/app/types/cliente";

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

export default function NovoTituloManualPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [idCliente, setIdCliente] = useState(0);
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [jurosValor, setJurosValor] = useState("");
  const [multaValor, setMultaValor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllPages<Cliente>("/api/clientes")
      .then(setClientes)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!idCliente) {
      alert("Selecione um cliente");
      return;
    }
    const valorNumerico = Number(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      alert("Informe um valor válido");
      return;
    }
    if (!vencimento) {
      alert("Informe a data de vencimento");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/titulos/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCliente,
          valor: valorNumerico,
          vencimento,
          descricao: descricao || undefined,
          jurosValor: jurosValor ? Number(jurosValor) : undefined,
          multaValor: multaValor ? Number(multaValor) : undefined,
        }),
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
          <h1 className={STYLE.TITLE}>Novo Título Manual</h1>

          {loading ? (
            <p className="text-sm text-muted mt-6">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="text-sm text-muted mt-6">
              Nenhum cliente cadastrado disponível para emissão de título.
            </p>
          ) : (
            <form className={`${STYLE.FORM} mt-6`} onSubmit={handleSubmit}>
              <div>
                <label className={STYLE.LABEL}>Cliente</label>
                <select
                  value={idCliente}
                  onChange={(event) => setIdCliente(Number(event.target.value))}
                  className={STYLE.INPUT}
                  required>
                  <option value={0}>Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={STYLE.LABEL}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                  className={STYLE.INPUT}
                  required
                />
              </div>

              <div>
                <label className={STYLE.LABEL}>Vencimento</label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(event) => setVencimento(event.target.value)}
                  className={STYLE.INPUT}
                  required
                />
              </div>

              <div>
                <label className={STYLE.LABEL}>Descrição / motivo (opcional)</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  className={STYLE.INPUT}
                  maxLength={500}
                />
              </div>

              <div>
                <label className={STYLE.LABEL}>Juros ao mês, % (opcional, padrão isento)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={jurosValor}
                  onChange={(event) => setJurosValor(event.target.value)}
                  className={STYLE.INPUT}
                />
              </div>

              <div>
                <label className={STYLE.LABEL}>Multa por atraso, % (opcional, padrão isento)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={multaValor}
                  onChange={(event) => setMultaValor(event.target.value)}
                  className={STYLE.INPUT}
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
