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
