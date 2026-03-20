'use client';

import Sidebar from '@/app/components/sidebar.component';
import Cliente from '@/app/types/cliente';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [documento, setDocumento] = useState('');

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCliente(data);
        setRazaoSocial(data.razaoSocial);
        setDocumento(data.documento);
      });
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razaoSocial, documento }),
    });
    router.push('/clientes');
  }

  if (!cliente) return <p className="p-8 text-center">Carregando...</p>;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />
      <main className="flex-1 min-h-screen px-4 py-8 sm:px-8 lg:px-16 bg-white dark:bg-black">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-black dark:text-zinc-50">
            Editar cliente
          </h1>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Razão Social
              </label>
              <input
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Documento
              </label>
              <input
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
              Atualizar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
