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
            className="w-full sm:w-auto rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 text-center transition-colors">
            Novo produto
          </Link>
        </header>

        <ul className="w-full space-y-4">
          {produtos.map((produto: Produto) => (
            <li
              key={produto.id}
              className="rounded border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-zinc-50 truncate">
                    {produto.franquia} - {produto.operadora}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Valor: R$ {(parseFloat(produto.valor + '') || 0).toFixed(2)}{' '}
                    | Portabilidade: {produto.portabilidade ? 'Sim' : 'Não'}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {produto.descricao}
                  </p>
                </div>

                <Link
                  href={`/produtos/${produto.id}`}
                  className={STYLE.BUTTON}>
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(produto.id)}
                  className={STYLE.BUTTON_DESTRUCTIVE}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

        {produtos.length === 0 && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 mt-8">
            Nenhum produto cadastrado
          </p>
        )}
      </main>
    </div>
  );
}
