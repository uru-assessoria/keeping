'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cliente from '../types/cliente';
import Sidebar from '../components/sidebar.component';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const load = () => {
    fetch('/api/clientes')
      .then((r) => r.json())
      .then(setClientes);
  };

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Confirmar exclusão deste cliente?')) return;
    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Falha ao excluir');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full min-h-screen py-8 px-4 sm:px-8 md:px-16 bg-white dark:bg-black">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-black dark:text-zinc-50">
            Clientes
          </h1>
          <Link
            href="/clientes/new"
            className="w-full sm:w-auto rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 text-center transition-colors">
            Novo cliente
          </Link>
        </header>

        <ul className="w-full space-y-4">
          {clientes.map((cliente) => (
            <li
              key={cliente.id}
              className="rounded border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-zinc-50 truncate">
                    {cliente.razaoSocial}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {cliente.documento}
                  </p>
                </div>

                <Link
                  href={`/clientes/${cliente.id}`}
                  className="w-full sm:w-auto rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 text-center transition-colors">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="rounded bg-red-900 px-3 py-1 text-sm text-white hover:bg-red-800 transition-colors cursor-pointer">
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

        {clientes.length === 0 && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 mt-8">
            Nenhum cliente cadastrado
          </p>
        )}
      </main>
    </div>
  );
}
