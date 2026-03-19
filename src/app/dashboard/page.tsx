'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-6">
        <nav className="space-y-4">
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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Dashboard
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700">
          Logout
        </button>
      </main>
    </div>
  );
}
