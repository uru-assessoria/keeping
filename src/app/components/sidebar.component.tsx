'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <aside className="w-full md:w-64 bg-sidebar text-slate-900 p-6 flex flex-col justify-between shadow-lg">
      <div>
        <div className="mb-8">
          <span className="block text-sm uppercase tracking-[0.3em] text-slate-900/80">
            Sistema
          </span>
          <h2 className="mt-2 text-2xl font-semibold">Credheinz Telecom</h2>
        </div>

        <nav className="space-y-3">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Início
          </Link>
          <Link
            href="/clientes"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Clientes
          </Link>
          <Link
            href="/clientes/new"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Novo Cliente
          </Link>
          <Link
            href="/contratos"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Contratos
          </Link>
          <Link
            href="/contratos/new"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Novo Contrato
          </Link>
          <Link
            href="/produtos"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Produtos
          </Link>
          <Link
            href="/produtos/new"
            className="block rounded-lg px-3 py-2 text-slate-900 hover:bg-white/20 transition-colors">
            Novo Produto
          </Link>
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 rounded bg-white px-4 py-2 text-slate-900 hover:bg-slate-100 transition-colors">
        Logout
      </button>
    </aside>
  );
}
