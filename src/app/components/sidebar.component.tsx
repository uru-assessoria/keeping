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
    <aside className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="block text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400">
          Início
        </Link>
        <hr className="border-zinc-200 dark:border-zinc-800" />
        <Link
          href="/clientes"
          className="block text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400">
          Clientes
        </Link>
        <Link
          href="/clientes/new"
          className="block text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400">
          Novo Cliente
        </Link>
        <Link
          href="/contratos"
          className="block text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400">
          Contratos
        </Link>
        <Link
          href="/contratos/new"
          className="block text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400">
          Novo Contrato
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 cursor-pointer">
        Logout
      </button>
    </aside>
  );
}
