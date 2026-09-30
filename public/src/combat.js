// Project Quve - Combat Engine

import { CARD_TYPES } from './cards.js';

// Elemental Counter Cycle: Attacker -> Defender (+20% bonus, -20% penalty)
export const ELEMENT_ADVANTAGES = {
  [CARD_TYPES.MAGMA]: CARD_TYPES.PLANT,
  [CARD_TYPES.PLANT]: CARD_TYPES.ROCK,
  [CARD_TYPES.ROCK]:  CARD_TYPES.WIND,
  [CARD_TYPES.WIND]:  CARD_TYPES.FISH,
  [CARD_TYPES.FISH]:  CARD_TYPES.MAGMA
};

export function getTypeModifier(attackerType, defenderType) {
  if (ELEMENT_ADVANTAGES[attackerType] === defenderType) {
    return { multiplier: 1.2, text: 'SUPER EFFECTIVE! (+20%)' };
  }
  if (ELEMENT_ADVANTAGES[defenderType] === attackerType) {
    return { multiplier: 0.8, text: 'NOT VERY EFFECTIVE (-20%)' };
  }
  return { multiplier: 1.0, text: '' };
}

// Select default closest target (Front -> Mid -> Back)
export function getClosestTarget(targetTeam) {
  const aliveTargets = targetTeam.filter(q => q.isAlive());
  if (aliveTargets.length === 0) return null;
  // Sort by position: 1 (Front) -> 2 (Mid) -> 3 (Back)
  aliveTargets.sort((a, b) => a.position - b.position);
  return aliveTargets[0];
}

// Find target based on card targeting rules
export function resolveTarget(card, targetTeam, friendlyTeam, caster) {
  const aliveTargets = targetTeam.filter(q => q.isAlive());
  if (aliveTargets.length === 0) return null;

  // Check if any enemy has active Taunt
  const tauntTarget = aliveTargets.find(q => q.statuses.taunt && q.speed < caster.speed);
  if (tauntTarget) return tauntTarget;

  // Card specific targeting rule
  if (card.effect?.targetRule === 'fastest') {
    return [...aliveTargets].sort((a, b) => b.speed - a.speed)[0];
  }

  // Default: closest frontliner
  return getClosestTarget(targetTeam);
}

// Sort actions based on Speed and Tiebreaker rules
export function sortActionQueue(queuedActions) {
  return queuedActions.sort((a, b) => {
    // 1. Current Speed
    if (b.caster.speed !== a.caster.speed) {
      return b.caster.speed - a.caster.speed;
    }
    // 2. Lower Current HP % (adrenaline priority)
    const aHpRatio = a.caster.currentHp / a.caster.maxHp;
    const bHpRatio = b.caster.currentHp / b.caster.maxHp;
    if (aHpRatio !== bHpRatio) {
      return aHpRatio - bHpRatio;
    }
    // 3. Base Speed
    if (b.caster.baseSpeed !== a.caster.baseSpeed) {
      return b.caster.baseSpeed - a.caster.baseSpeed;
    }
    // 4. Team Position (Front > Mid > Back)
    return a.caster.position - b.caster.position;
  });
}

// Shields are committed as soon as both sides end their selection phase, before
// speed order or attacks are resolved. This prevents a slow Quve from having to
// attack first before the defensive value of its selected card becomes active.
export function activateActionShield(action) {
  const { caster, card } = action;
  if (!caster.isAlive() || card.def <= 0) return null;

  caster.addShield(card.def);
  return {
    type: 'SHIELD_GAINED',
    casterId: caster.id,
    amount: card.def,
    text: `🛡️ ${caster.name} raised ${card.def} Shield from ${card.name}!`
  };
}

// Execute a single queued action and return animation events
export function executeCardAction(action, friendlyTeam, enemyTeam) {
  const { caster, card } = action;
  const events = [];

  if (!caster.isAlive()) {
    events.push({
      type: 'SKIPPED',
      text: `${caster.name} is knocked out and cannot cast ${card.name}!`
    });
    return events;
  }

  // Shields have already been activated for every queued card at turn end.
  // Resolve Target (or retarget if original target died)
  let target = action.target;
  if (!target || !target.isAlive()) {
    target = resolveTarget(card, enemyTeam, friendlyTeam, caster);
  }

  // Handle Non-Damaging Utility Cards
  if (card.effect?.healLowest) {
    const woundedAllies = friendlyTeam.filter(q => q.isAlive()).sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
    const healTarget = woundedAllies[0] || caster;
    const healAmount = card.effect.healLowest;
    healTarget.currentHp = Math.min(healTarget.maxHp, healTarget.currentHp + healAmount);
    events.push({
      type: 'HEAL',
      casterId: caster.id,
      targetId: healTarget.id,
      amount: healAmount,
      text: `💚 ${caster.name} healed ${healTarget.name} for +${healAmount} HP!`
    });
  }

  if (card.effect?.dodgeBuff) {
    caster.statuses.tempEvasion = (caster.statuses.tempEvasion || 0) + card.effect.dodgeBuff;
    events.push({
      type: 'BUFF',
      casterId: caster.id,
      text: `💨 ${caster.name} gained +${card.effect.dodgeBuff}% Flee Evasion!`
    });
  }

  if (card.effect?.speedBuff) {
    caster.statuses.tempSpeed = (caster.statuses.tempSpeed || 0) + Math.floor(caster.baseSpeed * card.effect.speedBuff);
    caster.speed += caster.statuses.tempSpeed;
    events.push({
      type: 'BUFF',
      casterId: caster.id,
      text: `⚡ ${caster.name} gained +${Math.round(card.effect.speedBuff * 100)}% Speed!`
    });
  }

  // Handle Attacks
  if (card.atk > 0 && target && target.isAlive()) {
    // Check Evasion roll
    const trueHit = card.effect?.trueHit || false;
    const totalEvasion = target.flee + (target.statuses.tempEvasion || 0);
    const hitRoll = Math.random() * 100;

    if (!trueHit && hitRoll < totalEvasion) {
      events.push({
        type: 'DODGE',
        casterId: caster.id,
        targetId: target.id,
        cardName: card.name,
        text: `💨 ${target.name} EVADED ${caster.name}'s ${card.name}!`
      });
      return events;
    }

    // Calculate Multipliers
    const typeMod = getTypeModifier(card.type, target.baseType);
    const stabMod = (card.type === caster.baseType) ? 1.10 : 1.00; // STAB (+10%)

    // Critical Chance calculation
    let critChance = Math.min(60, Math.max(0, (caster.speed * 0.25 + caster.crit) - (target.baseType === CARD_TYPES.ROCK ? 25 : 0)));
    if (card.effect?.critIfFaster && caster.speed > target.speed) {
      critChance += card.effect.critIfFaster;
    }
    const isCrit = (Math.random() * 100) < critChance;
    const critMod = isCrit ? 1.50 : 1.00;

    // Bonus ATK effects
    let baseAtk = card.atk;
    if (card.effect?.bonusIfBelowHalf && (caster.currentHp / caster.maxHp) < 0.5) {
      baseAtk += card.effect.bonusIfBelowHalf;
    }

    // Shield Buster / Shield Pierce
    let shieldDmgBonus = 1.0;
    if (card.effect?.shieldBuster && target.shield > 0) {
      shieldDmgBonus += card.effect.shieldBuster;
    }

    const calculatedDamage = Math.floor(baseAtk * typeMod.multiplier * stabMod * critMod * shieldDmgBonus);

    // Apply Damage to Shield then HP
    let shieldAbsorbed = 0;
    let hpDamage = 0;

    if (target.shield > 0) {
      if (target.shield >= calculatedDamage) {
        shieldAbsorbed = calculatedDamage;
        target.shield -= calculatedDamage;
      } else {
        shieldAbsorbed = target.shield;
        hpDamage = calculatedDamage - target.shield;
        target.shield = 0;
      }
    } else {
      hpDamage = calculatedDamage;
    }

    target.currentHp = Math.max(0, target.currentHp - hpDamage);

    events.push({
      type: 'ATTACK',
      casterId: caster.id,
      targetId: target.id,
      cardName: card.name,
      cardType: card.type,
      totalDamage: calculatedDamage,
      shieldAbsorbed,
      hpDamage,
      isCrit,
      typeText: typeMod.text,
      text: `⚔️ ${caster.name} used ${card.name} on ${target.name} for ${calculatedDamage} damage! ${isCrit ? '💥 CRITICAL!' : ''} ${typeMod.text}`
    });

    // Check on-hit status debuffs
    if (card.effect?.status === 'burn' && target.isAlive()) {
      target.statuses.burn = card.effect.duration;
      target.statuses.burnDmg = card.effect.damage;
      events.push({
        type: 'STATUS_APPLIED',
        targetId: target.id,
        status: 'Burn',
        text: `🔥 ${target.name} was afflicted with Burn!`
      });
    }

    if (card.effect?.status === 'root' && target.isAlive()) {
      target.statuses.root = card.effect.duration;
      target.speed = Math.floor(target.baseSpeed * (1 - card.effect.speedDebuff));
      events.push({
        type: 'STATUS_APPLIED',
        targetId: target.id,
        status: 'Root',
        text: `🌿 ${target.name} was Rooted (-15% Speed)!`
      });
    }

    // Lifesteal
    if (card.effect?.lifesteal && hpDamage > 0) {
      const healAmount = Math.floor(hpDamage * card.effect.lifesteal);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + healAmount);
      events.push({
        type: 'HEAL',
        casterId: caster.id,
        targetId: caster.id,
        amount: healAmount,
        text: `🩸 ${caster.name} drained ${healAmount} HP!`
      });
    }

    // Recoil
    if (card.effect?.recoil) {
      caster.currentHp = Math.max(0, caster.currentHp - card.effect.recoil);
      events.push({
        type: 'RECOIL',
        casterId: caster.id,
        amount: card.effect.recoil,
        text: `⚠️ ${caster.name} took ${card.effect.recoil} recoil damage!`
      });
    }

    // Target Defeated Check
    if (target.currentHp <= 0) {
      target.isDefeated = true;
      events.push({
        type: 'DEFEAT_QUVE',
        targetId: target.id,
        text: `💀 ${target.name} has been knocked out!`
      });
    }
  }

  return events;
}
