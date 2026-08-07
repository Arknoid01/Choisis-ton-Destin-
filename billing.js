/* ══════════════════════════════════════════════════════════════
   SFBilling — achats intégrés Google Play (DLC non consommables)
   Fableris / StoryForge — PegasusCorp

   Dépendance : cordova-plugin-purchase v13 (CdvPurchase)
     npm i cordova-plugin-purchase
     npx cap sync android

   Principe :
     - un pack = un produit non consommable = un ID Play Console
     - les packs débloqués sont mis en cache dans localStorage
       (sf_unlocked_packs) pour un affichage instantané hors ligne
     - la source de vérité reste Google Play : à chaque démarrage on
       resynchronise le cache avec les achats réellement possédés

   Sur navigateur (pas de plugin), tout est neutralisé proprement :
   les packs gratuits restent accessibles, les achats sont désactivés.
   ══════════════════════════════════════════════════════════════ */

window.SFBilling = (function () {

  // ── Table de correspondance pack ⇄ produit Play Console ──────
  // ⚠ Ces IDs sont DÉFINITIFS une fois créés dans la Play Console.
  //   Ils doivent correspondre exactement aux clés de PACK_CONFIG.
  const PRODUCTS = {
    cinq_lames: 'fableris.dlc.cinq_lames',
    neon:       'fableris.dlc.neon',
    pirates:    'fableris.dlc.pirates',
    cosmos:     'fableris.dlc.cosmos',
    fantasy:    'fableris.dlc.fantasy',
    wilds:      'fableris.dlc.wilds'
  };

  const FREE_PACKS   = ['free', 'kids'];
  const CACHE_KEY    = 'sf_unlocked_packs';
  const PRICE_KEY    = 'sf_pack_prices';
  const PRODUCT_PACKS = Object.keys(PRODUCTS);

  let store        = null;   // instance CdvPurchase.store
  let ready        = false;  // plugin initialisé et catalogue chargé
  let initPromise  = null;
  const listeners  = [];     // callbacks appelés quand les droits changent

  // ── Cache local ──────────────────────────────────────────────
  function readCache() {
    try {
      const v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (Array.isArray(v)) return v;
    } catch (e) {}
    return FREE_PACKS.slice();
  }

  function writeCache(packs) {
    const merged = Array.from(new Set(FREE_PACKS.concat(packs)));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch (e) {}
    return merged;
  }

  function packIdFor(productId) {
    return Object.keys(PRODUCTS).find(k => PRODUCTS[k] === productId) || null;
  }

  function notify() {
    const packs = readCache();
    listeners.forEach(fn => { try { fn(packs); } catch (e) { console.error(e); } });
  }

  // Préserve les déblocages hors Play (codes créateur, promos, flags éditeur).
  function preservedUnlocks(previous, ownedFromPlay) {
    const ownedSet = new Set(ownedFromPlay);
    return previous.filter(p => {
      if (FREE_PACKS.includes(p)) return false;
      if (!PRODUCT_PACKS.includes(p)) return true;
      return !ownedSet.has(p);
    });
  }

  // ── Resynchronisation avec ce que Google Play dit vraiment ───
  function syncFromStore() {
    if (!store) return;
    const previous = readCache();
    const ownedFromPlay = PRODUCT_PACKS.filter(packId => {
      const p = store.get(PRODUCTS[packId]);
      return !!(p && p.owned);
    });
    writeCache(ownedFromPlay.concat(preservedUnlocks(previous, ownedFromPlay)));
    cachePrices();
    notify();
  }

  // Mémorise les prix localisés renvoyés par Google (devise correcte
  // selon le pays), pour les afficher au lieu des prix codés en dur.
  function cachePrices() {
    if (!store) return;
    const prices = {};
    PRODUCT_PACKS.forEach(packId => {
      const p = store.get(PRODUCTS[packId]);
      const offer = p && p.getOffer && p.getOffer();
      const price = offer && offer.pricingPhases && offer.pricingPhases[0]
        ? offer.pricingPhases[0].price : null;
      if (price) prices[packId] = price;
    });
    try { localStorage.setItem(PRICE_KEY, JSON.stringify(prices)); } catch (e) {}
  }

  function waitForUnlock(packId, timeoutMs) {
    const limit = timeoutMs || 60000;
    return new Promise(resolve => {
      if (isUnlocked(packId)) {
        resolve(true);
        return;
      }
      let settled = false;
      const finish = ok => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const idx = listeners.indexOf(onChange);
        if (idx >= 0) listeners.splice(idx, 1);
        resolve(ok);
      };
      const onChange = packs => {
        if (packs.includes(packId)) finish(true);
      };
      listeners.push(onChange);
      const timer = setTimeout(() => finish(isUnlocked(packId)), limit);
    });
  }

  // ── Initialisation ───────────────────────────────────────────
  function init() {
    if (initPromise) return initPromise;

    initPromise = new Promise(resolve => {
      let settled = false;
      const done = value => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      const CdvPurchase = window.CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        console.info('[billing] plugin absent (web) — achats désactivés');
        done(false);
        return;
      }

      store = CdvPurchase.store;
      const { ProductType, Platform } = CdvPurchase;

      store.register(PRODUCT_PACKS.map(packId => ({
        id: PRODUCTS[packId],
        type: ProductType.NON_CONSUMABLE,
        platform: Platform.GOOGLE_PLAY
      })));

      store.when()
        .productUpdated(() => { cachePrices(); notify(); })
        .approved(transaction => {
          // Pas de vérification serveur : on valide localement.
          transaction.verify();
        })
        .verified(receipt => {
          // finish() = acknowledge côté Google. SANS CET APPEL,
          // Google rembourse automatiquement l'achat sous 3 jours.
          receipt.finish();
        })
        .finished(() => { syncFromStore(); })
        .receiptsReady(() => {
          ready = true;
          syncFromStore();
          done(true);
        });

      store.error(err => {
        // 6777006 / PAYMENT_CANCELLED : l'utilisateur a fermé la fenêtre
        if (err && (err.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED)) return;
        console.error('[billing]', err && err.code, err && err.message);
      });

      store.initialize([Platform.GOOGLE_PLAY])
        .then(() => {
          ready = true;
          syncFromStore();
          done(true);
        })
        .catch(err => {
          console.error('[billing] init', err);
          done(false);
        });

      // Filet de sécurité : ne jamais bloquer l'affichage de la
      // bibliothèque si le service Play ne répond pas.
      setTimeout(() => done(ready), 10000);
    });

    return initPromise;
  }

  // ── API publique ─────────────────────────────────────────────

  function isAvailable() {
    return !!(window.CdvPurchase && window.CdvPurchase.store);
  }

  function isReady() {
    return ready && !!store;
  }

  function isUnlocked(packId) {
    if (FREE_PACKS.includes(packId)) return true;
    return readCache().includes(packId);
  }

  function getUnlockedPacks() {
    return readCache();
  }

  // Prix localisé renvoyé par Google, sinon null (l'appelant retombe
  // sur le prix codé en dur dans PACK_CONFIG).
  function getPrice(packId) {
    try {
      const prices = JSON.parse(localStorage.getItem(PRICE_KEY) || '{}');
      return prices[packId] || null;
    } catch (e) { return null; }
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  /** Lance l'achat d'un pack. Résout { ok, reason }. */
  async function buy(packId) {
    const productId = PRODUCTS[packId];
    if (!productId) return { ok: false, reason: 'unknown_pack' };
    if (isUnlocked(packId)) return { ok: true, reason: 'already_owned' };

    const initialized = await init();
    if (!initialized || !store) return { ok: false, reason: 'unavailable' };

    let product = store.get(productId);
    let offer = product && product.getOffer && product.getOffer();
    if (!offer && store.update) {
      try { await store.update(); } catch (e) {}
      product = store.get(productId);
      offer = product && product.getOffer && product.getOffer();
    }
    if (!offer) return { ok: false, reason: 'not_found' };

    try {
      const err = await offer.order();
      // order() résout avec un IapError en cas d'échec, sinon undefined
      if (err) {
        const cancelled = window.CdvPurchase &&
          err.code === window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED;
        return { ok: false, reason: cancelled ? 'cancelled' : 'error', error: err };
      }

      // L'achat est validé de façon asynchrone (approved → verified → finished).
      const ok = await waitForUnlock(packId);
      return { ok, reason: ok ? 'purchased' : 'pending' };
    } catch (e) {
      console.error('[billing] order', e);
      return { ok: false, reason: 'error', error: e };
    }
  }

  /** Restaure les achats. Obligatoire côté Google Play. */
  async function restore() {
    const initialized = await init();
    if (!initialized || !store) return { ok: false, reason: 'unavailable' };
    try {
      await store.restorePurchases();
      syncFromStore();
      return { ok: true, packs: readCache() };
    } catch (e) {
      console.error('[billing] restore', e);
      return { ok: false, reason: 'error', error: e };
    }
  }

  return {
    init, isAvailable, isReady, isUnlocked, getUnlockedPacks,
    getPrice, onChange, buy, restore, PRODUCTS
  };
})();
