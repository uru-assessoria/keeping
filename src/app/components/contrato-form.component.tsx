'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/app/types/cliente';
import { ItemContrato } from '@/app/types/item-contrato';
import { STYLE } from '@/app/config/style.consts';
import Sidebar from '@/app/components/sidebar.component';

const emptyItem = (): ItemContrato => ({
  id: 0,
  idContrato: 0,
  numeroProvisorio: '',
  franquia: '',
  operadora: '',
  valor: 0,
  portabilidade: '',
});

interface ContratoFormProps {
  id?: string;
}

export default function ContratoForm({ id }: ContratoFormProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [idCliente, setIdCliente] = useState(0);
  const [valorPlano, setValorPlano] = useState(0);
  const [itens, setItens] = useState<ItemContrato[]>([emptyItem()]);
  const [loading, setLoading] = useState(true);

  const editId = id ? Number(id) : undefined;
  const novo = !editId;

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editId) return;

    fetch(`/api/contratos/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        setIdCliente(data.contrato.idCliente);
        setValorPlano(data.contrato.valorPlano);
        setItens(data.itens.length ? data.itens : [emptyItem()]);
      });
  }, [editId]);

  function updateItem(
    index: number,
    field: keyof ItemContrato,
    value: string | number,
  ) {
    setItens((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [field]: field === 'valor' ? Number(value) : value,
      } as ItemContrato;
      return next;
    });
  }

  function addItem() {
    setItens((current) => [...current, emptyItem()]);
  }

  function removeItem(index: number) {
    setItens((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!idCliente) {
      alert('Selecione um cliente');
      return;
    }

    const payload = {
      idCliente,
      valorPlano,
      itens: itens.filter(
        (item) =>
          item.numeroProvisorio ||
          item.franquia ||
          item.operadora ||
          item.valor > 0 ||
          item.portabilidade,
      ),
    };

    const url = editId ? `/api/contratos/${editId}` : '/api/contratos';
    const method = editId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert('Falha ao salvar contrato');
      return;
    }

    router.push('/contratos');
  }

  if (loading) {
    return <p className="p-8 text-center">Carregando…</p>;
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <div className="mx-auto w-full max-w-3xl">
          <h1 className={STYLE.TITLE}>
            {novo ? 'Novo contrato' : 'Editar contrato'}
          </h1>

          <form
            className={STYLE.FORM}
            onSubmit={handleSubmit}>
            <div>
              <label className={STYLE.LABEL}>Cliente</label>
              <select
                value={idCliente}
                onChange={(event) => setIdCliente(Number(event.target.value))}
                className={STYLE.INPUT}
                required>
                <option value={0}>Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}>
                    {cliente.razaoSocial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={STYLE.LABEL}>Valor do plano</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={valorPlano}
                onChange={(event) => setValorPlano(Number(event.target.value))}
                className={STYLE.INPUT}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label className={STYLE.LABEL}>Itens do contrato</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 transition-colors">
                  Adicionar item
                </button>
              </div>

              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="rounded border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={STYLE.LABEL}>Número provisório</label>
                        <input
                          value={item.numeroProvisorio}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'numeroProvisorio',
                              event.target.value,
                            )
                          }
                          className={STYLE.INPUT}
                        />
                      </div>
                      <div>
                        <label className={STYLE.LABEL}>Operadora</label>
                        <input
                          value={item.operadora}
                          onChange={(event) =>
                            updateItem(index, 'operadora', event.target.value)
                          }
                          className={STYLE.INPUT}
                        />
                      </div>
                      <div>
                        <label className={STYLE.LABEL}>Franquia</label>
                        <input
                          value={item.franquia}
                          onChange={(event) =>
                            updateItem(index, 'franquia', event.target.value)
                          }
                          className={STYLE.INPUT}
                        />
                      </div>
                      <div>
                        <label className={STYLE.LABEL}>Valor</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.valor}
                          onChange={(event) =>
                            updateItem(index, 'valor', event.target.value)
                          }
                          className={STYLE.INPUT}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={STYLE.LABEL}>Portabilidade</label>
                        <input
                          value={item.portabilidade}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'portabilidade',
                              event.target.value,
                            )
                          }
                          className={STYLE.INPUT}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-4 rounded bg-red-900 px-3 py-1 text-sm text-white hover:bg-red-800 transition-colors">
                      Remover item
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
              {novo ? 'Salvar contrato' : 'Atualizar contrato'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
