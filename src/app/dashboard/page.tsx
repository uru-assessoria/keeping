"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.component";
import { STYLE } from "../config/style.consts";

type ContratoComCliente = {
  id: number;
  idCliente: number;
  taxaManutencao: number;
  formalizacao: string;
  vencimento: string;
  clienteNome: string;
  valorTotal: number;
};

type FiltroTipo =
  | "recente"
  | "antigo"
  | "30dias"
  | "60dias"
  | "90dias"
  | "fisica"
  | "juridica";

interface PaginatedContratos {
  data: ContratoComCliente[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Dashboard() {
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltroTipo[]>([
    "30dias",
  ]);
  const [contratosFiltrados, setContratosFiltrados] =
    useState<PaginatedContratos>({
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
    });
  const [carregando, setCarregando] = useState(true);

  // Carregar contratos com filtros
  useEffect(() => {
    setCarregando(true);

    const params = new URLSearchParams({ page: "1", limit: "100" });

    // Mapear filtros para parâmetros da API
    const periodoVencimento = filtrosSelecionados.find((f) =>
      ["30dias", "60dias", "90dias"].includes(f),
    );
    if (periodoVencimento) {
      params.set("periodoVencimento", periodoVencimento);
    }

    const tipoCliente = filtrosSelecionados.find((f) =>
      ["fisica", "juridica"].includes(f),
    );
    if (tipoCliente) {
      params.set("tipoCliente", tipoCliente);
    }

    const ordenacao = filtrosSelecionados.find((f) =>
      ["recente", "antigo"].includes(f),
    );
    if (ordenacao) {
      params.set("ordenacao", ordenacao);
    }

    fetch(`/api/contratos?${params}`)
      .then((res) => res.json())
      .then(setContratosFiltrados)
      .finally(() => setCarregando(false));
  }, [filtrosSelecionados]);

  function toggleFiltro(filtro: FiltroTipo) {
    setFiltrosSelecionados((prev) => {
      // Se é um filtro de data, remover outros filtros de data
      const filtrosData = ["30dias", "60dias", "90dias"];
      const filtrosOrdenacao = ["recente", "antigo"];

      if (filtrosData.includes(filtro)) {
        const novosFiltros = prev.filter(
          (f) => !filtrosData.includes(f as string),
        );
        return novosFiltros.includes(filtro)
          ? novosFiltros.filter((f) => f !== filtro)
          : [...novosFiltros, filtro];
      }

      if (filtrosOrdenacao.includes(filtro)) {
        const novosFiltros = prev.filter(
          (f) => !filtrosOrdenacao.includes(f as string),
        );
        return novosFiltros.includes(filtro)
          ? novosFiltros.filter((f) => f !== filtro)
          : [...novosFiltros, filtro];
      }

      // Para filtros de tipo (física/jurídica)
      return prev.includes(filtro)
        ? prev.filter((f) => f !== filtro)
        : [...prev, filtro];
    });
  }

  const opcoesFiltro: {
    label: string;
    filtro: FiltroTipo;
    categoria?: string;
  }[] = [
    { label: "Mais recente", filtro: "recente", categoria: "Ordenação" },
    { label: "Mais antigo", filtro: "antigo", categoria: "Ordenação" },
    {
      label: "Vence nos próximos 30 dias",
      filtro: "30dias",
      categoria: "Vencimento",
    },
    {
      label: "Vencimento nos próximos 60 dias",
      filtro: "60dias",
      categoria: "Vencimento",
    },
    {
      label: "Vencimento nos próximos 90 dias",
      filtro: "90dias",
      categoria: "Vencimento",
    },
    { label: "Pessoa Física", filtro: "fisica", categoria: "Tipo de Cliente" },
    {
      label: "Pessoa Jurídica",
      filtro: "juridica",
      categoria: "Tipo de Cliente",
    },
  ];

  const contratos = contratosFiltrados.data;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <h1 className={STYLE.TITLE}>Dashboard</h1>

        <div className="mt-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de Contratos</h2>

          <div className="space-y-4">
            {["Ordenação", "Vencimento", "Tipo de Cliente"].map((categoria) => (
              <div key={categoria}>
                <h3 className="text-sm font-medium text-slate-700 mb-2">
                  {categoria}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opcoesFiltro
                    .filter((op) => op.categoria === categoria)
                    .map((op) => (
                      <button
                        key={op.filtro}
                        onClick={() => toggleFiltro(op.filtro)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          filtrosSelecionados.includes(op.filtro)
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-200 text-slate-900 hover:bg-zinc-300"
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            Contratos ({contratos.length})
          </h2>

          {carregando ? (
            <p className="text-center text-zinc-600">Carregando contratos...</p>
          ) : contratos.length === 0 ? (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              Nenhum contrato encontrado com os filtros selecionados
            </p>
          ) : (
            <ul className="w-full space-y-4">
              {contratos.map((contrato) => {
                const dataVencimento = new Date(contrato.vencimento);
                const dataFormatada =
                  dataVencimento.toLocaleDateString("pt-BR");

                return (
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
                          Vencimento: {dataFormatada}
                        </p>
                        <p className="text-sm text-muted">
                          Valor do contrato: R$
                          {parseFloat(contrato.valorTotal + "").toFixed(2)}
                        </p>
                      </div>

                      <Link
                        href={`/contratos/${contrato.id}`}
                        className={STYLE.BUTTON}
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
