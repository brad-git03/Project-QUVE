# Project Quve multiplayer deployment

## What is implemented

- Socket.IO rooms for one host and one invited opponent.
- Shareable links in the format `https://your-domain.example/?room=ABC123`.
- Server-owned 30-second pre-duel deadline, synchronized to both clients.
- Private lineup submission: the server broadcasts readiness, but never broadcasts either player's lineup.
- Early arena start when both players lock in; automatic start when the deadline expires.
- Disconnect handling that returns the remaining player to the lobby.

## Recommended prototype deployment: Render

This repository is ready to deploy as one Render Web Service. The included
`render.yaml` uses `npm ci`, starts the Express + Socket.IO server, and checks
`/api/health`.

1. Push the repository to GitHub or GitLab.
2. In Render, create a Blueprint and select the repository.
3. Deploy the service described by `render.yaml`.
4. Open the assigned HTTPS URL and create a room. Invite links automatically
   use the deployed origin.

WebSockets need a long-running process. Render supports this model directly.
The current room store is in memory, so keep the prototype at one instance.

## Vercel option

Vercel Functions are short-lived and are not a persistent Socket.IO host. To
use Vercel for the web client, deploy this Node server separately on Render (or
replace Socket.IO with a managed realtime provider such as Ably, Pusher, or
Supabase Realtime), then configure the browser client to connect to that public
realtime URL. The current one-service build should be deployed to Render.

## Production hardening

Before ranked or economy-backed PvP, add:

- Redis plus the Socket.IO Redis adapter for rooms, presence, timers, and
  horizontal scaling.
- PostgreSQL for accounts, inventories, match records, and QVC transactions.
- Authenticated sessions; names currently identify guests only.
- Server-authoritative combat actions and validation. The current battle after
  lineup sync still runs the existing local combat prototype on each client.
- Reconnection tokens and a grace window before forfeiting a disconnected duel.
- Rate limits, structured logs, error monitoring, and match-state tests.

## Local verification

```sh
npm install
npm start
```

Open `http://localhost:3000` in one browser window, create a room, and open its
invite link in a second window. Use different callsigns and lock three Quves on
both sides.
