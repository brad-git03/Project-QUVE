// Project Quve - Main Game Application Controller

import { createStarterPlayerTeam, createEnemyTeam } from './quve.js';
import { CARDS } from './cards.js';
import { activateActionShield, executeCardAction, sortActionQueue, getClosestTarget } from './combat.js';
import { BattleRenderer } from './renderer.js';

export class GameApp {
  constructor() {
    this.canvas = document.getElementById('battleCanvas');
    this.renderer = new BattleRenderer(this.canvas);

    // Game State
    this.round = 1;
    this.energy = 3;
    this.maxEnergy = 10;
    this.qvcTokens = 150;
    this.state = 'SELECTION'; // 'SELECTION' | 'RESOLVING' | 'GAME_OVER'

    // Teams
    this.playerTeam = createStarterPlayerTeam();
    this.enemyTeam = createEnemyTeam();

    // Cards & Deck
    this.drawDeck = [];
    this.discardPile = [];
    this.hand = [];
    this.queuedActions = []; // Array of { caster, card, target, cost }

    // Targeting
    this.selectedTarget = this.enemyTeam[0]; // default to enemy frontliner
    this.activeCasterId = null;

    this.initDeck();
    this.bindEvents();
    this.startRound(1);
    this.gameLoop();
  }

  initDeck() {
    this.drawDeck = [];
    // Populate deck with 5 cards from each of the 3 player Quves = 15 cards
    this.playerTeam.forEach(quve => {
      quve.getCards().forEach(card => {
        this.drawDeck.push({ ...card, casterId: quve.id, uid: Math.random().toString(36).substr(2, 9) });
      });
    });
    this.shuffle(this.drawDeck);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  cleanDeadQuveCards() {
    const alivePlayerIds = new Set(this.playerTeam.filter(q => q.isAlive()).map(q => q.id));
    const previousHandLength = this.hand.length;

    // Filter out cards of dead Quves from the hand into discard
    this.hand = this.hand.filter(card => {
      if (!alivePlayerIds.has(card.casterId)) {
        this.discardPile.push(card);
        return false;
      }
      return true;
    });

    if (this.hand.length !== previousHandLength) {
      this.logMessage(`🎴 Cards of fallen Quves were removed from your hand.`);
      this.renderHandUI();
    }
  }

  drawCards(count) {
    const alivePlayerIds = new Set(this.playerTeam.filter(q => q.isAlive()).map(q => q.id));
    if (alivePlayerIds.size === 0) return;

    let drawn = 0;
    let attempts = 0;
    const maxAttempts = 30;

    while (drawn < count && this.hand.length < 9 && attempts < maxAttempts) {
      attempts++;
      if (this.drawDeck.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawDeck = [...this.discardPile];
        this.discardPile = [];
        this.shuffle(this.drawDeck);
        this.logMessage('🔄 Discard pile shuffled back into draw deck.');
      }

      const card = this.drawDeck.pop();
      if (!card) break;

      // Only draw cards if the casting Quve is currently alive!
      if (alivePlayerIds.has(card.casterId)) {
        this.hand.push(card);
        drawn++;
      } else {
        // Discard fallen Quve card immediately
        this.discardPile.push(card);
      }
    }

    this.renderHandUI();
  }

  startRound(roundNumber) {
    this.round = roundNumber;
    this.state = 'SELECTION';
    this.queuedActions = [];

    // Gain energy (+2 per round, starting at 3 in round 1)
    if (roundNumber === 1) {
      this.energy = 3;
      this.drawCards(6); // Initial 6 cards
    } else {
      this.energy = Math.min(this.maxEnergy, this.energy + 2);
      this.drawCards(3); // Draw 3 cards per round
    }

    // Reset round shields and temp buffs
    this.playerTeam.forEach(q => q.resetRound());
    this.enemyTeam.forEach(q => q.resetRound());

    // Update target if current is dead
    if (!this.selectedTarget || !this.selectedTarget.isAlive()) {
      this.selectedTarget = getClosestTarget(this.enemyTeam);
    }

    this.logMessage(`🚩 ─── ROUND ${this.round} COMMENCED ─── (Energy: ${this.energy}/${this.maxEnergy})`);
    this.updateHUD();
    this.renderHandUI();
    this.renderQueueUI();
  }

  queueCard(cardInstance) {
    if (this.state !== 'SELECTION') return;

    if (this.energy < cardInstance.cost) {
      this.logMessage(`⚠️ Not enough energy! Need ${cardInstance.cost}, have ${this.energy}.`);
      return;
    }

    const caster = this.playerTeam.find(q => q.id === cardInstance.casterId);
    if (!caster || !caster.isAlive()) {
      this.logMessage(`⚠️ Cannot play card: ${caster?.name || 'Quve'} is knocked out!`);
      return;
    }

    // Deduct energy
    this.energy -= cardInstance.cost;

    // Remove from hand
    const index = this.hand.findIndex(c => c.uid === cardInstance.uid);
    if (index !== -1) {
      this.hand.splice(index, 1);
    }

    // Add to queue
    this.queuedActions.push({
      caster,
      card: cardInstance,
      target: this.selectedTarget,
      isPlayer: true
    });

    this.logMessage(`📌 Queued: [${cardInstance.name}] on ${this.selectedTarget?.name || 'Enemy'}`);
    this.updateHUD();
    this.renderHandUI();
    this.renderQueueUI();
  }

  unqueueCard(queueIndex) {
    if (this.state !== 'SELECTION') return;
    const action = this.queuedActions[queueIndex];
    if (!action) return;

    // Refund energy
    this.energy += action.card.cost;
    // Return card to hand
    this.hand.push(action.card);
    // Remove from queue
    this.queuedActions.splice(queueIndex, 1);

    this.updateHUD();
    this.renderHandUI();
    this.renderQueueUI();
  }

  // Simple Enemy AI: Selects 2-3 cards based on alive Quves and plays them
  generateEnemyActions() {
    const enemyActions = [];
    const aliveEnemies = this.enemyTeam.filter(q => q.isAlive());
    if (aliveEnemies.length === 0) return enemyActions;

    let enemyEnergy = Math.min(10, 2 + this.round);

    aliveEnemies.forEach(enemy => {
      if (enemyEnergy <= 0) return;
      const enemyCards = enemy.getCards();
      // Pick 1 random affordable card
      const playable = enemyCards.filter(c => c.cost <= enemyEnergy);
      if (playable.length > 0) {
        const chosen = playable[Math.floor(Math.random() * playable.length)];
        enemyEnergy -= chosen.cost;
        enemyActions.push({
          caster: enemy,
          card: chosen,
          target: getClosestTarget(this.playerTeam),
          isPlayer: false
        });
      }
    });

    return enemyActions;
  }

  async endTurnAndResolve() {
    if (this.state !== 'SELECTION') return;
    this.state = 'RESOLVING';

    const enemyActions = this.generateEnemyActions();
    const allActions = [...this.queuedActions, ...enemyActions];

    // Sort strictly by Speed & Tiebreaker rules from combat_rules.md
    const timeline = sortActionQueue(allActions);

    this.logMessage(`⚡ Commencing Battle Resolution Phase (${timeline.length} actions queued)...`);
    this.renderQueueUI(timeline);

    // Activate every selected card's shield together at turn end, before the
    // first speed-ordered action can deal damage.
    timeline.forEach(action => {
      const shieldEvent = activateActionShield(action);
      if (!shieldEvent) return;

      this.logMessage(shieldEvent.text);
      const casterPos = this.renderer.positions[shieldEvent.casterId];
      if (casterPos) {
        this.renderer.addFloatingText(casterPos.x, casterPos.y - 20, `+${shieldEvent.amount} 🛡️`, '#63b3ed');
      }
    });
    this.updateHUD();

    // Move played cards to discard
    this.queuedActions.forEach(a => this.discardPile.push(a.card));
    this.queuedActions = [];

    // Execute actions sequentially with animations
    for (const action of timeline) {
      if (!action.caster.isAlive()) continue;

      this.activeCasterId = action.caster.id;
      const friendlyTeam = action.isPlayer ? this.playerTeam : this.enemyTeam;
      const enemyTeam = action.isPlayer ? this.enemyTeam : this.playerTeam;

      // Animate Lunge Attack
      await this.animateLunge(action.caster, action.target);

      // Execute card logic
      const events = executeCardAction(action, friendlyTeam, enemyTeam);

      // Process visual effects from events
      events.forEach(evt => {
        this.logMessage(evt.text);

        if (evt.type === 'ATTACK') {
          const targetPos = this.renderer.positions[evt.targetId];
          if (targetPos) {
            this.renderer.addFloatingText(targetPos.x, targetPos.y - 20, evt.isCrit ? `CRIT  -${evt.totalDamage}` : `-${evt.totalDamage}`, evt.isCrit ? '#ffe27a' : '#fc8181', evt.isCrit);
            this.renderer.addDamageParticles(targetPos.x, targetPos.y, evt.isCrit ? '#ffbd38' : '#e53e3e', evt.isCrit ? 2 : 1);
            if (evt.isCrit) this.showCriticalHit();
          }
        } else if (evt.type === 'SHIELD_GAINED') {
          const casterPos = this.renderer.positions[evt.casterId];
          if (casterPos) {
            this.renderer.addFloatingText(casterPos.x, casterPos.y - 20, `+${evt.amount} 🛡️`, '#63b3ed');
          }
        } else if (evt.type === 'HEAL') {
          const targetPos = this.renderer.positions[evt.targetId];
          if (targetPos) {
            this.renderer.addFloatingText(targetPos.x, targetPos.y - 20, `+${evt.amount} HP`, '#48bb78');
          }
        } else if (evt.type === 'DODGE') {
          const targetPos = this.renderer.positions[evt.targetId];
          if (targetPos) {
            this.renderer.addFloatingText(targetPos.x, targetPos.y - 20, 'DODGED!', '#00b4d8');
          }
        }
      });

      // A player's hand must never retain cards belonging to a Quve that was
      // defeated by this action (including recoil).
      this.cleanDeadQuveCards();

      this.updateHUD();
      await this.sleep(600);

      // Check for team wipe
      if (this.checkMatchEnd()) return;
    }

    this.activeCasterId = null;

    // End of Round Phase (DoTs, Burns, Expire shields)
    this.logMessage(`⌛ Resolving End-of-Round Phase...`);
    [...this.playerTeam, ...this.enemyTeam].forEach(quve => {
      const logs = quve.applyEndOfRound();
      logs.forEach(l => this.logMessage(l));
    });
    this.cleanDeadQuveCards();

    if (this.checkMatchEnd()) return;

    // Advance to next round
    await this.sleep(800);
    this.startRound(this.round + 1);
  }

  async animateLunge(caster, target) {
    if (!target) return;
    const direction = caster.isPlayer ? 1 : -1;
    for (let i = 0; i <= 8; i++) {
      caster.animOffset.x = Math.sin((i / 8) * Math.PI) * 40 * direction;
      await this.sleep(18);
    }
    caster.animOffset.x = 0;
  }

  checkMatchEnd() {
    const playerAlive = this.playerTeam.some(q => q.isAlive());
    const enemyAlive = this.enemyTeam.some(q => q.isAlive());

    if (!enemyAlive) {
      this.state = 'GAME_OVER';
      this.qvcTokens += 50;
      this.showGameOverModal(true);
      return true;
    }

    if (!playerAlive) {
      this.state = 'GAME_OVER';
      this.showGameOverModal(false);
      return true;
    }

    return false;
  }

  showGameOverModal(isVictory) {
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');

    if (isVictory) {
      title.innerText = 'VICTORY';
      title.className = 'result-title';
      desc.innerHTML = `You defeated the enemy team!<br><span class="text-yellow-400 font-bold">+50 QVC (Quve Coin)</span> awarded!`;
    } else {
      title.innerText = 'DEFEAT';
      title.className = 'result-title defeat';
      desc.innerText = 'All your Quves have fallen. Refine your strategy and try again!';
    }

    modal.classList.remove('hidden');
    this.updateHUD();
  }

  restartBattle() {
    document.getElementById('gameOverModal').classList.add('hidden');
    this.playerTeam = createStarterPlayerTeam();
    this.enemyTeam = createEnemyTeam();
    this.initDeck();
    this.startRound(1);
  }

  logMessage(msg) {
    const logBox = document.getElementById('battleLog');
    if (!logBox) return;
    const line = document.createElement('div');
    const isRound = msg.includes('ROUND') || msg.includes('Resolution Phase');
    const isCrit = msg.includes('CRITICAL');
    line.className = `log-entry${isRound ? ' log-round' : ''}${isCrit ? ' log-crit' : ''}`;
    line.innerHTML = msg;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  updateHUD() {
    document.getElementById('roundCounter').innerText = `Round ${this.round}`;
    document.getElementById('energyCounter').innerText = `${this.energy} / ${this.maxEnergy}`;
    document.getElementById('qvcBalance').innerText = `${this.qvcTokens} QVC`;
    document.getElementById('deckCount').innerText = `${this.drawDeck.length} cards`;
    document.getElementById('discardCount').innerText = `${this.discardPile.length} cards`;
    document.getElementById('handCount').innerText = this.hand.length;

    const endTurnBtn = document.getElementById('endTurnBtn');
    if (this.state === 'SELECTION') {
      endTurnBtn.disabled = false;
      endTurnBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      endTurnBtn.disabled = true;
      endTurnBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  renderHandUI() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    const preferredOrder = ['FloraQuve', 'AquaFang', 'Terracube'];
    const orderedQuves = [...this.playerTeam].sort((a, b) => preferredOrder.indexOf(a.name) - preferredOrder.indexOf(b.name));

    orderedQuves.forEach(caster => {
      const cards = this.hand.filter(card => card.casterId === caster.id);
      const group = document.createElement('section');
      const typeClass = `type-${caster.baseType.toLowerCase()}`;
      group.className = `quve-card-group ${typeClass}`;
      group.innerHTML = `<div class="quve-group-header"><div class="quve-group-identity"><span class="quve-group-mark">${caster.name.charAt(0)}</span><span class="quve-group-copy"><strong>${caster.name}</strong><small>${caster.baseType} Quve</small></span></div><span class="quve-group-count">${cards.length} CARD${cards.length === 1 ? '' : 'S'}</span></div><div class="quve-cards"></div>`;
      const cardsRow = group.querySelector('.quve-cards');

      cards.forEach(card => {
      const cardEl = document.createElement('article');
      const isAffordable = this.energy >= card.cost;
      const typeClass = `type-${card.type.toLowerCase()}`;

      cardEl.className = `game-card ${typeClass}${isAffordable ? '' : ' unaffordable'}`;
      cardEl.tabIndex = isAffordable ? 0 : -1;
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', `${card.name}, costs ${card.cost} energy, ${card.atk} damage, ${card.def} shield`);

      cardEl.innerHTML = `
        <div class="card-top"><span class="card-element">${card.type}</span><span class="card-cost">${card.cost}<small>ϟ</small></span></div>
        <div class="card-art"><span class="card-glyph">${this.getCardGlyph(card)}</span></div>
        <div class="card-body">
          <div class="card-name">${card.name}</div><div class="card-slot">${card.slot} part</div>
          <div class="card-stats"><span class="card-stat attack">⚔ ${card.atk}<small>DMG</small></span><span class="card-stat defense">◆ ${card.def}<small>DEF</small></span></div>
        </div>
      `;

      cardEl.addEventListener('click', () => {
        if (isAffordable) this.queueCard(card);
      });
      cardEl.addEventListener('keydown', (event) => {
        if (isAffordable && (event.key === 'Enter' || event.key === ' ')) this.queueCard(card);
      });
      cardEl.addEventListener('mouseenter', (event) => this.showCardTooltip(card, caster, event));
      cardEl.addEventListener('mousemove', (event) => this.positionCardTooltip(event));
      cardEl.addEventListener('mouseleave', () => this.hideCardTooltip());
      cardEl.addEventListener('focus', (event) => this.showCardTooltip(card, caster, event));
      cardEl.addEventListener('blur', () => this.hideCardTooltip());
      cardEl.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        this.hideCardTooltip();
        this.showCardDetail(card, caster);
      });
      cardsRow.appendChild(cardEl);
      });
      container.appendChild(group);
    });
  }

  getTypeColor(type) {
    return { Plant: '#58e49c', Fish: '#58bfff', Rock: '#c0a987', Magma: '#ff695d', Wind: '#71e4e2' }[type] || '#8ca1ba';
  }

  cardDetailMarkup(card, caster) {
    return `<span class="tooltip-kicker">${caster.name} • ${card.type} • ${card.slot} part</span><h3 class="tooltip-name">${card.name}</h3><p class="tooltip-description">${card.description}</p><small class="tooltip-hint">Right-click to keep this detail open</small>`;
  }

  showCardTooltip(card, caster, event) {
    const tooltip = document.getElementById('cardTooltip');
    tooltip.style.setProperty('--tooltip-color', this.getTypeColor(card.type));
    tooltip.innerHTML = this.cardDetailMarkup(card, caster);
    tooltip.classList.remove('hidden');
    this.positionCardTooltip(event);
  }

  positionCardTooltip(event) {
    const tooltip = document.getElementById('cardTooltip');
    if (tooltip.classList.contains('hidden')) return;
    const sourceRect = event.currentTarget?.getBoundingClientRect();
    const x = event.clientX || (sourceRect?.right ?? 20);
    const y = event.clientY || (sourceRect?.top ?? 20);
    const left = Math.min(window.innerWidth - 276, x + 16);
    const top = Math.min(window.innerHeight - tooltip.offsetHeight - 12, Math.max(12, y - 20));
    tooltip.style.left = `${Math.max(12, left)}px`;
    tooltip.style.top = `${top}px`;
  }

  hideCardTooltip() {
    document.getElementById('cardTooltip').classList.add('hidden');
  }

  showCardDetail(card, caster) {
    const modal = document.getElementById('cardDetailModal');
    modal.style.setProperty('--detail-color', this.getTypeColor(card.type));
    document.getElementById('cardDetailOwner').textContent = `${caster.name} • ${card.type} • ${card.slot} part • ${card.cost} energy`;
    document.getElementById('cardDetailName').textContent = card.name;
    document.getElementById('cardDetailStats').innerHTML = `<span class="detail-stat attack">⚔ ${card.atk} DAMAGE</span><span class="detail-stat defense">◆ ${card.def} SHIELD</span>`;
    document.getElementById('cardDetailDescription').textContent = card.description;
    modal.classList.remove('hidden');
    document.getElementById('cardDetailClose').focus();
  }

  hideCardDetail() {
    document.getElementById('cardDetailModal').classList.add('hidden');
  }

  renderQueueUI(timeline = null) {
    const queueContainer = document.getElementById('actionQueueContainer');
    queueContainer.innerHTML = '';

    const list = timeline || this.queuedActions;
    if (list.length === 0) {
      queueContainer.innerHTML = '<span class="queue-empty"><b>+</b> Choose a card to plan your move</span>';
      return;
    }
    list.forEach((action, idx) => {
      const chip = document.createElement('div');
      chip.className = `queue-chip${action.isPlayer ? '' : ' enemy'}`;
      chip.innerHTML = `
        <span class="queue-number">${idx + 1}</span>
        <span class="queue-copy"><small>${action.caster.name} → ${action.target?.name || 'AUTO TARGET'}</small><strong>${action.card.name}</strong></span>
        ${action.isPlayer && this.state === 'SELECTION' ? '<button class="queue-remove" aria-label="Remove action">&times;</button>' : ''}
      `;

      if (action.isPlayer && this.state === 'SELECTION') {
        chip.querySelector('button').addEventListener('click', () => this.unqueueCard(idx));
      }

      queueContainer.appendChild(chip);
    });
  }

  getTypeBgClass(type) {
    switch (type) {
      case 'Plant': return 'bg-gradient-to-b from-emerald-700 to-emerald-950 border-emerald-500';
      case 'Fish': return 'bg-gradient-to-b from-blue-700 to-blue-950 border-blue-500';
      case 'Rock': return 'bg-gradient-to-b from-slate-600 to-slate-900 border-slate-400';
      case 'Magma': return 'bg-gradient-to-b from-rose-700 to-rose-950 border-rose-500';
      case 'Wind': return 'bg-gradient-to-b from-cyan-600 to-cyan-950 border-cyan-400';
      default: return 'bg-slate-800';
    }
  }

  getCardGlyph(card) {
    if (card.def > card.atk) return '◆';
    if (card.effect?.healLowest) return '+';
    if (card.effect?.status === 'burn') return '♨';
    if (card.effect?.status === 'root') return '⌁';
    if (card.effect?.dodgeBuff || card.effect?.speedBuff) return '»';
    return card.type === 'Magma' ? '▲' : card.type === 'Fish' ? '≈' : card.type === 'Plant' ? '♠' : card.type === 'Wind' ? '≋' : '⬟';
  }

  showCriticalHit() {
    const banner = document.getElementById('criticalBanner');
    const arena = document.querySelector('.arena-frame');
    banner.classList.remove('show');
    arena.classList.remove('critical-flash');
    void banner.offsetWidth;
    banner.classList.add('show');
    arena.classList.add('critical-flash');
  }

  bindEvents() {
    document.getElementById('endTurnBtn').addEventListener('click', () => this.endTurnAndResolve());
    document.getElementById('restartBtn').addEventListener('click', () => this.restartBattle());
    document.getElementById('cardDetailClose').addEventListener('click', () => this.hideCardDetail());
    document.getElementById('cardDetailModal').addEventListener('click', (event) => {
      if (event.target.id === 'cardDetailModal') this.hideCardDetail();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hideCardDetail();
    });

    // Canvas click to select enemy target
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      this.enemyTeam.forEach(enemy => {
        if (!enemy.isAlive()) return;
        const pos = this.renderer.positions[enemy.id];
        const dist = Math.hypot(mouseX - pos.x, mouseY - pos.y);
        if (dist < 50) {
          this.selectedTarget = enemy;
          this.logMessage(`🎯 Target selected: ${enemy.name} (${enemy.baseType})`);
        }
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  gameLoop() {
    this.renderer.render(
      this.playerTeam,
      this.enemyTeam,
      this.selectedTarget?.id,
      this.activeCasterId
    );
    requestAnimationFrame(() => this.gameLoop());
  }
}

