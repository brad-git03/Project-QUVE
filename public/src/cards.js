// Project Quve - Card Catalog (25 Starter Cards from skills.md)

export const CARD_TYPES = {
  PLANT: 'Plant',
  FISH: 'Fish',
  ROCK: 'Rock',
  MAGMA: 'Magma',
  WIND: 'Wind'
};

export const PART_SLOTS = {
  TOP: 'Top',
  FACE: 'Face',
  BACK: 'Back',
  SIDES: 'Sides',
  TAIL: 'Tail'
};

export const CARDS = {
  // Plant Cards
  verdant_sprout: {
    id: 'verdant_sprout',
    name: 'Verdant Sprout',
    type: CARD_TYPES.PLANT,
    slot: PART_SLOTS.TOP,
    cost: 1,
    atk: 50,
    def: 60,
    description: 'Restores 40 HP to the ally with lowest HP %.',
    effect: { healLowest: 40 }
  },
  bramble_snare: {
    id: 'bramble_snare',
    name: 'Bramble Snare',
    type: CARD_TYPES.PLANT,
    slot: PART_SLOTS.FACE,
    cost: 1,
    atk: 80,
    def: 40,
    description: 'Inflicts [Root]: -15% Speed for 1 round.',
    effect: { status: 'root', speedDebuff: 0.15, duration: 1 }
  },
  bark_carapace: {
    id: 'bark_carapace',
    name: 'Bark Carapace',
    type: CARD_TYPES.PLANT,
    slot: PART_SLOTS.BACK,
    cost: 1,
    atk: 20,
    def: 120,
    description: 'If shield breaks this round, restore 30 HP.',
    effect: { onShieldBreakHeal: 30 }
  },
  thorn_lash: {
    id: 'thorn_lash',
    name: 'Thorn Lash',
    type: CARD_TYPES.PLANT,
    slot: PART_SLOTS.SIDES,
    cost: 1,
    atk: 95,
    def: 35,
    description: 'Lifesteal 30% of unshielded damage dealt.',
    effect: { lifesteal: 0.3 }
  },
  nutrient_root: {
    id: 'nutrient_root',
    name: 'Nutrient Root',
    type: CARD_TYPES.PLANT,
    slot: PART_SLOTS.TAIL,
    cost: 0,
    atk: 25,
    def: 30,
    description: '[Combo] Gain 1 Energy if shield survives round.',
    effect: { energyOnShieldSurvive: 1 }
  },

  // Fish Cards
  angler_lure: {
    id: 'angler_lure',
    name: 'Angler Lure',
    type: CARD_TYPES.FISH,
    slot: PART_SLOTS.TOP,
    cost: 1,
    atk: 110,
    def: 25,
    description: '+20% Crit Chance if attacking before target.',
    effect: { critIfFaster: 20 }
  },
  sonar_visage: {
    id: 'sonar_visage',
    name: 'Sonar Visage',
    type: CARD_TYPES.FISH,
    slot: PART_SLOTS.FACE,
    cost: 1,
    atk: 75,
    def: 50,
    description: 'Bypasses frontline: Targets fastest enemy.',
    effect: { targetRule: 'fastest' }
  },
  razor_dorsal: {
    id: 'razor_dorsal',
    name: 'Razor Dorsal',
    type: CARD_TYPES.FISH,
    slot: PART_SLOTS.BACK,
    cost: 1,
    atk: 60,
    def: 80,
    description: 'When struck by a Crit, gain +15% Speed next round.',
    effect: { speedOnCritTaken: 0.15 }
  },
  tidal_slap: {
    id: 'tidal_slap',
    name: 'Tidal Fin-Slap',
    type: CARD_TYPES.FISH,
    slot: PART_SLOTS.SIDES,
    cost: 1,
    atk: 100,
    def: 35,
    description: '+20 bonus ATK when comboed with a Fish card.',
    effect: { comboTypeBonus: { type: CARD_TYPES.FISH, bonusAtk: 20 } }
  },
  aqua_propulsion: {
    id: 'aqua_propulsion',
    name: 'Aqua Propulsion',
    type: CARD_TYPES.FISH,
    slot: PART_SLOTS.TAIL,
    cost: 1,
    atk: 80,
    def: 45,
    description: 'Grants this Quve +20% Speed for next round.',
    effect: { speedBuff: 0.2, duration: 1 }
  },

  // Rock Cards
  obsidian_horn: {
    id: 'obsidian_horn',
    name: 'Obsidian Horn',
    type: CARD_TYPES.ROCK,
    slot: PART_SLOTS.TOP,
    cost: 1,
    atk: 90,
    def: 45,
    description: 'Deals 25% bonus damage against active shields.',
    effect: { shieldBuster: 0.25 }
  },
  granite_visage: {
    id: 'granite_visage',
    name: 'Granite Visage',
    type: CARD_TYPES.ROCK,
    slot: PART_SLOTS.FACE,
    cost: 1,
    atk: 30,
    def: 100,
    description: '[Taunt] Forces slower enemies to target this Quve.',
    effect: { tauntSlower: true }
  },
  basalt_bastion: {
    id: 'basalt_bastion',
    name: 'Basalt Bastion',
    type: CARD_TYPES.ROCK,
    slot: PART_SLOTS.BACK,
    cost: 1,
    atk: 0,
    def: 135,
    description: 'Immune to critical strikes while shield holds.',
    effect: { critImmunity: true }
  },
  boulder_crash: {
    id: 'boulder_crash',
    name: 'Boulder Crash',
    type: CARD_TYPES.ROCK,
    slot: PART_SLOTS.SIDES,
    cost: 2,
    atk: 160,
    def: 75,
    description: 'If target <50% HP, inflicts [Daze] (-25% ATK).',
    effect: { dazeIfLowHP: 0.25 }
  },
  tremor_anchor: {
    id: 'tremor_anchor',
    name: 'Tremor Anchor',
    type: CARD_TYPES.ROCK,
    slot: PART_SLOTS.TAIL,
    cost: 1,
    atk: 65,
    def: 65,
    description: 'Reflects 25 flat damage if shield is broken.',
    effect: { reflectOnBreak: 25 }
  },

  // Magma Cards
  volcanic_geyser: {
    id: 'volcanic_geyser',
    name: 'Volcanic Geyser',
    type: CARD_TYPES.MAGMA,
    slot: PART_SLOTS.TOP,
    cost: 1,
    atk: 125,
    def: 15,
    description: '+25 bonus ATK if user is below 50% HP.',
    effect: { bonusIfBelowHalf: 25 }
  },
  cinder_mask: {
    id: 'cinder_mask',
    name: 'Cinder Mask',
    type: CARD_TYPES.MAGMA,
    slot: PART_SLOTS.FACE,
    cost: 1,
    atk: 70,
    def: 40,
    description: 'Inflicts [Burn]: 25 true damage/round for 2 rounds.',
    effect: { status: 'burn', damage: 25, duration: 2 }
  },
  molten_plate: {
    id: 'molten_plate',
    name: 'Molten Plate',
    type: CARD_TYPES.MAGMA,
    slot: PART_SLOTS.BACK,
    cost: 1,
    atk: 35,
    def: 95,
    description: 'Attackers hitting this shield take 15 Burn damage.',
    effect: { burnAttacker: 15 }
  },
  pyro_claws: {
    id: 'pyro_claws',
    name: 'Pyro Claws',
    type: CARD_TYPES.MAGMA,
    slot: PART_SLOTS.SIDES,
    cost: 1,
    atk: 115,
    def: 20,
    description: 'Ignores 20% of target\'s active shield.',
    effect: { shieldPierce: 0.2 }
  },
  magma_thruster: {
    id: 'magma_thruster',
    name: 'Magma Thruster',
    type: CARD_TYPES.MAGMA,
    slot: PART_SLOTS.TAIL,
    cost: 1,
    atk: 135,
    def: 10,
    description: 'High damage, but inflicts 15 self-recoil damage.',
    effect: { recoil: 15 }
  },

  // Wind Cards
  gale_crest: {
    id: 'gale_crest',
    name: 'Gale Crest',
    type: CARD_TYPES.WIND,
    slot: PART_SLOTS.TOP,
    cost: 1,
    atk: 90,
    def: 40,
    description: 'Grants +25% [Flee] (Dodge Chance) this round.',
    effect: { dodgeBuff: 25 }
  },
  falcon_eye: {
    id: 'falcon_eye',
    name: 'Falcon Eye',
    type: CARD_TYPES.WIND,
    slot: PART_SLOTS.FACE,
    cost: 1,
    atk: 80,
    def: 45,
    description: '[Precision]: Cannot miss & clears target Evasion.',
    effect: { trueHit: true, clearEvasion: true }
  },
  cyclone_cloak: {
    id: 'cyclone_cloak',
    name: 'Cyclone Cloak',
    type: CARD_TYPES.WIND,
    slot: PART_SLOTS.BACK,
    cost: 1,
    atk: 30,
    def: 95,
    description: 'If you dodge this round, gain 1 Energy next round.',
    effect: { energyOnDodge: 1 }
  },
  twin_tempest: {
    id: 'twin_tempest',
    name: 'Twin Tempest',
    type: CARD_TYPES.WIND,
    slot: PART_SLOTS.SIDES,
    cost: 1,
    atk: 110,
    def: 25,
    description: 'Strikes twice (55 x 2). Rolls Crit and Hit twice.',
    effect: { multiHit: 2 }
  },
  slipstream_rudder: {
    id: 'slipstream_rudder',
    name: 'Slipstream Rudder',
    type: CARD_TYPES.WIND,
    slot: PART_SLOTS.TAIL,
    cost: 1,
    atk: 65,
    def: 60,
    description: 'Accelerates the next queued ally Quve.',
    effect: { accelerateNextAlly: true }
  }
};
