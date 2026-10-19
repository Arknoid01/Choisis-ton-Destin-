// Simule Google Play + cordova-plugin-purchase autour de billing.js.
// Cas couvert : après un achat, le plugin marque les autres DLC « non
// possédés » jusqu'au redémarrage → ils ne doivent PAS se reverrouiller,
// et « article déjà possédé » doit débloquer le pack.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../billing.js', import.meta.url), 'utf8');
let failed = 0;
const check = (ok, label) => {
  console.log(`${ok ? '  ✅' : '  ❌'} ${label}`);
  if (!ok) failed++;
};

function boot(ownedIds, storage = new Map()) {
  const owned = new Set(ownedIds);
  const handlers = {};
  const products = {};
  let orderResult = null;
  const store = {
    register(list) {
      list.forEach(p => {
        products[p.id] = {
          id: p.id,
          get owned() { return owned.has(p.id); },
          getOffer: () => ({
            pricingPhases: [{ price: '2,99 €' }],
            order: async () => orderResult ? orderResult(p.id) : undefined
          })
        };
      });
    },
    when() {
      const chain = {};
      ['productUpdated', 'approved', 'verified', 'finished', 'receiptsReady']
        .forEach(k => { chain[k] = fn => { handlers[k] = fn; return chain; }; });
      return chain;
    },
    error() {},
    initialize: async () => {},
    update: async () => {},
    restorePurchases: async () => {},
    get: id => products[id]
  };
  const window = {
    CdvPurchase: {
      store,
      ProductType: { NON_CONSUMABLE: 'nc' },
      Platform: { GOOGLE_PLAY: 'android-playstore' },
      ErrorCode: { PAYMENT_CANCELLED: 6777006 }
    }
  };
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v))
  };
  const ctx = { window, localStorage, document: { addEventListener() {}, removeEventListener() {} },
    console: { info() {}, error() {}, log() {} }, setTimeout, clearTimeout, setInterval, clearInterval };
  vm.runInNewContext(src, ctx);
  return {
    billing: window.SFBilling, owned, handlers, storage,
    setOrder: fn => { orderResult = fn; }
  };
}

const ids = { cinq: 'fableris.dlc.cinq_lames', cosmos: 'fableris.dlc.cosmos' };

console.log('1. Achat d\'un DLC alors que d\'autres sont déjà possédés');
{
  const sim = boot([ids.cinq]);
  await sim.billing.init();
  check(sim.billing.isUnlocked('cinq_lames'), 'au démarrage : Cinq Lames débloqué');
  check(!sim.billing.isUnlocked('cosmos'), 'au démarrage : Cosmos verrouillé');

  // Bug du plugin : après l'achat, seul le nouveau produit est « owned ».
  sim.setOrder(id => {
    sim.owned.clear();
    sim.owned.add(id);
    setTimeout(() => sim.handlers.finished(), 0);
  });
  const res = await sim.billing.buy('cosmos');
  check(res.ok, 'achat Cosmos réussi');
  check(sim.billing.isUnlocked('cosmos'), 'Cosmos débloqué');
  check(sim.billing.isUnlocked('cinq_lames'), 'Cinq Lames toujours débloqué');

  const r = await sim.billing.restore();
  check(r.ok && sim.billing.isUnlocked('cinq_lames'), 'restaurer ne reverrouille rien');
}

console.log('2. Cache désynchronisé : Google répond « déjà possédé »');
{
  const sim = boot([]);
  await sim.billing.init();
  check(!sim.billing.isUnlocked('cosmos'), 'Cosmos verrouillé');
  sim.setOrder(() => ({ code: 6777003, message: 'Failure to purchase since item is already owned' }));
  const res = await sim.billing.buy('cosmos');
  check(res.ok && res.reason === 'already_owned', 'buy() renvoie ok / already_owned');
  check(sim.billing.isUnlocked('cosmos'), 'Cosmos débloqué');
}

console.log('3. Remboursement : reverrouillé au démarrage suivant');
{
  const storage = new Map();
  const first = boot([ids.cosmos], storage);
  await first.billing.init();
  check(first.billing.isUnlocked('cosmos'), 'Cosmos acheté');
  const second = boot([], storage);
  await second.billing.init();
  check(!second.billing.isUnlocked('cosmos'), 'Cosmos reverrouillé après remboursement');
  check(second.billing.isUnlocked('kids'), 'pack Enfants (gratuit) toujours accessible');
}

if (failed) {
  console.error(`\n❌ ${failed} échec(s)`);
  process.exit(1);
}
console.log('\n✅ tout est vert');
