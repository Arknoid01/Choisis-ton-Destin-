/* ══════════════════════════════════════════════════════════════
   SFOnboarding — séquence de premier lancement
   (langue → micro-démo → tutoriel → code parental)

   Partagé entre index.html et stories.html : l'utilisateur voit la
   séquence quelle que soit la page sur laquelle il arrive.

   Les overlays sont injectés dans le DOM par ce module, avec des
   identifiants préfixés sf-onb- pour ne jamais entrer en conflit
   avec le balisage des pages hôtes.
   ══════════════════════════════════════════════════════════════ */

window.SFOnboarding = (function () {

  const LANGS = ['fr', 'en', 'es'];

  const TXT = {
    fr: {
      langTitle: 'Choisissez votre langue',
      langSub: 'Choose your language · Elige tu idioma',
      langConfirm: 'CONTINUER',
      tutoTitle: 'Astuces de navigation',
      tutoMenu: '<strong>Le point doré</strong> en haut de l\'écran permet d\'ouvrir le menu pendant une histoire.',
      tutoSave: '<strong>Le bouton 🔖</strong> en bas à droite permet de poser un marque-page pour sauvegarder votre progression.',
      tutoBtn: 'J\'AI COMPRIS',
      pinTitle: 'Code Parental',
      pinBody: 'Créez un code à 4 chiffres pour protéger le mode enfant. Il vous sera demandé pour le désactiver.',
      pinCreate: 'CRÉER LE CODE',
      pinSkip: 'Plus tard',
      pinError: '4 chiffres requis',
      pinDone: '✓ Code parental enregistré !',
      pinEnter: 'Code à 4 chiffres',
      pinConfirm: 'Confirme le code',
      pinMismatch: 'Les codes ne correspondent pas',
      pinKids: 'Activer le mode enfant maintenant',
      demoTitle: 'Un roman dont vous êtes le héros',
      demoSetup: 'Vous arrivez à un carrefour dans la forêt. Que faites-vous ?',
      demoChoiceA: 'Prendre le sentier lumineux',
      demoChoiceB: 'S\'engager dans l\'ombre',
      demoOutcomeA: 'Le sentier mène à une clairière paisible. Votre histoire aurait pris une tournure douce…',
      demoOutcomeB: 'L\'ombre recèle des secrets. Votre récit aurait basculé vers le mystère…',
      demoConclusion: 'Chaque histoire fonctionne ainsi : vos choix orientent le récit. Essayez-en une gratuitement, à votre rythme.',
      demoReady: 'Prêt ? Commencez par une histoire courte (~15 min) :',
      demoStarterPlay: 'Jouer',
      demoContinue: 'CONTINUER',
      demoSkip: 'Passer'
    },
    en: {
      langTitle: 'Choose your language',
      langSub: 'Choisissez votre langue · Elige tu idioma',
      langConfirm: 'CONTINUE',
      tutoTitle: 'Navigation tips',
      tutoMenu: '<strong>The golden dot</strong> at the top of the screen opens the menu during a story.',
      tutoSave: '<strong>The 🔖 button</strong> at the bottom right lets you bookmark and save your progress.',
      tutoBtn: 'GOT IT',
      pinTitle: 'Parental Code',
      pinBody: 'Create a 4-digit code to protect Kids Mode. It will be required to turn it off.',
      pinCreate: 'CREATE CODE',
      pinSkip: 'Later',
      pinError: '4 digits required',
      pinDone: '✓ Parental code saved!',
      pinEnter: '4-digit code',
      pinConfirm: 'Confirm the code',
      pinMismatch: 'Codes do not match',
      pinKids: 'Enable Kids Mode now',
      demoTitle: 'A story where you choose',
      demoSetup: 'You reach a crossroads in the forest. What do you do?',
      demoChoiceA: 'Take the bright path',
      demoChoiceB: 'Venture into the shadows',
      demoOutcomeA: 'The path leads to a peaceful clearing. Your story would have taken a gentle turn…',
      demoOutcomeB: 'The shadows hold secrets. Your tale would have shifted toward mystery…',
      demoConclusion: 'Every story works like this: your choices shape the narrative. Try a free one whenever you like.',
      demoReady: 'Ready? Start with a short story (~15 min):',
      demoStarterPlay: 'Play',
      demoContinue: 'CONTINUE',
      demoSkip: 'Skip'
    },
    es: {
      langTitle: 'Elige tu idioma',
      langSub: 'Choisissez votre langue · Choose your language',
      langConfirm: 'CONTINUAR',
      tutoTitle: 'Consejos de navegación',
      tutoMenu: '<strong>El punto dorado</strong> en la parte superior abre el menú durante una historia.',
      tutoSave: '<strong>El botón 🔖</strong> abajo a la derecha permite guardar un marcador con tu progreso.',
      tutoBtn: 'ENTENDIDO',
      pinTitle: 'Código Parental',
      pinBody: 'Crea un código de 4 dígitos para proteger el modo infantil. Se solicitará para desactivarlo.',
      pinCreate: 'CREAR CÓDIGO',
      pinSkip: 'Más tarde',
      pinError: 'Se requieren 4 dígitos',
      pinDone: '✓ ¡Código parental guardado!',
      pinEnter: 'Código de 4 dígitos',
      pinConfirm: 'Confirma el código',
      pinMismatch: 'Los códigos no coinciden',
      pinKids: 'Activar el modo infantil ahora',
      demoTitle: 'Una novela en la que tú eliges',
      demoSetup: 'Llegas a una encrucijada en el bosque. ¿Qué haces?',
      demoChoiceA: 'Tomar el sendero luminoso',
      demoChoiceB: 'Adentrarse en la sombra',
      demoOutcomeA: 'El sendero conduce a un claro tranquilo. Tu historia habría tomado un rumbo apacible…',
      demoOutcomeB: 'La sombra guarda secretos. Tu relato habría virado hacia el misterio…',
      demoConclusion: 'Cada historia funciona así: tus elecciones orientan el relato. Prueba una gratis, sin prisa.',
      demoReady: '¿Listo? Empieza con una historia corta (~15 min):',
      demoStarterPlay: 'Jugar',
      demoContinue: 'CONTINUAR',
      demoSkip: 'Omitir'
    }
  };

  const LANG_LABELS = {
    fr: { flag: '🇫🇷', name: 'Français', native: 'French' },
    en: { flag: '🇬🇧', name: 'English',  native: 'Anglais' },
    es: { flag: '🇪🇸', name: 'Español',  native: 'Espagnol' }
  };

  // Starter / compteur / PIN — délégués à SFShared (sf-shared.js)
  function isKidsMode() { return window.SFShared ? SFShared.isKidsMode() : false; }
  function getStarterFile(lang) { return SFShared.getStarterFile(lang); }
  function getStarterTitle(lang) { return SFShared.getStarterTitle(lang); }
  function getStarterGameUrl(lang) { return SFShared.getStarterGameUrl(lang); }
  function shouldShowStarterHint() { return SFShared.shouldShowStarterHint(); }
  function sha256(input) { return SFShared.sha256(input); }

  let _pendingLang = 'fr';
  let _onLangChange = null;
  let _onComplete = null;
  let _injected = false;
  let _finished = false;

  // ── localStorage tolérant (mode privé, quota dépassé) ────────
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function currentLang() {
    const lang = lsGet('sf_lang');
    return LANGS.includes(lang) ? lang : 'fr';
  }

  function t() {
    return TXT[currentLang()] || TXT.fr;
  }

  function isActive() {
    return ['sf-onb-lang', 'sf-onb-demo', 'sf-onb-tuto', 'sf-onb-pin'].some(id => {
      const el = document.getElementById(id);
      return el && el.style.display === 'flex';
    });
  }

  function finishOnboarding() {
    if (_finished) return;
    _finished = true;
    if (typeof _onComplete === 'function') {
      try { _onComplete(); } catch (e) { console.error(e); }
    }
  }

  function goToStarterStory() {
    lsSet('sf_demo_shown', '1');
    window.location.href = getStarterGameUrl(currentLang());
  }

  // ── Styles ───────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('sf-onb-style')) return;
    const style = document.createElement('style');
    style.id = 'sf-onb-style';
    style.textContent = `
      .sf-onb-overlay{
        position:fixed;inset:0;z-index:9000;
        background:rgba(0,0,0,0.88);
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(8px);
        animation:sf-onb-fade-in .35s ease;
        padding:20px;box-sizing:border-box;overflow-y:auto;
      }
      @keyframes sf-onb-fade-in{from{opacity:0}to{opacity:1}}
      @keyframes sf-onb-fade-out{from{opacity:1}to{opacity:0}}
      @keyframes sf-onb-scale-in{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
      .sf-onb-box{
        background:#13110e;border:1px solid #8a6a30;border-radius:20px;
        padding:32px 24px;max-width:340px;width:100%;text-align:center;
        animation:sf-onb-scale-in .35s ease;margin:auto;
        font-family:'Cormorant Garamond',Georgia,serif;
      }
      .sf-onb-icon{font-size:34px;margin-bottom:14px}
      .sf-onb-title{
        font-family:'Cinzel',Georgia,serif;font-size:18px;font-weight:600;
        color:#e8e0d0;letter-spacing:2px;margin-bottom:8px;
      }
      .sf-onb-sub{font-size:13px;color:#9a8a70;font-style:italic;margin-bottom:24px;line-height:1.6}
      .sf-onb-choices{display:flex;flex-direction:column;gap:10px}
      .sf-onb-choice{
        display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;
        border:1px solid #2a2418;background:#1a1710;cursor:pointer;text-align:left;
        width:100%;transition:border-color .2s,background .2s;font:inherit;
      }
      .sf-onb-choice.selected{border-color:var(--gold, #c8a96e);background:rgba(200,169,110,.1)}
      .sf-onb-flag{font-size:26px;flex-shrink:0}
      .sf-onb-choice-info{flex:1}
      .sf-onb-name{font-family:'Cinzel',Georgia,serif;font-size:14px;font-weight:600;color:#e8e0d0;display:block}
      .sf-onb-native{font-size:12px;color:#9a8a70}
      .sf-onb-check{
        width:20px;height:20px;border-radius:50%;border:2px solid #2a2418;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;font-size:11px;color:#000;
      }
      .sf-onb-choice.selected .sf-onb-check{background:var(--gold, #c8a96e);border-color:var(--gold, #c8a96e)}
      .sf-onb-btn{
        margin-top:20px;width:100%;padding:13px;border-radius:10px;border:1px solid #8a6a30;
        background:linear-gradient(135deg,rgba(200,169,110,.15),rgba(200,169,110,.05));
        color:var(--gold, #c8a96e);font-family:'Cinzel',Georgia,serif;font-size:12px;
        letter-spacing:2px;cursor:pointer;transition:background .2s;
      }
      .sf-onb-btn:hover{background:rgba(200,169,110,.2)}
      .sf-onb-tips{margin-bottom:24px}
      .sf-onb-tip{display:flex;gap:12px;align-items:flex-start;text-align:left;margin-bottom:16px}
      .sf-onb-tip-icon{
        font-size:18px;background:#1a1710;width:32px;height:32px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gold, #c8a96e);
      }
      .sf-onb-tip p{font-size:13px;color:#9a8a70;line-height:1.5;margin:0}
      .sf-onb-label{
        text-align:left;margin-bottom:6px;font-size:11px;color:#5a5040;
        font-family:ui-monospace,monospace;letter-spacing:1px;
      }
      .sf-onb-input{
        width:100%;background:#1a1710;border:1px solid #2a2418;border-radius:8px;color:#e8e0d0;
        font-family:ui-monospace,monospace;font-size:24px;padding:12px;outline:none;
        text-align:center;letter-spacing:8px;box-sizing:border-box;
      }
      .sf-onb-input:focus{border-color:#8a6a30}
      .sf-onb-error{display:none;margin-top:8px;font-size:11px;color:#fa6d8f;font-family:ui-monospace,monospace}
      .sf-onb-kids{display:flex;align-items:center;gap:10px;margin-top:18px;text-align:left;cursor:pointer}
      .sf-onb-kids input{width:18px;height:18px;accent-color:var(--gold, #c8a96e);flex-shrink:0;cursor:pointer}
      .sf-onb-kids span{font-size:12px;color:#9a8a70;line-height:1.4}
      .sf-onb-skip{
        margin-top:12px;background:none;border:none;color:#5a5040;font-size:12px;
        letter-spacing:1px;cursor:pointer;font-family:ui-monospace,monospace;
      }
      .sf-onb-demo-setup{font-size:15px;color:#e8e0d0;line-height:1.65;margin-bottom:20px;font-style:italic}
      .sf-onb-demo-choices{display:flex;flex-direction:column;gap:10px;margin-bottom:8px}
      .sf-onb-demo-choice{
        width:100%;padding:13px 16px;border-radius:10px;border:1px solid #2a2418;
        background:#1a1710;color:#e8e0d0;font-family:'Cormorant Garamond',Georgia,serif;
        font-size:15px;text-align:left;cursor:pointer;transition:border-color .2s,background .2s;
      }
      .sf-onb-demo-choice:hover{border-color:#8a6a30;background:rgba(200,169,110,.06)}
      .sf-onb-demo-outcome{
        display:none;font-size:14px;color:var(--gold, #c8a96e);line-height:1.6;margin:16px 0;
        padding:14px;border-radius:10px;border:1px solid rgba(200,169,110,.2);
        background:rgba(200,169,110,.05);font-style:italic;
      }
      .sf-onb-demo-outcome.visible{display:block}
      .sf-onb-demo-conclusion{
        display:none;font-size:13px;color:#9a8a70;line-height:1.6;margin-bottom:4px;
      }
      .sf-onb-demo-conclusion.visible{display:block}
      .sf-onb-demo-ready{
        display:none;font-size:13px;color:#e8e0d0;line-height:1.55;margin:14px 0 10px;
      }
      .sf-onb-demo-ready.visible{display:block}
      .sf-onb-starter-link{
        display:none;width:100%;margin-bottom:12px;padding:12px 14px;border-radius:10px;
        border:1px solid rgba(200,169,110,.45);
        background:rgba(200,169,110,.08);color:var(--gold, #c8a96e);text-decoration:none;
        font-family:'Cinzel',Georgia,serif;font-size:11px;letter-spacing:1.5px;
        box-sizing:border-box;transition:background .2s,border-color .2s;
      }
      .sf-onb-starter-link.visible{display:block}
      .sf-onb-starter-link:hover{background:rgba(200,169,110,.16);border-color:var(--gold, #c8a96e)}
      .sf-onb-demo-actions{display:none;margin-top:16px}
      .sf-onb-demo-actions.visible{display:block}
      .sf-onb-toast{
        position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:#13110e;border:1px solid rgba(109,250,188,.4);border-radius:10px;
        padding:10px 20px;font-family:ui-monospace,monospace;font-size:11px;
        color:#6dfabc;z-index:9100;white-space:nowrap;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // ── Overlays ─────────────────────────────────────────────────
  function injectOverlays() {
    if (_injected) return;
    _injected = true;

    const langChoices = LANGS.map(code => {
      const l = LANG_LABELS[code];
      return `<button class="sf-onb-choice" data-lang="${code}" type="button">
          <span class="sf-onb-flag">${l.flag}</span>
          <span class="sf-onb-choice-info">
            <span class="sf-onb-name">${l.name}</span>
            <span class="sf-onb-native">${l.native}</span>
          </span>
          <span class="sf-onb-check"></span>
        </button>`;
    }).join('');

    const wrap = document.createElement('div');
    wrap.id = 'sf-onb-root';
    wrap.innerHTML = `
      <div class="sf-onb-overlay" id="sf-onb-lang">
        <div class="sf-onb-box">
          <div class="sf-onb-icon">✦</div>
          <div class="sf-onb-title" id="sf-onb-lang-title"></div>
          <p class="sf-onb-sub" id="sf-onb-lang-sub"></p>
          <div class="sf-onb-choices">${langChoices}</div>
          <button class="sf-onb-btn" id="sf-onb-lang-confirm" type="button"></button>
        </div>
      </div>
      <div class="sf-onb-overlay" id="sf-onb-demo">
        <div class="sf-onb-box">
          <div class="sf-onb-icon">📖</div>
          <div class="sf-onb-title" id="sf-onb-demo-title"></div>
          <p class="sf-onb-demo-setup" id="sf-onb-demo-setup"></p>
          <div class="sf-onb-demo-choices" id="sf-onb-demo-choices">
            <button class="sf-onb-demo-choice" id="sf-onb-demo-choice-a" type="button"></button>
            <button class="sf-onb-demo-choice" id="sf-onb-demo-choice-b" type="button"></button>
          </div>
          <p class="sf-onb-demo-outcome" id="sf-onb-demo-outcome"></p>
          <p class="sf-onb-demo-conclusion" id="sf-onb-demo-conclusion"></p>
          <p class="sf-onb-demo-ready" id="sf-onb-demo-ready"></p>
          <a class="sf-onb-starter-link" id="sf-onb-demo-starter" href="#"></a>
          <div class="sf-onb-demo-actions" id="sf-onb-demo-actions">
            <button class="sf-onb-btn" id="sf-onb-demo-continue" type="button"></button>
          </div>
          <button class="sf-onb-skip" id="sf-onb-demo-skip" type="button"></button>
        </div>
      </div>
      <div class="sf-onb-overlay" id="sf-onb-tuto">
        <div class="sf-onb-box">
          <div class="sf-onb-icon">💡</div>
          <div class="sf-onb-title" id="sf-onb-tuto-title" style="margin-bottom:20px"></div>
          <div class="sf-onb-tips">
            <div class="sf-onb-tip"><span class="sf-onb-tip-icon">●</span><p id="sf-onb-tuto-menu"></p></div>
            <div class="sf-onb-tip"><span class="sf-onb-tip-icon">+</span><p id="sf-onb-tuto-save"></p></div>
          </div>
          <button class="sf-onb-btn" id="sf-onb-tuto-close" type="button"></button>
        </div>
      </div>
      <div class="sf-onb-overlay" id="sf-onb-pin">
        <div class="sf-onb-box">
          <div class="sf-onb-icon">🔒</div>
          <div class="sf-onb-title" id="sf-onb-pin-title"></div>
          <p class="sf-onb-sub" id="sf-onb-pin-body" style="margin-bottom:20px"></p>
          <div class="sf-onb-label" id="sf-onb-pin-enter-label"></div>
          <input id="sf-onb-pin-input" class="sf-onb-input" type="password"
                 inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off">
          <div class="sf-onb-label" id="sf-onb-pin-confirm-label" style="margin-top:14px"></div>
          <input id="sf-onb-pin-input2" class="sf-onb-input" type="password"
                 inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off">
          <div id="sf-onb-pin-error" class="sf-onb-error"></div>
          <label class="sf-onb-kids">
            <input type="checkbox" id="sf-onb-pin-kids">
            <span id="sf-onb-pin-kids-label"></span>
          </label>
          <button class="sf-onb-btn" id="sf-onb-pin-create" type="button"></button>
          <button class="sf-onb-skip" id="sf-onb-pin-skip" type="button"></button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    wrap.querySelectorAll('.sf-onb-choice').forEach(btn => {
      btn.addEventListener('click', () => selectLang(btn.dataset.lang));
    });
    document.getElementById('sf-onb-lang-confirm').addEventListener('click', confirmLang);
    document.getElementById('sf-onb-demo-choice-a').addEventListener('click', () => pickDemo('a'));
    document.getElementById('sf-onb-demo-choice-b').addEventListener('click', () => pickDemo('b'));
    document.getElementById('sf-onb-demo-continue').addEventListener('click', closeDemo);
    document.getElementById('sf-onb-demo-skip').addEventListener('click', closeDemo);
    document.getElementById('sf-onb-demo-starter').addEventListener('click', e => {
      e.preventDefault();
      goToStarterStory();
    });
    document.getElementById('sf-onb-tuto-close').addEventListener('click', closeTuto);
    document.getElementById('sf-onb-pin-create').addEventListener('click', submitPin);
    document.getElementById('sf-onb-pin-skip').addEventListener('click', skipPin);

    const pin1 = document.getElementById('sf-onb-pin-input');
    const pin2 = document.getElementById('sf-onb-pin-input2');
    const digitsOnly = el => el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 4);
    });
    digitsOnly(pin1);
    digitsOnly(pin2);
    pin1.addEventListener('keydown', e => { if (e.key === 'Enter') pin2.focus(); });
    pin2.addEventListener('keydown', e => { if (e.key === 'Enter') submitPin(); });
  }

  function applyTexts() {
    if (!_injected) return;
    const tr = t();
    const set = (id, val, html) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (html) el.innerHTML = val; else el.textContent = val;
    };
    set('sf-onb-lang-title', tr.langTitle);
    set('sf-onb-lang-sub', tr.langSub);
    set('sf-onb-lang-confirm', tr.langConfirm);
    set('sf-onb-tuto-title', tr.tutoTitle);
    set('sf-onb-tuto-menu', tr.tutoMenu, true);
    set('sf-onb-tuto-save', tr.tutoSave, true);
    set('sf-onb-tuto-close', tr.tutoBtn);
    set('sf-onb-pin-title', tr.pinTitle);
    set('sf-onb-pin-body', tr.pinBody);
    set('sf-onb-pin-enter-label', tr.pinEnter);
    set('sf-onb-pin-confirm-label', tr.pinConfirm);
    set('sf-onb-pin-kids-label', tr.pinKids);
    set('sf-onb-pin-create', tr.pinCreate);
    set('sf-onb-pin-skip', tr.pinSkip);
    set('sf-onb-demo-title', tr.demoTitle);
    set('sf-onb-demo-setup', tr.demoSetup);
    set('sf-onb-demo-choice-a', tr.demoChoiceA);
    set('sf-onb-demo-choice-b', tr.demoChoiceB);
    set('sf-onb-demo-conclusion', tr.demoConclusion);
    set('sf-onb-demo-ready', tr.demoReady);
    updateDemoStarterLink();
    set('sf-onb-demo-continue', tr.demoContinue);
    set('sf-onb-demo-skip', tr.demoSkip);
  }

  function updateDemoStarterLink() {
    const link = document.getElementById('sf-onb-demo-starter');
    if (!link) return;
    const tr = t();
    const title = getStarterTitle(currentLang());
    link.textContent = tr.demoStarterPlay + ' → ' + title;
    link.href = getStarterGameUrl(currentLang());
  }

  function resetDemoView() {
    const outcome = document.getElementById('sf-onb-demo-outcome');
    const conclusion = document.getElementById('sf-onb-demo-conclusion');
    const ready = document.getElementById('sf-onb-demo-ready');
    const starter = document.getElementById('sf-onb-demo-starter');
    const actions = document.getElementById('sf-onb-demo-actions');
    const choices = document.getElementById('sf-onb-demo-choices');
    if (outcome) { outcome.textContent = ''; outcome.classList.remove('visible'); }
    if (conclusion) conclusion.classList.remove('visible');
    if (ready) ready.classList.remove('visible');
    if (starter) starter.classList.remove('visible');
    if (actions) actions.classList.remove('visible');
    if (choices) choices.style.display = '';
  }

  function hideAll() {
    ['sf-onb-lang', 'sf-onb-demo', 'sf-onb-tuto', 'sf-onb-pin'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'none'; el.style.animation = ''; }
    });
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  }

  function fadeOut(id, cb) {
    const el = document.getElementById(id);
    if (!el) { if (cb) cb(); return; }
    el.style.animation = 'sf-onb-fade-out .3s ease forwards';
    setTimeout(() => {
      el.style.display = 'none';
      el.style.animation = '';
      if (cb) cb();
    }, 300);
  }

  // ── Étape 1 : langue ─────────────────────────────────────────
  function selectLang(lang) {
    if (!LANGS.includes(lang)) return;
    _pendingLang = lang;
    document.querySelectorAll('#sf-onb-lang .sf-onb-choice').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('selected', on);
      const check = b.querySelector('.sf-onb-check');
      if (check) check.textContent = on ? '✓' : '';
    });
  }

  function confirmLang() {
    lsSet('sf_lang', _pendingLang);
    lsSet('sf_lang_chosen', '1');
    if (typeof _onLangChange === 'function') {
      try { _onLangChange(_pendingLang); } catch (e) { console.error(e); }
    }
    applyTexts();
    fadeOut('sf-onb-lang', next);
  }

  // ── Étape 2 : micro-démo interactive ───────────────────────
  function showDemo() {
    hideAll();
    applyTexts();
    resetDemoView();
    show('sf-onb-demo');
  }

  function pickDemo(which) {
    const tr = t();
    const outcome = document.getElementById('sf-onb-demo-outcome');
    const choices = document.getElementById('sf-onb-demo-choices');
    if (!outcome || !choices) return;
    outcome.textContent = which === 'a' ? tr.demoOutcomeA : tr.demoOutcomeB;
    outcome.classList.add('visible');
    choices.style.display = 'none';
    document.getElementById('sf-onb-demo-conclusion').classList.add('visible');
    document.getElementById('sf-onb-demo-ready').classList.add('visible');
    updateDemoStarterLink();
    document.getElementById('sf-onb-demo-starter').classList.add('visible');
    document.getElementById('sf-onb-demo-actions').classList.add('visible');
  }

  function closeDemo() {
    lsSet('sf_demo_shown', '1');
    fadeOut('sf-onb-demo', next);
  }

  // ── Étape 3 : tutoriel ───────────────────────────────────────
  function showTuto() {
    hideAll();
    applyTexts();
    show('sf-onb-tuto');
  }

  function closeTuto() {
    lsSet('sf_tuto_shown', '1');
    fadeOut('sf-onb-tuto', next);
  }

  // ── Étape 4 : code parental ──────────────────────────────────
  function maybeShowPin() {
    if (lsGet('sf_pin_setup_done')) {
      hideAll();
      if (window.SFCommunity) SFCommunity.maybeAutoShow();
      finishOnboarding();
      return;
    }
    if (lsGet('sf_parent_pin') !== null) {
      finishOnboarding();
      return;
    }
    showPin();
  }

  function showPin() {
    hideAll();
    applyTexts();
    const err = document.getElementById('sf-onb-pin-error');
    document.getElementById('sf-onb-pin-input').value = '';
    document.getElementById('sf-onb-pin-input2').value = '';
    document.getElementById('sf-onb-pin-kids').checked = false;
    if (err) err.style.display = 'none';
    show('sf-onb-pin');
    setTimeout(() => {
      const el = document.getElementById('sf-onb-pin-input');
      if (el) el.focus();
    }, 120);
  }

  function closePin() {
    lsSet('sf_pin_setup_done', '1');
    fadeOut('sf-onb-pin', () => {
      hideAll();
      if (window.SFCommunity) SFCommunity.maybeAutoShow();
      finishOnboarding();
    });
  }

  function skipPin() {
    closePin();
  }

  // Écrit directement dans sf_options : la page hôte n'expose pas
  // forcément saveOptions() (stories.html n'a pas de panneau options).
  function enableKidsMode() {
    let opts = {};
    try { opts = JSON.parse(lsGet('sf_options') || '{}') || {}; } catch (e) {}
    opts.kids = true;
    lsSet('sf_options', JSON.stringify(opts));

    const toggle = document.getElementById('opt-kids');
    if (toggle) toggle.checked = true;
    ['renderGameList', 'renderLibrary'].forEach(fn => {
      if (typeof window[fn] === 'function') {
        try { window[fn](); } catch (e) {}
      }
    });
  }

  function submitPin() {
    const tr = t();
    const input = document.getElementById('sf-onb-pin-input').value.trim();
    const input2 = document.getElementById('sf-onb-pin-input2').value.trim();
    const err = document.getElementById('sf-onb-pin-error');

    const fail = msg => {
      err.textContent = msg;
      err.style.display = 'block';
    };

    if (!/^\d{4}$/.test(input)) {
      fail(tr.pinError);
      document.getElementById('sf-onb-pin-input').focus();
      return;
    }
    if (input !== input2) {
      fail(tr.pinMismatch);
      document.getElementById('sf-onb-pin-input2').value = '';
      document.getElementById('sf-onb-pin-input2').focus();
      return;
    }

    lsSet('sf_parent_pin', sha256(input));
    if (document.getElementById('sf-onb-pin-kids').checked) enableKidsMode();
    closePin();

    const msg = document.createElement('div');
    msg.className = 'sf-onb-toast';
    msg.textContent = tr.pinDone;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  }

  // ── Orchestration ────────────────────────────────────────────
  function next() {
    hideAll();
    if (!lsGet('sf_lang_chosen')) {
      selectLang(currentLang());
      applyTexts();
      show('sf-onb-lang');
    } else if (!lsGet('sf_demo_shown')) {
      showDemo();
    } else if (!lsGet('sf_tuto_shown')) {
      showTuto();
    } else {
      maybeShowPin();
    }
  }

  function start(opts) {
    opts = opts || {};
    _onLangChange = typeof opts.onLangChange === 'function' ? opts.onLangChange : null;
    _onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
    _finished = false;
    const boot = () => {
      injectStyles();
      injectOverlays();
      _pendingLang = currentLang();
      next();
    };
    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });
  }

  /** Remet à zéro la séquence — utile pour revoir le tutoriel. */
  function reset() {
    ['sf_lang_chosen', 'sf_demo_shown', 'sf_tuto_shown', 'sf_pin_setup_done'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    if (window.SFShared?.resetGameHints) SFShared.resetGameHints();
    _finished = false;
    next();
  }

  return {
    start,
    next,
    reset,
    applyTexts,
    sha256,
    getStarterFile,
    getStarterGameUrl,
    getStarterTitle,
    shouldShowStarterHint,
    isActive,
    isKidsMode
  };
})();
