/* ══════════════════════════════════════════════════════════════
   SFMultiplayer — partie locale en wifi (hôte + joueurs)

   Découverte : broadcast UDP (capacitor-udp-socket) d'un code à 4 chiffres.
   Transport  : serveur TCP local sur l'hôte (capacitor-tcp-socket-manager,
   patché — voir patches/) ; les joueurs s'y connectent en client TCP.
   Protocole  : une ligne JSON par message : {type, ...payload}.

   Uniquement disponible dans l'app native (aucun des deux plugins ne
   fonctionne dans un navigateur classique — voir isAvailable()).
   ══════════════════════════════════════════════════════════════ */

window.SFMultiplayer = (function () {

  const BROADCAST_PORT = 45645;
  const SERVER_PORT = 45646;
  const BROADCAST_INTERVAL_MS = 1000;
  const DISCOVERY_TIMEOUT_MS = 8000;
  const MAX_PLAYERS = 8;

  function plugins() {
    return window.Capacitor && window.Capacitor.Plugins;
  }

  function isAvailable() {
    const p = plugins();
    return !!(p && p.UdpSocket && p.TcpSocketManager);
  }

  function randomCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function randomToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Émetteur d'événements minimal, réutilisé par host et join.
  function makeEmitter() {
    const handlers = {};
    return {
      on(event, cb) {
        (handlers[event] = handlers[event] || []).push(cb);
        return () => {
          handlers[event] = (handlers[event] || []).filter(fn => fn !== cb);
        };
      },
      emit(event, data) {
        (handlers[event] || []).forEach(cb => {
          try { cb(data); } catch (e) { console.error('[SFMultiplayer]', event, e); }
        });
      }
    };
  }

  function parseLine(line) {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.warn('[SFMultiplayer] message JSON invalide ignoré:', line);
      return null;
    }
  }

  // capacitor-udp-socket encode/décode 'buffer' en base64 côté natif
  // (Base64.encode/decode côté Java) — non documenté dans son README.
  function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function fromBase64(b64) {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) {
      return '';
    }
  }

  // ── HÔTE ─────────────────────────────────────────────────────
  const host = (function () {
    const events = makeEmitter();
    let udpSocketId = null;
    let broadcastTimer = null;
    let code = null;
    let ipAddress = null;
    let players = new Map(); // playerId -> { id, name, clientId, connected, token }
    let clientToPlayer = new Map(); // native clientId -> playerId
    let playerIdCounter = 0;
    let listenersAttached = false;
    let storyInfo = null;

    function attachListeners() {
      if (listenersAttached) return;
      listenersAttached = true;
      const Tcp = plugins().TcpSocketManager;

      Tcp.addListener('clientDisconnected', ({ clientId }) => {
        const playerId = clientToPlayer.get(clientId);
        if (!playerId) return;
        const player = players.get(playerId);
        if (player) {
          player.connected = false;
          events.emit('playerLeft', { playerId, name: player.name });
          broadcastRoster();
        }
      });

      Tcp.addListener('receiveMessage', ({ clientId, message }) => {
        const msg = parseLine(message);
        if (!msg) return;
        handleClientMessage(clientId, msg);
      });
    }

    function handleClientMessage(clientId, msg) {
      if (msg.type === 'join') {
        handleJoin(clientId, msg);
        return;
      }
      if (msg.type === 'clockSync') {
        // Aller-retour horloge (style NTP) — répond immédiatement, aucune
        // identification requise, pour que le joueur puisse estimer le
        // décalage entre son horloge locale et celle de l'hôte avant même
        // que la partie ne démarre.
        sendToClient(clientId, { type: 'clockSyncReply', t0: msg.t0, t1: Date.now() });
        return;
      }
      const playerId = clientToPlayer.get(clientId);
      if (!playerId) return; // pas encore identifié (n'a pas envoyé 'join')
      events.emit('message', { playerId, type: msg.type, payload: msg });
    }

    function handleJoin(clientId, msg) {
      const name = (msg.name || 'Joueur').slice(0, 24);
      let playerId = null;

      // Reconnexion : on retrouve le joueur via son jeton.
      if (msg.rejoin) {
        for (const [id, p] of players) {
          if (p.token === msg.rejoin) { playerId = id; break; }
        }
      }
      const isReconnect = !!playerId;

      if (playerId) {
        const player = players.get(playerId);
        player.clientId = clientId;
        player.connected = true;
        clientToPlayer.set(clientId, playerId);
        events.emit('playerRejoined', { playerId, name: player.name });
      } else {
        if (countConnected() >= MAX_PLAYERS) {
          sendToClient(clientId, { type: 'full' });
          return;
        }
        playerId = 'p' + (++playerIdCounter);
        const token = randomToken();
        players.set(playerId, { id: playerId, name, clientId, connected: true, token });
        clientToPlayer.set(clientId, playerId);
        events.emit('playerJoined', { playerId, name });
      }

      const player = players.get(playerId);
      sendToClient(clientId, {
        type: 'welcome',
        playerId,
        token: player.token,
        story: storyInfo,
        players: rosterPayload()
      });

      // Reconnexion : la partie a pu avancer pendant l'absence du joueur
      // (broadcasts 'advance'/'voteStart' manqués car son socket était
      // fermé) — on lui renvoie où en est le jeu maintenant pour qu'il
      // puisse rattraper, plutôt que de rester bloqué sur une vieille scène.
      if (isReconnect && resumeProvider) {
        const state = resumeProvider();
        if (state) sendToClient(clientId, Object.assign({ type: 'resume' }, state));
      }

      broadcastRoster();
    }

    let resumeProvider = null;
    function setResumeProvider(fn) { resumeProvider = fn; }

    function countConnected() {
      let n = 0;
      for (const p of players.values()) if (p.connected) n++;
      return n;
    }

    function rosterPayload() {
      return Array.from(players.values()).map(p => ({
        id: p.id, name: p.name, connected: p.connected
      }));
    }

    function broadcastRoster() {
      broadcast('roster', { players: rosterPayload() });
    }

    async function sendToClient(clientId, msg) {
      try {
        await plugins().TcpSocketManager.sendMessageToClient({
          clientId, message: JSON.stringify(msg)
        });
      } catch (e) {
        console.warn('[SFMultiplayer] envoi à un client échoué', e);
      }
    }

    async function sendTo(playerId, type, payload) {
      const player = players.get(playerId);
      if (!player || !player.connected) return;
      await sendToClient(player.clientId, Object.assign({ type }, payload));
    }

    async function broadcast(type, payload) {
      try {
        await plugins().TcpSocketManager.broadcastToClients({
          message: JSON.stringify(Object.assign({ type }, payload))
        });
      } catch (e) {
        console.warn('[SFMultiplayer] broadcast échoué', e);
      }
    }

    async function startUdpBroadcast() {
      const Udp = plugins().UdpSocket;
      const { socketId } = await Udp.create({ properties: {} });
      udpSocketId = socketId;
      await Udp.bind({ socketId, port: 0 }); // port éphémère, on ne fait qu'émettre
      await Udp.setBroadcast({ socketId, enabled: true });

      const payload = toBase64(JSON.stringify({ app: 'ctd-multiplayer', code, port: SERVER_PORT }));
      broadcastTimer = setInterval(() => {
        Udp.send({ socketId: udpSocketId, address: '255.255.255.255', port: BROADCAST_PORT, buffer: payload })
          .catch(e => console.warn('[SFMultiplayer] broadcast UDP échoué', e));
      }, BROADCAST_INTERVAL_MS);
    }

    async function create({ storyFile, storyTitle }) {
      if (!isAvailable()) throw new Error('unavailable');
      storyInfo = { file: storyFile, title: storyTitle };
      players = new Map();
      clientToPlayer = new Map();
      playerIdCounter = 0;
      code = randomCode();

      attachListeners();
      const result = await plugins().TcpSocketManager.startServer({ port: SERVER_PORT });
      ipAddress = result.ipAddress;
      await startUdpBroadcast();

      return { code, ipAddress };
    }

    async function stop() {
      if (broadcastTimer) { clearInterval(broadcastTimer); broadcastTimer = null; }
      const p = plugins();
      if (udpSocketId != null && p && p.UdpSocket) {
        try { await p.UdpSocket.close({ socketId: udpSocketId }); } catch (e) {}
        udpSocketId = null;
      }
      if (p && p.TcpSocketManager) {
        try { await p.TcpSocketManager.stopServer(); } catch (e) {}
      }
      code = null;
      players = new Map();
      clientToPlayer = new Map();
    }

    function getPlayers() { return rosterPayload(); }
    function getCode() { return code; }

    /**
     * Reconstruit l'état JS après une navigation de page (ex: lobby → game.html).
     * Les sockets natifs (serveur TCP, broadcast UDP) survivent à la navigation
     * — seul l'état JS (roster, listeners) est perdu et doit être reformé ici.
     */
    function hydrate(snapshot) {
      code = snapshot.code;
      storyInfo = snapshot.story || storyInfo;
      players = new Map();
      clientToPlayer = new Map();
      playerIdCounter = 0;
      (snapshot.players || []).forEach(p => {
        players.set(p.id, { id: p.id, name: p.name, clientId: p.clientId, connected: p.connected, token: p.token });
        if (p.clientId) clientToPlayer.set(p.clientId, p.id);
        const n = parseInt(String(p.id).replace('p', ''), 10);
        if (!isNaN(n) && n > playerIdCounter) playerIdCounter = n;
      });
      attachListeners();
    }

    /** Snapshot sérialisable pour sessionStorage avant une navigation. */
    function snapshot() {
      return {
        code,
        story: storyInfo,
        players: Array.from(players.values())
      };
    }

    return {
      create, stop, broadcast, sendTo, getPlayers, getCode, hydrate, snapshot, setResumeProvider,
      on: events.on
    };
  })();

  // ── JOUEUR ───────────────────────────────────────────────────
  const join = (function () {
    const events = makeEmitter();
    let udpSocketId = null;
    let connected = false;
    let playerId = null;
    let token = null;
    let listenersAttached = false;
    let joinTimeoutHandle = null;
    let clockOffset = 0; // estimation (horloge hôte - horloge locale), en ms
    let pendingClockSync = null; // { t0, resolve }

    function attachListeners() {
      if (listenersAttached) return;
      listenersAttached = true;
      const Tcp = plugins().TcpSocketManager;
      Tcp.addListener('receiveMessage', ({ message }) => {
        const msg = parseLine(message);
        if (!msg) return;
        handleServerMessage(msg);
      });
      Tcp.addListener('serverDisconnected', () => {
        connected = false;
        events.emit('disconnected', {});
      });
      Tcp.addListener('serverReconnected', () => {
        connected = true;
        // Le socket brut est de retour, mais l'hôte ne sait pas encore que
        // c'est le même joueur tant qu'on ne renvoie pas notre jeton.
        if (token) send('join', { rejoin: token }).catch(() => {});
        syncClock();
        events.emit('reconnected', {});
      });
    }

    function handleServerMessage(msg) {
      if (msg.type === 'welcome') {
        playerId = msg.playerId;
        token = msg.token;
        connected = true;
        events.emit('connected', { playerId, story: msg.story, players: msg.players });
        return;
      }
      if (msg.type === 'full') {
        events.emit('error', { reason: 'full' });
        return;
      }
      if (msg.type === 'roster') {
        events.emit('roster', { players: msg.players });
        return;
      }
      if (msg.type === 'clockSyncReply') {
        if (pendingClockSync && pendingClockSync.t0 === msg.t0) {
          const t2 = Date.now();
          const rtt = t2 - pendingClockSync.t0;
          pendingClockSync.resolve({ offset: msg.t1 - pendingClockSync.t0 - rtt / 2, rtt });
          pendingClockSync = null;
        }
        return;
      }
      events.emit('message', { type: msg.type, payload: msg });
    }

    // Un seul aller-retour horloge (style NTP) : offset = décalage estimé
    // entre l'horloge de l'hôte et la nôtre, en supposant une latence
    // symétrique aller/retour (raisonnable sur un wifi local).
    function pingClock() {
      return new Promise((resolve) => {
        const t0 = Date.now();
        pendingClockSync = { t0, resolve };
        send('clockSync', { t0 }).catch(() => resolve(null));
        setTimeout(() => {
          if (pendingClockSync && pendingClockSync.t0 === t0) {
            pendingClockSync = null;
            resolve(null);
          }
        }, 3000);
      });
    }

    // Répète l'aller-retour plusieurs fois et garde l'échantillon au RTT le
    // plus court (le plus fiable) — pratique NTP standard pour limiter
    // l'erreur due à une latence asymétrique.
    async function syncClock(samples = 5) {
      let best = null;
      for (let i = 0; i < samples; i++) {
        const r = await pingClock();
        if (r && (!best || r.rtt < best.rtt)) best = r;
      }
      if (best) clockOffset = best.offset;
      return clockOffset;
    }

    function getClockOffset() { return clockOffset; }

    function findHostViaBroadcast(code) {
      return new Promise(async (resolve, reject) => {
        const Udp = plugins().UdpSocket;
        const { socketId } = await Udp.create({ properties: {} });
        udpSocketId = socketId;

        const timeout = setTimeout(async () => {
          cleanupListener();
          try { await Udp.close({ socketId }); } catch (e) {}
          udpSocketId = null;
          reject(new Error('not_found'));
        }, DISCOVERY_TIMEOUT_MS);

        let removeListener = null;
        function cleanupListener() {
          if (removeListener) { removeListener(); removeListener = null; }
        }

        const handle = await Udp.addListener('receive', async (event) => {
          const msg = parseLine(fromBase64(event.buffer || ''));
          if (!msg || msg.app !== 'ctd-multiplayer' || String(msg.code) !== String(code)) return;
          clearTimeout(timeout);
          cleanupListener();
          try { await Udp.close({ socketId }); } catch (e) {}
          udpSocketId = null;
          resolve({ ipAddress: event.remoteAddress, port: msg.port });
        });
        removeListener = () => handle.remove();

        try {
          await Udp.bind({ socketId, port: BROADCAST_PORT });
        } catch (e) {
          clearTimeout(timeout);
          cleanupListener();
          reject(e);
        }
      });
    }

    async function connect({ code, name }) {
      if (!isAvailable()) throw new Error('unavailable');
      attachListeners();
      const { ipAddress, port } = await findHostViaBroadcast(code);
      await plugins().TcpSocketManager.connectToServer({ ipAddress, port });
      await send('join', { name, rejoin: token || undefined });

      const data = await new Promise((resolve, reject) => {
        joinTimeoutHandle = setTimeout(() => reject(new Error('timeout')), 5000);
        const off = events.on('connected', (data) => {
          clearTimeout(joinTimeoutHandle);
          off();
          resolve(data);
        });
      });
      await syncClock();
      return data;
    }

    async function send(type, payload) {
      await plugins().TcpSocketManager.sendMessageToServer({
        message: JSON.stringify(Object.assign({ type }, payload))
      });
    }

    async function leave() {
      connected = false;
      playerId = null;
      const p = plugins();
      if (p && p.TcpSocketManager) {
        try { await p.TcpSocketManager.disconnectFromServer(); } catch (e) {}
      }
    }

    function isConnected() { return connected; }
    function getPlayerId() { return playerId; }

    /**
     * Reconstruit l'état JS après une navigation de page (ex: lobby → game.html).
     * La connexion TCP native survit à la navigation — seul l'état JS
     * (playerId/token, listeners) est perdu et doit être reformé ici.
     */
    function hydrate(snapshot) {
      playerId = snapshot.playerId;
      token = snapshot.token;
      clockOffset = snapshot.clockOffset || 0;
      connected = true;
      attachListeners();
    }

    /** Snapshot sérialisable pour sessionStorage avant une navigation. */
    function snapshot() {
      return { playerId, token, clockOffset };
    }

    return {
      connect, send, leave, isConnected, getPlayerId, getClockOffset, hydrate, snapshot,
      on: events.on
    };
  })();

  return { isAvailable, MAX_PLAYERS, host, join };
})();
