/* ══════════════════════════════════════════════════════════════
   SFOnboarding — séquence de premier lancement (langue, tuto, PIN)
   Partagé entre index.html et stories.html
   ══════════════════════════════════════════════════════════════ */

window.SFOnboarding = (function () {
  const TXT = {
    fr: {
      langTitle: 'Choisissez votre langue',
      langSub: 'Choose your language · Elige tu idioma',
      langConfirm: 'CONTINUER',
      tutoTitle: 'Astuces de navigation',
      tutoMenu: '<strong>Le point bleu</strong> en haut de l\'écran permet d\'ouvrir le menu pendant une histoire.',
      tutoSave: '<strong>Le bouton +</strong> en bas à droite permet de poser un marque-page pour sauvegarder votre progression.',
      tutoBtn: 'J\'AI COMPRIS',
      pinSetupTitle: 'Code Parental',
      pinSetupBody: 'Créez un code à 4 chiffres pour protéger le mode enfant. Il vous sera demandé pour le désactiver.',
      pinSetupCreate: 'CRÉER LE CODE',
      pinSetupSkip: 'Plus tard',
      pinSetupError: '4 chiffres requis',
      pinSetupDone: '✓ Code parental enregistré !',
      pinSetupEnter: 'Code à 4 chiffres',
      pinSetupConfirm: 'Confirme le code',
      pinSetupMismatch: 'Les codes ne correspondent pas',
      pinSetupKids: 'Activer le mode enfant maintenant'
    },
    en: {
      langTitle: 'Choose your language',
      langSub: 'Choisissez votre langue · Elige tu idioma',
      langConfirm: 'CONTINUE',
      tutoTitle: 'Navigation tips',
      tutoMenu: '<strong>The blue dot</strong> at the top opens the menu during a story.',
      tutoSave: '<strong>The + button</strong> at the bottom right lets you bookmark your progress.',
      tutoBtn: 'GOT IT',
      pinSetupTitle: 'Parental Code',
      pinSetupBody: 'Create a 4-digit code to protect Kids Mode. It will be required to turn it off.',
      pinSetupCreate: 'CREATE CODE',
      pinSetupSkip: 'Later',
      pinSetupError: '4 digits required',
      pinSetupDone: '✓ Parental code saved!',
      pinSetupEnter: '4-digit code',
      pinSetupConfirm: 'Confirm the code',
      pinSetupMismatch: 'Codes do not match',
      pinSetupKids: 'Enable Kids Mode now'
    },
    es: {
      langTitle: 'Elige tu idioma',
      langSub: 'Choisissez votre langue · Choose your language',
      langConfirm: 'CONTINUAR',
      tutoTitle: 'Consejos de navegación',
      tutoMenu: '<strong>El punto azul</strong> en la parte superior abre el menú durante una historia.',
      tutoSave: '<strong>El botón +</strong> abajo a la derecha permite guardar un marcador.',
      tutoBtn: 'ENTENDIDO',
      pinSetupTitle: 'Código Parental',
      pinSetupBody: 'Crea un código de 4 dígitos para proteger el modo infantil. Se solicitará para desactivarlo.',
      pinSetupCreate: 'CREAR CÓDIGO',
      pinSetupSkip: 'Más tarde',
      pinSetupError: 'Se requieren 4 dígitos',
      pinSetupDone: '✓ ¡Código parental guardado!',
      pinSetupEnter: 'Código de 4 dígitos',
      pinSetupConfirm: 'Confirma el código',
      pinSetupMismatch: 'Los códigos no coinciden',
      pinSetupKids: 'Activar el modo infantil ahora'
    }
  };

  let _pendingLang = 'fr';
  let _getLang = () => localStorage.getItem('sf_lang') || 'fr';
  let _setLang = lang => { localStorage.setItem('sf_lang', lang); };

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function currentLang() {
    const lang = _getLang();
    return TXT[lang] ? lang : 'fr';
  }

  function t() {
    return TXT[currentLang()] || TXT.fr;
  }

  function hashPin(value) {
    if (typeof window._sha256sync === 'function') return window._sha256sync(value);
    return value;
  }

  function injectStyles() {
    if (document.getElementById('sf-onboarding-style')) return;
    const style = document.createElement('style');
    style.id = 'sf-onboarding-style';
    style.textContent = `
      #lang-overlay,#tuto-overlay,#pin-setup-overlay{
        position:fixed;inset:0;z-index:960;
        background:rgba(0,0,0,0.85);
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(8px);animation:sf-onb-fade-in .4s ease;
      }
      #pin-setup-overlay{z-index:970}
      @keyframes sf-onb-fade-in{from{opacity:0}to{opacity:1}}
      @keyframes sf-onb-scale-in{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes sf-onb-fade-out{from{opacity:1}to{opacity:0}}
      .sf-onb-box{
        background:#13110e;border:1px solid #8a6a30;border-radius:20px;
        padding:36px 28px;max-width:340px;width:90%;text-align:center;
        animation:sf-onb-scale-in .4s ease;
      }
      .sf-onb-title{font-family:'Cinzel',serif;font-size:18px;font-weight:600;color:#e8e0d0;letter-spacing:2px;margin-bottom:8px}
      .sf-onb-sub{font-size:13px;color:#9a8a70;font-style:italic;margin-bottom:28px;line-height:1.6}
      .sf-onb-choices{display:flex;flex-direction:column;gap:10px}
      .sf-onb-choice{
        display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;
        border:1px solid #2a2418;background:#13110e;cursor:pointer;text-align:left;width:100%;
      }
      .sf-onb-choice.selected{border-color:#c8a96e;background:rgba(200,169,110,0.1)}
      .sf-onb-flag{font-size:26px;flex-shrink:0}
      .sf-onb-name{font-family:'Cinzel',serif;font-size:14px;font-weight:600;color:#e8e0d0;display:block}
      .sf-onb-native{font-size:12px;color:#9a8a70}
      .sf-onb-check{
        width:20px;height:20px;border-radius:50%;border:2px solid #2a2418;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;font-size:11px;margin-left:auto;
      }
      .sf-onb-choice.selected .sf-onb-check{background:#c8a96e;border-color:#c8a96e;color:#000}
      .sf-onb-btn{
        margin-top:20px;width:100%;padding:13px;border-radius:10px;border:1px solid #8a6a30;
        background:linear-gradient(135deg,rgba(200,169,110,0.15),rgba(200,169,110,0.05));
        color:#c8a96e;font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;cursor:pointer;
      }
      .sf-onb-tip{display:flex;gap:12px;align-items:flex-start;text-align:left;margin-bottom:16px}
      .sf-onb-tip-icon{
        font-size:18px;background:#1a1710;width:32px;height:32px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#c8a96e;
      }
      .sf-onb-tip p{font-size:13px;color:#9a8a70;line-height:1.5}
      .sf-onb-input{
        width:100%;background:#13110e;border:1px solid #2a2418;border-radius:8px;color:#e8e0d0;
        font-family:'DM Mono',monospace;font-size:24px;padding:12px;outline:none;text-align:center;
        letter-spacing:8px;box-sizing:border-box;
      }
      .sf-onb-label{text-align:left;margin-bottom:6px;font-size:11px;color:#5a5040;font-family:'DM Mono',monospace;letter-spacing:1px}
      .sf-onb-error{display:none;margin-top:8px;font-size:11px;color:#fa6d8f;font-family:'DM Mono',monospace}
      .sf-onb-skip{margin-top:12px;background:none;border:none;color:#5a5040;font-size:12px;letter-spacing:1px;cursor:pointer;font-family:'DM Mono',monospace}
    `;
    document.head.appendChild(style);
  }

  function injectOverlays() {
    if (document.getElementById('lang-overlay')) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="lang-overlay">
        <div class="sf-onb-box">
          <div style="font-size:36px;margin-bottom:16px">✦</div>
          <div class="sf-onb-title" id="txt-onb-lang-title"></div>
          <p class="sf-onb-sub" id="txt-onb-lang-sub"></p>
          <div class="sf-onb-choices">
            <button class="sf-onb-choice selected" data-lang="fr" type="button">
              <span class="sf-onb-flag">🇫🇷</span>
              <div><span class="sf-onb-name">Français</span><span class="sf-onb-native">French</span></div>
              <div class="sf-onb-check">✓</div>
            </button>
            <button class="sf-onb-choice" data-lang="en" type="button">
              <span class="sf-onb-flag">🇬🇧</span>
              <div><span class="sf-onb-name">English</span><span class="sf-onb-native">Anglais</span></div>
              <div class="sf-onb-check"></div>
            </button>
            <button class="sf-onb-choice" data-lang="es" type="button">
              <span class="sf-onb-flag">🇪🇸</span>
              <div><span class="sf-onb-name">Español</span><span class="sf-onb-native">Espagnol</span></div>
              <div class="sf-onb-check"></div>
            </button>
          </div>
          <button class="sf-onb-btn" id="btn-onb-lang-confirm" type="button"></button>
        </div>
      </div>
      <div id="tuto-overlay">
        <div class="sf-onb-box">
          <div style="font-size:36px;margin-bottom:16px">💡</div>
          <div class="sf-onb-title" id="txt-onb-tuto-title"></div>
          <div style="margin-bottom:28px">
            <div class="sf-onb-tip"><span class="sf-onb-tip-icon">●</span><p id="txt-onb-tuto-menu"></p></div>
            <div class="sf-onb-tip"><span class="sf-onb-tip-icon">+</span><p id="txt-onb-tuto-save"></p></div>
          </div>
          <button class="sf-onb-btn" id="btn-onb-tuto-close" type="button"></button>
        </div>
      </div>
      <div id="pin-setup-overlay">
        <div class="sf-onb-box">
          <div style="font-size:36px;margin-bottom:16px">🔒</div>
          <div class="sf-onb-title" id="txt-onb-pin-title"></div>
          <p class="sf-onb-sub" id="txt-onb-pin-body" style="margin-bottom:20px"></p>
          <div class="sf-onb-label" id="txt-onb-pin-enter"></div>
          <input id="pin-setup-input" class="sf-onb-input" type="password" inputmode="numeric" maxlength="4" placeholder="••••">
          <div class="sf-onb-label" id="txt-onb-pin-confirm" style="margin-top:14px"></div>
          <input id="pin-setup-input2" class="sf-onb-input" type="password" inputmode="numeric" maxlength="4" placeholder="••••">
          <div id="pin-setup-error" class="sf-onb-error"></div>
          <label style="display:flex;align-items:center;gap:10px;margin-top:18px;text-align:left;cursor:pointer">
            <input type="checkbox" id="pin-setup-kids" style="width:18px;height:18px;accent-color:#c8a96e">
            <span id="txt-onb-pin-kids" style="font-size:12px;color:#9a8a70;line-height:1.4"></span>
          </label>
          <button class="sf-onb-btn" id="btn-onb-pin-create" type="button"></button>
          <button class="sf-onb-skip" id="btn-onb-pin-skip" type="button"></button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    document.querySelectorAll('#lang-overlay .sf-onb-choice').forEach(btn => {
      btn.addEventListener('click', () => selectLang(btn.dataset.lang, btn));
    });
    document.getElementById('btn-onb-lang-confirm').addEventListener('click', confirmLang);
    document.getElementById('btn-onb-tuto-close').addEventListener('click', closeTuto);
    document.getElementById('btn-onb-pin-create').addEventListener('click', submitPinSetup);
    document.getElementById('btn-onb-pin-skip').addEventListener('click', skipPinSetup);
    document.getElementById('pin-setup-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('pin-setup-input2').focus();
    });
    document.getElementById('pin-setup-input2').addEventListener('keydown', e => {
      if (e.key === 'Enter') submitPinSetup();
    });
  }

  function applyTexts() {
    const tr = t();
    const set = (id, val, html) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (html) el.innerHTML = val; else el.textContent = val;
    };
    set('txt-onb-lang-title', tr.langTitle);
    set('txt-onb-lang-sub', tr.langSub);
    set('btn-onb-lang-confirm', tr.langConfirm);
    set('txt-onb-tuto-title', tr.tutoTitle);
    set('txt-onb-tuto-menu', tr.tutoMenu, true);
    set('txt-onb-tuto-save', tr.tutoSave, true);
    set('btn-onb-tuto-close', tr.tutoBtn);
    set('txt-onb-pin-title', tr.pinSetupTitle);
    set('txt-onb-pin-body', tr.pinSetupBody);
    set('txt-onb-pin-enter', tr.pinSetupEnter);
    set('txt-onb-pin-confirm', tr.pinSetupConfirm);
    set('txt-onb-pin-kids', tr.pinSetupKids);
    set('btn-onb-pin-create', tr.pinSetupCreate);
    set('btn-onb-pin-skip', tr.pinSetupSkip);
    // index.html (overlays existants)
    set('txt-tuto-title', tr.tutoTitle);
    set('txt-tuto-menu', tr.tutoMenu, true);
    set('txt-tuto-save', tr.tutoSave, true);
    set('txt-tuto-btn', tr.tutoBtn);
    set('txt-pinsetup-title', tr.pinSetupTitle);
    set('txt-pinsetup-body', tr.pinSetupBody);
    set('txt-pinsetup-enter', tr.pinSetupEnter);
    set('txt-pinsetup-confirm', tr.pinSetupConfirm);
    set('txt-pinsetup-kids', tr.pinSetupKids);
    set('txt-pinsetup-create', tr.pinSetupCreate);
    set('txt-pinsetup-skip', tr.pinSetupSkip);
  }

  function hideAll() {
    ['lang-overlay', 'tuto-overlay', 'pin-setup-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  function fadeOut(el, cb) {
    if (!el) { if (cb) cb(); return; }
    el.style.animation = 'sf-onb-fade-out .3s ease forwards';
    setTimeout(() => {
      el.style.display = 'none';
      el.style.animation = '';
      if (cb) cb();
    }, 300);
  }

  function selectLang(lang, btn) {
    _pendingLang = lang;
    document.querySelectorAll('#lang-overlay .sf-onb-choice').forEach(b => {
      b.classList.remove('selected');
      const check = b.querySelector('.sf-onb-check');
      if (check) check.textContent = '';
    });
    btn.classList.add('selected');
    const check = btn.querySelector('.sf-onb-check');
    if (check) check.textContent = '✓';
  }

  function confirmLang() {
    lsSet('sf_lang', _pendingLang);
    lsSet('sf_lang_chosen', '1');
    _setLang(_pendingLang);
    fadeOut(document.getElementById('lang-overlay'), () => {
      setTimeout(startLaunchSequence, 200);
    });
  }

  function showTuto() {
    applyTexts();
    const overlay = document.getElementById('tuto-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
  }

  function closeTuto() {
    lsSet('sf_tuto_shown', '1');
    fadeOut(document.getElementById('tuto-overlay'), () => {
      setTimeout(startLaunchSequence, 200);
    });
  }

  function maybeShowPinSetup() {
    if (lsGet('sf_pin_setup_done')) return;
    if (lsGet('sf_parent_pin') !== null) return;
    showPinSetup();
  }

  function showPinSetup() {
    applyTexts();
    const overlay = document.getElementById('pin-setup-overlay');
    if (!overlay) return;
    document.getElementById('pin-setup-input').value = '';
    document.getElementById('pin-setup-input2').value = '';
    document.getElementById('pin-setup-kids').checked = false;
    document.getElementById('pin-setup-error').style.display = 'none';
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('pin-setup-input').focus(), 100);
  }

  function closePinSetup() {
    lsSet('sf_pin_setup_done', '1');
    fadeOut(document.getElementById('pin-setup-overlay'));
  }

  function skipPinSetup() {
    closePinSetup();
  }

  function submitPinSetup() {
    const tr = t();
    const input = document.getElementById('pin-setup-input').value.trim();
    const input2 = document.getElementById('pin-setup-input2').value.trim();
    const err = document.getElementById('pin-setup-error');
    if (!/^\d{4}$/.test(input)) {
      err.textContent = tr.pinSetupError;
      err.style.display = 'block';
      document.getElementById('pin-setup-input').focus();
      return;
    }
    if (input !== input2) {
      err.textContent = tr.pinSetupMismatch;
      err.style.display = 'block';
      document.getElementById('pin-setup-input2').value = '';
      document.getElementById('pin-setup-input2').focus();
      return;
    }
    lsSet('sf_parent_pin', hashPin(input));
    if (document.getElementById('pin-setup-kids').checked) {
      const kidsToggle = document.getElementById('opt-kids');
      if (kidsToggle) kidsToggle.checked = true;
      if (typeof window.saveOptions === 'function') window.saveOptions();
      if (typeof window.renderGameList === 'function') window.renderGameList();
      if (typeof window.renderLibrary === 'function') window.renderLibrary();
    }
    closePinSetup();
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
      'background:#13110e;border:1px solid rgba(109,250,188,0.4);border-radius:10px;' +
      'padding:10px 20px;font-family:monospace;font-size:11px;color:#6dfabc;z-index:999';
    msg.textContent = tr.pinSetupDone;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  }

  function startLaunchSequence() {
    injectStyles();
    injectOverlays();
    applyTexts();
    hideAll();

    if (!lsGet('sf_lang_chosen')) {
      _pendingLang = _getLang();
      const overlay = document.getElementById('lang-overlay');
      if (overlay) overlay.style.display = 'flex';
    } else if (!lsGet('sf_tuto_shown')) {
      showTuto();
    } else {
      maybeShowPinSetup();
    }
  }

  function start(opts) {
    opts = opts || {};
    if (typeof opts.getLang === 'function') _getLang = opts.getLang;
    if (typeof opts.setLang === 'function') _setLang = opts.setLang;
    _pendingLang = _getLang();
    startLaunchSequence();
  }

  // Rétrocompatibilité avec index.html
  window.startLaunchSequence = startLaunchSequence;
  window.confirmLang = confirmLang;
  window.selectLangPopup = selectLang;
  window.showTuto = showTuto;
  window.closeTuto = closeTuto;
  window.maybeShowPinSetup = maybeShowPinSetup;
  window.showPinSetup = showPinSetup;
  window.closePinSetup = closePinSetup;
  window.skipPinSetup = skipPinSetup;
  window.submitPinSetup = submitPinSetup;

  return { start, startLaunchSequence };
})();
