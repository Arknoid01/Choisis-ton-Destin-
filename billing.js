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
     - les déblocages hors Play (codes créateur) vivent dans leur
       propre clé sf_code_unlocks et survivent à la resynchro

   ⚠ IMPORTANT : window.CdvPurchase n'existe qu'APRÈS l'événement
   deviceready. Toute lecture anticipée fait croire que le plugin est
   absent et désactive définitivement les achats.

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

  const FREE_PACKS    = ['free', 'kids'];
  const CACHE_KEY     = 'sf_unlocked_packs';
  const CODE_KEY      = 'sf_code_unlocks';
  const PRICE_KEY     = 'sf_pack_prices';
  const PRODUCT_PACKS = Object.keys(PRODUCTS);

  const DEVICE_READY_TIMEOUT = 15000;
  const STORE_INIT_TIMEOUT   = 20000;
  const PURCHASE_TIMEOUT     = 120000;

  let store       = null;   // instance CdvPurchase.store
  let ready       = false;  // catalogue Play chargé
  let configured  = false;  // produits enregistrés + écouteurs branchés
  let initPromise = null;
  let lastError   = null;
  const listeners = [];     // callbacks appelés quand les droits changent

  // ── localStorage tolérant ────────────────────────────────────
  function readJSON(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  // ── Cache local ──────────────────────────────────────────────
  function readCache() {
    return readJSON(CACHE_KEY, FREE_PACKS.slice());
  }

  function writeCache(packs) {
    const merged = Array.from(new Set(FREE_PACKS.concat(packs)));
    writeJSON(CACHE_KEY, merged);
    return merged;
  }

  // Déblocages accordés hors Google Play (codes créateur, promos).
  // Migration : les anciennes versions écrivaient tout dans
  // sf_unlocked_packs, on récupère donc ce qui s'y trouve au premier
  // passage pour ne priver personne de ses droits.
  function readCodeUnlocks() {
    let stored = null;
    try { stored = localStorage.getItem(CODE_KEY); } catch (e) {}
    if (stored === null) {
      const legacy = readCache().filter(p => !FREE_PACKS.includes(p));
      writeJSON(CODE_KEY, legacy);
      return legacy;
    }
    return readJSON(CODE_KEY, []);
  }

  /** Enregistre un déblocage hors Play (appelé par le système de codes). */
  function addCodeUnlock(packs) {
    const list = Array.isArray(packs) ? packs : [packs];
    const merged = Array.from(new Set(readCodeUnlocks().concat(list)));
    writeJSON(CODE_KEY, merged);
    writeCache(readCache().concat(merged));
    notify();
    return merged;
  }

  function notify() {
    const packs = readCache();
    // Copie : un listener peut se retirer lui-même pendant l'itération.
    listeners.slice().forEach(fn => {
      try { fn(packs); } catch (e) { console.error('[billing] listener', e); }
    });
  }

  // ── Resynchronisation avec ce que Google Play dit vraiment ───
  // On repart des achats réels : un remboursement ou une annulation
  // doit pouvoir REVERROUILLER un pack. Les codes créateur, eux, sont
  // conservés puisqu'ils ne dépendent pas de Google.
  function syncFromStore() {
    if (!store) return;
    const ownedFromPlay = PRODUCT_PACKS.filter(packId => {
      const p = store.get(PRODUCTS[packId]);
      return !!(p && p.owned);
    });
    writeJSON(CACHE_KEY, Array.from(new Set(
      FREE_PACKS.concat(ownedFromPlay, readCodeUnlocks())
    )));
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

  // ── deviceready ──────────────────────────────────────────────
  // Sans cette attente, window.CdvPurchase est encore indéfini au
  // chargement de la page et les achats sont désactivés à tort.
  function isNative() {
    return !!(window.cordova ||
      (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' &&
       window.Capacitor.isNativePlatform()));
  }

  function waitForPlugin() {
    return new Promise(resolve => {
      if (window.CdvPurchase && window.CdvPurchase.store) { resolve(true); return; }
      if (!isNative()) { resolve(false); return; }

      let done = false;
      const settle = value => {
        if (done) return;
        done = true;
        clearInterval(poll);
        clearTimeout(timer);
        document.removeEventListener('deviceready', onReady);
        resolve(value);
      };
      const onReady = () => {
        // Le plugin s'enregistre parfois juste après deviceready.
        setTimeout(() => settle(!!(window.CdvPurchase && window.CdvPurchase.store)), 0);
      };

      document.addEventListener('deviceready', onReady, { once: true });
      // Filet : deviceready peut avoir déjà été émis avant ce script.
      const poll = setInterval(() => {
        if (window.CdvPurchase && window.CdvPurchase.store) settle(true);
      }, 250);
      const timer = setTimeout(() => settle(false), DEVICE_READY_TIMEOUT);
    });
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => resolve('timeout'), ms))
    ]);
  }

  // ── Initialisation ───────────────────────────────────────────
  function init() {
    // Un échec n'est pas définitif : on autorise une nouvelle tentative
    // au prochain appel (réseau revenu, Play Services démarrés…).
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const hasPlugin = await waitForPlugin();
      if (!hasPlugin) {
        lastError = isNative() ? 'plugin_missing' : 'web';
        console.info('[billing] plugin indisponible (' + lastError + ') — achats désactivés');
        initPromise = null;
        return false;
      }

      const CdvPurchase = window.CdvPurchase;
      store = CdvPurchase.store;
      const { ProductType, Platform } = CdvPurchase;

      // Une seule fois, même si init() est relancée après un échec :
      // réenregistrer les produits duplique les écouteurs.
      if (!configured) {
        configured = true;

        store.register(PRODUCT_PACKS.map(packId => ({
          id: PRODUCTS[packId],
          type: ProductType.NON_CONSUMABLE,
          platform: Platform.GOOGLE_PLAY
        })));

        store.when()
          .productUpdated(() => { cachePrices(); notify(); })
          .approved(transaction => {
            // Pas de validation serveur : verify() se résout aussitôt et
            // enchaîne sur verified → finish().
            transaction.verify();
          })
          .verified(receipt => {
            // finish() = acknowledge côté Google. SANS CET APPEL,
            // Google rembourse automatiquement l'achat sous 3 jours.
            receipt.finish();
          })
          .finished(() => { syncFromStore(); })
          .receiptsReady(() => { ready = true; syncFromStore(); });

        store.error(err => {
          if (err && CdvPurchase.ErrorCode &&
              err.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) return;
          lastError = err && err.message ? err.message : 'store_error';
          console.error('[billing]', err && err.code, err && err.message);
        });
      }

      const result = await withTimeout(
        store.initialize([Platform.GOOGLE_PLAY]).then(() => 'ok', err => {
          console.error('[billing] initialize', err);
          lastError = 'initialize_failed';
          return 'error';
        }),
        STORE_INIT_TIMEOUT
      );

      if (result === 'ok') {
        ready = true;
        syncFromStore();
        return true;
      }

      // Timeout ou erreur : Play Services peut répondre plus tard, on
      // autorise donc une nouvelle tentative au prochain achat.
      if (result === 'timeout') lastError = 'initialize_timeout';
      initPromise = null;
      return ready;
    })();

    return initPromise;
  }

  // Attend qu'un pack devienne débloqué (cycle approved → verified →
  // finished, entièrement asynchrone côté Google Play).
  function waitForUnlock(packId, timeoutMs) {
    return new Promise(resolve => {
      if (isUnlocked(packId)) { resolve(true); return; }

      let done = false;
      const settle = ok => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        const i = listeners.indexOf(onPacks);
        if (i >= 0) listeners.splice(i, 1);
        resolve(ok);
      };
      const onPacks = packs => { if (packs.includes(packId)) settle(true); };

      listeners.push(onPacks);
      const timer = setTimeout(() => settle(isUnlocked(packId)), timeoutMs || PURCHASE_TIMEOUT);
    });
  }

  // ── API publique ─────────────────────────────────────────────

  /** Le plugin est-il présent ? Synchrone, peut être faux avant deviceready. */
  function isAvailable() {
    return !!(window.CdvPurchase && window.CdvPurchase.store) || isNative();
  }

  /** Attend deviceready + l'init du store. À préférer avant un achat. */
  async function ensureReady() {
    await init();
    return !!store;
  }

  function isReady() {
    return ready && !!store;
  }

  function getLastError() {
    return lastError;
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

  function findOffer(productId) {
    const product = store.get(productId);
    return product && product.getOffer ? product.getOffer() : null;
  }

  /** Lance l'achat d'un pack. Résout { ok, reason }. */
  async function buy(packId) {
    const productId = PRODUCTS[packId];
    if (!productId) return { ok: false, reason: 'unknown_pack' };
    if (isUnlocked(packId)) return { ok: true, reason: 'already_owned' };

    await init();
    if (!store) {
      return { ok: false, reason: isNative() ? 'plugin_missing' : 'web' };
    }

    let offer = findOffer(productId);
    if (!offer && typeof store.update === 'function') {
      // Catalogue pas encore chargé : on force un rafraîchissement.
      try { await withTimeout(store.update(), 10000); } catch (e) {}
      offer = findOffer(productId);
    }
    if (!offer) {
      // Produit absent du catalogue Play : ID inexistant, produit
      // inactif, ou build non distribué par Google Play.
      return { ok: false, reason: 'not_found' };
    }

    try {
      const err = await offer.order();
      // order() résout avec un IapError en cas d'échec, sinon undefined
      if (err) {
        const cancelled = window.CdvPurchase && window.CdvPurchase.ErrorCode &&
          err.code === window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED;
        if (!cancelled) lastError = err.message || String(err.code);
        return { ok: false, reason: cancelled ? 'cancelled' : 'error', error: err };
      }

      // Le paiement est accepté, mais le déblocage arrive via les
      // événements du store : on attend la confirmation réelle.
      const ok = await waitForUnlock(packId);
      return { ok, reason: ok ? 'purchased' : 'pending' };
    } catch (e) {
      console.error('[billing] order', e);
      lastError = e && e.message ? e.message : 'order_failed';
      return { ok: false, reason: 'error', error: e };
    }
  }

  /** Restaure les achats. Obligatoire côté Google Play. */
  async function restore() {
    await init();
    if (!store) {
      return { ok: false, reason: isNative() ? 'plugin_missing' : 'web' };
    }
    try {
      await withTimeout(store.restorePurchases(), 30000);
      syncFromStore();
      return { ok: true, packs: readCache() };
    } catch (e) {
      console.error('[billing] restore', e);
      lastError = e && e.message ? e.message : 'restore_failed';
      return { ok: false, reason: 'error', error: e };
    }
  }

  return {
    init, ensureReady, isAvailable, isReady, isUnlocked, getUnlockedPacks,
    getPrice, onChange, buy, restore, addCodeUnlock, getLastError, PRODUCTS
  };
})();
