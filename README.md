# Litch RPG Webapp

Base de webapp para um RPG text-based com combate por turno, chat, mercado entre jogadores e informações em tempo real.

## Stack

- React + Vite + TypeScript no cliente.
- Node + TypeScript + Socket.IO no servidor realtime.
- Domínio modular com servidor autoritativo.
- Persistência local em `data/game-state.json`, incluindo contas, personagens, mercado, chat, clãs e batalhas.

## Rodando

```bash
npm install
npm run dev
```

Cliente: http://127.0.0.1:5173

Servidor realtime: http://127.0.0.1:3001

## E-mail

Cadastro e recuperação de senha usam links enviados por e-mail. Em desenvolvimento, se SMTP não estiver configurado, os e-mails são gravados em `data/email-outbox.log`.

Variáveis para envio real:

```bash
PUBLIC_APP_URL=https://seu-site.com
CLIENT_ORIGIN=https://seu-site.com
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM="Litch <no-reply@seudominio.com>"
```

## Regras implementadas

- Cadastro cria jogador e personagem automaticamente.
- Login com e-mail e senha, confirmação de e-mail, logout de sessão e redefinição de senha por link seguro.
- Atributos iniciais: FORÇA, CONSTITUIÇÃO e AGILIDADE com 1 ponto.
- Equipamentos: arma, armadura e amuleto.
- Inventário com capacidade de 40 itens.
- Viagem entre cidades com custo e nível mínimo.
- Cidade principal com Caçar, Arena, Armeiro e Boticário.
- Combate por turno com dano baseado em FORÇA atacante menos DEFESA defensor.
- Vida do personagem: `nível * 50 + 2 * CON`.
- FORÇA total: `nível * 10 + atributo FORÇA`.
- AGILIDADE controla crítico e esquiva.
- Experiência, nível, pontos de atributo e chance de drop em monstros.
- Venda para NPC apenas no Armeiro.
- Chat e atualizações realtime via WebSocket.

## Sistema de raridade

O projeto possui um sistema de raridade compartilhado entre cliente e servidor com 5 níveis:

- common (Comum)
- uncommon (Incomum)
- rare (Raro)
- epic (Épico)
- legendary (Lendário)

### Probabilidades

A chance de um item sair acima de comum segue:

- uncommon: 20%
- rare: 8%
- epic: 3%
- legendary: 1%

Quando nenhuma dessas faixas é atendida, o item fica como common.

Distribuição final:

- common: 68%
- uncommon: 20%
- rare: 8%
- epic: 3%
- legendary: 1%

### Multiplicadores

Cada raridade aumenta 20% em relação a anterior, tanto para atributos quanto para preço:

- common: 1.0000
- uncommon: 1.2000
- rare: 1.4400
- epic: 1.7280
- legendary: 2.0736

Fórmula base:

- multiplicador(n) = 1.2^n, onde n = 0..4

### Estrutura técnica

- `Rarity` é definido em `src/shared/types.ts`.
- `ItemDefinition` possui o campo opcional `rarity?: Rarity`.
- As regras de chance e multiplicador ficam em `src/shared/rarity.ts`:
	- `RARITY_CHANCES`
	- `RARITY_STAT_MULTIPLIER`
	- `RARITY_PRICE_MULTIPLIER`
	- `getRarityFromRoll()`

### Comportamento no cliente

- A raridade é exibida com label (Comum, Incomum, Raro, Épico, Lendário).
- Bordas de equipamentos usam cor de raridade nas listagens e modal do mercado.
- O destaque visual por borda é aplicado apenas para equipamentos (itens com `slot`).

### Estado atual de integração

- O utilitário de sorteio (`getRarityFromRoll`) já existe e está pronto para uso.
- Neste momento, o servidor ainda não aplica sorteio automático de raridade na geração de itens.
- Sem `rarity` explícita no item, o cliente trata como `common`.
