/* ══════════════════════════════════════════════════════════════
   SFCommunity — popup concours & créateurs communauté
   Partagé entre index.html et stories.html
   Données : community.json / community_en.json / community_es.json
   ══════════════════════════════════════════════════════════════ */

window.SFCommunity = (function () {
  let _data = null;
  let _loaded = false;
  let _autoQueued = false;

  const BANNER_TXT = {
    fr: {
      text: 'Première histoire terminée ? Participez au concours — votre récit pourrait être publié.',
      btn: 'Participer au concours',
      dismiss: 'Fermer'
    },
    en: {
      text: 'Finished your first story? Join the contest — yours could be published.',
      btn: 'Join the contest',
      dismiss: 'Dismiss'
    },
    es: {
      text: '¿Terminaste tu primera historia? Participa en el concurso — la tuya podría publicarse.',
      btn: 'Participar en el concurso',
      dismiss: 'Cerrar'
    }
  };

  function lang() {
    const l = localStorage.getItem('sf_lang') || 'fr';
    return ['fr', 'en', 'es'].includes(l) ? l : 'fr';
  }

  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }

  function lsSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  function getStoriesFinishedCount() {
    return parseInt(lsGet('sf_stories_finished') || '0', 10) || 0;
  }

  function getBannerHost() {
    return document.getElementById('content')
      || document.getElementById('content-block')
      || null;
  }

  function injectContestBanner(d) {
    injectStyles();
    if (document.getElementById('sf-contest-banner')) return;
    const host = getBannerHost();
    if (!host) return;
    const tx = BANNER_TXT[lang()] || BANNER_TXT.fr;
    const el = document.createElement('div');
    el.id = 'sf-contest-banner';
    el.className = 'sf-contest-banner';
    el.innerHTML = `
      <div class="sf-contest-banner-text">${esc(tx.text)}</div>
      <div class="sf-contest-banner-actions">
        <button type="button" class="sf-contest-banner-btn" id="sf-contest-banner-go">${esc(tx.btn)}</button>
        <button type="button" class="sf-contest-banner-dismiss" id="sf-contest-banner-x" aria-label="${esc(tx.dismiss)}">✕</button>
      </div>`;
    host.insertBefore(el, host.firstChild);
    document.getElementById('sf-contest-banner-go').addEventListener('click', goSubmit);
    document.getElementById('sf-contest-banner-x').addEventListener('click', () => {
      if (d.popup_id) lsSet('sf_contest_banner_dismiss_' + d.popup_id, '1');
      el.remove();
    });
  }

  async function maybeShowContestBanner() {
    const d = await loadData();
    if (!d?.contest?.active || !d.popup_id) return;
    if (getStoriesFinishedCount() < 1) return;
    if (lsGet('sf_contest_banner_dismiss_' + d.popup_id)) return;
    injectContestBanner(d);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(dateStr) {
    try {
      const l = lang();
      return new Date(dateStr).toLocaleDateString(
        l === 'en' ? 'en-GB' : l === 'es' ? 'es-ES' : 'fr-FR',
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch (e) {
      return dateStr;
    }
  }

  function injectStyles() {
    if (document.getElementById('sf-comm-styles')) return;
    const s = document.createElement('style');
    s.id = 'sf-comm-styles';
    s.textContent = `
      .sf-comm-overlay{
        position:fixed;inset:0;z-index:280;
        background:rgba(10,8,5,0);display:flex;
        align-items:center;justify-content:center;
        pointer-events:none;transition:background .35s;
        padding:16px;padding-top:calc(16px + var(--safe-top, env(safe-area-inset-top, 0px)));
      }
      .sf-comm-overlay.open{
        background:rgba(10,8,5,0.92);pointer-events:all;
        backdrop-filter:blur(10px);
      }
      .sf-comm-box{
        width:100%;max-width:480px;max-height:min(88vh,720px);
        background:#13110e;border:1px solid #2a2418;border-radius:20px;
        transform:scale(0.95) translateY(12px);opacity:0;
        transition:all .35s cubic-bezier(.4,0,.2,1);
        display:flex;flex-direction:column;overflow:hidden;
      }
      .sf-comm-overlay.open .sf-comm-box{
        transform:scale(1) translateY(0);opacity:1;
      }
      .sf-comm-head{
        padding:24px 24px 16px;text-align:center;flex-shrink:0;
        border-bottom:1px solid #2a2418;position:relative;
      }
      .sf-comm-close{
        position:absolute;top:14px;right:14px;width:30px;height:30px;
        border-radius:8px;background:none;border:1px solid #2a2418;
        color:#5a5040;cursor:pointer;font-size:16px;
        display:flex;align-items:center;justify-content:center;
      }
      .sf-comm-close:hover{border-color:#8a6a30;color:#e8e0d0;}
      .sf-comm-icon{font-size:32px;margin-bottom:8px;}
      .sf-comm-title{
        font-family:'Cinzel',serif;font-size:17px;font-weight:600;
        color:#e8e0d0;letter-spacing:2px;margin-bottom:4px;
      }
      .sf-comm-sub{
        font-family:'Cormorant Garamond',serif;font-size:14px;
        color:#c8a96e;font-style:italic;
      }
      .sf-comm-scroll{
        overflow-y:auto;flex:1;padding:16px 20px 8px;
        -webkit-overflow-scrolling:touch;
      }
      .sf-comm-section{
        font-family:'Cinzel',serif;font-size:9px;font-weight:600;
        letter-spacing:3px;text-transform:uppercase;color:#5a5040;
        margin:8px 0 10px;display:flex;align-items:center;gap:8px;
      }
      .sf-comm-section::after{
        content:'';flex:1;height:1px;background:#2a2418;
      }
      .sf-comm-ai{
        background:linear-gradient(135deg,rgba(124,109,250,0.1),rgba(109,250,188,0.06));
        border:1px solid rgba(124,109,250,0.35);border-radius:12px;
        padding:14px 16px;margin-bottom:16px;
      }
      .sf-comm-ai-title{
        font-family:'Cinzel',serif;font-size:13px;color:#d4cbff;
        letter-spacing:1px;margin-bottom:6px;
      }
      .sf-comm-ai-text{font-size:12px;color:#9a8a70;line-height:1.55;margin-bottom:10px;}
      .sf-comm-ai-btn{
        width:100%;padding:10px 14px;border-radius:8px;cursor:pointer;
        border:1px solid rgba(124,109,250,0.45);background:rgba(124,109,250,0.12);
        color:#d4cbff;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;
      }
      .sf-comm-ai-btn:hover{border-color:#b8a8ff;color:#fff;}
      .sf-comm-contest{
        background:linear-gradient(135deg,rgba(124,109,250,0.08),rgba(200,169,110,0.08));
        border:1px solid rgba(200,169,110,0.3);border-radius:12px;
        padding:14px 16px;margin-bottom:16px;
      }
      .sf-comm-badge{
        display:inline-block;font-family:'DM Mono',monospace;font-size:9px;
        letter-spacing:1px;text-transform:uppercase;color:#6dfabc;
        border:1px solid rgba(109,250,188,0.35);border-radius:20px;
        padding:2px 8px;margin-bottom:8px;
      }
      .sf-comm-contest-title{
        font-family:'Cinzel',serif;font-size:14px;color:#e8e0d0;
        letter-spacing:1px;margin-bottom:6px;
      }
      .sf-comm-theme{
        font-size:13px;color:#c8a96e;margin-bottom:8px;
      }
      .sf-comm-theme strong{color:#e8d4a0;}
      .sf-comm-desc{
        font-size:13px;color:#9a8a70;line-height:1.65;margin-bottom:10px;
      }
      .sf-comm-deadline{
        font-family:'DM Mono',monospace;font-size:10px;color:#7070a0;
        margin-bottom:10px;
      }
      .sf-comm-prizes{
        list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;
      }
      .sf-comm-prizes li{
        font-size:12px;color:#e8e0d0;line-height:1.45;
        padding-left:16px;position:relative;
      }
      .sf-comm-prizes li::before{
        content:'✦';position:absolute;left:0;color:#c8a96e;font-size:10px;top:1px;
      }
      .sf-comm-card{
        background:#1a1710;border:1px solid #2a2418;border-radius:10px;
        padding:12px 14px;margin-bottom:10px;display:flex;gap:12px;
        align-items:flex-start;cursor:pointer;transition:border-color .15s;
      }
      .sf-comm-card:hover{border-color:#8a6a30;}
      .sf-comm-card.static{cursor:default;}
      .sf-comm-card-icon{font-size:22px;flex-shrink:0;line-height:1;}
      .sf-comm-card-body{flex:1;min-width:0;}
      .sf-comm-card-title{
        font-family:'Cinzel',serif;font-size:12px;color:#e8e0d0;
        letter-spacing:0.5px;margin-bottom:3px;
      }
      .sf-comm-card-meta{
        font-size:11px;color:#c8a96e;margin-bottom:4px;
      }
      .sf-comm-card-date{
        font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.5px;
        color:#5a5040;margin-bottom:4px;
      }
      .sf-comm-card-dlc{
        border-color:rgba(100,180,255,0.35);
        background:rgba(100,180,255,0.05);
      }
      .sf-comm-card-dlc:hover{border-color:rgba(100,180,255,0.55);}
      .sf-comm-card-dlc .sf-comm-card-meta{color:#8ec4ff;}
      .sf-comm-card-badge{
        display:inline-block;font-family:'DM Mono',monospace;font-size:8px;
        letter-spacing:1.5px;text-transform:uppercase;padding:2px 6px;
        border-radius:20px;border:1px solid rgba(100,180,255,0.4);
        color:#8ec4ff;margin-left:6px;vertical-align:middle;
      }
      .sf-comm-card-text{font-size:12px;color:#9a8a70;line-height:1.5;}
      .sf-comm-empty{
        font-size:13px;color:#9a8a70;line-height:1.6;font-style:italic;
        padding:8px 4px 12px;
      }
      .sf-comm-foot{
        padding:12px 20px 20px;flex-shrink:0;
        border-top:1px solid #2a2418;display:flex;flex-direction:column;gap:8px;
      }
      .sf-comm-btn{
        width:100%;padding:13px 20px;border-radius:8px;
        border:1px solid #8a6a30;
        background:linear-gradient(135deg,rgba(200,169,110,0.12),rgba(138,106,48,0.06));
        color:#e8d4a0;font-family:'Cinzel',serif;font-size:11px;
        font-weight:600;letter-spacing:2px;cursor:pointer;
        text-transform:uppercase;transition:all .2s;
      }
      .sf-comm-btn:hover{
        border-color:#c8a96e;box-shadow:0 0 20px rgba(200,169,110,0.12);
      }
      .sf-comm-btn.secondary{
        background:none;border-color:#2a2418;color:#9a8a70;letter-spacing:1.5px;
      }
      .sf-comm-btn.secondary:hover{border-color:#8a6a30;color:#e8e0d0;}
      .sf-contest-banner{
        width:100%;max-width:520px;margin:0 auto 14px;
        background:linear-gradient(135deg,rgba(200,169,110,0.1),rgba(124,109,250,0.06));
        border:1px solid rgba(200,169,110,0.35);border-radius:12px;
        padding:12px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
        animation:sf-comm-banner-in .45s ease both;
      }
      @keyframes sf-comm-banner-in{
        from{opacity:0;transform:translateY(-6px);}
        to{opacity:1;transform:translateY(0);}
      }
      .sf-contest-banner-text{
        flex:1;min-width:180px;font-size:13px;color:#c8a96e;line-height:1.5;
        font-family:'Cormorant Garamond',serif;font-style:italic;
      }
      .sf-contest-banner-actions{display:flex;gap:8px;flex-shrink:0;}
      .sf-contest-banner-btn{
        padding:8px 12px;border-radius:8px;cursor:pointer;
        border:1px solid #8a6a30;background:rgba(200,169,110,0.12);
        color:#e8d4a0;font-family:'Cinzel',serif;font-size:10px;letter-spacing:1.5px;
      }
      .sf-contest-banner-btn:hover{border-color:#c8a96e;}
      .sf-contest-banner-dismiss{
        padding:8px 10px;border-radius:8px;cursor:pointer;
        border:1px solid #2a2418;background:none;color:#5a5040;
        font-size:14px;line-height:1;
      }
      .sf-contest-banner-dismiss:hover{border-color:#8a6a30;color:#9a8a70;}
    `;
    document.head.appendChild(s);
  }

  function injectOverlay() {
    if (document.getElementById('sf-comm-overlay')) return;
    const el = document.createElement('div');
    el.id = 'sf-comm-overlay';
    el.className = 'sf-comm-overlay';
    el.innerHTML = `
      <div class="sf-comm-box" role="dialog" aria-modal="true">
        <div class="sf-comm-head">
          <button type="button" class="sf-comm-close" id="sf-comm-close" aria-label="Close">✕</button>
          <div class="sf-comm-icon">🏆</div>
          <div class="sf-comm-title" id="sf-comm-title"></div>
          <div class="sf-comm-sub" id="sf-comm-sub"></div>
        </div>
        <div class="sf-comm-scroll" id="sf-comm-body"></div>
        <div class="sf-comm-foot" id="sf-comm-foot"></div>
      </div>`;
    document.body.appendChild(el);

    el.addEventListener('click', e => {
      if (e.target === el) close();
    });
    document.getElementById('sf-comm-close').addEventListener('click', close);
  }

  async function loadData() {
    if (_loaded && _data) return _data;
    const l = lang();
    const urls = l === 'fr'
      ? ['community.json']
      : [`community_${l}.json`, 'community.json'];
    for (const url of urls) {
      try {
        const r = await fetch(url);
        if (r.ok) {
          _data = await r.json();
          _loaded = true;
          return _data;
        }
      } catch (e) {}
    }
    _data = null;
    _loaded = true;
    return null;
  }

  function renderAiTip(d) {
    if (!d.ai_tip_title) return '';
    return `
      <div class="sf-comm-ai">
        <div class="sf-comm-ai-title">${esc(d.ai_tip_title)}</div>
        <div class="sf-comm-ai-text">${esc(d.ai_tip_text || '')}</div>
        <button type="button" class="sf-comm-ai-btn" id="sf-comm-ai">${esc(d.btn_ai || 'AI')}</button>
      </div>`;
  }

  function renderContest(d) {
    const c = d.contest;
    if (!c || !c.active) return '';
    const prizes = (c.prizes || []).map(p => `<li>${esc(p)}</li>`).join('');
    return `
      <div class="sf-comm-section">${esc(d.section_contest)}</div>
      <div class="sf-comm-contest">
        ${c.badge ? `<span class="sf-comm-badge">${esc(c.badge)}</span>` : ''}
        <div class="sf-comm-contest-title">${esc(c.title)}</div>
        ${c.theme ? `<div class="sf-comm-theme"><strong>${esc(d.theme_label || (lang() === 'en' ? 'Theme' : lang() === 'es' ? 'Tema' : 'Thème'))} :</strong> ${esc(c.theme)}</div>` : ''}
        ${c.description ? `<div class="sf-comm-desc">${esc(c.description)}</div>` : ''}
        ${c.deadline ? `<div class="sf-comm-deadline">${esc(d.deadline_label)} : ${formatDate(c.deadline)}</div>` : ''}
        ${prizes ? `<ul class="sf-comm-prizes">${prizes}</ul>` : ''}
      </div>`;
  }

  function renderStories(d) {
    const stories = d.featured_stories || [];
    let html = `<div class="sf-comm-section">${esc(d.section_stories)}</div>`;
    if (!stories.length) {
      return html + `<div class="sf-comm-empty">${esc(d.empty_stories)}</div>`;
    }
    html += stories.map(s => {
      const isDlc = s.type === 'dlc';
      const byLabel = lang() === 'en' ? 'By' : lang() === 'es' ? 'Por' : 'Par';
      const metaLine = s.author
        ? `${esc(byLabel)} ${esc(s.author)}`
        : (isDlc && s.badge ? esc(s.badge) : '');
      return `
      <div class="sf-comm-card${isDlc ? ' sf-comm-card-dlc' : ''}" data-file="${esc(s.file || '')}" role="button" tabindex="0">
        <div class="sf-comm-card-icon">${esc(s.icon || '📖')}</div>
        <div class="sf-comm-card-body">
          <div class="sf-comm-card-title">${esc(s.title)}${isDlc && s.badge ? `<span class="sf-comm-card-badge">${esc(s.badge)}</span>` : ''}</div>
          ${s.date ? `<div class="sf-comm-card-date">${formatDate(s.date)}</div>` : ''}
          ${metaLine ? `<div class="sf-comm-card-meta">${metaLine}</div>` : ''}
          ${s.note ? `<div class="sf-comm-card-text">${esc(s.note)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    return html;
  }

  function renderCreators(d) {
    const creators = d.featured_creators || [];
    let html = `<div class="sf-comm-section">${esc(d.section_creators)}</div>`;
    if (!creators.length) {
      return html + `<div class="sf-comm-empty">${esc(d.empty_creators)}</div>`;
    }
    html += creators.map(c => `
      <div class="sf-comm-card static">
        <div class="sf-comm-card-icon">${esc(c.icon || '✍')}</div>
        <div class="sf-comm-card-body">
          <div class="sf-comm-card-title">${esc(c.name)}</div>
          ${c.badge ? `<div class="sf-comm-card-meta">${esc(c.badge)}</div>` : ''}
          ${c.bio ? `<div class="sf-comm-card-text">${esc(c.bio)}</div>` : ''}
        </div>
      </div>`).join('');
    return html;
  }

  function launchStory(file) {
    if (!file) return;
    close();
    localStorage.setItem('sf_game_file', file);
    window.location.href = 'game.html?story=' + encodeURIComponent(file);
  }

  function goAi() {
    close();
    window.location.href = 'ai-guide.html';
  }

  function goSubmit() {
    close();
    if (typeof openSubmitPopup === 'function') {
      openSubmitPopup();
      return;
    }
    window.location.href = 'index.html?submit=1';
  }

  function markSeen() {
    if (!_data || !_data.popup_id) return;
    lsSet('sf_community_seen_' + _data.popup_id, '1');
  }

  function isOnboardingActive() {
    return !!document.querySelector('.sf-onb-overlay.open');
  }

  async function open() {
    injectStyles();
    injectOverlay();
    const d = await loadData();
    if (!d) return;

    document.getElementById('sf-comm-title').textContent = d.title || 'Communauté';
    document.getElementById('sf-comm-sub').textContent = d.subtitle || '';
    document.getElementById('sf-comm-body').innerHTML =
      renderContest(d) + renderAiTip(d) + renderStories(d) + renderCreators(d);

    document.getElementById('sf-comm-body').querySelectorAll('.sf-comm-card[data-file]').forEach(card => {
      const file = card.getAttribute('data-file');
      if (!file) return;
      card.addEventListener('click', () => launchStory(file));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launchStory(file); }
      });
    });

    const foot = document.getElementById('sf-comm-foot');
    const showParticipate = d.contest && d.contest.active;
    foot.innerHTML = `
      ${showParticipate ? `<button type="button" class="sf-comm-btn" id="sf-comm-participate">${esc(d.btn_participate)}</button>` : ''}
      <button type="button" class="sf-comm-btn${showParticipate ? ' secondary' : ''}" id="sf-comm-submit">${esc(d.btn_submit)}</button>
      <button type="button" class="sf-comm-btn secondary" id="sf-comm-close-btn">${esc(d.btn_close)}</button>`;

    if (showParticipate) {
      document.getElementById('sf-comm-participate').addEventListener('click', goSubmit);
    }
    const aiBtn = document.getElementById('sf-comm-ai');
    if (aiBtn) aiBtn.addEventListener('click', goAi);
    document.getElementById('sf-comm-submit').addEventListener('click', goSubmit);
    document.getElementById('sf-comm-close-btn').addEventListener('click', close);

    document.getElementById('sf-comm-overlay').classList.add('open');
    markSeen();
  }

  function close() {
    const el = document.getElementById('sf-comm-overlay');
    if (el) el.classList.remove('open');
  }

  async function maybeAutoShow() {
    // Pas de popup auto au premier lancement — bandeau concours après la 1re histoire (maybeShowContestBanner).
    return;
  }

  function init() {
    injectStyles();
    injectOverlay();
    loadData().then(() => maybeShowContestBanner());
  }

  return { init, open, close, maybeAutoShow, maybeShowContestBanner, loadData };
})();
