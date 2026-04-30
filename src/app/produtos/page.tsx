'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import { Produto } from '../types/produto';

interface PaginatedProdutos {
  data: Produto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProdutosPage() {
  const [result, setResult] = useState<PaginatedProdutos>({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const load = (page = 1, limit = 20, q = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.set('search', q);
    fetch(`/api/produtos?${params}`)
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
    if (!confirm('Confirmar exclusão deste produto?')) return;
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (res.ok) load(result.meta.page, result.meta.limit, debouncedSearch);
    else alert('Falha ao excluir');
  }

  const { data: produtos, meta } = result;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Produtos</h1>
          <Link href="/produtos/new" className={STYLE.BUTTON}>
            Novo produto
          </Link>
        </header>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={STYLE.INPUT}
          />
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produtos.map((produto: Produto) => (
            <div
              key={produto.id}
              className="rounded border border-border p-4 bg-surface-variant flex flex-col">
              <div className="flex-1 min-w-0 mb-4">
                <p className="font-semibold text-foreground mb-2">
                  {produto.franquia}
                </p>
                <p className="text-sm text-muted line-clamp-2 mb-2">
                  {produto.operadora}
                </p>
                <p className="text-sm text-muted line-clamp-4">
                  {produto.descricao}
                </p>
              </div>

              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/produtos/${produto.id}`}
                  className={`${STYLE.BUTTON} flex-1 text-center`}>
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(produto.id)}
                  className={`${STYLE.BUTTON_DESTRUCTIVE} flex-1`}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {produtos.length === 0 && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 mt-8">
            Nenhum produto cadastrado
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
