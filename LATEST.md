# Emissão manual de títulos + consulta unificada (Contrato/Manual)

Data: 2026-08-11

## O que foi pedido

Na área de Títulos deveria haver duas áreas/dois botões:
1. Emissão **automática** de boletos/faturas a partir de contratos assinados (já existia).
2. Emissão **manual** de um título/boleto avulso, com valor editável, para qualquer cliente já cadastrado (sem depender de contrato).

E uma área de **consulta** mostrando o status de todos os boletos emitidos — tanto os automáticos (via contrato) quanto os manuais/esporádicos.

## O que foi feito

### Banco de dados
Migração `drizzle/0003_titulo_manual.sql` (já aplicada no banco Neon de produção):
- `titulo.id_contrato` deixou de ser obrigatório (título manual não tem contrato).
- Novo `titulo.id_cliente` (NOT NULL, FK → `cliente.id`) — preenchido nos dois fluxos, o que simplificou os joins de listagem/detalhe (antes era `titulo → contrato → cliente`, agora é direto `titulo → cliente`).
- Novo `titulo.origem` (`"CONTRATO"` | `"MANUAL"`, default `"CONTRATO"`).
- Novo `titulo.descricao` (texto livre, opcional — motivo do título manual).
- A tabela `titulo` estava vazia em produção no momento da migração, então o backfill de dados não teve risco.

### Backend
- **`src/lib/titulo-helpers.ts`** (novo): extrai `limparDocumento`, `ultimoDiaDoMes`, `gerarSeuNumero`, `parseEndereco` e `montarPagador` (antes duplicados/inline em `api/titulos/route.ts`) para reuso entre os dois fluxos de criação. Adiciona `gerarSeuNumeroManual(idCliente)` para o fluxo avulso.
- **`POST /api/titulos/manual`** (novo, `src/app/api/titulos/manual/route.ts`): recebe `{ idCliente, valor, vencimento, descricao? }`, valida o cliente (existe e está ativo), monta o pagador e emite o boleto via Unicred (mesma integração do fluxo automático, que já era agnóstica de contrato). Grava `origem: "MANUAL"` e `idContrato: null`.
- **`POST /api/titulos`** (fluxo automático, inalterado no comportamento): passou a gravar `idCliente` e `origem: "CONTRATO"` também.
- **`GET /api/titulos`**: join direto por `titulo.idCliente → cliente` (mais simples e correto que via contrato); novo filtro `origem`.
- **`GET /api/titulos/[id]`**: mesma troca de join; a seção de contrato na resposta vira `null` quando o título é manual.
- **`src/lib/schemas.ts`**: novo `createTituloManualSchema`; `listTitulosQuerySchema` ganhou o filtro `origem`.

### Frontend
- **`src/app/titulos/page.tsx`** (área de consulta): dois botões no cabeçalho — "Emitir via contrato assinado" (`/titulos/new`, fluxo já existente) e "Emitir título manual" (`/titulos/manual/new`, novo). Filtro dropdown "Origem" (Todos/Contrato/Manual) na barra de busca. Badge de origem em cada card da lista, ao lado do badge de status. Exibe a `descricao` quando o título é manual.
- **`src/app/titulos/manual/new/page.tsx`** (novo): formulário com select de cliente (reaproveita o padrão `loadAllPages` já usado no resto do projeto), valor editável, vencimento (data específica, não "mês de referência" como no fluxo automático) e descrição opcional.
- **`src/app/titulos/[id]/page.tsx`**: seção "Contrato" agora é condicional — só aparece se o título tiver contrato; título manual mostra a descrição no lugar.
- **`src/app/types/titulo.ts`**: tipos atualizados (`idContrato` e `contrato` viram nullable, novos campos `idCliente`/`origem`/`descricao`).

## Como foi validado

- `npx tsc --noEmit` e `npm run lint`: sem novos erros/warnings introduzidos.
- Servidor de dev rodado localmente contra o banco de produção real (219 clientes cadastrados, 0 títulos na tabela no momento do teste).
- Screenshots da UI autenticada confirmando: os dois botões no cabeçalho de `/titulos`, o filtro de origem, a lista vazia funcionando sem erro, e o formulário de `/titulos/manual/new` renderizando corretamente com os clientes carregados.
- Testes de API (`curl`) nos casos de erro do `POST /api/titulos/manual`: cliente inexistente (404) e payload inválido (400) responderam corretamente.
- **Não foi emitido nenhum boleto manual real via Unicred** — isso exigiria chamar a API real do banco e criar um título de verdade vinculado a um cliente de produção, o que foi deixado para o usuário testar manualmente quando desejar (decisão tomada em conjunto durante a implementação).

## Pontas soltas / notas para o futuro

- O botão "Gerar Título" em `src/app/contratos/page.tsx` continua usando o mesmo `POST /api/titulos` do fluxo automático — não foi alterado, só precisa continuar funcionando (e continua, pois grava `idCliente`/`origem` normalmente).
- `src/lib/unicred.ts`, `src/app/api/webhooks/unicred/route.ts` e `src/app/api/titulos/[id]/status/route.ts` são agnósticos de origem (contrato vs. manual) e não precisaram de alteração.
- O plano completo desta implementação (com o detalhamento de cada arquivo) ficou salvo em `C:\Users\Pichau\.claude\plans\na-parte-de-t-tulos-deep-robin.md`.
