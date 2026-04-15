'use client';

import { useEffect, useState } from 'react';
import STYLE from '../config/style.consts';
import { Cliente } from '../types/cliente';
import Sidebar from './sidebar.component';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ClienteForm() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as number | undefined;
  const novo = !(id! > 0);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [documento, setDocumento] = useState('');
  const [razaoSocialRepresentante, setRazaoSocialRepresentante] = useState('');
  const [documentoRepresentante, setDocumentoRepresentante] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(false);
  const [entidadeJuridica, setEntidadeJuridica] = useState(false);
  if (id) {
    useEffect(() => {
      fetch(`/api/clientes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setCliente(data);
          setRazaoSocial(data.razaoSocial);
          setDocumento(data.documento);
          setRazaoSocialRepresentante(data.razaoSocialRepresentante);
          setDocumentoRepresentante(data.documentoRepresentante);
          setDataNascimento((data.dataNascimento + '').split('T')[0]);
          setEndereco(data.endereco);
          setTelefone(data.telefone);
          setEmail(data.email);
          setAtivo(data.ativo);
          setEntidadeJuridica(data.entidadeJuridica);
        });
    }, [id]);
  }

  function collectClienteData(): Cliente {
    return {
      id: cliente ? cliente.id : 0,
      razaoSocial,
      documento,
      razaoSocialRepresentante,
      documentoRepresentante,
      dataNascimento,
      endereco,
      telefone,
      email,
      entidadeJuridica,
    } as Cliente;
  }
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!novo) {
      await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectClienteData()),
      });
    } else {
      await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectClienteData()),
      });
    }
    router.push('/clientes');
  }
  const handleDocumentoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    let document = value.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (value.length <= 11) {
      setDocumento(document.replace(/(.{3})(.{3})(.{3})(.{2})/, '$1.$2.$3-$4'));
      setEntidadeJuridica(false);
    } else {
      setDocumento(
        document.replace(/(.{2})(.{3})(.{3})(.{4})(.{2})/, '$1.$2.$3/$4-$5'),
      );
      setEntidadeJuridica(true);
    }
  };

  if (!novo && !cliente)
    return <p className="p-8 text-center">Carregando...</p>;

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <div className="mx-auto w-full max-w-lg">
          <h1 className={STYLE.TITLE}>
            {novo ? 'Cadastrar' : 'Editar'} cliente
          </h1>

          <form
            className={STYLE.FORM}
            onSubmit={handleSubmit}>
            <div>
              <label className={STYLE.LABEL}>Razão Social</label>
              <input
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>
                {entidadeJuridica ? 'CNPJ' : 'CPF'}
              </label>
              <input
                value={documento}
                onChange={handleDocumentoChange}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Endereço</label>
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Telefone</label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>

            {entidadeJuridica ? (
              <>
                <h3>Dados do Representante Legal / Responsável</h3>
                <div>
                  <label className={STYLE.LABEL}>Razão Social</label>
                  <input
                    value={razaoSocialRepresentante}
                    onChange={(e) =>
                      setRazaoSocialRepresentante(e.target.value)
                    }
                    className={STYLE.INPUT}
                    required
                  />
                </div>
                <div>
                  <label className={STYLE.LABEL}>CPF</label>
                  <input
                    value={documentoRepresentante}
                    onChange={(e) => setDocumentoRepresentante(e.target.value)}
                    className={STYLE.INPUT}
                    required
                  />
                </div>
              </>
            ) : (
              ''
            )}
            <div>
              <label className={STYLE.LABEL}>Data de Nascimento</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <div>
              <label className={STYLE.LABEL}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={STYLE.INPUT}
                required
              />
            </div>
            <button
              type="submit"
              className={STYLE.BUTTON}>
              {novo ? 'Cadastrar' : 'Atualizar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
