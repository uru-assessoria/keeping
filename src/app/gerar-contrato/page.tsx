'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import { Cliente } from '../types/cliente';
import html2pdf from 'html2pdf.js';
import { generateContrato } from '../config/document.const';

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

  const opt = {
    margin: 1,
    filename: 'myfile.pdf',
    pagebreak: { mode: ['css'] },
    image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' as 'portrait' },
  };

  async function printTest() {
    const element = document.createElement('div');
    fetch(`/api/clientes/${clienteId}`)
      .then((res) => res.json())
      .then((data) => {
        element.innerHTML = generateContrato(data as Cliente);
        html2pdf().set(opt).from(element).save();
      });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    printTest();
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />

      <main className={STYLE.MAIN}>
        <div className="mx-auto w-full max-w-lg">
          <h1 className={STYLE.TITLE}>Gerar Boleto</h1>

          <form
            className={STYLE.FORM}
            onSubmit={handleSubmit}>
            <div>
              <label className={STYLE.LABEL}>Cliente</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={STYLE.INPUT}
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
              <label className={STYLE.LABEL}>Valor</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={STYLE.INPUT}
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
