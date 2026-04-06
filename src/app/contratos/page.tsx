'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/sidebar.component';
import { STYLE } from '@/app/config/style.consts';
import { Cliente } from '../types/cliente';
import { ItemContrato } from '../types/item-contrato';
import { Contrato, ContratoItens } from '../types/contrato';
import { generateContrato } from '../config/document.const';
//import html2pdf from 'html2pdf.js';

type ContratoListItem = {
  id: number;
  idCliente: number;
  valorPlano: number;
  clienteNome: string;
};

export default function ContratosPage() {
  const [contratos, setContratos] = useState<ContratoListItem[]>([]);

  useEffect(() => {
    fetch('/api/contratos')
      .then((res) => res.json())
      .then(setContratos);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Confirmar exclusão deste contrato?')) return;
    const res = await fetch(`/api/contratos/${id}`, { method: 'DELETE' });
    if (res.ok)
      setContratos((current) =>
        current.filter((contrato) => contrato.id !== id),
      );
    else alert('Falha ao excluir contrato');
  }

  const opt = {
    margin: 1,
    filename: 'myfile.pdf',
    pagebreak: { mode: ['css'] },
    image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' as 'portrait' },
  };

  async function printContrato(contrato: ContratoListItem) {
    const { default: html2pdf } = await import('html2pdf.js');
    Promise.all([
      fetch(`/api/clientes/${contrato.idCliente}`).then((res) => res.json()),
      fetch(`/api/contratos/${contrato.id}`).then((res) => res.json()),
    ]).then((results) => {
      const [clienteData, contratoData] = results;

      const element = document?.createElement('div');
      element.id = 'pdf-content';
      element.innerHTML = generateContrato(
        contratoData as ContratoItens,
        clienteData as Cliente,
      );

      html2pdf().set(opt).from(element).save();
    });
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Contratos</h1>
          <Link
            href="/contratos/new"
            className="w-full sm:w-auto rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 text-center transition-colors">
            Novo contrato
          </Link>
        </header>

        <ul className="w-full space-y-4">
          {contratos.map((contrato) => (
            <li
              key={contrato.id}
              className="rounded border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-zinc-50 truncate">
                    {contrato.clienteNome}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Valor do plano: R${' '}
                    {parseFloat(contrato.valorPlano + '').toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => printContrato(contrato)}
                    className={STYLE.BUTTON}>
                    Imprimir
                  </button>
                  |
                  <Link
                    href={`/contratos/${contrato.id}`}
                    className={STYLE.BUTTON}>
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(contrato.id)}
                    className={STYLE.BUTTON_DESTRUCTIVE}>
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
      </main>
    </div>
  );
}
