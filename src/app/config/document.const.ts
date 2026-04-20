import { Cliente } from '../types/cliente';
import { Contrato, ContratoItens } from '../types/contrato';
import { ProdutoContrato } from '../types/produto-contrato';

import { Produto } from '../types/produto';

export function generateContrato(
  contrato: ContratoItens,
  cliente: Cliente,
  produtos: Produto[],
): string {
  return `

${style}

<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS MÓVEIS – TITULARIDADE
<br/>EMPRESARIAL</h1>

${sectionContratante(cliente)}

${sectionContratada}

${sectionClausulaPrimeira}

${sectionClausulaSegunda}

${sectionClausulaTerceira(cliente)}

${sectionClausulaQuarta(cliente, contrato)}

${sectionClausulaQuinta}

${sectionClausulaSexta}

${sectionClausulaSetima}

${sectionServicoContratado(contrato, produtos)}

${sectionAssinaturas(contrato, cliente)}


<br/><br/>
`;
}
const style = `
<style>


  #pdf-content *{
    color:#111;
  }
  #pdf-content h1,h2,h3{
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
  }
  #pdf-content h1{
    color:#169;
    text-align: center;
    font-size: 1.25rem;
    margin: 0.5rem 0 0.25rem;
  }
  #pdf-content h2{
    color:#48b;
    margin: 0.5rem 0 0.25rem;

  }
  #pdf-content dl{
    display: grid;
    grid-template-columns: 175px auto;
    padding: 8px;
  }
  #pdf-content dt{
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    
    
  }
  #pdf-content dt:after{
      content:":";
  }
  #pdf-content ol{
    list-style-type: none;
    margin-left: 1.5rem;
    list-style-type: none;
  }
  #pdf-content ol {
    counter-reset: custom-list-counter;
  }

  #pdf-content li {
   counter-increment: custom-list-counter;
  }

  #pdf-content li::before {
   content: counter(custom-list-counter) ". ";
  }

  #pdf-content ol ol li::before {
   content: counter(custom-list-counter, lower-alpha) ". ";
  }

  #pdf-content section{
    page-break-inside: avoid;
    break-inside: avoid;
  }
  #pdf-content .center{
    text-align: center;
  }
  
  #pdf-content table{
    width: 100%;
  }  
  
  #pdf-content th{
    text-align: left;
    color:#48b;
  }
  
  #pdf-content td{
    text-align: left;
  }
  
</style>
`;

function sectionContratante(cliente: Cliente): string {
  console.log('cliente', cliente);
  const data = (cliente.dataNascimento + '')
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');
  return ` 
  <section>
    <h2>CONTRATANTE (USUÁRIO FINAL)</h2>
    <dl>  
      <dt>Nome</dt><dd>${cliente.razaoSocial}</dd>
      <dt>CPF</dt><dd>${cliente.documento}</dd>
      <dt>Data de Nascimento</dt><dd>${data}</dd>
      <dt>Endereço</dt><dd>${cliente.endereco}</dd>
      <dt>Telefone</dt><dd>${cliente.telefone}</dd>
      <dt>E-mail</dt><dd>${cliente.email}</dd>
    </dl>
  </section>
  `;
}

const sectionContratada = `
<section>
  <h2>CONTRATADA (TITULAR DA LINHA E PRESTADORA DO SERVIÇO)</h2>
  <dl>
    <dt>Razão Social</dt> <dd>Credheinz Intermediação de Negócios LTDA</dd>
    <dt>CNPJ</dt> <dd>42.708.459/0001-94</dd>
    <dt>Endereço</dt> <dd>Avenida Aniceto Zacchi 147 Sala 01 Ponte de Imaruim Palhoça/SC</dd>
    <dt>CEP</dt> <dd>88130-300</dd>
    <dt>Representante Legal</dt> <dd>Davi Heinz</dd>
    <dt>E-mail</dt> <dd>credheinz@hotmail.com</dd> 
  </dl>
</section>
`;

const sectionClausulaPrimeira = `
<section>
  <h2>CLÁUSULA PRIMEIRA – DO OBJETO</h2>
  <p>O presente contrato tem por objeto a prestação de serviço de telecomunicação móvel
  pessoal (SMP) pela Credheinz Intermediação de Negócios LTDA, com a linha móvel ativada
  sob a titularidade da empresa, possibilitando ao CONTRATANTE usufruir de plano exclusivo
  destinado a pessoas jurídicas, nos termos deste instrumento e da regulamentação vigente
  da Agência Nacional de Telecomunicações – ANATEL.</p>
</section>
`;

const sectionClausulaSegunda = `
<section>
  <h2>CLÁUSULA SEGUNDA – DA TITULARIDADE DA LINHA</h2>
  <ol>
    <li>A titularidade da linha telefônica permanecerá registrada sob o CNPJ da Credheinz Intermediação de Negócios LTDA durante todo o período de vigência contratual.</li>
    <li>O CONTRATANTE reconhece que, por meio deste contrato, está autorizado a utilizar a linha móvel e os serviços vinculados, mesmo não sendo o titular direto do número.</li>
  </ol>
</section>
`;

function sectionClausulaTerceira(cliente: Cliente): string {
  return ` 
    <section>
      <h2>CLÁUSULA TERCEIRA – DO PRAZO E FIDELIDADE CONTRATUAL</h2>
      <ol>
        <li>O presente contrato terá vigência de ${cliente.entidadeJuridica ? '24' : '12'} meses, contados a partir da data de ativação da linha.</li>
        <li>Durante o período de vigência, o CONTRATANTE compromete-se a manter os serviços ativos, sob pena de multa por rescisão antecipada, conforme cláusula seguinte.</li>
        <li>Findo o período de fidelidade, o cliente poderá:
          <ol>
            <li>Encerrar o contrato sem ônus;</li>
            <li>Continuar com os serviços conforme condições atualizadas;</li>
            <li>Solicitar a transferência da titularidade da linha para CPF próprio, mediante autorização da CONTRATADA e após análise.</li>
          </ol>
        </li>
      </ol>
    </section>
    `;
}
function sectionClausulaQuarta(
  cliente: Cliente,
  contrato: ContratoItens,
): string {
  let itens = '';
  if (cliente.entidadeJuridica) {
    itens = `
      <li>Em caso de rescisão contratual por parte do CONTRATANTE antes do término do período de fidelidade, será cobrada multa proporcional ao tempo restante de vigência, limitada a R$${contrato.contrato.valorPlano} vezes número de meses restantes / 24.</li>
    `;
  } else {
    itens = `
      <li>Em caso de rescisão contratual total por parte do CONTRATANTE antes do término do período de fidelidade, será cobrada multa proporcional ao tempo restante de vigência, limitada ao valor total do plano, vezes número de meses restantes até os 12 meses de vigência.</li>
      <li>Em caso de rescisão contratual parcial por parte do CONTRATANTE antes do término do período de fidelidade, será cobrada multa proporcional ao tempo restante de vigência, limitada ao valor do plano para cada linha contratada, vezes número de meses restantes até os 12 meses de vigência.</li>
    `;
  }
  return ` 
    <section>
      <h2>CLÁUSULA QUARTA – DA MULTA POR RESCISÃO ANTECIPADA</h2>
      <ol>
        ${itens}
        <li>A multa será devida mesmo nos casos de portabilidade, desativação, transferência de titularidade sem autorização ou inadimplência.</li>
      </ol>
    </section>
    `;
}

const sectionClausulaQuinta = `
<section>
  <h2>CLÁUSULA QUINTA – DAS OBRIGAÇÕES DA CONTRATADA</h2>
  <p>A CONTRATADA compromete-se a:</p>
  <ol>
    <li>Prestar os serviços conforme os padrões de qualidade exigidos pela ANATEL;</li>
    <li>Informar o CONTRATANTE sobre quaisquer alterações no plano ou nos valores;</li>
    <li>Permitir, após a fidelidade, a transferência da titularidade da linha, conforme solicitação do CONTRATANTE e em conformidade com os critérios operacionais e legais vigentes.</li>
  </ol>
</section>
`;

const sectionClausulaSexta = `
<section>
  <h2>CLÁUSULA SEXTA – DAS OBRIGAÇÕES DO CONTRATANTE</h2>
  <ol>
    <li>Utilizar os serviços de forma responsável, conforme a legislação aplicável;</li>
    <li>Efetuar os pagamentos acordados em dia;</li>
    <li>Manter seus dados atualizados junto à CONTRATADA;</li>
    <li>Não solicitar portabilidade da linha sem a quitação total do contrato ou anuência da CONTRATADA.</li>
  </ol>
</section>
`;

const sectionClausulaSetima = `
<section>
  <h2>CLÁUSULA SÉTIMA – DISPOSIÇÕES GERAIS</h2>
  <ol>
    <li>O presente contrato está em conformidade com as normas da Resolução nº 632/2014 da ANATEL e demais legislações aplicáveis.</li>
    <li>As partes concordam com os termos do contrato, fazendo a validação digital em plataforma utilizada pela CONTRATADA.</li>
    <li>As partes podem eleger o foro da comarca de [Palhoça/SC] para dirimir quaisquer controvérsias oriundas deste contrato.</li>
  </ol>
</section>
`;

function sectionServicoContratado(
  contrato: ContratoItens,
  produtos: Produto[],
): string {
  let rows = '';

  contrato.itens.forEach((item) => {
    const produto = produtos.find((p) => p.id === item.idProduto);
    if (produto) {
      rows += `
        <tr> 
          <td>${item.numeroProvisorio}</td>
          <td>${produto.franquia}</td>
          <td>${produto.operadora}</td>
          <td>R$ ${(parseFloat(produto.valor + '') || 0).toFixed(2)}</td>
          <td>${produto.portabilidade ? 'Sim' : 'Não'}</td>
        </tr>
        `;
    }
  });

  return `
    <section>
      <h2 class='center'>SERVIÇO CONTRATADO: LINHA MOVEL</h2>
      <table>
        <tr>
          <th>NUMERO PROVISÓRIO</th>
          <th>FRANQUIA</th>
          <th>OPERADORA</th>
          <th>VALOR</th>
          <th>PORTABILIDADE</th>
        </tr>

        ${rows}  
          
      </table>      
    </section>
  `;
}
function sectionAssinaturas(contrato:ContratoItens,cliente: Cliente): string {
  const data = (contrato.contrato.formalizacao+ '')
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');  
  let assinantes = '';
  if (cliente.entidadeJuridica) {
    assinantes = `
      <p class='center'>CONTRATANTE: ${cliente.razaoSocial}</p>
      <p class='center'>CNPJ: ${cliente.documento}</p>
      <p class='center'>RESPONSÁVEL: ${cliente.razaoSocialRepresentante}</p>
      <p class='center'>CPF: ${cliente.documentoRepresentante}</p>
    `;
  } else {
    assinantes = `
      <p class='center'>CONTRATANTE: ${cliente.razaoSocial}</p>
      <p class='center'>CPF: ${cliente.documento}</p>
    `;
  }

  return `
    <section>
      <h2 class='center'>ASSINATURAS</h2>
      <p class='center'>Data do início do contrato: ${data}</p>
      <br/><br/><br/><br/>
      <hr style='width: 50%; margin: 0 auto;'/>
      ${assinantes}
      <br/><br/><br/><br/>
      <hr style='width: 50%; margin: 0 auto;'/>
      <p class='center'>CONTRATADA: Credheinz Intermediação de Negócios LTDA</p>
      <p class='center'>CNPJ: 42.708.459/0001-94</p>
    </section>
  `;
}
