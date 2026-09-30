import { GameApp } from './app.js';

const socket = io();
const params = new URLSearchParams(location.search);
const invitedRoom = params.get('room')?.toUpperCase();
const screens = ['lobbyScreen', 'roomScreen', 'preDuelScreen', 'arenaScreen'];
const roster = [
  { id: 'terracube', name: 'Terracube', type: 'ROCK', role: 'VANGUARD', hp: 460, power: 40, glyph: '◆', color: '#c0a987' },
  { id: 'floraquve', name: 'FloraQuve', type: 'PLANT', role: 'SUPPORT', hp: 440, power: 45, glyph: '✦', color: '#58e49c' },
  { id: 'aquafang', name: 'AquaFang', type: 'FISH', role: 'STRIKER', hp: 380, power: 55, glyph: '◈', color: '#58bfff' },
  { id: 'ignis', name: 'IgnisQuve', type: 'MAGMA', role: 'BRAWLER', hp: 360, power: 65, glyph: '▲', color: '#ff695d' },
  { id: 'zephyr', name: 'ZephyrBox', type: 'WIND', role: 'SCOUT', hp: 370, power: 50, glyph: '⌁', color: '#71e4e2' }
];

let room = null;
let selected = [];
let timerHandle = null;
let gameStarted = false;
let game = null;
let pendingBattleState = null;
let pendingResolution = null;
let playerName = sessionStorage.getItem('quve-player-name') || '';

const $ = id => document.getElementById(id);

function showScreen(id) {
  screens.forEach(screen => $(screen).classList.toggle('hidden', screen !== id));
  document.querySelectorAll('.arena-only').forEach(el => el.classList.toggle('hidden', id !== 'arenaScreen'));
}

function error(message = '') {
  $('lobbyError').textContent = message;
}

function renderRoster() {
  $('lineupRoster').innerHTML = roster.map(quve => {
    const order = selected.indexOf(quve.id);
    return `<button class="roster-card ${order >= 0 ? 'selected' : ''}" data-id="${quve.id}" style="--quve:${quve.color}">
      <span class="selection-order">${order >= 0 ? order + 1 : '+'}</span>
      <div class="roster-art"><i>${quve.glyph}</i><span></span></div>
      <small>${quve.type} / ${quve.role}</small><h3>${quve.name}</h3>
      <div class="roster-stats"><span>♥ <b>${quve.hp}</b> HP</span><span>⚔ <b>${quve.power}</b> PWR</span></div>
    </button>`;
  }).join('');
  document.querySelectorAll('.roster-card').forEach(card => card.addEventListener('click', () => toggleQuve(card.dataset.id)));
  renderFormation();
}

function toggleQuve(id) {
  if (room?.players.find(player => player.id === socket.id)?.ready) return;
  if (selected.includes(id)) selected = selected.filter(item => item !== id);
  else if (selected.length < 3) selected.push(id);
  renderRoster();
}

function renderFormation() {
  $('formationSlots').innerHTML = [0, 1, 2].map((_, index) => {
    const quve = roster.find(item => item.id === selected[index]);
    return `<span class="formation-slot ${quve ? 'filled' : ''}"><b>${index + 1}</b>${quve ? `<i style="color:${quve.color}">${quve.glyph}</i><em>${quve.name}</em>` : '<em>EMPTY</em>'}</span>`;
  }).join('');
  $('readyBtn').disabled = selected.length !== 3;
  $('readyBtn').querySelector('span').textContent = `${selected.length} / 3`;
}

function updateRoom(nextRoom) {
  const previousPhase = room?.phase;
  room = nextRoom;
  const me = room.players.find(player => player.id === socket.id);
  const rival = room.players.find(player => player.id !== socket.id);

  if (room.phase === 'lobby') {
    showScreen('roomScreen');
    $('roomCode').textContent = room.code;
    $('hostName').textContent = room.players[0]?.name || playerName;
    const link = `${location.origin}${location.pathname}?room=${room.code}`;
    $('inviteLink').value = link;
    if (rival) {
      $('opponentSlot').classList.add('occupied');
      $('opponentSlot').querySelector('h2').textContent = rival.name;
      $('opponentSlot').querySelector('small').textContent = 'CONNECTED';
    }
  }

  if (room.phase === 'preduel') {
    showScreen('preDuelScreen');
    renderRoster();
    $('yourReadyLabel').textContent = me?.ready ? 'YOU / LOCKED IN' : 'YOU / SELECTING';
    $('opponentReadyLabel').textContent = rival?.ready ? 'RIVAL / READY' : 'RIVAL / SELECTING';
    $('opponentReadyDot').classList.toggle('active', Boolean(rival?.ready));
    if (me?.ready) {
      $('readyBtn').disabled = true;
      $('readyBtn').classList.add('locked');
      $('readyBtn').firstChild.textContent = 'LINEUP LOCKED ';
    }
    startTimer(room.deadline);
  }

  if (room.phase === 'arena' && previousPhase !== 'arena') enterArena();
}

function startTimer(deadline) {
  clearInterval(timerHandle);
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    $('lineupTimer').textContent = remaining;
    $('timerProgress').style.strokeDashoffset = `${226 - (remaining / 30) * 226}`;
  };
  tick();
  timerHandle = setInterval(tick, 250);
}

async function enterArena() {
  clearInterval(timerHandle);
  if (gameStarted) return;
  gameStarted = true;
  screens.forEach(id => $(id).classList.add('hidden'));
  $('arenaLoader').classList.remove('hidden');
  await new Promise(resolve => setTimeout(resolve, 2100));
  $('arenaLoader').classList.add('hidden');
  showScreen('arenaScreen');
  game = new GameApp({
    multiplayer: {
      playerId: socket.id,
      submitTurn: (round, actions) => new Promise(resolve => socket.emit('battle:submit', { round, actions }, resolve)),
      completeTurn: round => socket.emit('battle:complete', { round })
    }
  });
  if (pendingBattleState) game.applyBattleState(pendingBattleState);
  if (pendingResolution) {
    game.resolveSyncedTurn(pendingResolution);
    pendingResolution = null;
  }
  socket.emit('battle:sync');
}

$('playerName').value = playerName;
if (invitedRoom) {
  $('createRoomBtn').firstChild.textContent = 'ACCEPT DUEL INVITE ';
  document.querySelector('.lobby-hero > p').textContent = `You were invited to private room ${invitedRoom}. Enter your callsign to accept the challenge.`;
}

$('createRoomBtn').addEventListener('click', () => {
  playerName = $('playerName').value.trim();
  if (!playerName) return error('A callsign is required before you can create or accept an invite.');
  sessionStorage.setItem('quve-player-name', playerName);
  error();
  const event = invitedRoom ? 'room:join' : 'room:create';
  const payload = invitedRoom ? { code: invitedRoom, name: playerName } : { name: playerName };
  socket.emit(event, payload, response => {
    if (!response?.ok) return error(response?.error || 'Unable to enter the duel room.');
    updateRoom(response.room);
  });
});

$('playerName').addEventListener('keydown', event => { if (event.key === 'Enter') $('createRoomBtn').click(); });
$('copyInviteBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('inviteLink').value); }
  catch { $('inviteLink').select(); document.execCommand('copy'); }
  $('copyFeedback').classList.add('show');
  $('copyInviteBtn').textContent = 'COPIED ✓';
  setTimeout(() => { $('copyFeedback').classList.remove('show'); $('copyInviteBtn').textContent = 'COPY LINK'; }, 2200);
});

$('readyBtn').addEventListener('click', () => {
  if (selected.length !== 3) return;
  socket.emit('preduel:ready', { lineup: selected });
});

socket.on('connect', () => { $('networkStatus').textContent = 'ONLINE / ' + socket.id.slice(0, 5).toUpperCase(); });
socket.on('disconnect', () => { $('networkStatus').textContent = 'RECONNECTING'; });
socket.on('room:state', updateRoom);
socket.on('room:notice', message => error(message));
socket.on('battle:turnState', state => {
  pendingBattleState = state;
  if (game) game.applyBattleState(state);
});
socket.on('battle:resolve', packet => {
  if (game) game.resolveSyncedTurn(packet);
  else pendingResolution = packet;
});
socket.on('invite:accepted', ({ name }) => {
  $('acceptedName').textContent = name;
  $('acceptModal').classList.remove('hidden');
  let count = 3;
  $('acceptCountdown').textContent = count;
  const interval = setInterval(() => {
    count -= 1;
    $('acceptCountdown').textContent = Math.max(0, count);
    if (count <= 0) { clearInterval(interval); $('acceptModal').classList.add('hidden'); }
  }, 1000);
});

showScreen('lobbyScreen');
