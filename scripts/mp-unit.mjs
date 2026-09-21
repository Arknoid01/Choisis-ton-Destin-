// Tests de multiplayer.js avec un faux réseau en mémoire (plugins UDP/TCP simulés).
// Usage : npm run test:mp
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SRC = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'multiplayer.js'), 'utf8');

// ── Faux réseau : un « appareil » = un contexte vm avec ses propres plugins ──
function makeNetwork() {
  const devices = [];
  let clientSeq = 0;
  const net = { devices, hostDevice: null, clients: new Map() };

  function makeDevice(name, opts = {}) {
    const dev = { name, udpListeners: [], tcpListeners: {}, opts };
    const emit = (ev, data) => (dev.tcpListeners[ev] || []).forEach(cb => cb(data));
    dev.emit = emit;
    const plugins = {
      UdpSocket: {
        async create() { if (opts.udpCreateFails) throw new Error('udp_create_failed'); return { socketId: 1 }; },
        async bind() {}, async setBroadcast() {}, async close() {},
        async addListener(ev, cb) { dev.udpListeners.push(cb); return { remove() { dev.udpListeners = dev.udpListeners.filter(f => f !== cb); } }; },
        async send({ buffer }) {
          devices.filter(d => d !== dev).forEach(d => d.udpListeners.forEach(cb => cb({ buffer, remoteAddress: '10.0.0.1' })));
        }
      },
      TcpSocketManager: {
        addListener(ev, cb) { (dev.tcpListeners[ev] = dev.tcpListeners[ev] || []).push(cb); return Promise.resolve({ remove() {} }); },
        async startServer() { net.hostDevice = dev; return { ipAddress: '10.0.0.1' }; },
        async stopServer() { net.hostDevice = null; },
        async connectToServer() { dev.clientId = 'client-' + (++clientSeq); net.clients.set(dev.clientId, dev); },
        async disconnectFromServer() {
          net.clients.delete(dev.clientId);
          net.hostDevice && net.hostDevice.emit('clientDisconnected', { clientId: dev.clientId });
        },
        // Livraison SYNCHRONE : la réponse de l'hôte arrive avant le retour de send()
        async sendMessageToServer({ message }) { net.hostDevice.emit('receiveMessage', { clientId: dev.clientId, message }); },
        async sendMessageToClient({ clientId, message }) { net.clients.get(clientId)?.emit('receiveMessage', { message }); },
        async broadcastToClients({ message }) { net.clients.forEach(c => c.emit('receiveMessage', { message })); }
      }
    };
    const window = { Capacitor: { Plugins: plugins } };
    const ctx = vm.createContext({ window, crypto: webcrypto, btoa, atob, setTimeout, clearTimeout, setInterval, clearInterval, console: { ...console, warn() {}, error() {} } });
    vm.runInContext(SRC, ctx);
    dev.mp = window.SFMultiplayer;
    devices.push(dev);
    return dev;
  }
  net.makeDevice = makeDevice;
  return net;
}

let failed = 0;
async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); console.log(`  ✅ ${name} (${Date.now() - t0} ms)`); }
  catch (e) { failed++; console.log(`  ❌ ${name}\n     ${e.message}`); }
}

await test('un joueur rejoint via le code : welcome reçu, roster à jour des deux côtés', async () => {
  const net = makeNetwork();
  const h = net.makeDevice('host'), j = net.makeDevice('joueur');
  const { code } = await h.mp.host.create({ storyFile: 'a.json', storyTitle: 'A' });
  const joined = new Promise(r => h.mp.host.on('playerJoined', r));
  const data = await j.mp.join.connect({ code, name: 'Alice' });
  assert.equal(data.playerId, 'p1');
  assert.equal((await joined).name, 'Alice');
  assert.equal(h.mp.host.getPlayers().length, 1);
  assert.equal(typeof j.mp.join.getClockOffset(), 'number');
  await h.mp.host.stop();
});

await test('mauvais code : not_found (et pas de blocage)', async () => {
  const net = makeNetwork();
  const h = net.makeDevice('host'), j = net.makeDevice('joueur');
  await h.mp.host.create({ storyFile: 'a.json', storyTitle: 'A' });
  await assert.rejects(j.mp.join.connect({ code: '0000', name: 'X' }), /not_found/);
  await h.mp.host.stop();
});

await test('échec de Udp.create : connect() est rejeté au lieu de rester bloqué', async () => {
  const net = makeNetwork();
  const j = net.makeDevice('joueur', { udpCreateFails: true });
  const r = await Promise.race([
    j.mp.join.connect({ code: '1234', name: 'X' }).then(() => 'ok', e => e.message),
    new Promise(r => setTimeout(() => r('BLOQUÉ'), 2000))
  ]);
  assert.equal(r, 'udp_create_failed');
});

await test('partie limitée à 8 joueurs hôte compris : le 8e joueur reçoit « full »', async () => {
  const net = makeNetwork();
  const h = net.makeDevice('host');
  const { code } = await h.mp.host.create({ storyFile: 'a.json', storyTitle: 'A' });
  const joiners = Array.from({ length: 8 }, (_, i) => net.makeDevice('j' + i));
  const results = await Promise.all(joiners.map((d, i) => d.mp.join.connect({ code, name: 'J' + i }).then(() => 'ok', e => e.message)));
  assert.equal(results.filter(r => r === 'ok').length, 7);
  assert.equal(results.filter(r => r === 'full').length, 1);
  await h.mp.host.stop();
});

await test('reconnexion avec le jeton : même playerId, pas de doublon dans le roster', async () => {
  const net = makeNetwork();
  const h = net.makeDevice('host'), j = net.makeDevice('joueur');
  const { code } = await h.mp.host.create({ storyFile: 'a.json', storyTitle: 'A' });
  const first = await j.mp.join.connect({ code, name: 'Alice' });
  await j.mp.join.leave();
  const again = await j.mp.join.connect({ code, name: 'Alice' });
  assert.equal(again.playerId, first.playerId);
  assert.equal(h.mp.host.getPlayers().length, 1);
  assert.equal(h.mp.host.getPlayers()[0].connected, true);
  await h.mp.host.stop();
});

await test('jetons de reconnexion : 32 caractères hexadécimaux, uniques', async () => {
  const net = makeNetwork();
  const h = net.makeDevice('host');
  const { code } = await h.mp.host.create({ storyFile: 'a.json', storyTitle: 'A' });
  const seen = [];
  h.mp.host.on('playerJoined', () => {});
  const joiners = [net.makeDevice('a'), net.makeDevice('b')];
  for (const d of joiners) await d.mp.join.connect({ code, name: d.name });
  joiners.forEach(d => seen.push(d.mp.join.snapshot().token));
  seen.forEach(t => assert.match(t, /^[0-9a-f]{32}$/));
  assert.notEqual(seen[0], seen[1]);
  await h.mp.host.stop();
});

console.log(failed ? `\n❌ ${failed} échec(s)` : '\n✅ tout est vert');
process.exit(failed ? 1 : 0);
