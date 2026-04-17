// content.js - GMB Review AI v6
// Clean single-file injection for business.google.com
// v6.1.0 | 2026-04-17 18:30

(function() {
  'use strict';
  if (window._gmbAI6) { return; }
  window._gmbAI6 = true;

  // ── Constants ────────────────────────────────────────────────────
  var PANEL_ID = 'gmbAI6Panel';
  var TONES = {
    friendly:     'friendly and warm',
    professional: 'professional and formal',
    concise:      'concise and neutral',
    empathetic:   'empathetic and caring',
    enthusiastic: 'enthusiastic and energetic'
  };

  // ── State ────────────────────────────────────────────────────────
  var cfg      = {};
  var reviews  = [];
  var stopAuto = false;
  var pageNum  = 1;
  var logLines = 0;

  // ── Boot ─────────────────────────────────────────────────────────
  loadCfg(function(saved) {
    cfg = saved || {};
    injectFAB();
    if (isReviewsPage()) { setTimeout(injectPanel, 1400); }
    watchURL();
  });

  function isReviewsPage() {
    return location.href.indexOf('business.google.com') !== -1 &&
           location.href.indexOf('review') !== -1;
  }

  function watchURL() {
    var last = location.href;
    setInterval(function() {
      if (location.href === last) { return; }
      last = location.href;
      if (isReviewsPage() && !doc(PANEL_ID)) { setTimeout(injectPanel, 2000); }
    }, 1000);
  }

  // ── Floating button ──────────────────────────────────────────────
  function injectFAB() {
    if (doc('gmbAI6FAB')) { return; }
    var btn = mk('button');
    btn.id        = 'gmbAI6FAB';
    btn.innerHTML = '&#10024; AI Reviews';
    on(btn, 'click', function() {
      if (doc(PANEL_ID)) { toggleMin(); } else { injectPanel(); }
    });
    document.body.appendChild(btn);
  }

  function toggleMin() {
    var body = doc('gmbAI6Body');
    if (!body) { return; }
    var hidden = body.style.display === 'none';
    body.style.display = hidden ? '' : 'none';
    var minBtn = doc('gmbAI6MinBtn');
    if (minBtn) { minBtn.textContent = hidden ? '\u2212' : '+'; }
  }

  // ── Panel ────────────────────────────────────────────────────────
  function injectPanel() {
    if (doc(PANEL_ID)) { return; }
    var panel = mk('div');
    panel.id = PANEL_ID;
    document.body.style.marginRight  = '370px';
    document.body.style.transition   = 'margin-right 0.2s';
    panel.innerHTML = panelHTML();
    document.body.appendChild(panel);
    wireEvents();
    fillSettings();
    lg('Panel ready');
    setTimeout(doScan, 700);
  }

  function panelHTML() {
    return (
      '<div id="gmbAI6Head">' +
        '<div class="g6Logo">' +
          '<svg width="16" height="16" viewBox="0 0 22 22"><polygon points="11,1 13.8,8 21,8.3 15.5,13 17.6,20 11,16.3 4.4,20 6.5,13 1,8.3 8.2,8" fill="#4F46E5"/></svg>' +
          '<span>Review AI <small style="font-size:9px;opacity:0.6;font-weight:400">v6.1 · 17 Apr</small></span>' +
        '</div>' +
        '<div class="g6HBtns">' +
          '<button id="gmbAI6MinBtn" title="Minimise">\u2212</button>' +
          '<button id="gmbAI6CloseBtn" title="Close">&times;</button>' +
        '</div>' +
      '</div>' +

      '<div id="gmbAI6Body">' +

        '<div id="gmbAI6Tabs">' +
          '<button class="g6Tab g6TabOn" data-tab="reviews">&#128269; Reviews</button>' +
          '<button class="g6Tab" data-tab="settings">&#9881; Settings</button>' +
        '</div>' +

        // ── REVIEWS TAB ──
        '<div id="gmbAI6TabReviews" class="g6Pane">' +
          '<div id="gmbAI6Controls">' +
            '<div class="g6Row">' +
              '<span class="g6Label">Tone</span>' +
              '<select id="gmbAI6Tone">' +
                '<option value="friendly">&#128522; Friendly</option>' +
                '<option value="professional">&#127913; Professional</option>' +
                '<option value="concise">&#128221; Concise</option>' +
                '<option value="empathetic">&#128153; Empathetic</option>' +
                '<option value="enthusiastic">&#128640; Enthusiastic</option>' +
              '</select>' +
            '</div>' +
            '<div class="g6Row">' +
              '<button id="gmbAI6ScanBtn" class="g6Btn g6BtnGray">&#128269; Scan Reviews</button>' +
              '<button id="gmbAI6AllBtn"  class="g6Btn g6BtnPurple" disabled>&#9889; Reply All</button>' +
            '</div>' +
            '<div id="gmbAI6Status" class="g6Status"></div>' +
          '</div>' +

          '<div id="gmbAI6List">' +
            '<div class="g6Empty">Click <strong>Scan Reviews</strong> to load reviews from this page.</div>' +
          '</div>' +

          '<div id="gmbAI6Pager" style="display:none">' +
            '<span id="gmbAI6PageLbl" class="g6PageLbl">Page 1</span>' +
            '<div class="g6Row">' +
              '<button id="gmbAI6PrevBtn" class="g6Btn g6BtnSm g6BtnGray" disabled>&larr; Prev</button>' +
              '<button id="gmbAI6NextBtn" class="g6Btn g6BtnSm g6BtnGray">Next &rarr;</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // ── SETTINGS TAB ──
        '<div id="gmbAI6TabSettings" class="g6Pane" style="display:none">' +
          '<div id="gmbAI6SettingsForm">' +

            '<div class="g6Field">' +
              '<label class="g6FieldLbl">Gemini API Key <span class="g6Req">*</span></label>' +
              '<div class="g6InputRow">' +
                '<input type="password" id="gmbAI6Key" placeholder="AIza..." autocomplete="off"/>' +
                '<button id="gmbAI6EyeBtn" class="g6IconBtn" title="Show/hide">&#128065;</button>' +
              '</div>' +
              '<a id="gmbAI6KeyLink" class="g6Hint g6Link" href="#">Get a free key at ai.google.dev &rarr;</a>' +
            '</div>' +

            '<div class="g6Field">' +
              '<label class="g6FieldLbl">Default Reply Tone</label>' +
              '<select id="gmbAI6DefTone">' +
                '<option value="friendly">&#128522; Friendly &amp; Warm</option>' +
                '<option value="professional">&#127913; Professional</option>' +
                '<option value="concise">&#128221; Concise &amp; Neutral</option>' +
                '<option value="empathetic">&#128153; Empathetic</option>' +
                '<option value="enthusiastic">&#128640; Enthusiastic</option>' +
              '</select>' +
            '</div>' +

            '<div class="g6Divider"></div>' +

            '<div class="g6ProfilesHeader">' +
              '<span class="g6FieldLbl">&#127970; BUSINESS PROFILES</span>' +
              '<button id="gmbAI6AddProfile" class="g6Btn g6BtnSm g6BtnBlue">+ Add Profile</button>' +
            '</div>' +
            '<div class="g6ProfileNote">Each profile auto-matches to reviews based on the business name shown on each review card.</div>' +
            '<div id="gmbAI6ProfileList"></div>' +

            '<button id="gmbAI6SaveBtn" class="g6Btn g6BtnPurple g6BtnFull">&#10003; Save All Settings</button>' +
            '<div id="gmbAI6SaveMsg" class="g6SaveMsg" style="display:none">&#10003; Saved!</div>' +
            '<div id="gmbAI6KeyWarn" class="g6KeyWarn" style="display:none">&#9888; Add your Gemini API key to generate replies.</div>' +

          '</div>' +
        '</div>' +

        // ── LOG ──
        '<div id="gmbAI6LogWrap">' +
          '<button id="gmbAI6LogBtn" class="g6LogToggle">' +
            '&#128203; Log <span id="gmbAI6LogBadge">0</span> <span id="gmbAI6LogArr">&#9650;</span>' +
          '</button>' +
          '<div id="gmbAI6Log" style="display:none"></div>' +
        '</div>' +

      '</div>'
    );
  }

  // ── Wire events ──────────────────────────────────────────────────
  function wireEvents() {
    on(doc('gmbAI6CloseBtn'), 'click', function() {
      var p = doc(PANEL_ID);
      if (p) { p.remove(); }
      document.body.style.marginRight = '';
    });
    on(doc('gmbAI6MinBtn'), 'click', toggleMin);

    // Tabs
    var tabs = document.querySelectorAll('.g6Tab');
    for (var i = 0; i < tabs.length; i++) {
      (function(t) { on(t, 'click', function() { switchTab(t.getAttribute('data-tab')); }); })(tabs[i]);
    }

    on(doc('gmbAI6ScanBtn'), 'click', doScan);
    on(doc('gmbAI6AllBtn'),  'click', doAutoAll);
    on(doc('gmbAI6PrevBtn'), 'click', function() { doPage('prev'); });
    on(doc('gmbAI6NextBtn'), 'click', function() { doPage('next'); });

    on(doc('gmbAI6Tone'), 'change', function() {
      var v = doc('gmbAI6Tone').value;
      var sels = document.querySelectorAll('.g6CardTone');
      for (var i = 0; i < sels.length; i++) { sels[i].value = v; }
    });

    on(doc('gmbAI6EyeBtn'), 'click', function() {
      var inp = doc('gmbAI6Key');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
    on(doc('gmbAI6KeyLink'), 'click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://ai.google.dev/gemini-api/docs/api-key' });
    });
    on(doc('gmbAI6AddProfile'), 'click', addProfile);
    on(doc('gmbAI6SaveBtn'), 'click', doSave);
    on(doc('gmbAI6LogBtn'), 'click', function() {
      var log = doc('gmbAI6Log');
      var open = log.style.display !== 'none';
      log.style.display = open ? 'none' : 'block';
      doc('gmbAI6LogArr').innerHTML = open ? '&#9650;' : '&#9660;';
    });
  }

  function switchTab(name) {
    var panes = document.querySelectorAll('.g6Pane');
    for (var i = 0; i < panes.length; i++) { panes[i].style.display = 'none'; }
    var btns = document.querySelectorAll('.g6Tab');
    for (var j = 0; j < btns.length; j++) { btns[j].classList.remove('g6TabOn'); }
    var pane = doc('gmbAI6Tab' + name.charAt(0).toUpperCase() + name.slice(1));
    if (pane) { pane.style.display = ''; }
    var activeBtn = doc(PANEL_ID).querySelector('[data-tab="' + name + '"]');
    if (activeBtn) { activeBtn.classList.add('g6TabOn'); }
  }

  // ── Settings + Multi-Profile ─────────────────────────────────────

  // cfg.profiles = array of { id, label, bizName, bizType, city, services, seoKeywords, instructions }
  // Profile is auto-selected per review based on rev.biz containing profile.bizName

  function fillSettings() {
    if (cfg.geminiKey) { doc('gmbAI6Key').value     = cfg.geminiKey; }
    if (cfg.tone)      { doc('gmbAI6DefTone').value = cfg.tone; doc('gmbAI6Tone').value = cfg.tone; }
    if (!cfg.geminiKey){ doc('gmbAI6KeyWarn').style.display = ''; }
    // Ensure at least one default profile
    if (!cfg.profiles || cfg.profiles.length === 0) {
      cfg.profiles = [{
        id: 'p1', label: 'Default Business',
        bizName: cfg.bizName || '', bizType: cfg.bizType || '',
        city: cfg.city || '', services: cfg.services || '',
        seoKeywords: cfg.seoKeywords || '', instructions: cfg.instructions || ''
      }];
    }
    renderProfileList();
  }

  function renderProfileList() {
    var list = doc('gmbAI6ProfileList');
    if (!list) { return; }
    list.innerHTML = '';
    (cfg.profiles || []).forEach(function(p, idx) {
      var card = mk('div');
      card.className = 'g6ProfileCard';
      card.id = 'g6Profile_' + p.id;
      card.innerHTML =
        '<div class="g6ProfileCardHead">' +
          '<span class="g6ProfileLabel">' + esc(p.label || 'Profile ' + (idx+1)) + '</span>' +
          '<div class="g6ProfileCardBtns">' +
            '<button class="g6Btn g6BtnSm g6BtnGray g6ProfToggle" data-pid="' + p.id + '">&#9660; Edit</button>' +
            (idx > 0 ? '<button class="g6Btn g6BtnSm g6BtnDanger g6ProfDelete" data-pid="' + p.id + '">&#10005;</button>' : '') +
          '</div>' +
        '</div>' +
        '<div class="g6ProfileBody" id="g6ProfBody_' + p.id + '" style="display:none">' +
          '<div class="g6Field"><label class="g6FieldLbl">Profile Label</label>' +
            '<input type="text" class="g6ProfField" data-pid="' + p.id + '" data-key="label" value="' + esc(p.label||'') + '" placeholder="e.g. House of Salons F7"/>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">Business Name <span class="g6Hint">(must match review card heading)</span></label>' +
            '<input type="text" class="g6ProfField" data-pid="' + p.id + '" data-key="bizName" value="' + esc(p.bizName||'') + '" placeholder="e.g. House of Salons"/>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">Business Type</label>' +
            '<input type="text" class="g6ProfField" data-pid="' + p.id + '" data-key="bizType" value="' + esc(p.bizType||'') + '" placeholder="e.g. hair salon, spa, shoe store"/>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">City / Location</label>' +
            '<input type="text" class="g6ProfField" data-pid="' + p.id + '" data-key="city" value="' + esc(p.city||'') + '" placeholder="e.g. Islamabad"/>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">Services</label>' +
            '<textarea class="g6ProfField" data-pid="' + p.id + '" data-key="services" rows="2" placeholder="e.g. haircut, colour, facial">' + esc(p.services||'') + '</textarea>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">SEO Keywords</label>' +
            '<textarea class="g6ProfField" data-pid="' + p.id + '" data-key="seoKeywords" rows="2" placeholder="e.g. best salon Islamabad">' + esc(p.seoKeywords||'') + '</textarea>' +
          '</div>' +
          '<div class="g6Field"><label class="g6FieldLbl">Custom Instructions</label>' +
            '<textarea class="g6ProfField" data-pid="' + p.id + '" data-key="instructions" rows="2" placeholder="e.g. Always mention loyalty card.">' + esc(p.instructions||'') + '</textarea>' +
          '</div>' +
        '</div>';
      list.appendChild(card);

      // Toggle expand/collapse
      var toggleBtn = card.querySelector('.g6ProfToggle');
      on(toggleBtn, 'click', function() {
        var body = doc('g6ProfBody_' + p.id);
        var open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        toggleBtn.innerHTML = open ? '&#9660; Edit' : '&#9650; Close';
      });

      // Delete button
      var delBtn = card.querySelector('.g6ProfDelete');
      if (delBtn) {
        on(delBtn, 'click', function() {
          if (!confirm('Delete profile "' + (p.label||'Profile') + '"?')) { return; }
          cfg.profiles = cfg.profiles.filter(function(pr) { return pr.id !== p.id; });
          renderProfileList();
        });
      }

      // Live update on field change
      var fields = card.querySelectorAll('.g6ProfField');
      fields.forEach(function(f) {
        on(f, 'input', function() {
          var pid = f.getAttribute('data-pid');
          var key = f.getAttribute('data-key');
          var prof = cfg.profiles.find(function(pr) { return pr.id === pid; });
          if (prof) {
            prof[key] = f.value;
            // Update label shown in header live
            if (key === 'label') {
              var lbl = doc('g6Profile_' + pid) && doc('g6Profile_' + pid).querySelector('.g6ProfileLabel');
              if (lbl) { lbl.textContent = f.value || 'Profile'; }
            }
          }
        });
      });
    });
  }

  function addProfile() {
    if (!cfg.profiles) { cfg.profiles = []; }
    var newId = 'p' + Date.now();
    cfg.profiles.push({ id: newId, label: 'New Business', bizName: '', bizType: '', city: '', services: '', seoKeywords: '', instructions: '' });
    renderProfileList();
    // Auto-expand the new one
    setTimeout(function() {
      var body = doc('g6ProfBody_' + newId);
      var btn  = document.querySelector('.g6ProfToggle[data-pid="' + newId + '"]');
      if (body) { body.style.display = ''; }
      if (btn)  { btn.innerHTML = '&#9650; Close'; }
    }, 50);
  }

  // Find the best matching profile for a review based on its business label
  function getProfileForReview(rev) {
    if (!cfg.profiles || cfg.profiles.length === 0) { return fallbackProfile(); }
    var biz = (rev.biz || '').toLowerCase().trim();
    if (!biz) { return cfg.profiles[0]; }
    // Try exact contains match first
    for (var i = 0; i < cfg.profiles.length; i++) {
      var pn = (cfg.profiles[i].bizName || '').toLowerCase().trim();
      if (pn && (biz.indexOf(pn) !== -1 || pn.indexOf(biz) !== -1)) { return cfg.profiles[i]; }
    }
    // Try word-by-word match
    for (var j = 0; j < cfg.profiles.length; j++) {
      var pn2 = (cfg.profiles[j].bizName || '').toLowerCase();
      var words = pn2.split(/\s+/).filter(function(w) { return w.length > 3; });
      var matches = 0;
      for (var w = 0; w < words.length; w++) { if (biz.indexOf(words[w]) !== -1) { matches++; } }
      if (matches >= 1 && words.length > 0) { return cfg.profiles[j]; }
    }
    // Default to first profile
    return cfg.profiles[0];
  }

  function fallbackProfile() {
    return { bizName: cfg.bizName||'our business', bizType: cfg.bizType||'business', city: cfg.city||'', services: cfg.services||'', seoKeywords: cfg.seoKeywords||'', instructions: cfg.instructions||'' };
  }

  function doSave() {
    var key = (doc('gmbAI6Key').value || '').trim();
    cfg.geminiKey = key;
    cfg.tone      = doc('gmbAI6DefTone').value || 'friendly';
    // profiles are updated live, no need to re-read fields
    chrome.runtime.sendMessage({ action: 'SAVE', data: cfg }, function() {
      var msg  = doc('gmbAI6SaveMsg');
      var warn = doc('gmbAI6KeyWarn');
      if (msg)  { msg.style.display  = ''; setTimeout(function() { msg.style.display = 'none'; }, 2500); }
      if (warn) { warn.style.display = key ? 'none' : ''; }
      doc('gmbAI6Tone').value = cfg.tone;
      lg('Settings saved (' + (cfg.profiles||[]).length + ' profiles)');
    });
  }

  // ── Scan ─────────────────────────────────────────────────────────
  function doScan() {
    lg('Scanning page...');
    setStatus('Scanning...', 'loading');
    doc('gmbAI6ScanBtn').disabled = true;
    reviews = [];
    setTimeout(function() {
      reviews = scanPage();
      doc('gmbAI6ScanBtn').disabled = false;
      var pending = reviews.filter(function(r) { return !r.replied; });
      if (reviews.length === 0) {
        setStatus('No reviews found. Make sure you are on the Reviews tab.', 'warn');
        renderList([]);
        return;
      }
      var lazyCount = reviews.filter(function(r) { return r.isLazy; }).length;
      var extra = lazyCount > 0 ? ' (' + lazyCount + ' lazy thanks replies)' : '';
      setStatus(reviews.length + ' reviews — ' + pending.length + ' need replies' + extra, 'ok');
      doc('gmbAI6AllBtn').disabled = pending.length === 0;
      renderList(reviews);
      refreshPager();
      lg('Found ' + reviews.length + ' reviews, ' + pending.length + ' pending');
    }, 500);
  }

  // ── Scan DOM ─────────────────────────────────────────────────────
  function scanPage() {
    var found = [];
    var seen  = [];
    var allBtns = document.querySelectorAll('button, [role="button"]');

    // Pass 1: unreplied — has a "Reply" button
    for (var i = 0; i < allBtns.length; i++) {
      var btn = allBtns[i];
      if (inPanel(btn)) { continue; }
      var txt = (btn.textContent || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (txt.indexOf('reply') === -1) { continue; }
      if (txt.indexOf('edit') !== -1 || txt.indexOf('delete') !== -1 || txt.indexOf('report') !== -1) { continue; }
      var card = getCard(btn);
      if (!card || hasSeen(seen, card)) { continue; }
      seen.push(card);
      var data = extractReview(card, btn, false, false);
      if (data) { found.push(data); }
    }

    // Pass 2: already replied — has "Edit reply" button
    // But if reply is just "thanks / thanks sir" etc., treat as needing reply
    for (var j = 0; j < allBtns.length; j++) {
      var btnJ = allBtns[j];
      if (inPanel(btnJ)) { continue; }
      var txtJ = (btnJ.textContent || '').trim().toLowerCase();
      if (txtJ.indexOf('edit reply') === -1 && txtJ.indexOf('delete reply') === -1) { continue; }
      var cardJ = getCard(btnJ);
      if (!cardJ || hasSeen(seen, cardJ)) { continue; }
      seen.push(cardJ);
      var isLazy = checkLazyReply(cardJ);
      var dataJ  = extractReview(cardJ, btnJ, !isLazy, isLazy);
      if (dataJ) { found.push(dataJ); }
    }

    return found;
  }

  function getCard(el) {
    var node = el.parentElement;
    for (var i = 0; i < 16; i++) {
      if (!node || node === document.body) { return null; }
      if (isCardEl(node)) { return node; }
      node = node.parentElement;
    }
    return null;
  }

  function isCardEl(node) {
    if (!node || node.offsetHeight < 80 || node.offsetHeight > 1000 || node.offsetWidth < 200) { return false; }
    var html = node.innerHTML || '';
    return html.indexOf('star') !== -1 || !!node.querySelector('[aria-label*="star"], [aria-label*="Star"]');
  }

  // ── Extract review data ──────────────────────────────────────────
  function extractReview(card, replyBtn, replied, isLazy) {
    try {
      // ── Reviewer name ──────────────────────────────────────────
      var reviewer = '';
      // S1: img aria-label "Photo of NAME"
      var imgs = card.querySelectorAll('img[aria-label]');
      for (var i = 0; i < imgs.length; i++) {
        var m = (imgs[i].getAttribute('aria-label') || '').match(/photo of (.+)/i);
        if (m && m[1].trim().length > 1) { reviewer = m[1].trim(); break; }
      }
      // S2: aria-label that looks like a name (not on button/link, no action words)
      if (!reviewer) {
        var ACTION = /star|rating|reply|edit|delete|report|photo|flag|share|like|helpful|option|open|menu|more|less|review|google|map|location|\d/i;
        var arias = card.querySelectorAll('[aria-label]');
        for (var a = 0; a < arias.length; a++) {
          var nd = arias[a];
          var tg = (nd.tagName || '').toLowerCase();
          var rl = (nd.getAttribute('role') || '').toLowerCase();
          if (tg === 'button' || tg === 'a' || rl === 'button' || rl === 'menuitem') { continue; }
          var al = (nd.getAttribute('aria-label') || '').trim();
          if (al.length >= 2 && al.length <= 40 && !ACTION.test(al) &&
              /^[A-Za-z\u00C0-\u024F\u0600-\u06FF]/.test(al)) { reviewer = al; break; }
        }
      }
      // S3: Google Maps contributor link
      if (!reviewer) {
        var cl = card.querySelector('a[href*="maps/contrib"], a[href*="contributorId"]');
        if (cl) { reviewer = (cl.textContent || '').trim().split('\n')[0].trim(); }
      }
      // S4: heading elements
      if (!reviewer) {
        var hds = card.querySelectorAll('h1,h2,h3,[role="heading"]');
        for (var h = 0; h < hds.length; h++) {
          var ht = (hds[h].textContent || '').trim();
          if (ht.length >= 2 && ht.length <= 40 && hds[h].children.length === 0) { reviewer = ht; break; }
        }
      }
      // S5: first leaf span/div that looks like a name
      if (!reviewer) {
        var ACTION2 = /star|rating|ago|hour|day|week|month|year|reply|cancel|post|edit|delete|report|owner|response|google|map|flag|option|menu|open|close|\d/i;
        var leaves = card.querySelectorAll('span, div, p');
        for (var s = 0; s < leaves.length; s++) {
          var nd2 = leaves[s];
          if (inPanel(nd2) || nd2.children.length > 0) { continue; }
          if (nd2.closest('button,[role="button"],[role="menuitem"]')) { continue; }
          var t2 = (nd2.textContent || '').trim();
          if (t2.length >= 2 && t2.length <= 40 &&
              /^[A-Z\u00C0-\u024F\u0600-\u06FF]/.test(t2) && !ACTION2.test(t2)) {
            reviewer = t2; break;
          }
        }
      }
      if (!reviewer) { reviewer = 'Valued Customer'; }

      // ── Star rating ───────────────────────────────────────────
      var stars = 0;
      var starMatches = [];
      var ariaEls = card.querySelectorAll('[aria-label],[title]');
      for (var j = 0; j < ariaEls.length && !stars; j++) {
        if (inPanel(ariaEls[j])) { continue; }
        var lbl  = (ariaEls[j].getAttribute('aria-label') || ariaEls[j].getAttribute('title') || '').trim();
        var role = (ariaEls[j].getAttribute('role') || '').toLowerCase();
        var mR   = lbl.match(/rated\s*(\d(?:\.\d)?)/i) || lbl.match(/(\d(?:\.\d)?)\s*out\s*of\s*5/i);
        if (mR) { stars = Math.round(parseFloat(mR[1])); break; }
        var mS = lbl.match(/^(\d(?:\.\d)?)\s*stars?$/i);
        if (mS) {
          var v = Math.round(parseFloat(mS[1]));
          starMatches.push({ v: v, role: role });
          if (role === 'img') { stars = v; break; }
        }
      }
      if (!stars && starMatches.length > 0) {
        // Prefer role=img container; fallback: if all same value use that; else max
        var vals = {};
        for (var vi = 0; vi < starMatches.length; vi++) { vals[starMatches[vi].v] = 1; }
        var keys = Object.keys(vals);
        stars = keys.length === 1 ? parseInt(keys[0], 10) : 0;
        if (!stars) {
          for (var ki = 0; ki < keys.length; ki++) { if (parseInt(keys[ki],10) > stars) { stars = parseInt(keys[ki],10); } }
        }
      }
      // SVG fill colour fallback
      if (!stars) {
        var GOLD = /fbbc04|f4b400|ffab00|ffb300|ffd700|ffc107|f9ab00|fcba03/i;
        var GREY = /dadce0|bdc1c6|9aa0a6|e8eaed|cccccc|b0b0b0/i;
        var svgEls = card.querySelectorAll('svg,path,polygon,circle');
        var sf = 0, se = 0;
        for (var si = 0; si < svgEls.length && si < 50; si++) {
          if (inPanel(svgEls[si])) { continue; }
          var fc = (svgEls[si].getAttribute('fill') || '') + (svgEls[si].getAttribute('style') || '');
          if (GOLD.test(fc)) { sf++; }
          else if (GREY.test(fc)) { se++; }
        }
        if (sf >= 1 && sf <= 5 && sf + se <= 10) { stars = sf; }
      }
      // Material icon text fallback
      if (!stars) {
        var matF = 0, matE = 0;
        var matEls = card.querySelectorAll('i,span');
        for (var mi = 0; mi < matEls.length; mi++) {
          if (matEls[mi].children.length > 0 || inPanel(matEls[mi])) { continue; }
          var tc = (matEls[mi].textContent || '').trim();
          if (tc === 'star') { matF++; }
          else if (tc === 'star_border' || tc === 'star_outline') { matE++; }
        }
        if (matF + matE === 5) { stars = matF; }
      }

      // ── Review text ───────────────────────────────────────────
      var text      = '';
      var ratingOnly = false;

      // UI labels that must NEVER be treated as review content
      var UI_PHRASES = [
        'flag as inappropriate','flag as','inappropriate','report review',
        'report this','helpful','not helpful','see more','see less','translate',
        'read more','write a review','add photo','suggest an edit','send message',
        'edit info','claim this business','open now','closed now','directions',
        'call','website','save','share','follow','unfollow','overview','about',
        'open review options','review options'
      ];

      var spans = card.querySelectorAll('span, p, div');
      var longest = '';
      for (var k = 0; k < spans.length; k++) {
        var sp = spans[k];
        if (sp.children.length > 0 || inPanel(sp)) { continue; }
        if (sp.closest('button,[role="button"],[role="menuitem"],a,nav')) { continue; }
        var t = (sp.textContent || '').trim();

        // Detect rating-only markers
        if (t.indexOf("didn't write a review") !== -1 || t.indexOf('left just a rating') !== -1 ||
            t.indexOf('only left a rating')    !== -1 || t.indexOf('has left just a rating') !== -1 ||
            t.indexOf('The user didn')          !== -1) {
          ratingOnly = true; break;
        }

        if (t.length < 3 || /^\d+$/.test(t)) { continue; }
        if (/^\d+\s*(hour|day|week|month|year)/i.test(t)) { continue; }
        if (/^(a|an)\s+(hour|day|week|month|year)/i.test(t)) { continue; }
        // Single-word UI labels
        if (/^(reply|cancel|post|submit|edit|delete|report|more|less|share|like|next|prev|previous|show|hide|close|open|menu|options|photos?|reviews?|hours|about|add|update|call|save|follow|unfollow|view|load|overview|suggest|claim|directions|website|translate|flag)$/i.test(t)) { continue; }
        // UI phrase substrings
        var tl = t.toLowerCase();
        var skip = false;
        for (var up = 0; up < UI_PHRASES.length; up++) {
          if (tl.indexOf(UI_PHRASES[up]) !== -1) { skip = true; break; }
        }
        if (skip) { continue; }
        if (reviewer && tl === reviewer.toLowerCase()) { continue; }
        if (cfg.bizName && tl === cfg.bizName.toLowerCase()) { continue; }

        if (t.length > longest.length) { longest = t; }
      }
      text = ratingOnly ? '' : longest;

      // ── Date ──────────────────────────────────────────────────
      var date = '';
      for (var d = 0; d < spans.length; d++) {
        if (spans[d].children.length > 0) { continue; }
        var dt = (spans[d].textContent || '').trim();
        if (/^\d+\s*(hour|day|week|month|year)s?\s*ago$/i.test(dt) || /^just now$/i.test(dt)) {
          date = dt; break;
        }
      }

      // ── Business label ─────────────────────────────────────────
      var biz = '';
      var reviewerLC = (reviewer || '').toLowerCase();

      // Helper: check if a text snippet matches a saved profile bizName
      function matchesBizName(txt) {
        if (!cfg.profiles || !txt) { return ''; }
        var tl = txt.toLowerCase();
        var best = '', bestScore = 0;
        for (var pi = 0; pi < cfg.profiles.length; pi++) {
          var pbn = (cfg.profiles[pi].bizName || '').toLowerCase().trim();
          if (!pbn) { continue; }
          if (tl.indexOf(pbn) !== -1 && pbn.length > bestScore) {
            best = cfg.profiles[pi].bizName; bestScore = pbn.length;
          }
        }
        return best;
      }

      // S1: walk up ancestors, check preceding siblings at each level for a profile bizName
      var ancNode = card;
      for (var anc = 0; anc < 8 && !biz; anc++) {
        ancNode = ancNode.parentElement;
        if (!ancNode || ancNode === document.body) { break; }
        var children = ancNode.children;
        for (var ci = 0; ci < children.length && !biz; ci++) {
          if (children[ci] === card || children[ci].contains(card)) { break; }
          var ct = (children[ci].textContent || '').trim().split('\n')[0].trim().slice(0, 120);
          var m = matchesBizName(ct);
          if (m) { biz = m; }
        }
      }

      // S2: match any saved profile bizName found anywhere inside card text
      if (!biz) {
        var cardText = (card.textContent || '').toLowerCase();
        var bestLen2 = 0;
        if (cfg.profiles) {
          for (var pp = 0; pp < cfg.profiles.length; pp++) {
            var pbn2 = (cfg.profiles[pp].bizName || '').toLowerCase().trim();
            if (pbn2 && cardText.indexOf(pbn2) !== -1 && pbn2.length > bestLen2) {
              biz = cfg.profiles[pp].bizName; bestLen2 = pbn2.length;
            }
          }
        }
      }

      // S3: ancestor heading not equal to reviewer name
      if (!biz) {
        var ancNode2 = card.parentElement;
        for (var anc2 = 0; anc2 < 6 && !biz; anc2++) {
          if (!ancNode2 || ancNode2 === document.body) { break; }
          var hdgs2 = ancNode2.querySelectorAll('h1,h2,h3,h4,[role="heading"]');
          for (var hh = 0; hh < hdgs2.length && !biz; hh++) {
            if (hdgs2[hh].closest && hdgs2[hh].closest('#' + PANEL_ID)) { continue; }
            if (card.contains(hdgs2[hh])) { continue; }
            var ht = (hdgs2[hh].textContent || '').trim().split('\n')[0].trim();
            if (ht.length > 2 && ht.toLowerCase() !== reviewerLC) { biz = matchesBizName(ht) || ''; }
          }
          ancNode2 = ancNode2.parentElement;
        }
      }

      lg('Reviewer: "' + reviewer + '" | Stars: ' + stars + ' | Biz: "' + biz + '" | Text: "' + text.slice(0,40) + '"');

      return {
        id:        'r' + Math.random().toString(36).slice(2, 9),
        el:        card,
        reviewer:  reviewer,
        stars:     stars,
        text:      text,
        date:      date,
        biz:       biz,
        replied:   replied,
        isLazy:    isLazy || false,
        replyBtn:  replyBtn,
        generated: '',
        posted:    false
      };
    } catch (e) {
      lg('extractReview error: ' + e.message);
      return null;
    }
  }

  // ── Lazy reply check ─────────────────────────────────────────────
  function checkLazyReply(card) {
    var replyText = '';
    var allNodes  = card.querySelectorAll('span,p,div');
    var inSection = false;
    for (var i = 0; i < allNodes.length; i++) {
      var nd = allNodes[i];
      if (nd.children.length > 0) { continue; }
      var t = (nd.textContent || '').trim().toLowerCase();
      if (t.indexOf('response from the owner') !== -1 || t.indexOf('your reply') !== -1) { inSection = true; continue; }
      if (inSection && t.length > 1 && t.length < 200) { replyText = t; break; }
    }
    if (!replyText) {
      // fallback: find short text near edit reply button
      var editBtn = null;
      var btns = card.querySelectorAll('button,[role="button"]');
      for (var b = 0; b < btns.length; b++) {
        if ((btns[b].textContent || '').toLowerCase().indexOf('edit reply') !== -1) { editBtn = btns[b]; break; }
      }
      if (editBtn) {
        var par = editBtn.parentElement;
        for (var p = 0; p < 6; p++) {
          if (!par) { break; }
          var cands = par.querySelectorAll('span,p,div');
          for (var c = 0; c < cands.length; c++) {
            if (cands[c].children.length > 0) { continue; }
            var ct = (cands[c].textContent || '').trim().toLowerCase();
            if (ct.length > 1 && ct.length < 300 &&
                !/star|rating|reply|edit|delete|option|report|photo|map|google|owner/i.test(ct)) {
              replyText = ct; break;
            }
          }
          if (replyText) { break; }
          par = par.parentElement;
        }
      }
    }
    if (!replyText) { return false; }
    var clean = replyText.replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
    var LAZY = [
      /^thanks?$/, /^thanks?\s+sir$/, /^sir\s+thanks?$/, /^thanks?\s+please$/,
      /^please\s+thanks?$/, /^thanks?\s+you$/, /^thank\s+you\s+sir$/,
      /^sir\s+thank\s+you$/, /^thanks?\s+a?\s*lot$/, /^thanks?\s+very\s+much$/,
      /^much\s+thanks?$/, /^shukriya$/, /^shukria$/, /^ok\s+thanks?$/, /^thanks?\s+ok$/,
      /^ji\s+thanks?$/, /^thanks?\s+ji$/, /^boht\s+shukriya$/
    ];
    for (var lp = 0; lp < LAZY.length; lp++) { if (LAZY[lp].test(clean)) { return true; } }
    if (clean.length <= 20 && clean.indexOf('thank') === 0) { return true; }
    return false;
  }

  // ── Render list ──────────────────────────────────────────────────
  function renderList(list) {
    var cont = doc('gmbAI6List');
    if (!cont) { return; }
    cont.innerHTML = '';

    if (!list || list.length === 0) {
      cont.innerHTML = '<div class="g6Empty">No reviews found.<br>Make sure you are on the <strong>Reviews</strong> tab.</div>';
      return;
    }

    var tone    = (doc('gmbAI6Tone') || {}).value || cfg.tone || 'friendly';
    var pending = list.filter(function(r) { return !r.replied; }).length;
    var replied = list.length - pending;

    // Summary bar
    var bar = mk('div');
    bar.className = 'g6SummBar';
    bar.innerHTML =
      '<span class="g6SummPend">' + pending + ' pending</span>' +
      '<span class="g6SummDone">' + replied + ' replied</span>' +
      (pending > 1 ? '<button class="g6Btn g6BtnSm g6BtnBlue" id="gmbAI6GenAll">&#9889; Generate All</button>' : '');
    cont.appendChild(bar);
    if (pending > 1 && doc('gmbAI6GenAll')) { on(doc('gmbAI6GenAll'), 'click', doGenerateAll); }

    for (var i = 0; i < list.length; i++) { cont.appendChild(buildCard(list[i], tone)); }
  }

  function buildCard(rev, tone) {
    var wrap  = mk('div');
    wrap.id        = 'g6Card_' + rev.id;
    wrap.className = 'g6Card' + (rev.replied ? ' g6CardDone' : '');

    var init  = (rev.reviewer || 'U').charAt(0).toUpperCase();
    var stars = '\u2605'.repeat(rev.stars || 0) + '\u2606'.repeat(Math.max(0, 5 - (rev.stars || 0)));
    var snip  = rev.text
      ? esc(rev.text.slice(0, 110)) + (rev.text.length > 110 ? '&hellip;' : '')
      : '<em>Rating only &mdash; no written comment</em>';

    var tagCls  = rev.replied ? 'g6TagDone' : rev.isLazy ? 'g6TagLazy' : 'g6TagPend';
    var tagTxt  = rev.replied ? '&#10003; Replied' : rev.isLazy ? '&#9888; Lazy Reply' : 'Pending';

    var html =
      '<div class="g6CardHead">' +
        '<div class="g6Ava">' + esc(init) + '</div>' +
        '<div class="g6CardMeta">' +
          '<span class="g6Name">' + esc(rev.reviewer) + '</span>' +
          '<span class="g6Stars">' + stars + '</span>' +
          (rev.date ? '<span class="g6Date">' + esc(rev.date) + '</span>' : '') +
          (rev.biz  ? '<span class="g6Biz">'  + esc(rev.biz)  + '</span>' : '') +
        '</div>' +
        '<span class="g6Tag ' + tagCls + '">' + tagTxt + '</span>' +
      '</div>' +
      '<div class="g6CardText">' + snip + '</div>';

    if (!rev.replied) {
      html +=
        '<div class="g6CardCtrl">' +
          '<select class="g6CardTone" data-id="' + rev.id + '">' + toneOpts(tone) + '</select>' +
          '<button class="g6Btn g6BtnSm g6BtnBlue g6GenBtn" data-id="' + rev.id + '">&#10024; Generate</button>' +
        '</div>' +
        '<div class="g6CardProfile">' +
          '<span class="g6ProfileBadge" id="g6PBadge_' + rev.id + '">&#127970; ' + esc(getProfileForReview(rev).label || getProfileForReview(rev).bizName || 'Default') + '</span>' +
        '</div>' +
        '<div class="g6RespArea" id="g6Resp_' + rev.id + '" style="display:none">' +
          '<textarea class="g6TA" id="g6TA_' + rev.id + '" rows="3" placeholder="AI response..."></textarea>' +
          '<div class="g6RespBtns">' +
            '<button class="g6Btn g6BtnSm g6BtnGray g6RegenBtn" data-id="' + rev.id + '">&#8635; Regen</button>' +
            '<button class="g6Btn g6BtnSm g6BtnGreen g6PostBtn" data-id="' + rev.id + '">&#10003; Fill &amp; Post</button>' +
          '</div>' +
        '</div>' +
        '<div class="g6St" id="g6St_' + rev.id + '"></div>';
    } else {
      html += '<div class="g6St g6StOk">&#10003; Already replied</div>';
    }

    wrap.innerHTML = html;

    var genBtn   = wrap.querySelector('.g6GenBtn');
    var regenBtn = wrap.querySelector('.g6RegenBtn');
    var postBtn  = wrap.querySelector('.g6PostBtn');
    if (genBtn)   { on(genBtn,   'click', function() { doGenerate(genBtn.getAttribute('data-id')); }); }
    if (regenBtn) { on(regenBtn, 'click', function() { doGenerate(regenBtn.getAttribute('data-id')); }); }
    if (postBtn)  { on(postBtn,  'click', function() { doPost(postBtn.getAttribute('data-id')); }); }

    // Set tone to global
    var ts = wrap.querySelector('.g6CardTone');
    if (ts) { ts.value = (doc('gmbAI6Tone') || {}).value || tone; }

    return wrap;
  }

  function toneOpts(sel) {
    var opts = ['friendly','professional','concise','empathetic','enthusiastic'];
    var lbls = { friendly:'Friendly', professional:'Professional', concise:'Concise', empathetic:'Empathetic', enthusiastic:'Enthusiastic' };
    var h = '';
    for (var i = 0; i < opts.length; i++) {
      h += '<option value="' + opts[i] + '"' + (opts[i] === sel ? ' selected' : '') + '>' + lbls[opts[i]] + '</option>';
    }
    return h;
  }

  // ── Generate single ──────────────────────────────────────────────
  function doGenerate(id) {
    var rev = byId(id);
    if (!rev) { return; }
    if (!cfg.geminiKey) { setSt(id, 'No API key — go to Settings tab', 'error'); switchTab('settings'); return; }

    var cardEl  = doc('g6Card_' + id);
    var toneSel = cardEl && cardEl.querySelector('.g6CardTone');
    var tone    = (toneSel && toneSel.value) || cfg.tone || 'friendly';
    var genBtn  = cardEl && cardEl.querySelector('.g6GenBtn');
    var rgnBtn  = cardEl && cardEl.querySelector('.g6RegenBtn');

    setSt(id, 'Generating...', 'loading');
    if (genBtn)  { genBtn.disabled  = true;  genBtn.textContent  = '...'; }
    if (rgnBtn)  { rgnBtn.disabled  = true; }

    chrome.runtime.sendMessage({ action: 'GEMINI', key: cfg.geminiKey, prompt: buildPrompt(rev, tone) }, function(res) {
      if (genBtn)  { genBtn.disabled  = false; genBtn.innerHTML  = '&#10024; Generate'; }
      if (rgnBtn)  { rgnBtn.disabled  = false; }
      if (chrome.runtime.lastError || !res) { setSt(id, 'Extension error — reload page', 'error'); return; }
      if (!res.ok) {
        setSt(id, res.error, 'error');
        if ((res.error || '').toLowerCase().indexOf('key') !== -1) { switchTab('settings'); }
        return;
      }
      rev.generated = res.text;
      var ta   = doc('g6TA_'   + id);
      var resp = doc('g6Resp_' + id);
      if (ta)   { ta.value = res.text; }
      if (resp) { resp.style.display = ''; }
      setSt(id, '\u2713 Ready \u2014 edit if needed, then click Fill & Post', 'ok');
    });
  }

  // ── Generate all ─────────────────────────────────────────────────
  function doGenerateAll() {
    var pending = reviews.filter(function(r) { return !r.replied; });
    var i = 0;
    function next() {
      if (i >= pending.length) { return; }
      doGenerate(pending[i++].id);
      setTimeout(next, 1800);
    }
    next();
  }

  // ── Post single ──────────────────────────────────────────────────
  function doPost(id) {
    var rev = byId(id);
    if (!rev) { return; }
    var ta      = doc('g6TA_' + id);
    var text    = (ta && ta.value && ta.value.trim()) || rev.generated || '';
    var postBtn = doc('g6Card_' + id) && doc('g6Card_' + id).querySelector('.g6PostBtn');
    if (!text) { setSt(id, 'Generate a response first', 'error'); return; }

    setSt(id, 'Scrolling to review...', 'loading');
    if (postBtn) { postBtn.disabled = true; postBtn.textContent = '...'; }
    try { rev.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(e) {}

    setTimeout(function() {
      var nativeBtn = rev.replyBtn || findReplyBtnIn(rev.el);
      if (nativeBtn && !rev.isLazy) {
        nativeBtn.click();
        setSt(id, 'Opening reply box...', 'loading');
        setTimeout(function() { waitAndFill(rev, text, id, postBtn); }, 1000);
      } else {
        waitAndFill(rev, text, id, postBtn);
      }
    }, 500);
  }

  function findReplyBtnIn(el) {
    var btns = el.querySelectorAll('button,[role="button"]');
    for (var i = 0; i < btns.length; i++) {
      if (inPanel(btns[i])) { continue; }
      var t = (btns[i].textContent || '').trim().toLowerCase().replace(/\s+/g,' ');
      if ((t === 'reply' || t.indexOf('reply') !== -1) && t.indexOf('edit') === -1 && t.indexOf('delete') === -1) { return btns[i]; }
    }
    return null;
  }

  function waitAndFill(rev, text, id, postBtn) {
    var tries = 0;
    var iv = setInterval(function() {
      tries++;
      var ta = findVisibleTA(rev.el);
      if (ta) {
        clearInterval(iv);
        fillAndSubmit(ta, text, rev, id, postBtn);
      } else if (tries >= 20) {
        clearInterval(iv);
        setSt(id, 'Reply box not found. Click the Reply button on Google first, then try again.', 'error');
        if (postBtn) { postBtn.disabled = false; postBtn.innerHTML = '&#10003; Fill &amp; Post'; }
      }
    }, 300);
  }

  function findVisibleTA(cardEl) {
    var sources = [cardEl, document.body];
    for (var s = 0; s < sources.length; s++) {
      var tas = sources[s].querySelectorAll('textarea');
      for (var i = 0; i < tas.length; i++) {
        if (!inPanel(tas[i]) && tas[i].offsetParent !== null) { return tas[i]; }
      }
    }
    return null;
  }

  function fillAndSubmit(ta, text, rev, id, postBtn) {
    ta.focus();
    try {
      var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      if (setter && setter.set) { setter.set.call(ta, text); }
      else { ta.value = text; }
    } catch(e) { ta.value = text; }
    ta.dispatchEvent(new Event('input',  { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    ta.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    ta.dispatchEvent(new KeyboardEvent('keyup',   { bubbles: true }));

    setSt(id, 'Filled! Submitting...', 'loading');
    setTimeout(function() {
      var submitBtn = findSubmitNear(ta);
      if (submitBtn) {
        submitBtn.click();
        setTimeout(function() { markDone(rev, id, postBtn); }, 1000);
      } else {
        setSt(id, '\u2713 Filled! Click "Post reply" on Google to submit.', 'ok');
        if (postBtn) { postBtn.disabled = false; postBtn.innerHTML = '&#10003; Fill &amp; Post'; }
      }
    }, 400);
  }

  function findSubmitNear(ta) {
    var node = ta.parentElement;
    for (var i = 0; i < 10; i++) {
      if (!node) { break; }
      var btns = node.querySelectorAll('button,[role="button"]');
      for (var j = 0; j < btns.length; j++) {
        if (inPanel(btns[j])) { continue; }
        var t = (btns[j].textContent || '').trim().toLowerCase();
        if (t === 'post reply' || t === 'post' || t === 'submit' || t === 'send') { return btns[j]; }
      }
      node = node.parentElement;
    }
    return null;
  }

  function markDone(rev, id, postBtn) {
    rev.replied = true; rev.posted = true;
    setSt(id, '\u2713 Reply posted!', 'ok');
    if (postBtn) { postBtn.style.display = 'none'; }
    var cardEl = doc('g6Card_' + id);
    if (cardEl) {
      cardEl.classList.add('g6CardDone');
      var tag = cardEl.querySelector('.g6Tag');
      if (tag) { tag.className = 'g6Tag g6TagDone'; tag.innerHTML = '&#10003; Replied'; }
    }
    var rem = reviews.filter(function(r) { return !r.replied; }).length;
    setStatus(rem > 0 ? rem + ' replies pending' : 'All done!', rem > 0 ? 'loading' : 'ok');
  }

  // ── Auto reply all (with auto-pagination) ────────────────────────
  function doAutoAll() {
    var pending = reviews.filter(function(r) { return !r.replied; });
    if (pending.length === 0) { autoNextPage(); return; }
    if (!cfg.geminiKey) { setStatus('No API key — check Settings', 'error'); switchTab('settings'); return; }
    if (!confirm('Auto-reply to all ' + pending.length + ' pending reviews on this page, then continue to all pages?\n\nClick OK to start.')) { return; }

    stopAuto = false;
    var allBtn = doc('gmbAI6AllBtn');
    if (allBtn) { allBtn.innerHTML = '&#9632; Stop'; allBtn.onclick = function() { stopAuto = true; }; }
    runAutoPage(pending, allBtn);
  }

  function runAutoPage(pending, allBtn) {
    var i = 0;
    function next() {
      if (stopAuto) {
        setStatus('Stopped.', 'warn');
        if (allBtn) { allBtn.innerHTML = '&#9889; Reply All'; allBtn.onclick = doAutoAll; allBtn.disabled = false; }
        return;
      }
      if (i >= pending.length) {
        if (allBtn) { allBtn.innerHTML = '&#9889; Reply All'; allBtn.onclick = doAutoAll; allBtn.disabled = false; }
        setStatus('Page ' + pageNum + ' done. Checking for next page...', 'ok');
        setTimeout(autoNextPage, 1500);
        return;
      }
      var rev = pending[i++];
      setStatus('Page ' + pageNum + ' — ' + i + '/' + pending.length + ': ' + rev.reviewer, 'loading');
      doGenerate(rev.id);
      setTimeout(function() {
        if (rev.generated) {
          var ta = doc('g6TA_' + rev.id);
          if (ta) { ta.value = rev.generated; }
          doPost(rev.id);
          setTimeout(next, 3500);
        } else {
          lg('No response for ' + rev.reviewer + ' — skipping');
          setTimeout(next, 1000);
        }
      }, 4000);
    }
    next();
  }

  function autoNextPage() {
    if (stopAuto) { return; }
    var nextBtn = findPageBtn('next');
    if (!nextBtn || nextBtn.disabled) {
      lg('No next page — all done!');
      setStatus('All reviews replied across all pages!', 'ok');
      var allBtn = doc('gmbAI6AllBtn');
      if (allBtn) { allBtn.disabled = true; }
      return;
    }
    pageNum++;
    setStatus('Loading page ' + pageNum + '...', 'loading');
    lg('Moving to page ' + pageNum);
    nextBtn.click();
    setTimeout(function() {
      if (stopAuto) { return; }
      reviews = scanPage();
      var pending = reviews.filter(function(r) { return !r.replied; });
      lg('Page ' + pageNum + ': ' + reviews.length + ' reviews, ' + pending.length + ' pending');
      renderList(reviews);
      refreshPager();
      if (pending.length === 0) {
        setTimeout(autoNextPage, 1000);
      } else {
        var allBtn = doc('gmbAI6AllBtn');
        if (allBtn) { allBtn.innerHTML = '&#9632; Stop'; allBtn.onclick = function() { stopAuto = true; }; }
        runAutoPage(pending, allBtn);
      }
    }, 3000);
  }

  // ── Pagination ───────────────────────────────────────────────────
  function refreshPager() {
    var hasPrev = !!findPageBtn('prev');
    var hasNext = !!findPageBtn('next');
    var pager   = doc('gmbAI6Pager');
    if (!pager) { return; }
    pager.style.display = (hasPrev || hasNext) ? '' : 'none';
    var pb = doc('gmbAI6PrevBtn'), nb = doc('gmbAI6NextBtn'), lb = doc('gmbAI6PageLbl');
    if (pb) { pb.disabled = !hasPrev; }
    if (nb) { nb.disabled = !hasNext; }
    if (lb) { lb.textContent = 'Page ' + pageNum; }
  }

  function doPage(dir) {
    var btn = findPageBtn(dir);
    if (!btn) { return; }
    pageNum = dir === 'next' ? pageNum + 1 : Math.max(1, pageNum - 1);
    setStatus('Loading page ' + pageNum + '...', 'loading');
    btn.click();
    setTimeout(doScan, 2500);
  }

  function findPageBtn(dir) {
    var kw = dir === 'next' ? ['next','next page','newer'] : ['prev','previous','older'];
    var els = document.querySelectorAll('button,[role="button"],a,[aria-label]');
    for (var i = 0; i < els.length; i++) {
      if (inPanel(els[i])) { continue; }
      var txt = (els[i].textContent || '').trim().toLowerCase();
      var lbl = (els[i].getAttribute('aria-label') || '').toLowerCase();
      for (var k = 0; k < kw.length; k++) {
        if (txt === kw[k] || lbl.indexOf(kw[k]) !== -1) { return els[i]; }
      }
    }
    return null;
  }

  // ── Prompt builder ───────────────────────────────────────────────
  function buildPrompt(rev, tone) {
    var toneDesc  = TONES[tone] || TONES.friendly;
    var prof      = getProfileForReview(rev);
    var bizName   = prof.bizName     || cfg.bizName   || 'our business';
    var bizType   = prof.bizType     || cfg.bizType   || 'business';
    var city      = prof.city        || cfg.city      || '';
    var services  = prof.services    || cfg.services  || '';
    var seoKws    = prof.seoKeywords || cfg.seoKeywords || (bizName + (city ? ' ' + city : ''));
    var custom    = prof.instructions|| cfg.instructions || '';

    // Resolve stars
    var stars = rev.stars || 0;
    if (stars === 0 && rev.text && rev.text.trim().length >= 3) {
      // Guess from review text words
      var txt = rev.text.toLowerCase();
      var POS = ['good','great','excellent','amazing','awesome','best','love','perfect','wonderful','fantastic','outstanding','brilliant','superb','happy','satisfied','recommend','nice','lovely','mashallah','well done','khubsoorat','bohat acha','bahut acha'];
      var NEG = ['bad','worst','terrible','horrible','awful','poor','disappointing','disappointed','waste','rude','unprofessional','dirty','pathetic','ruined','useless','bura','ganda','worst'];
      var ps = 0, ns = 0;
      for (var pi = 0; pi < POS.length; pi++) { if (txt.indexOf(POS[pi]) !== -1) { ps++; } }
      for (var ni = 0; ni < NEG.length; ni++) { if (txt.indexOf(NEG[ni]) !== -1) { ns++; } }
      stars = ps > ns ? 5 : ns > ps ? 1 : 3;
      lg('Stars guessed from text: ' + stars);
    }
    // For rating-only (no text), if star extraction returned 0 we genuinely don't know.
    // Default to 3 (neutral) — safer than assuming positive. The AI will still write
    // a decent neutral reply. The user can always regenerate if the rating is wrong.
    if (stars === 0) { stars = 3; lg('Stars unknown — defaulting to neutral (3)'); }

    var isPos  = stars >= 4;
    var isMix  = stars === 3;
    var isNeg  = stars <= 2;

    var name      = (rev.reviewer && rev.reviewer !== 'Valued Customer') ? rev.reviewer : '';
    var firstName = name ? name.split(' ')[0] : '';
    var greeting  = firstName ? ('Dear ' + firstName + ',') : 'Dear Valued Guest,';

    var cityLine = city     ? ' in ' + city     : '';
    var servLine = services ? '\nServices offered: ' + services + '.' : '';
    var seoLine  = '\nSEO keywords (weave in 1 naturally, only if it fits): ' + seoKws + '.';

    var context =
      'You are the owner of ' + bizName + ' — a ' + bizType + cityLine + '.' +
      servLine + seoLine +
      '\nCRITICAL: NEVER mention star numbers or the word "stars". NEVER start with "Thank you for your review." NEVER use hollow phrases like "We are so thrilled!".';

    var instruction;
    if (!rev.text || rev.text.trim().length < 3) {
      // Rating only
      if (isPos) {
        instruction = stars === 5
          ? 'POSITIVE (no written comment). DO NOT apologise. Thank ' + (firstName || 'them') + ' warmly for choosing ' + bizName + '. Mention delivering the best ' + bizType + ' experience' + cityLine + ' is always the goal. Invite them back.'
          : 'POSITIVE 4-star (no written comment). DO NOT apologise. Thank ' + (firstName || 'them') + '. Mention you look forward to making their next visit a perfect experience.';
      } else if (isMix) {
        instruction = 'MIXED (no written comment). Thank them for visiting. Acknowledge feedback is always valued. Assure them you are always improving. Invite them back for a better experience.';
      } else {
        instruction = 'NEGATIVE (no written comment). Apologise sincerely. Say this is not the ' + bizName + ' standard. Ask them to contact you directly to resolve it.';
      }
    } else {
      if (isPos) {
        instruction = 'POSITIVE REVIEW (' + stars + '/5). Customer is happy. DO NOT apologise. DO NOT say sorry. Thank ' + (firstName || 'them') + ' and specifically echo what they praised: "' + rev.text.slice(0, 80) + '". Reinforce this is the standard at ' + bizName + '. Invite them back.';
      } else if (isMix) {
        instruction = 'MIXED REVIEW (' + stars + '/5). Thank ' + (firstName || 'the customer') + '. Acknowledge positives from "' + rev.text.slice(0, 80) + '". Address concerns calmly. Invite back.';
      } else {
        instruction = 'NEGATIVE REVIEW (' + stars + '/5). Apologise sincerely to ' + (firstName || 'the customer') + '. Address their specific issue: "' + rev.text.slice(0, 80) + '". Do not make excuses. Ask them to contact ' + bizName + ' directly to resolve it.';
      }
    }

    return context + '\n\nREVIEWER: ' + (firstName || 'customer') + '\nRATING: ' + stars + '/5\nREVIEW: ' + (rev.text || '(no text)') + '\n\nTASK: ' + instruction + '\n\nFORMAT: Exactly 1-2 sentences. Under 40 words. ' + toneDesc + ' tone. Begin with: ' + greeting + '\n' + (custom ? 'Extra instructions: ' + custom + '\n' : '') + 'Output ONLY the reply text. Nothing else.';
  }

  // ── Utilities ────────────────────────────────────────────────────
  function doc(id) { return document.getElementById(id); }
  function mk(tag) { return document.createElement(tag); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn); } }

  function inPanel(el) {
    if (!el) { return false; }
    var n = el;
    while (n) {
      if (n.id === PANEL_ID || n.id === 'gmbAI6FAB') { return true; }
      n = n.parentElement;
    }
    return false;
  }

  function hasSeen(arr, item) { for (var i = 0; i < arr.length; i++) { if (arr[i] === item) { return true; } } return false; }
  function byId(id) { for (var i = 0; i < reviews.length; i++) { if (reviews[i].id === id) { return reviews[i]; } } return null; }

  function setStatus(msg, type) {
    var el = doc('gmbAI6Status');
    if (el) { el.textContent = msg; el.className = 'g6Status ' + (type || ''); }
  }

  function setSt(id, msg, type) {
    var el = doc('g6St_' + id);
    if (!el) { return; }
    el.textContent = msg;
    el.className   = 'g6St ' + (type === 'ok' ? 'g6StOk' : type === 'error' ? 'g6StErr' : 'g6StLoad');
  }

  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function loadCfg(cb) {
    try {
      chrome.runtime.sendMessage({ action: 'LOAD' }, function(d) {
        if (chrome.runtime.lastError) { cb({}); return; }
        cb(d || {});
      });
    } catch(e) { cb({}); }
  }

  function lg(msg) {
    console.log('[GMB AI] ' + msg);
    logLines++;
    var badge = doc('gmbAI6LogBadge');
    if (badge) { badge.textContent = logLines; }
    var logEl = doc('gmbAI6Log');
    if (!logEl) { return; }
    var row = mk('div');
    row.className   = 'g6LogRow';
    var ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    row.textContent = ts + '  ' + msg;
    logEl.insertBefore(row, logEl.firstChild);
    while (logEl.children.length > 80) { logEl.removeChild(logEl.lastChild); }
  }

})();
