# Project Quve: Combat Rules & Battle Mechanics Specification

## 1. Battlefield Layout & Positioning

A standard battle features two opposing teams of **3 Quves** positioned in a grid line or triangle formation:

```
[ PLAYER TEAM ]                                [ ENEMY TEAM ]
               Frontliner (Pos 1)      Frontliner (Pos 1)
Midliner (Pos 2)                               Midliner (Pos 2)
               Backliner (Pos 3)       Backliner (Pos 3)
```

- **Slot 1 (Front)**: Absorbs first-contact damage. Typically occupied by high-DEF/HP Quves (Rock / Plant).
- **Slot 2 (Mid)**: Utility, hybrid support, or secondary brawler (Wind / Plant / Fish).
- **Slot 3 (Back)**: High-damage glass cannon or assassin (Fish / Magma), protected behind frontline shields.

---

## 2. The Round System

Battles are structured into iterative **Rounds**. Each round consists of 5 discrete phases:

```
┌──────────────────┐
│ 1. Round Start   │ ➔ Cleanse round buffs, check active statuses
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 2. Energy & Draw │ ➔ Gain +2 Energy, Draw +3 Cards from team deck
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 3. Action Phase  │ ➔ Both players queue cards (30s countdown timer)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 4. Battle Resolve│ ➔ Actions execute strictly in Speed order
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 5. Round End     │ ➔ DoTs trigger (Burn), Regen heals, Shields expire
└──────────────────┘
```

### Resource Economy

| Resource | Round 1 (Start) | Per Round Gain | Maximum Cap |
| :--- | :---: | :---: | :---: |
| **Energy** | **3 Energy** | **+2 Energy** | **10 Energy** |
| **Hand Size** | **6 Cards** | **+3 Cards** | **9 Cards** |
| **Draw Deck** | **15 Cards** (3 Quves $\times$ 5 parts) | Shuffles discard pile when empty | 15 total |

---

## 3. Turn Order & Speed Tiebreakers

During **Phase 4 (Battle Resolve)**, all queued cards from both teams are gathered into a single action timeline sorted by the casting Quve's current **Speed stat** (highest speed attacks first).

### Speed Tiebreaker Hierarchy
If two opposing or allied Quves have the exact same current Speed value, the game resolves initiative using the following deterministic tiebreaker chain:

1. **Higher Current Speed Stat** (including active buffs/debuffs).
2. **Lower Current HP Percentage** (the more endangered Quve gains adrenaline priority).
3. **Higher Base Speed Stat** (natural base speed without temporary buffs).
4. **Higher Speed Stat Part Count** (number of equipped Fish/Wind parts).
5. **Team Position Priority** (Frontliner > Midliner > Backliner).
6. **Deterministic Hash Seed**: If 100% identical, resolved by the server match random seed (coin flip determined at match start).

---

## 4. Targeting Rules & Aggro Priority

### A. Default Targeting Rule: "Closest Enemy"
Unless a card explicitly specifies a targeting modifier, all attacks automatically target the **closest live enemy in the front line**:
- If enemy Position 1 (Front) is alive $\rightarrow$ Target Position 1.
- If Position 1 is defeated $\rightarrow$ Target Position 2 (Mid).
- If Positions 1 and 2 are defeated $\rightarrow$ Target Position 3 (Back).

### B. Targeting Overrides & Keywords
Cards can manipulate target priority:
- **Fastest Enemy**: Targets the enemy with the highest Speed stat (e.g., *Sonar Visage*).
- **Lowest HP**: Targets the most wounded enemy to secure a knockout.
- **Taunt**: The caster forces all enemy attacks to redirect to itself this round (e.g., *Granite Visage*).
- **Backline Snipe**: Skips the frontline and directly attacks Position 3.

### C. Mid-Round Target Defeat ("Overkill Retargeting")
If an enemy Quve is knocked out mid-round while another card is still queued to strike it:
- The remaining attacks **do not fizzle**.
- They immediately **retarget the next closest valid enemy** according to default targeting rules.

---

## 5. Damage & Shield Calculation Math

All combat mathematics are computed server-side using deterministic integer arithmetic (rounded to the nearest whole integer).

### A. Total Damage Formula
$$\text{Final Damage} = \lfloor \text{Base ATK} \times M_{\text{Type}} \times M_{\text{Synergy}} \times M_{\text{Crit}} \times M_{\text{Status}} \rfloor$$

Where:
- $\text{Base ATK}$: The card's printed attack value.
- $M_{\text{Type}}$ (**Elemental Advantage**):
  - **$+20\%$ ($1.20\times$)** if attacking an element you counter (e.g., Magma hitting Plant).
  - **$-20\%$ ($0.80\times$)** if attacking an element that counters you (e.g., Plant hitting Magma).
  - **$1.00\times$** for neutral matchups.
- $M_{\text{Synergy}}$ (**Same-Type Card Bonus / STAB**):
  - **$+10\%$ ($1.10\times$)** if the played card's element matches the casting Quve's Base Type.
- $M_{\text{Crit}}$ (**Critical Hit Multiplier**):
  - Base Critical Multiplier is **$150\%$ ($1.50\times$)** on a successful critical roll.
- $M_{\text{Status}}$ (**Active Buffs/Debuffs**):
  - E.g., [Daze] applies a $0.75\times$ multiplier.

---

### B. Hit & Evasion (Flee) Formula
When an attack is launched, the game rolls hit accuracy against target evasion:

$$\text{Hit Chance (\%)} = \min\left(100, \max\left(5, \text{Attacker Hit Rate} - \text{Target Evasion (Flee)} \right)\right)$$

- Base Hit Rate is **$100\%$**.
- Base Evasion is **$0\%$** (boosted by Wind stats and skills like *Gale Crest*).
- Attacks with the **[Precision]** keyword (e.g., *Falcon Eye*) treat Target Evasion as $0\%$ and always hit with $100\%$ accuracy.

---

### C. Critical Strike Probability
$$\text{Crit Chance (\%)} = \min\left(60, \max\left(0, \frac{\text{Attacker Speed} \times 0.25 + \text{Crit Stat}}{100} - \text{Target Crit RES}\right)\right)$$

- Fish-type Quves have the highest natural critical chance.
- Rock-type Quves have high **Crit RES**, reducing incoming critical chances to zero or near-zero.
- The maximum hard cap for Critical Chance is **$60\%$** to prevent uncounterable RNG sweeps.

---

### D. Shield & Armor Absorption Rules

1. **Pre-Attack Shielding**: When a card is played, its **DEF value** is immediately added to the casting Quve's active Shield pool at the start of the round (during Phase 3 submission).
2. **Damage Soak Order**:
   - Damage is **first subtracted from the active Shield pool**.
   - Any **excess damage (bleed-through)** after the shield drops to 0 is subtracted from **Current HP**.
3. **Shield Expiry**:
   - Shields **do not carry over** between rounds. Unbroken shields expire at the end of Phase 5 (Round End).
4. **True Damage / Burn**:
   - Status damage such as **[Burn]** completely ignores shields and damages Current HP directly.

```
Incoming Attack: 120 Damage
Current Shield:  70 DEF
Current HP:     200 HP

Step 1: Shield absorbs 70 damage ➔ Shield = 0 (Broken!)
Step 2: Remaining 50 damage hits HP ➔ HP = 150
Result: Quve survives with 150 HP and 0 Shield.
```

---

## 6. End-of-Round Resolution Order (Phase 5)

At the end of each round, lingering effects trigger in strict sequence:
1. **Shield Break Retaliation Check**: Cards that trigger upon shield destruction (e.g., *Bark Carapace* HP recovery or *Tremor Anchor* counter-damage) resolve.
2. **Damage-over-Time (DoT)**: **[Burn]** stacks tick and reduce HP. (If a Quve hits 0 HP, it is defeated).
3. **Regeneration / Heals**: **[Photosynthesis]** or lingering heal effects restore HP.
4. **Buff / Debuff Duration Decay**: Status effect durations decrease by 1 turn.
5. **Shield Cleanup**: All remaining shields are cleared to 0 for the next round.
6. **Victory / Defeat Check**: If all 3 Quves of a team are eliminated, match concludes immediately.
