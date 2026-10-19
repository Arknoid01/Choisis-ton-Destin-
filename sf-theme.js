/** Thème visuel saisonnier Fableris (toutes pages sauf éditeur).
 *  Changer UNE ligne pour une MàJ saisonnière — rien d'autre à toucher.
 *
 *  Valeurs : 'default' | 'halloween'
 *
 *  Ex. après Halloween → 'default'
 *  Ex. octobre 2027   → 'halloween'
 */
window.SF_THEME = 'halloween';
window.SF_HOME_THEME = window.SF_THEME;

window.SFTheme = {
  get() {
    return window.SF_THEME || window.SF_HOME_THEME || 'default';
  },
  apply() {
    const theme = this.get();
    document.documentElement.dataset.sfTheme = theme;
    document.documentElement.dataset.homeTheme = theme;
  },
  starColor(alpha) {
    if (this.get() === 'halloween') return `rgba(232,147,74,${alpha})`;
    return `rgba(200,169,110,${alpha})`;
  },
  sparkPalette() {
    if (this.get() === 'halloween') {
      return {
        primary: { core:'rgba(255,200,117,0.95)', glow:'rgba(232,147,74,0.65)' },
        ai:      { core:'rgba(196,184,255,0.92)', glow:'rgba(124,109,250,0.55)' },
        default: { core:'rgba(232,147,74,0.88)',  glow:'rgba(255,130,50,0.55)' },
      };
    }
    return {
      primary: { core:'rgba(232,212,160,0.95)', glow:'rgba(200,169,110,0.65)' },
      ai:      { core:'rgba(196,184,255,0.92)', glow:'rgba(124,109,250,0.55)' },
      default: { core:'rgba(200,169,110,0.88)', glow:'rgba(200,169,110,0.55)' },
    };
  },
};

SFTheme.apply();
