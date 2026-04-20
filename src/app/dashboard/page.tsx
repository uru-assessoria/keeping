'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';

type ContratoComCliente = {
  id: number;
  idCliente: number;
  valorPlano: number;
  formalizacao: string;
  vencimento?: string;
  clienteNome: string;
  entidadeJuridica: boolean;
};

type FiltroTipo =
  | 'recente'
  | 'antigo'
  | '30dias'
  | '60dias'
  | '90dias'
  | 'fisica'
  | 'juridica';

export default function Dashboard() {
  const [contratos, setContratos] = useState<ContratoComCliente[]>([]);
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltroTipo[]>([
    '30dias',
  ]);
  const [contratosFiltrados, setContratosFiltrados] = useState<ContratoComCliente[]>([]);

  useEffect(() => {
    fetch('/api/contratos')
      .then((res) => res.json())
      .then(setContratos);
  }, []);

  useEffect(() => {
    let resultado = [...contratos];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Aplicar filtros de data e tipo de cliente
    const temFiltroData = filtrosSelecionados.some((f) =>
      ['30dias', '60dias', '90dias', 'recente', 'antigo'].includes(f),
    );
    const temFiltroTipo = filtrosSelecionados.some((f) =>
      ['fisica', 'juridica'].includes(f),
    );

    if (temFiltroData || temFiltroTipo) {
      resultado = resultado.filter((contrato) => {
        const dataVencimento = new Date(contrato.vencimento || '');
        dataVencimento.setHours(0, 0, 0, 0);

        // Se tem filtro de tipo de cliente
        if (temFiltroTipo) {
          const isJuridica = contrato.entidadeJuridica;
          if (filtrosSelecionados.includes('fisica') && isJuridica) return false;
          if (filtrosSelecionados.includes('juridica') && !isJuridica)
            return false;
        }

        // Se tem filtro de data
        if (temFiltroData) {
          if (filtrosSelecionados.includes('30dias')) {
            const limite = new Date(hoje);
            limite.setDate(limite.getDate() + 30);
            if (dataVencimento > limite || dataVencimento < hoje) return false;
          }
          if (filtrosSelecionados.includes('60dias')) {
            const limite = new Date(hoje);
            limite.setDate(limite.getDate() + 60);
            if (dataVencimento > limite || dataVencimento < hoje) return false;
          }
          if (filtrosSelecionados.includes('90dias')) {
            const limite = new Date(hoje);
            limite.setDate(limite.getDate() + 90);
            if (dataVencimento > limite || dataVencimento < hoje) return false;
          }
        }

        return true;
      });
    }

    // Aplicar ordenação
    if (filtrosSelecionados.includes('recente')) {
      resultado.sort(
        (a, b) =>
          new Date(b.formalizacao).getTime() -
          new Date(a.formalizacao).getTime(),
      );
    } else if (filtrosSelecionados.includes('antigo')) {
      resultado.sort(
        (a, b) =>
          new Date(a.formalizacao).getTime() -
          new Date(b.formalizacao).getTime(),
      );
    }

    setContratosFiltrados(resultado);
  }, [contratos, filtrosSelecionados]);

  function toggleFiltro(filtro: FiltroTipo) {
    setFiltrosSelecionados((prev) => {
      // Se é um filtro de data, remover outros filtros de data
      const filtrosData = ['30dias', '60dias', '90dias'];
      const filtrosOrdenacao = ['recente', 'antigo'];

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
    { label: 'Mais recente', filtro: 'recente', categoria: 'Ordenação' },
    { label: 'Mais antigo', filtro: 'antigo', categoria: 'Ordenação' },
    {
      label: 'Vence nos próximos 30 dias',
      filtro: '30dias',
      categoria: 'Vencimento',
    },
    {
      label: 'Vencimento nos próximos 60 dias',
      filtro: '60dias',
      categoria: 'Vencimento',
    },
    {
      label: 'Vencimento nos próximos 90 dias',
      filtro: '90dias',
      categoria: 'Vencimento',
    },
    { label: 'Pessoa Física', filtro: 'fisica', categoria: 'Tipo de Cliente' },
    {
      label: 'Pessoa Jurídica',
      filtro: 'juridica',
      categoria: 'Tipo de Cliente',
    },
  ];

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <h1 className={STYLE.TITLE}>Dashboard</h1>

        <div className="mt-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de Contratos</h2>

          <div className="space-y-4">
            {['Ordenação', 'Vencimento', 'Tipo de Cliente'].map((categoria) => (
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
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-200 text-slate-900 hover:bg-zinc-300'
                        }`}>
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
            Contratos ({contratosFiltrados.length})
          </h2>

          {contratosFiltrados.length === 0 ? (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              Nenhum contrato encontrado com os filtros selecionados
            </p>
          ) : (
            <ul className="w-full space-y-4">
              {contratosFiltrados.map((contrato) => {
                const dataVencimento = new Date(contrato.vencimento || '');
                const dataFormatada = dataVencimento.toLocaleDateString('pt-BR');
                const tipoCliente = contrato.entidadeJuridica
                  ? 'Jurídica'
                  : 'Física';

                return (
                  <li
                    key={contrato.id}
                    className="rounded border border-border p-4 bg-surface-variant">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {contrato.clienteNome}
                        </p>
                        <p className="text-sm text-muted">
                          Vencimento: {dataFormatada} • Tipo: {tipoCliente}
                        </p>
                        <p className="text-sm text-muted">
                          Valor do plano: R${' '}
                          {parseFloat(contrato.valorPlano + '').toFixed(2)}
                        </p>
                      </div>

                      <Link
                        href={`/contratos/${contrato.id}`}
                        className={STYLE.BUTTON}>
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
