'use client';

import { useEffect, useState } from 'react';
import STYLE from '../config/style.consts';
import { Produto } from '../types/produto';
import Sidebar from './sidebar.component';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ProdutoForm() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as number | undefined;
  const novo = !(id! > 0);

  const [produto, setProduto] = useState<Produto | null>(null);
  const [franquia, setFranquia] = useState('');
  const [operadora, setOperadora] = useState('');
  const [valor, setValor] = useState(0);
  const [portabilidade, setPortabilidade] = useState(false);
  const [descricao, setDescricao] = useState('');

  if (id) {
    useEffect(() => {
      fetch(`/api/produtos/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduto(data);
          setFranquia(data.franquia);
          setOperadora(data.operadora);
          setValor(data.valor);
          setPortabilidade(data.portabilidade);
          setDescricao(data.descricao);
        });
    }, [id]);
  }

  function collectProdutoData(): Produto {
    return {
      id: produto ? produto.id : 0,
      franquia,
      operadora,
      valor,
      portabilidade,
      descricao,
    } as Produto;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!novo) {
      await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectProdutoData()),
      });
    } else {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectProdutoData()),
      });
    }
    router.push('/produtos');
  }

  if (!novo && !produto)
    return <p className="p-8 text-center">Carregando...</p>;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <div className="mx-auto w-full max-w-lg">
          <h1 className={STYLE.TITLE}>
            {novo ? 'Cadastrar' : 'Editar'} produto
          </h1>

          <form
            className={STYLE.FORM}
            onSubmit={handleSubmit}>
            <div>
              <label className={STYLE.LABEL}>Franquia</label>
              <input
                value={franquia}
                onChange={(e) => setFranquia(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Operadora</label>
              <input
                value={operadora}
                onChange={(e) => setOperadora(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Valor</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(parseFloat(e.target.value))}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Portabilidade</label>
              <input
                type="checkbox"
                checked={portabilidade}
                onChange={(e) => setPortabilidade(e.target.checked)}
                className="mr-2"
              />
              Sim
            </div>
            <div>
              <label className={STYLE.LABEL}>Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 transition-colors">
              {novo ? 'Cadastrar' : 'Atualizar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
