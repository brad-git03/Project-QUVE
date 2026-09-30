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
  emitRoom(room);
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
