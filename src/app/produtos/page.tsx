'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import { Produto } from '../types/produto';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const load = () => {
    fetch('/api/produtos')
      .then((r) => r.json())
      .then(setProdutos);
  };

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Confirmar exclusão deste produto?')) return;
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Falha ao excluir');
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className={STYLE.TITLE}>Produtos</h1>
          <Link
            href="/produtos/new"
            className={STYLE.BUTTON}>
            Novo produto
          </Link>
        </header>

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
      </main>
    </div>
  );
}
