/* SFStoryMeta — badges auteur / communauté pour les cartes histoire */
window.SFStoryMeta = (function () {
  const TXT = {
    fr: {
      community: 'Communauté',
      by: 'Par',
      kids: 'Enfants',
      new: 'Nouveau',
      endings: n => `${n} fin${n > 1 ? 's' : ''}`,
      spotlightLabel: 'Créations communauté',
      spotlightTitle: 'Histoires écrites par la communauté',
      spotlightSub: 'Comme La gare des regrets — la vôtre pourrait être la prochaine.',
      spotlightBtn: 'Participer au concours'
    },
    en: {
      community: 'Community',
      by: 'By',
      kids: 'Kids',
      new: 'New',
      endings: n => `${n} ending${n > 1 ? 's' : ''}`,
      spotlightLabel: 'Community creations',
      spotlightTitle: 'Stories written by the community',
      spotlightSub: 'Like The Station of Regrets — yours could be next.',
      spotlightBtn: 'Join the contest'
    },
    es: {
      community: 'Comunidad',
      by: 'Por',
      kids: 'Niños',
      new: 'Nuevo',
      endings: n => `${n} final${n > 1 ? 'es' : ''}`,
      spotlightLabel: 'Creaciones de la comunidad',
      spotlightTitle: 'Historias escritas por la comunidad',
      spotlightSub: 'Como La estación de los arrepentimientos — la tuya podría ser la siguiente.',
      spotlightBtn: 'Participar en el concurso'
    }
  };

  function t(lang) { return TXT[lang] || TXT.fr; }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isCommunity(g) {
    return !!(g && (g.community === true || g.community === 'true'));
  }

  function authorLine(g, lang, className) {
    if (!g || !g.author) return '';
    const cls = className || 'story-author';
    return `<div class="${cls}">${esc(t(lang).by)} ${esc(g.author)}</div>`;
  }

  function metaTags(g, lang, extra) {
    const tx = t(lang);
    const tags = [];
    if (isCommunity(g)) {
      tags.push(`<span class="story-tag community">✦ ${esc(tx.community)}</span>`);
    }
    if (g.kids) tags.push(`<span class="story-tag kids">${esc(tx.kids)}</span>`);
    if (g.new) tags.push(`<span class="story-tag new">${esc(tx.new)}</span>`);
    if (extra && extra.portal) {
      tags.push('<span class="story-tag portal">🔗 Via portail</span>');
    }
    if (g.duration) tags.push(`<span class="story-tag">${esc(g.duration)}</span>`);
    if (g.endings) tags.push(`<span class="story-tag">${esc(tx.endings(g.endings))}</span>`);
    return tags.join('');
  }

  function spotlightBanner(games, lang, onLaunch, onCommunity) {
    const community = (games || [])
      .filter(g => g.lang === lang && isCommunity(g))
      .sort((a, b) => (Date.parse(b.published || '') || 0) - (Date.parse(a.published || '') || 0));
    if (!community.length) return '';
    const tx = t(lang);

    const prologue = (games || []).find(g =>
      g.lang === lang && g.pack === 'cosmos' && /prologue/i.test(g.file || '') && g.portal !== true
    );

    const items = [];
    if (community[0]) items.push({ kind: 'story', game: community[0] });
    if (prologue) items.push({ kind: 'dlc', game: prologue });
    if (community[1]) items.push({ kind: 'story', game: community[1] });
    community.slice(2).forEach(g => items.push({ kind: 'story', game: g }));

    const cards = items.map(item => {
      const g = item.game;
      const isDlc = item.kind === 'dlc';
      const safeFile = esc(g.file).replace(/'/g, "\\'");
      return `
      <div class="community-spot-card${isDlc ? ' community-spot-dlc' : ''}" onclick="${onLaunch}('${safeFile}')">
        <span class="community-spot-icon">${g.icon || (isDlc ? '🚀' : '📖')}</span>
        <div class="community-spot-info">
          <div class="community-spot-title">${esc(g.title)}</div>
          ${isDlc
            ? `<div class="community-spot-author">DLC · ${esc({ fr: 'Pack Cosmos', en: 'Cosmos Pack', es: 'Pack Cosmos' }[lang] || 'Pack Cosmos')}</div>`
            : (g.author ? `<div class="community-spot-author">${esc(tx.by)} ${esc(g.author)}</div>` : '')}
        </div>
        <span class="community-spot-arrow">›</span>
      </div>`;
    }).join('');

    return `<div class="community-spotlight">
      <div class="community-spotlight-head">
        <span class="community-spotlight-label">${esc(tx.spotlightLabel)}</span>
        <h2 class="community-spotlight-title">${esc(tx.spotlightTitle)}</h2>
        <p class="community-spotlight-sub">${esc(tx.spotlightSub)}</p>
      </div>
      <div class="community-spotlight-list">${cards}</div>
      <button type="button" class="community-spotlight-btn" onclick="${onCommunity}()">${esc(tx.spotlightBtn)} →</button>
    </div>`;
  }

  return { isCommunity, authorLine, metaTags, spotlightBanner, t };
})();
