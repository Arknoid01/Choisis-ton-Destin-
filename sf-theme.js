/** Thème visuel saisonnier Fableris (toutes pages sauf éditeur).
 *  Changer UNE ligne pour une MàJ saisonnière — rien d'autre à toucher.
 *
 *  Valeurs : 'default' | 'halloween' | 'christmas'
 *
 *  Ex. après Halloween   → 'default'  (branche 1.9 / 2.2)
 *  Ex. Halloween         → 'halloween' (branche 1.8)
 *  Ex. Noël              → 'christmas' (branches 2.0 / 2.1)
 */
window.SF_THEME = 'christmas';
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
    if (this.get() === 'christmas') return `rgba(196,216,160,${alpha})`;
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
    if (this.get() === 'christmas') {
      return {
        primary: { core:'rgba(255,220,180,0.95)', glow:'rgba(196,48,58,0.55)' },
        ai:      { core:'rgba(180,220,190,0.92)', glow:'rgba(60,120,80,0.5)' },
        default: { core:'rgba(212,175,90,0.9)',  glow:'rgba(196,48,58,0.45)' },
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
