const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', game: 'Project Quve', version: '0.1.0' });
});

function safeName(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 20);
}

function publicRoom(room) {
  return {
    code: room.code,
    phase: room.phase,
    deadline: room.deadline,
    players: room.players.map(({ id, name, ready }) => ({ id, name, ready }))
  };
}

function emitRoom(room) {
  io.to(room.code).emit('room:state', publicRoom(room));
}

function startPreDuel(room) {
  room.phase = 'preduel';
  room.deadline = Date.now() + 30000;
  room.players.forEach(player => { player.ready = false; });
  emitRoom(room);
  room.timer = setTimeout(() => startArena(room), 30050);
}

function startArena(room) {
  if (room.phase === 'arena') return;
  clearTimeout(room.timer);
  room.phase = 'arena';
  room.deadline = null;
  room.battle = { round: 1, submissions: new Map(), completed: new Set(), resolving: false };
  emitRoom(room);
  emitBattleState(room);
}

function battleState(room) {
  const battle = room.battle || { round: 1, submissions: new Map(), resolving: false };
  return {
    round: battle.round,
    resolving: battle.resolving,
    players: room.players.map(player => ({ id: player.id, name: player.name, submitted: battle.submissions.has(player.id) }))
  };
}

function emitBattleState(room) {
  io.to(room.code).emit('battle:turnState', battleState(room));
}

io.on('connection', socket => {
  socket.on('room:create', ({ name } = {}, reply = () => {}) => {
    const playerName = safeName(name);
    if (!playerName) return reply({ ok: false, error: 'Enter a valid player name.' });
    let code;
    do code = Math.random().toString(36).slice(2, 8).toUpperCase(); while (rooms.has(code));
    const room = { code, phase: 'lobby', deadline: null, timer: null, players: [{ id: socket.id, name: playerName, ready: false, lineup: [] }] };
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    reply({ ok: true, room: publicRoom(room) });
    emitRoom(room);
  });

  socket.on('room:join', ({ code, name } = {}, reply = () => {}) => {
    const room = rooms.get(String(code || '').toUpperCase());
    const playerName = safeName(name);
    if (!room || room.phase !== 'lobby') return reply({ ok: false, error: 'This invite is invalid or the duel already started.' });
    if (!playerName) return reply({ ok: false, error: 'Enter a valid player name.' });
    if (room.players.length >= 2) return reply({ ok: false, error: 'This duel room is already full.' });
    room.players.push({ id: socket.id, name: playerName, ready: false, lineup: [] });
    socket.join(room.code);
    socket.data.roomCode = room.code;
    reply({ ok: true, room: publicRoom(room) });
    io.to(room.players[0].id).emit('invite:accepted', { name: playerName });
    emitRoom(room);
    setTimeout(() => startPreDuel(room), 3200);
  });

  socket.on('preduel:ready', ({ lineup } = {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.phase !== 'preduel') return;
    const player = room.players.find(item => item.id === socket.id);
    if (!player) return;
    player.ready = true;
    player.lineup = Array.isArray(lineup) ? lineup.slice(0, 3) : [];
    emitRoom(room);
    if (room.players.length === 2 && room.players.every(item => item.ready)) startArena(room);
  });

  socket.on('battle:sync', () => {
    const room = rooms.get(socket.data.roomCode);
    if (room?.phase === 'arena') socket.emit('battle:turnState', battleState(room));
  });

  socket.on('battle:submit', ({ round, actions } = {}, reply = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    const battle = room?.battle;
    if (!room || room.phase !== 'arena' || !battle || battle.resolving) return reply({ ok: false, error: 'Turn is not accepting actions.' });
    if (round !== battle.round || battle.submissions.has(socket.id)) return reply({ ok: false, error: 'This turn was already submitted or has advanced.' });
    const cleanActions = Array.isArray(actions) ? actions.slice(0, 10).map(action => ({
      cardId: String(action.cardId || '').slice(0, 40),
      casterPosition: Math.max(1, Math.min(3, Number(action.casterPosition) || 1)),
      targetPosition: Math.max(1, Math.min(3, Number(action.targetPosition) || 1))
    })) : [];
    battle.submissions.set(socket.id, cleanActions);
    reply({ ok: true });
    emitBattleState(room);
    if (room.players.length === 2 && room.players.every(player => battle.submissions.has(player.id))) {
      battle.resolving = true;
      const turns = room.players.map((player, index) => ({ playerId: player.id, playerIndex: index, actions: battle.submissions.get(player.id) }));
      io.to(room.code).emit('battle:resolve', { round: battle.round, seed: Math.floor(Math.random() * 2147483646) + 1, turns });
      emitBattleState(room);
    }
  });

  socket.on('battle:complete', ({ round } = {}) => {
    const room = rooms.get(socket.data.roomCode);
    const battle = room?.battle;
    if (!battle || !battle.resolving || round !== battle.round) return;
    battle.completed.add(socket.id);
    if (room.players.length === 2 && room.players.every(player => battle.completed.has(player.id))) {
      battle.round += 1;
      battle.submissions.clear();
      battle.completed.clear();
      battle.resolving = false;
      emitBattleState(room);
    }
  });

  socket.on('disconnect', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return;
    room.players = room.players.filter(player => player.id !== socket.id);
    if (!room.players.length) {
      clearTimeout(room.timer);
      rooms.delete(room.code);
    } else {
      room.phase = 'lobby';
      room.deadline = null;
      clearTimeout(room.timer);
      room.players.forEach(player => { player.ready = false; });
      emitRoom(room);
      io.to(room.code).emit('room:notice', 'Your opponent disconnected. Waiting for a new challenger.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎮 Project Quve Local Prototype is Running!`);
  console.log(`🌐 Open in your browser: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
