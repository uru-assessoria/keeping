'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cliente from '../types/cliente';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then(setClientes);
  }, []);

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link
          href="/clientes/new"
          className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700">
          Novo cliente
        </Link>
      </header>

      <ul className="space-y-4">
        {clientes.map((cliente) => (
          <li
            key={cliente.id}
            className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{cliente.razaoSocial}</p>
                <p className="text-sm text-zinc-600">{cliente.documento}</p>
              </div>

              <Link
                href={`/clientes/${cliente.id}`}
                className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700">
                Editar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
