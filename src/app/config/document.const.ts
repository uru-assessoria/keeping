import { Cliente } from '../types/cliente';

export function generateContrato(cliente: Cliente): string {
  const data = (cliente.dataNascimento + '')
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  return `
  <style>
  *{
    color:#111;
  }
  h1,h2,h3{
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
  }
  h1{
    color:#169;
    text-align: center;
    font-size: 1.25rem;
    margin: 0.5rem 0 0.25rem;
  }
  h2{
    color:#48b;
     margin: 0.5rem 0 0.25rem;

  }
  dl{
    display: grid;
    grid-template-columns: 175px auto;
    padding: 8px;
  }
  dt{
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    
    
  }
  dt:after{
      content:":";
  }
  ol{
    list-style-type: none;
    margin-left: 1.5rem;
    list-style-type: none;
  }
  ol {
    counter-reset: custom-list-counter;
  }

  li {
   counter-increment: custom-list-counter;
  }

  li::before {
   content: counter(custom-list-counter) ". ";
  }

  ol ol li::before {
   content: counter(custom-list-counter, lower-alpha) ". ";
  }

  section{
    page-break-inside: avoid;
    break-inside: avoid;
  }

</style>
<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS MÓVEIS – TITULARIDADE
<br/>EMPRESARIAL</h1>
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

<section>
<h2>CLÁUSULA PRIMEIRA – DO OBJETO</h2>
<p>O presente contrato tem por objeto a prestação de serviço de telecomunicação móvel
pessoal (SMP) pela Credheinz Intermediação de Negócios LTDA, com a linha móvel ativada
sob a titularidade da empresa, possibilitando ao CONTRATANTE usufruir de plano exclusivo
destinado a pessoas jurídicas, nos termos deste instrumento e da regulamentação vigente
da Agência Nacional de Telecomunicações – ANATEL.</p>
</section>

<section>
<h2>CLÁUSULA SEGUNDA – DA TITULARIDADE DA LINHA</h2>
<ol>
<li>A titularidade da linha telefônica permanecerá registrada sob o CNPJ da Credheinz Intermediação de Negócios LTDA durante todo o período de vigência contratual.</li>
<li>O CONTRATANTE reconhece que, por meio deste contrato, está autorizado a utilizar a linha móvel e os serviços vinculados, mesmo não sendo o titular direto do número.</li>
</ol>
</section>

<section>
<h2>CLÁUSULA TERCEIRA – DO PRAZO E FIDELIDADE CONTRATUAL</h2>
<ol>
<li>O presente contrato terá vigência de 12 meses, contados a partir da data de ativação da linha.</li>
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

<section>
<h2>CLÁUSULA QUARTA – DA MULTA POR RESCISÃO ANTECIPADA</h2>
<ol>
<li>Em caso de rescisão contratual total por parte do CONTRATANTE antes do término do período de fidelidade, será cobrada multa proporcional ao tempo restante de vigência, limitada ao valor total do plano, vezes número de meses restantes até os 12 meses de vigência.</li>
<li>Em caso de rescisão contratual parcial por parte do CONTRATANTE antes do término do período de fidelidade, será cobrada multa proporcional ao tempo restante de vigência, limitada ao valor do plano para cada linha contratada, vezes número de meses restantes até os 12 meses de vigência.</li>
<li>A multa será devida mesmo nos casos de portabilidade, desativação, transferência de titularidade sem autorização ou inadimplência.</li>
</ol>
</section>

<section>
<h2>CLÁUSULA QUINTA – DAS OBRIGAÇÕES DA CONTRATADA</h2>
<p>A CONTRATADA compromete-se a:</p>
<ol>
<li>Prestar os serviços conforme os padrões de qualidade exigidos pela ANATEL;</li>
<li>Informar o CONTRATANTE sobre quaisquer alterações no plano ou nos valores;</li>
<li>Permitir, após a fidelidade, a transferência da titularidade da linha, conforme solicitação do CONTRATANTE e em conformidade com os critérios operacionais e legais vigentes.</li>
</ol>
</section>

<section>
<h2>CLÁUSULA SEXTA – DAS OBRIGAÇÕES DO CONTRATANTE</h2>
<ol>
<li>Utilizar os serviços de forma responsável, conforme a legislação aplicável;</li>
<li>Efetuar os pagamentos acordados em dia;</li>
<li>Manter seus dados atualizados junto à CONTRATADA;</li>
<li>Não solicitar portabilidade da linha sem a quitação total do contrato ou anuência da CONTRATADA.</li>
</ol>
</section>

<section>
<h2>CLÁUSULA SÉTIMA – DISPOSIÇÕES GERAIS</h2>
<ol>
<li>O presente contrato está em conformidade com as normas da Resolução nº 632/2014 da ANATEL e demais legislações aplicáveis.</li>
<li>As partes concordam com os termos do contrato, fazendo a validação digital em plataforma utilizada pela CONTRATADA.</li>
<li>As partes podem eleger o foro da comarca de [Palhoça/SC] para dirimir quaisquer controvérsias oriundas deste contrato.</li>
</ol>
</section>
<br/>
<br/>

`;
}
