'use client';

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

  if (!cliente) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Editar cliente</h1>

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
          Atualizar
        </button>
      </form>
    </div>
  );
}
