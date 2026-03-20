'use client';

import Sidebar from '@/app/components/sidebar.component';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewClientePage() {
  const router = useRouter();
  const [razaoSocial, setRazaoSocial] = useState('');
  const [documento, setDocumento] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razaoSocial, documento }),
    });
    router.push('/clientes');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full min-h-screen py-8 px-4 sm:px-8 md:px-16 bg-white dark:bg-black">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-black dark:text-zinc-50">
            Novo cliente
          </h1>

          <form
            className="w-full max-w-md space-y-6"
            onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Razão Social
              </label>
              <input
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Documento
              </label>
              <input
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
              Salvar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
