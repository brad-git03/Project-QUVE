// Project Quve - Quve Model & Archetypes

import { CARD_TYPES, CARDS } from './cards.js';

// Base elemental stats (HP, ATK, DEF, Speed, Crit, Flee)
export const TYPE_BASE_STATS = {
  [CARD_TYPES.PLANT]: { hp: 440, atk: 45, def: 55, speed: 38, crit: 15, flee: 5, color: '#38a169', accent: '#68d391' },
  [CARD_TYPES.FISH]:  { hp: 380, atk: 55, def: 40, speed: 52, crit: 35, flee: 10, color: '#3182ce', accent: '#63b3ed' },
  [CARD_TYPES.ROCK]:  { hp: 460, atk: 40, def: 65, speed: 30, crit: 10, flee: 0, color: '#a0aec0', accent: '#cbd5e0' },
  [CARD_TYPES.MAGMA]: { hp: 360, atk: 65, def: 35, speed: 46, crit: 25, flee: 5, color: '#e53e3e', accent: '#fc8181' },
  [CARD_TYPES.WIND]:  { hp: 370, atk: 50, def: 38, speed: 50, crit: 20, flee: 25, color: '#00b4d8', accent: '#90e0ef' }
};

export class Quve {
  constructor(id, name, baseType, parts, isPlayer = true, position = 1) {
    this.id = id;
    this.name = name;
    this.baseType = baseType;
    this.parts = parts; // Object: { top, face, back, sides, tail } with cardIds
    this.isPlayer = isPlayer;
    this.position = position; // 1 = Front, 2 = Mid, 3 = Back

    // Initialize stats from base type
    const base = TYPE_BASE_STATS[baseType];
    this.maxHp = base.hp;
    this.currentHp = base.hp;
    this.shield = 0;
    this.speed = base.speed;
    this.baseSpeed = base.speed;
    this.crit = base.crit;
    this.flee = base.flee;
    this.color = base.color;
    this.accent = base.accent;

    // Active status effects
    this.statuses = {
      burn: 0, // rounds left
      burnDmg: 0,
      root: 0,
      daze: 0,
      tempEvasion: 0,
      tempSpeed: 0
    };

    // Visual animation states
    this.animOffset = { x: 0, y: 0 };
    this.flashColor = null;
    this.isDefeated = false;
  }

  getCards() {
    return Object.values(this.parts).map(cardId => CARDS[cardId]).filter(Boolean);
  }

  isAlive() {
    return this.currentHp > 0 && !this.isDefeated;
  }

  addShield(amount) {
    this.shield += amount;
  }

  resetRound() {
    this.shield = 0;
    this.statuses.tempEvasion = 0;
    this.statuses.tempSpeed = 0;
    this.speed = this.baseSpeed;
    if (this.statuses.root > 0) {
      this.speed = Math.floor(this.baseSpeed * 0.85);
    }
  }

  applyEndOfRound() {
    const logs = [];
    // Burn DoT
    if (this.statuses.burn > 0) {
      this.currentHp = Math.max(0, this.currentHp - this.statuses.burnDmg);
      logs.push(`${this.name} suffered ${this.statuses.burnDmg} Burn damage! (${this.currentHp}/${this.maxHp} HP)`);
      this.statuses.burn--;
      if (this.currentHp <= 0) {
        this.isDefeated = true;
        logs.push(`💀 ${this.name} collapsed from Burn!`);
      }
    }

    if (this.statuses.root > 0) this.statuses.root--;
    if (this.statuses.daze > 0) this.statuses.daze--;

    return logs;
  }
}

// Preset Teams
export function createStarterPlayerTeam() {
  return [
    // Position 1: Frontline Tank (Rock with Plant heal)
    new Quve('p1', 'Terracube', CARD_TYPES.ROCK, {
      top: 'obsidian_horn',
      face: 'granite_visage',
      back: 'basalt_bastion',
      sides: 'boulder_crash',
      tail: 'verdant_sprout' // Hybrid part!
    }, true, 1),

    // Position 2: Midline Brawler / Support (Plant with Wind Evasion)
    new Quve('p2', 'FloraQuve', CARD_TYPES.PLANT, {
      top: 'verdant_sprout',
      face: 'bramble_snare',
      back: 'bark_carapace',
      sides: 'thorn_lash',
      tail: 'slipstream_rudder' // Hybrid part!
    }, true, 2),

    // Position 3: Backline Striker (Fish / Crit Assassin)
    new Quve('p3', 'AquaFang', CARD_TYPES.FISH, {
      top: 'angler_lure',
      face: 'sonar_visage',
      back: 'razor_dorsal',
      sides: 'tidal_slap',
      tail: 'aqua_propulsion'
    }, true, 3)
  ];
}

export function createEnemyTeam() {
  return [
    // Enemy Frontline: Magma Tank/Bruiser
    new Quve('e1', 'IgnisQuve', CARD_TYPES.MAGMA, {
      top: 'volcanic_geyser',
      face: 'cinder_mask',
      back: 'molten_plate',
      sides: 'pyro_claws',
      tail: 'magma_thruster'
    }, false, 1),

    // Enemy Midline: Wind Evasive Scout
    new Quve('e2', 'ZephyrBox', CARD_TYPES.WIND, {
      top: 'gale_crest',
      face: 'falcon_eye',
      back: 'cyclone_cloak',
      sides: 'twin_tempest',
      tail: 'slipstream_rudder'
    }, false, 2),

    // Enemy Backline: Rock Anchor
    new Quve('e3', 'Bouldron', CARD_TYPES.ROCK, {
      top: 'obsidian_horn',
      face: 'granite_visage',
      back: 'basalt_bastion',
      sides: 'boulder_crash',
      tail: 'tremor_anchor'
    }, false, 3)
  ];
}

// PvP uses an equivalent mirrored squad so both browsers simulate the same
// stats from opposite viewpoints. IDs are remapped for renderer separation.
export function createMirroredEnemyTeam() {
  return createStarterPlayerTeam().map((quve, index) => new Quve(
    `e${index + 1}`,
    quve.name,
    quve.baseType,
    { ...quve.parts },
    false,
    quve.position
  ));
}
