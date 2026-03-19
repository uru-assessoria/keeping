'use client';

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
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Novo cliente</h1>

      <form
        className="space-y-4"
        onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">Razão Social</label>
          <input
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Documento</label>
          <input
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700">
          Salvar
        </button>
      </form>
    </div>
  );
}
