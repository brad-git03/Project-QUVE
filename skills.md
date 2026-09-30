# Project Quve: Skills & Combat Deck System

## 1. Skill Card Anatomy & Balance Framework

Every Quve carries **5 skill cards** in combat, determined by its **5 physical body parts**. In battle, a 3-Quve team forms a unified draw pile of **15 skill cards**.

Each card possesses four core attributes:
- **Energy Cost**: The action point requirement to queue the card (0, 1, or 2 Energy).
- **ATK (Attack Power)**: Direct damage dealt to the target's Shield and HP.
- **DEF (Shield Value)**: Armor points gained by the casting Quve for the duration of the round.
- **Card Mechanics / Keywords**: Unique status effects, targeting rules, heals, or conditional triggers.

### Mathematical Balance Budget (Standard 1-Energy Baseline)
To prevent power creep and ensure rock-solid balance:
$$\text{Total Card Budget} = \text{ATK} + \text{DEF} + (\text{Effect Value Weight}) \approx 135 \text{ to } 150 \text{ points}$$

- **Pure Offensive Cards**: High ATK (110–125), Low DEF (10–30), minor/no effect.
- **Pure Defensive Cards**: Low ATK (0–35), High DEF (110–140), protection mechanics.
- **Hybrid / Balanced Cards**: Moderate ATK (65–85), Moderate DEF (60–80), light utility.
- **Heavy Utility Cards**: Lower stats (30–60), compensated by high-impact status effects (Burn, Root, Stun, Energy manipulation).
- **0-Energy Cards**: Total budget constrained to 50–65 points, strictly conditional.
- **2-Energy Cards**: Total budget constrained to 220–250 points, reserved for heavy anchors/finishers.

---

## 2. The 5 Part Card Slots & Tactical Roles

Each body part serves an intentional strategic role in team composition:

| Part Slot | Anatomical Representative | Primary Tactical Role | Typical Stat Bias |
| :--- | :--- | :--- | :--- |
| **Slot 1: Top** | Horns, Crests, Sprouts, Antennas | **Primary Engagement** (Burst damage, execute, or emergency heal) | High ATK or High Utility |
| **Slot 2: Face** | Eyes, Visors, Masks, Jaws | **Control & Tactical Utility** (Debuffs, target overrides, precision) | Balanced / Status |
| **Slot 3: Back** | Shells, Carapaces, Dorsal Fins, Cloaks | **Fortification & Sustain** (Armor, damage reduction, thorns) | Heavy DEF |
| **Slot 4: Sides / Arms** | Claws, Fins, Branches, Pincers, Wings | **Sustained Offense** (Combos, multi-strikes, armor penetration) | Moderate-High ATK |
| **Slot 5: Tail** | Roots, Stingers, Rudders, Jet Exhausts | **Tempo & Momentum** (Speed modifiers, energy gain, clutch counters) | Utility / Hybrid |

---

## 3. Core Status Effects & Keywords

- **[Burn]** *(Magma)*: Deals a flat amount of pure damage at the start of each round for 2 turns. Ignores shields.
- **[Photosynthesis / Regen]** *(Plant)*: Restores HP at round end or triggers healing upon shield damage.
- **[Root / Slow]** *(Plant/Rock)*: Reduces the target's Speed stat, causing them to act later in the turn order.
- **[Streamline]** *(Fish)*: Bonus Critical Hit Chance when acting before the target.
- **[Flee / Evasion]** *(Wind)*: Percentage chance to completely dodge an incoming attack and negate all damage and on-hit debuffs.
- **[Precision / True Hit]** *(Wind)*: Ignores target evasion and blind effects.
- **[Thorns / Retaliation]** *(Rock/Magma)*: Deals reflective damage back to the attacker when struck.
- **[Combo]** *(All)*: Bonus effect activated when this Quve plays 2 or more cards in the same turn.

---

## 4. Starter Card Sets (25 Complete Cards Across 5 Types)

### A. Plant Type Set (Theme: Healing, HP Pools, Roots & Poison)
*Focus: Outlasting the enemy through attrition, health sustain, and armor recovery.*

| Part Slot | Card Name | Cost | ATK | DEF | Card Effect & Mechanics |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Top** | **Verdant Sprout** | 1 | 50 | 60 | Restores 40 HP to the ally with the lowest current HP percentage. |
| **Face** | **Bramble Snare** | 1 | 80 | 40 | Applies **[Root]**: Reduces target's Speed by 15% for 1 round. |
| **Back** | **Bark Carapace** | 1 | 20 | 120 | If this shield breaks this round, immediately restore 30 HP to this Quve. |
| **Sides** | **Thorn Lash** | 1 | 95 | 35 | Heals this Quve for 30% of unshielded HP damage dealt to the target. |
| **Tail** | **Nutrient Root** | 0 | 25 | 30 | **[Combo]**: If this Quve's shield is not broken by round end, gain 1 Energy. |

---

### B. Fish Type Set (Theme: Swift Momentum, Critical Hits & Flow)
*Focus: Speed control, opportunistic critical strikes, and targeting backline threats.*

| Part Slot | Card Name | Cost | ATK | DEF | Card Effect & Mechanics |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Top** | **Angler Lure** | 1 | 110 | 25 | **[Streamline]**: +20% Critical Strike Chance if this Quve attacks before the target. |
| **Face** | **Sonar Visage** | 1 | 75 | 50 | Bypasses standard front-line targeting: Targets the fastest enemy Quve this round. |
| **Back** | **Razor Dorsal** | 1 | 60 | 80 | When struck by a critical hit, gains +15% Speed next round. |
| **Sides** | **Tidal Fin-Slap** | 1 | 100 | 35 | Deals +20 bonus damage when played in a combo with another Fish card. |
| **Tail** | **Aqua Propulsion**| 1 | 80 | 45 | Grants this Quve +20% Speed for the next round. |

---

### C. Rock Type Set (Theme: Solid Fortification, Damage Interception & Stuns)
*Focus: Absorbing heavy blows, shielding fragile allies, and disrupting enemy attacks.*

| Part Slot | Card Name | Cost | ATK | DEF | Card Effect & Mechanics |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Top** | **Obsidian Horn** | 1 | 90 | 45 | **Shatter**: Deals 25% bonus damage against enemy active shields. |
| **Face** | **Granite Visage** | 1 | 30 | 100 | **Taunt**: Forces all slower enemies with single-target skills to target this Quve this round. |
| **Back** | **Basalt Bastion** | 1 | 0 | 135 | Immune to critical strikes while this card's shield remains intact. |
| **Sides** | **Boulder Crush** | 2 | 160 | 75 | **[Heavy Strike]**: If the target has less than 50% HP, inflicts **[Daze]** (-25% target ATK next round). |
| **Tail** | **Tremor Anchor** | 1 | 65 | 65 | **Retaliation**: Deals 25 flat damage back to any attacker who breaks this Quve's shield. |

---

### D. Magma Type Set (Theme: Raw Explosive ATK, Armor Melt & Burn)
*Focus: Shattering enemy defenses quickly at the cost of personal defense or recoil.*

| Part Slot | Card Name | Cost | ATK | DEF | Card Effect & Mechanics |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Top** | **Volcanic Geyser**| 1 | 125 | 15 | **Combustion**: Deals +25 bonus damage if this Quve is currently below 50% HP. |
| **Face** | **Cinder Mask** | 1 | 70 | 40 | Applies **[Burn]**: Deals 25 true damage to the target at the start of the next 2 rounds. |
| **Back** | **Molten Plate** | 1 | 35 | 95 | Any direct attacker striking this shield suffers 1 stack of **[Burn]** (15 damage next round). |
| **Sides** | **Pyro Claws** | 1 | 115 | 20 | **Armor Melt**: Ignores 20% of the target's current active shield value. |
| **Tail** | **Magma Thruster** | 1 | 135 | 10 | **Overheat**: Massive strike, but inflicts 15 true recoil damage to self. |

---

### E. Wind Type Set (Theme: Evasion, Multi-Hits, Velocity & Priority)
*Focus: Dodging lethal strikes, chaining rapid attacks, and ignoring enemy evasion.*

| Part Slot | Card Name | Cost | ATK | DEF | Card Effect & Mechanics |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Top** | **Gale Crest** | 1 | 90 | 40 | Grants +25% **[Flee]** (Dodge Chance) against incoming attacks during this round. |
| **Face** | **Falcon Eye** | 1 | 80 | 45 | **[Precision]**: Cannot miss. Disperses all active Evasion buffs on the target. |
| **Back** | **Cyclone Cloak** | 1 | 30 | 95 | If this Quve successfully dodges an attack this round, gain 1 Energy next round (Max 1/round). |
| **Sides** | **Twin Tempest** | 1 | 55 x 2 | 25 | **Multi-Hit**: Strikes twice (110 total ATK). Each strike calculates Crit and Dodge independently. |
| **Tail** | **Slipstream Rudder**| 1 | 65 | 60 | Accelerates the allied Quve queued directly behind this Quve, raising its turn priority. |

---

## 5. Balance Matrix Summary

| Type | Average ATK | Average DEF | Signature Strength | Primary Vulnerability |
| :--- | :---: | :---: | :--- | :--- |
| **Plant** | 50 – 95 | 30 – 120 | Unmatched longevity & team sustain | Low immediate burst damage |
| **Fish** | 60 – 110 | 25 – 80 | High turn priority & assassin bursts | Low base shield defense |
| **Rock** | 0 – 160 | 45 – 135 | Massive armor pools & damage mitigation | Lowest overall speed |
| **Magma** | 70 – 135 | 10 – 95 | Overwhelming shield-break & pure burn | High risk / self-recoil / fragile |
| **Wind** | 55 – 110 | 25 – 95 | Evasion mechanics & turn sequence control | RNG dependent on evasion rolls |

---

## 6. Hybrid Build Examples

Because parts can be mixed across types, players can invent balanced archetypes:
1. **"The Unbreakable Healer" (Rock Base + Plant Parts)**:
   - Rock Body (High Defense) with *Verdant Sprout* (Top/Heal) and *Bark Carapace* (Back/Shield+Regen).
2. **"The Evasive Pyro" (Wind Base + Magma Parts)**:
   - Wind Body (High Evasion) with *Volcanic Geyser* (Top/Burst) and *Pyro Claws* (Sides/Melt), creating a high-threat glass cannon that avoids retaliation.
3. **"The Speed Brawler" (Fish Base + Rock Horn)**:
   - Fast turn priority with *Obsidian Horn* to crack open enemy tanks before they can set up defensive shields.
