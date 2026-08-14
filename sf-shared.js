/* ══════════════════════════════════════════════════════════════
   SFShared — utilitaires partagés Fableris / StoryForge
   Starter stories, compteur de fins, esc, SHA-256, packs bibliothèque
   ══════════════════════════════════════════════════════════════ */

window.SFShared = (function () {
  const LANGS = ['fr', 'en', 'es'];
  const STATS_KEY = 'sf_player_stats';
  const LEGACY_FINISH_KEY = 'sf_stories_finished';
  const PACK_EXPANDED_KEY = 'sf_pack_expanded';

  const STARTER_STORIES = {
    default: {
      fr: 'stories/fr/lumiere_peur_du_noir.json',
      en: 'stories/en/lumiere_peur_du_noir_en.json',
      es: 'stories/es/lumiere_peur_du_noir_es.json'
    },
    kids: {
      fr: 'stories/fr/aikito_v2.json',
      en: 'stories/en/aikito_v2_en.json',
      es: 'stories/es/aikito_v2_es.json'
    }
  };

  const STARTER_TITLES = {
    default: {
      fr: 'La Lumière qui a Peur du Noir',
      en: 'The Light Afraid of the Dark',
      es: 'La Luz que Teme a la Oscuridad'
    },
    kids: {
      fr: 'Le Temps Perdu avec Aikito',
      en: 'Lost Time with Aikito',
      es: 'El Tiempo Perdido con Aikito'
    }
  };

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function readStats() {
    try {
      const s = JSON.parse(lsGet(STATS_KEY) || '{}');
      return s && typeof s === 'object' ? s : {};
    } catch (e) {
      return {};
    }
  }

  function writeStats(stats) {
    lsSet(STATS_KEY, JSON.stringify(stats));
  }

  /** Migre l'ancien compteur sf_stories_finished vers sf_player_stats.storiesFinished */
  function migrateStoriesFinishedCount() {
    const stats = readStats();
    const legacy = parseInt(lsGet(LEGACY_FINISH_KEY) || '0', 10) || 0;
    const current = parseInt(stats.storiesFinished || '0', 10) || 0;
    const merged = Math.max(current, legacy);
    if (merged !== current) {
      stats.storiesFinished = merged;
      writeStats(stats);
    }
    if (merged !== legacy) {
      lsSet(LEGACY_FINISH_KEY, String(merged));
    }
  }

  function getStoriesFinishedCount() {
    migrateStoriesFinishedCount();
    const stats = readStats();
    return parseInt(stats.storiesFinished || '0', 10) || 0;
  }

  /** À appeler après trackStats('story_finish') — retourne le total unifié */
  function syncStoriesFinishedCount() {
    migrateStoriesFinishedCount();
    return getStoriesFinishedCount();
  }

  function isKidsMode() {
    try {
      const opts = JSON.parse(lsGet('sf_options') || '{}') || {};
      return opts.kids === true || opts.kids === 'true';
    } catch (e) {
      return false;
    }
  }

  function currentLang() {
    const lang = lsGet('sf_lang');
    return LANGS.includes(lang) ? lang : 'fr';
  }

  function getStarterFile(lang) {
    const code = LANGS.includes(lang) ? lang : currentLang();
    const bucket = isKidsMode() ? STARTER_STORIES.kids : STARTER_STORIES.default;
    return bucket[code] || bucket.fr;
  }

  function getStarterTitle(lang) {
    const code = LANGS.includes(lang) ? lang : currentLang();
    const bucket = isKidsMode() ? STARTER_TITLES.kids : STARTER_TITLES.default;
    return bucket[code] || bucket.fr;
  }

  function getStarterGameUrl(lang) {
    return 'game.html?story=' + encodeURIComponent(getStarterFile(lang));
  }

  function shouldShowStarterHint() {
    return getStoriesFinishedCount() === 0;
  }

  /** Packs ouverts par défaut au premier passage bibliothèque (DLC restent visibles repliés) */
  function getDefaultExpandedPackIds() {
    return isKidsMode() ? ['free', 'kids'] : ['free'];
  }

  function ensureDefaultExpandedPacks() {
    if (lsGet(PACK_EXPANDED_KEY) !== null) return;
    lsSet(PACK_EXPANDED_KEY, JSON.stringify(getDefaultExpandedPackIds()));
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    let hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (let i = 0; i < ascii.length; i++) {
      const j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength | 0);
    for (let j = 0; j < words.length;) {
      const w = words.slice(j, j += 16);
      const oldHash = hash.slice(0);
      for (let i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
          + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
        hash.length = 8;
      }
      hash = hash.map((x, i) => (x + oldHash[i]) | 0);
    }
    hash.forEach(x => {
      for (let j = 3; j + 1; j--) {
        const hex = ((x >> (j * 8)) & 255).toString(16);
        result += (hex.length === 1 ? '0' : '') + hex;
      }
    });
    return result;
  }

  migrateStoriesFinishedCount();

  return {
    LANGS,
    STARTER_STORIES,
    STARTER_TITLES,
    esc,
    escHtml: esc,
    sha256,
    getStoriesFinishedCount,
    syncStoriesFinishedCount,
    migrateStoriesFinishedCount,
    getStarterFile,
    getStarterTitle,
    getStarterGameUrl,
    shouldShowStarterHint,
    isKidsMode,
    currentLang,
    getDefaultExpandedPackIds,
    ensureDefaultExpandedPacks
  };
})();
