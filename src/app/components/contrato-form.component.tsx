'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/app/types/cliente';
import { ProdutoContrato } from '@/app/types/produto-contrato';
import { Produto } from '@/app/types/produto';
import { STYLE } from '@/app/config/style.consts';
import Sidebar from '@/app/components/sidebar.component';

const emptyItem = (): ProdutoContrato => ({
  id: 0,
  idContrato: 0,
  numeroProvisorio: '',
  idProduto: 0,
});

interface ContratoFormProps {
  id?: string;
}

export default function ContratoForm({ id }: ContratoFormProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [idCliente, setIdCliente] = useState(0);
  const [valorPlano, setValorPlano] = useState(0);
  const [itens, setItens] = useState<ProdutoContrato[]>([emptyItem()]);
  const [loading, setLoading] = useState(true);

  const editId = id ? Number(id) : undefined;
  const novo = !editId;

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then((res) => res.json()),
      fetch('/api/produtos').then((res) => res.json()),
    ])
      .then(([clientesData, produtosData]) => {
        setClientes(clientesData);
        setProdutos(produtosData);
      })
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
    field: keyof ProdutoContrato,
    value: string | number,
  ) {
    setItens((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [field]: field === 'idProduto' ? Number(value) : value,
      } as ProdutoContrato;
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
        (item) => item.numeroProvisorio || item.idProduto > 0,
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
                  className={STYLE.BUTTON_OPERATIVE}>
                  Adicionar item
                </button>
              </div>

              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="rounded border border-border p-4 bg-surface-variant">
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
                        <label className={STYLE.LABEL}>Produto</label>
                        <select
                          value={item.idProduto}
                          onChange={(event) =>
                            updateItem(index, 'idProduto', event.target.value)
                          }
                          className={STYLE.INPUT}
                          required>
                          <option value={0}>Selecione um produto</option>
                          {produtos.map((produto) => (
                            <option
                              key={produto.id}
                              value={produto.id}>
                              {produto.franquia} - {produto.operadora} (R${' '}
                              {(parseFloat(produto.valor + '') || 0).toFixed(2)}
                              )
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-6 rounded bg-danger px-3 py-1 text-sm text-white hover:bg-red-700 transition-colors">
                      Remover item
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={STYLE.BUTTON}>
              {novo ? 'Salvar contrato' : 'Atualizar contrato'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
