# Project Quve: Game Concept & Core Design Document

## 1. Game Overview

**Project Quve** is a turn-based tactical RPG featuring deep creature customization, progressive story-driven PvE adventure, and competitive asynchronous/synchronous PvP arenas. 

Drawing strategic inspiration from turn-based creature battlers like **Axie Infinity** and **Pokémon**, battles revolve around tactical positioning, energy/action economy, skill-card management, and elemental synergies.

- **Genre**: Turn-Based Tactical Card Battler / Creature Collector RPG
- **Platform**: **Browser-First (Web / HTML5 / WebGL)**, expanding to PC & Mobile later
- **Core Progression**: Story Mode (PvE Campaign) $\rightarrow$ Dungeon / Boss Raids $\rightarrow$ PvP Arena (Ranked Leagues)
- **Native Ecosystem Token**: **Quve Coin ($QVC)**

---

## 2. The Creature: "Quve"

A **Quve** (pronounced */kjuːv/*) is a modular, box-shaped creature native to the cubic biomes of the world. While their core anatomy is a base cube, their traits, aesthetics, and combat roles are defined by **5 distinct body parts**.

```
         [ TOP / HEAD ]
               │
[ LEFT PART ]──[ CORE BODY ]──[ RIGHT PART ]
               │
        [ BACK / ACCESSORY ]
               │
         [ TAIL / BASE ]
```

### The 5 Anatomical Part Slots
Each Quve has 5 modular equipment/mutation slots. Each part represents **1 combat skill card** (totaling 5 skill cards in a Quve's active battle deck):

1. **Top / Horn / Crest**: Primary offensive or utility card.
2. **Face / Eyes / Visage**: Sensory, status effect, or debuff card.
3. **Back / Shell / Fin**: Defensive shields, stances, or passive buffs.
4. **Sides / Arms / Appendages**: Core physical or magical strikes.
5. **Tail / Propulsion**: Speed modifiers, combo finishers, or energy management.

---

## 3. Elemental Types & Stat Affinities

Every Quve possesses a **Core Base Type**, which dictates its primary base stat distribution and elemental passive. There are **5 Core Elements**:

| Element | Combat Theme | Primary Stat Affinities | Passive Trait Concept |
| :--- | :--- | :--- | :--- |
| **Plant** | Sustained Survival | **HP & Healing Power** | *Photosynthesis*: Regenerates a % of max HP at end of round or gains shield on healing. |
| **Fish** | Swift Assassination | **Speed & Critical Rate** | *Streamline*: Gains extra critical chance when attacking before opponents. |
| **Rock** | Fortress & Resilience | **Defense & Crit RES** | *Solid Stone*: Reduces incoming critical strike damage and converts % of armor into retaliation damage. |
| **Magma** | Raw Explosive Power | **ATK & Pure Damage** | *Combustion*: Applies Burn stacks and deals bonus damage to shielded targets. |
| **Wind** | Evasion & Precision | **Flee (Dodge) & Hit Rate** | *Tailwind*: High dodge chance against heavy attacks; attacks ignore a portion of target evasion. |

---

## 4. Suggested Type Advantage Wheel

To maintain tight competitive balance, a cyclic 5-element pentagon system is suggested where each element beats one and is vulnerable to another (with standard $+15\% \sim +20\%$ damage bonus / reduction modifier).

```
               [ Magma ]
              ↗         ↘
         Burns           Evaporates /
        (Beats)          Cooled by (Loses to)
          /                   \
      [ Plant ]              [ Fish ]
         ↑                      ↓
     Breaks down            Stirs up /
      Roots in               Strands
         ↑                      ↓
      [ Rock ]  ←──────────  [ Wind ]
                 Deflects /
                 Withstands
```

### Advantage Explanations:
1. **Magma beats Plant**: Extreme heat incinerates wood and foliage.
2. **Plant beats Rock**: Deep root systems crack boulders and absorb mineral nutrients.
3. **Rock beats Wind**: Solid monolithic terrain blocks and disperses gusting storms.
4. **Wind beats Fish**: Gales churn the waters and strand aquatic life on land.
5. **Fish beats Magma**: Water douses flames and hardens molten lava into brittle rock.

> [!TIP]
> **Optional Dual Advantage (Extended Pentagram)**:
> In addition to the clockwise primary cycle ($+20\%$), you can add secondary counter-interactions ($+10\%$) across the pentagram star to create deeper counter-strategies (e.g., *Magma melts Rock*, *Wind fells Plant*).

---

## 5. Hybridization & Modular Customization

A Quve does **not** need to have all 5 parts matching its Core Base Type:
- A **Rock-type Quve** can equip **Plant roots** (for healing) and **Fish fins** (for sudden speed burst).
- **Same-Type Synergy Bonus**: Equipping a part that matches the Quve's Base Type grants bonus stats (e.g., $+10\%$ Part Card effectiveness or $+5\%$ base stat synergy).
- **Hybrid Builds**: Encourage creative deckbuilding (e.g., a "Drain-Tank" Magma Quve with Plant regeneration parts, or an elusive "Ghost-Striker" Wind Quve with Magma bursts).

---

## 6. Battle Mechanics Overview

- **Team Composition**: **3 Quves per team** (Frontliner / Tank, Midliner / Utility, Backliner / Finisher).
- **Turn Structure**:
  1. **Energy Generation**: Gain fixed Energy points per round (e.g., 3 Energy).
  2. **Card Draw**: Draw cards from the combined team deck (15 total cards: 3 Quves $\times$ 5 part cards).
  3. **Action Phase**: Select and sequence cards targeting specific enemy positions.
  4. **Resolution Phase**: Actions execute based on individual Quve **Speed** stat order.
- **Victory Condition**: Eliminate all 3 opposing Quves.

---

## 7. Economy: Quve Coin ($QVC)

**Quve Coin ($QVC)** acts as the core utility and reward currency within the ecosystem:

| Use Case | Description |
| :--- | :--- |
| **Story / Quest Rewards** | Earned through campaign milestone completions, daily challenges, and dungeon clears. |
| **PvP Season Rewards** | Distributed to top-ranking players on the competitive leaderboard at the end of each season. |
| **Part Forging & Rerolling** | Used as currency to craft new Quve parts, mutate existing parts, or refine card stats. |
| **Breeding / Fusion** | Required to incubate new Quves or fuse two Quves to inherit rare traits. |
| **Marketplace Trade** | Primary medium of exchange for trading Quves, parts, and cosmetic skins between players. |

---

## 8. Next Steps & Upcoming Documentation

1. **`skills.md`**: Detailed breakdown of the 5 Part Card slots, energy costs, mechanics, and starter card sets for each of the 5 Types.
2. **`story.md` / `campaign.md`**: Story progression, world lore, cubic biomes, and enemy faction design.
3. **`combat_rules.md`**: Turn order, speed calculation formula, hit/flee probability math, and status ailments (Burn, Root, Bleed, etc.).
