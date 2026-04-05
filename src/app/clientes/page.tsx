'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import { Cliente } from '../types/cliente';

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
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Clientes</h1>
          <Link
            href="/clientes/new"
            className="w-full sm:w-auto rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 text-center transition-colors">
            Novo cliente
          </Link>
        </header>

        <ul className="w-full space-y-4">
          {clientes.map((cliente: Cliente) => (
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
                  className={STYLE.BUTTON}>
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className={STYLE.BUTTON_DESTRUCTIVE}>
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
