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
  const [taxaManutencao, setTaxaManutencao] = useState(0);
  const [formalizacao, setFormalizacao] = useState('');
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
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ao carregar contrato: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.contrato) {
          setIdCliente(data.contrato.idCliente || 0);
          setTaxaManutencao(Number(data.contrato.taxaManutencao) || 0);
          setFormalizacao((data.contrato.formalizacao + '').split('T')[0] || '');
          setItens(data.itens && data.itens.length ? data.itens : [emptyItem()]);
        } else {
          alert('Erro: Dados do contrato inválidos');
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar contrato:', error);
        alert('Falha ao carregar contrato: ' + error.message);
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

    const filteredItens = itens.filter(
      (item) => item.numeroProvisorio || item.idProduto > 0,
    );

    if (filteredItens.length === 0) {
      alert('Adicione pelo menos um item ao contrato');
      return;
    }

    const payload = {
      idCliente,
      taxaManutencao,
      formalizacao,
      itens: filteredItens,
    };

    const url = editId ? `/api/contratos/${editId}` : '/api/contratos';
    const method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erro da API:', responseData);
        alert('Falha ao salvar contrato: ' + (responseData.error || responseData.message || 'Erro desconhecido'));
        return;
      }

      router.push('/contratos');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar contrato: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
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
              <label className={STYLE.LABEL}>Taxa de manutenção</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={taxaManutencao}
                onChange={(event) => setTaxaManutencao(Number(event.target.value))}
                className={STYLE.INPUT}
                required
              />
            </div>

            <div>
              <label className={STYLE.LABEL}>Valor total do contrato</label>
              <input
                type="text"
                value={(
                  Number(taxaManutencao) +
                  itens.reduce((acc, item) => {
                    const produto = produtos.find((p) => p.id === item.idProduto);
                    return acc + (produto ? Number(produto.valor) : 0);
                  }, 0)
                ).toFixed(2)}
                className={STYLE.INPUT}
                disabled
              />
            </div>

            <div>
              <label className={STYLE.LABEL}>Data de formalização</label>
              <input
                type="date"
                value={formalizacao}
                onChange={(event) => setFormalizacao(event.target.value)}
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
                      className="mt-6 rounded bg-danger px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
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
