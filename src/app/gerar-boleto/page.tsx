'use client';

import { useEffect, useState } from 'react';
import Cliente from '../types/cliente';
import Sidebar from '../components/sidebar.component';

export default function GerarBoletoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then(setClientes);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/gerar-boleto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, valor: parseFloat(valor) }),
    });
    if (response.ok) {
      setShowDialog(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />

      <main className="flex-1 flex flex-col w-full min-h-screen py-8 px-4 sm:px-8 md:px-16 bg-white dark:bg-black">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-black dark:text-zinc-50">
            Gerar Boleto
          </h1>

          <form
            className="w-full max-w-md space-y-6"
            onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                required>
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}>
                    {cliente.razaoSocial} ({cliente.documento})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
              Gerar Boleto
            </button>
          </form>

          {showDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg w-full max-w-sm">
                <p className="mb-4 text-black dark:text-zinc-50">
                  Boleto gerado com sucesso!
                </p>
                <button
                  onClick={() => setShowDialog(false)}
                  className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
