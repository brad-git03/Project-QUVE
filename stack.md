# Project Quve: Technology Stack & Architecture Design

## 1. Overview & Project Profile

- **Project Type**: Web-first 2D/3D Turn-Based Tactical Card Battler (PvE story progression + PvP multiplayer)
- **Target Platform**: Desktop & Mobile Web Browsers (HTML5/WebGL), with future wrapper export (Capacitor / Electron / React Native)
- **Core Needs**: High responsiveness, clean card/battle UI, deterministic turn-based state synchronization, modular monster rendering (box/parts), and secure transactional economy (Quve Coin $QVC).

---

## 2. Recommended Tech Stack

| Layer | Recommended Choice | Purpose | Key Justification |
| :--- | :--- | :--- | :--- |
| **Game Engine / Rendering** | **Phaser.js** *(2D)* or **Three.js / React Three Fiber** *(3D Voxels)* | Canvas rendering of battle arena, animations, and modular Quves | If 2D sprites/isometric: Phaser 3 is lightweight and web-battle tested. If 3D cubic monsters: Three.js/R3F renders boxy models effortlessly in browser. |
| **Frontend UI & State** | **React + Tailwind CSS + Zustand** | Game HUD, card hands, inventory, deckbuilder, menus | Component-driven UI matches card battlers perfectly. Zustand handles lightweight, fast game state without Redux boilerplate. |
| **Game Server & API** | **Node.js (TypeScript) + Express** | REST API for auth, inventory, story quests, and shop | Full-stack TypeScript allows **sharing combat math, card models, and type definitions** between client and server. |
| **Realtime Networking** | **Socket.io** | Turn-based PvP matchmaking, battle state sync, timers | Reliable event-driven WebSocket abstraction with automatic reconnection, rooms, and fallbacks. |
| **Primary Database** | **PostgreSQL** (via **Prisma** or **Drizzle ORM**) | User accounts, Quve parts, equipped decks, story progress, QVC transactions | ACID-compliant relational integrity is critical for monster inventories, equipment slots, and currency balances. |
| **Session Cache & Matchmaking** | **Redis** | Active battle rooms, turn countdown timers, matchmaking queues | High-throughput in-memory key-value store to keep active matches fast without hammering PostgreSQL. |

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ React + Tailwind CSS  │       │  Game Canvas Engine   │  │
│  │ (HUD, Cards, Menus)   │ <───> │  (Phaser / Three.js)  │  │
│  └───────────────────────┘       └───────────────────────┘  │
└──────────────┬───────────────────────────────┬──────────────┘
               │ HTTP REST                     │ WebSockets
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js / Express Server                 │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ REST Endpoints        │       │ Socket.io Gateway     │  │
│  │ (Auth, Gacha, Deck)   │       │ (Battle Rooms, Turns) │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              ▼                               ▼              │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ PostgreSQL (Prisma)   │       │ Redis (Cache & Rooms) │  │
│  │ Persistent Player Data│       │ Live State & Queue    │  │
│  └───────────────────────┘       └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Deep-Dive Evaluations & Alternatives

### A. Frontend: React vs. Vue.js
- **Primary Choice**: **React + Tailwind CSS**
  - *Pros*: Massive ecosystem, superior UI animation libraries (Framer Motion is incredible for card dragging/hover effects), and seamless 3D integration via React Three Fiber (R3F) if box-type 3D Quves are used.
  - *Cons*: Slightly higher setup complexity compared to Vue.
- **Alternative**: **Vue.js 3 (Pinia + Tailwind CSS)**
  - *Pros*: Cleaner template syntax, gentler learning curve, very lightweight.
  - *When to pick Vue*: If your development team is already faster and more comfortable with Vue single-file components.

### B. Game Rendering Engine: 2D vs. 3D (The "Box Monster" Advantage)
- **Recommendation 1 (If 3D Low-Poly / Voxels)**: **Three.js / React Three Fiber**
  - *Why it fits Quve*: Quves are explicitly **box-type monsters**! Generating 3D cubes with customizable slot meshes (horns, fins, wings, tails) is mathematically straightforward in 3D and allows dynamic rotations, 3D modular part swaps, and lighting effects right in the browser.
- **Recommendation 2 (If 2D Sprite / Chibi Art)**: **Phaser 3 or PixiJS**
  - *Why it fits Quve*: Battle-tested 2D canvas engines. Handles sprite sheet animations, particle effects, and card tweens with high FPS on low-end mobile browsers.

### C. Backend: Node.js (Express) vs. Python (FastAPI)
- **Primary Choice**: **Node.js (TypeScript) + Express + Socket.io**
  - *Key Benefit: Shared Codebase*: In a card battler, combat resolution logic (damage calculation, shield absorption, status triggers) should run on the server to prevent cheating, but also on the client for instant UI previews. Using TypeScript on both ends allows **100% code sharing** of combat formulas.
- **Alternative**: **Python (FastAPI + WebSockets)**
  - *Pros*: Python is supreme if you plan to build advanced AI/machine learning bot opponents for story mode or balance simulation algorithms.
  - *Trade-off*: You must write and maintain combat formulas twice (TypeScript on frontend, Python on backend) or run API calls for UI previews.

### D. Database: PostgreSQL vs. NoSQL
- **Primary Choice**: **PostgreSQL**
  - *Why it fits*: Inventory systems, part attributes, and monetary balances ($QVC) require strict transactional safety (ACID). If a player equips a part or crafts a card, you cannot risk duplicate states or race conditions.
  - *JSONB Support*: PostgreSQL handles flexible JSON data easily, allowing you to store dynamic part modifiers or card metadata in JSONB columns while keeping player accounts strictly structured.

---

## 4. Architectural Patterns for Turn-Based Battles

1. **Server-Authoritative State**:
   - The client never decides if an attack hit or how much damage was dealt.
   - The client emits player actions (`{ quveId, cardId, targetIndex }`).
   - The server validates energy cost, executes the turn logic using the shared combat engine, and broadcasts the resolved event log to both players.
2. **Animation Deserialization Queue**:
   - The server sends a list of atomic events for the turn:
     `[ { type: "CARD_PLAYED", card: "Bramble Snare" }, { type: "DAMAGE_TAKEN", target: 2, amount: 80 }, { type: "STATUS_APPLIED", status: "ROOT" } ]`
   - The frontend reads this sequence and plays the matching visual and sound animations in order.
3. **Turn Timers**:
   - Handled via Redis / Server clock (e.g., 30 seconds per selection phase) with auto-pass if a player disconnects.

---

## 5. Economy & Token Readiness ($QVC)

Since **Quve Coin ($QVC)** is intended as an in-game currency with potential Web3/PvP trading in the future:
- **Phase 1 (Testing / Web2 Prototype)**: Keep $QVC as an internal database column (`player.qvc_balance`) with audit logging.
- **Phase 2 (Blockchain / Token Expansion)**: Easily wrap with smart contracts (ERC-20 / Solana SPL) using libraries like **Viem / Ethers.js** on Node.js without rewriting game mechanics.

---

## 6. Recommended Starter Packages

```json
{
  "frontend": [
    "react",
    "react-dom",
    "zustand",
    "tailwindcss",
    "framer-motion",
    "socket.io-client",
    "lucide-react"
  ],
  "backend": [
    "express",
    "socket.io",
    "cors",
    "dotenv",
    "zod",
    "@prisma/client",
    "ioredis",
    "jsonwebtoken",
    "bcrypt"
  ],
  "devDependencies": [
    "typescript",
    "prisma",
    "tsx",
    "vite"
  ]
}
```
