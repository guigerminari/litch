# Litch RPG Webapp

Base de webapp para um RPG text-based com combate por turno, chat, mercado entre jogadores e informacoes em tempo real.

## Stack

- React + Vite + TypeScript no cliente.
- Node + TypeScript + Socket.IO no servidor realtime.
- Dominio modular com servidor autoritativo.
- Store em memoria para desenvolvimento. A proxima etapa natural e trocar os repositorios por PostgreSQL e Redis.

## Rodando

```bash
npm install
npm run dev
```

Cliente: http://127.0.0.1:5173

Servidor realtime: http://127.0.0.1:3001

## Regras implementadas

- Cadastro cria jogador e personagem automaticamente.
- Atributos iniciais: FORCA, CONSTITUICAO e AGILIDADE com 1 ponto.
- Equipamentos: arma, armadura e amuleto.
- Inventario com capacidade de 40 itens.
- Viagem entre cidades com custo e nivel minimo.
- Cidade principal com Cacar, Arena, Armeiro e Boticario.
- Combate por turno com dano baseado em FORCA atacante menos DEFESA defensor.
- Vida do personagem: `nivel * 50 + 2 * CON`.
- FORCA total: `nivel * 10 + atributo FORCA`.
- AGILIDADE controla critico e esquiva.
- Experiencia, nivel, pontos de atributo e chance de drop em monstros.
- Venda para NPC apenas no Armeiro.
- Chat e atualizacoes realtime via WebSocket.

## Sistema de raridade

O projeto possui um sistema de raridade compartilhado entre cliente e servidor com 5 niveis:

- common (Comum)
- uncommon (Incomum)
- rare (Raro)
- epic (Epico)
- legendary (Lendario)

### Probabilidades

A chance de um item sair acima de comum segue:

- uncommon: 20%
- rare: 8%
- epic: 3%
- legendary: 1%

Quando nenhuma dessas faixas e atendida, o item fica como common.

Distribuicao final:

- common: 68%
- uncommon: 20%
- rare: 8%
- epic: 3%
- legendary: 1%

### Multiplicadores

Cada raridade aumenta 20% em relacao a anterior, tanto para atributos quanto para preco:

- common: 1.0000
- uncommon: 1.2000
- rare: 1.4400
- epic: 1.7280
- legendary: 2.0736

Formula base:

- multiplicador(n) = 1.2^n, onde n = 0..4

### Estrutura tecnica

- `Rarity` e definido em `src/shared/types.ts`.
- `ItemDefinition` possui o campo opcional `rarity?: Rarity`.
- As regras de chance e multiplicador ficam em `src/shared/rarity.ts`:
	- `RARITY_CHANCES`
	- `RARITY_STAT_MULTIPLIER`
	- `RARITY_PRICE_MULTIPLIER`
	- `getRarityFromRoll()`

### Comportamento no cliente

- A raridade e exibida com label (Comum, Incomum, Raro, Epico, Lendario).
- Bordas de equipamentos usam cor de raridade nas listagens e modal do mercado.
- O destaque visual por borda e aplicado apenas para equipamentos (itens com `slot`).

### Estado atual de integracao

- O utilitario de sorteio (`getRarityFromRoll`) ja existe e esta pronto para uso.
- Neste momento, o servidor ainda nao aplica sorteio automatico de raridade na geracao de itens.
- Sem `rarity` explicita no item, o cliente trata como `common`.
