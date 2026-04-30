'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import { Cliente } from '../types/cliente';

interface PaginatedClientes {
  data: Cliente[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ClientesPage() {
  const [result, setResult] = useState<PaginatedClientes>({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const load = (page = 1, limit = 20, q = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.set('search', q);
    fetch(`/api/clientes?${params}`)
      .then((r) => r.json())
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
    if (!confirm('Confirmar exclusão deste cliente?')) return;
    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    if (res.ok) load(result.meta.page, result.meta.limit, debouncedSearch);
    else alert('Falha ao excluir');
  }

  const { data: clientes, meta } = result;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Clientes</h1>
          <Link href="/clientes/new" className={STYLE.BUTTON}>
            Novo cliente
          </Link>
        </header>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={STYLE.INPUT}
          />
        </div>

        <ul className="w-full space-y-4">
          {clientes.map((cliente: Cliente) => (
            <li
              key={cliente.id}
              className="rounded border border-border p-4 bg-surface-variant">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {cliente.razaoSocial}
                  </p>
                  <p className="text-sm text-muted">{cliente.documento}</p>
                </div>

                <Link href={`/clientes/${cliente.id}`} className={STYLE.BUTTON}>
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

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => load(meta.page - 1, meta.limit, debouncedSearch)}
              disabled={meta.page <= 1}
              className={`${STYLE.BUTTON} ${meta.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Anterior
            </button>
            <span className="text-sm text-muted">
              Página {meta.page} de {meta.totalPages} ({meta.total} total)
            </span>
            <button
              onClick={() => load(meta.page + 1, meta.limit, debouncedSearch)}
              disabled={meta.page >= meta.totalPages}
              className={`${STYLE.BUTTON} ${meta.page >= meta.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
