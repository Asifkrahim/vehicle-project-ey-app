/* ==========================================================================
   VehicleCare+ — Mobile App JavaScript
   ========================================================================== */

(function () {
  'use strict';

  /* ── Ripple Effect ──────────────────────────────────────────────────────── */
  function addRipple(el) {
    el.addEventListener('pointerdown', function (e) {
      const rect = el.getBoundingClientRect();
      const r = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - r / 2;
      const y = e.clientY - rect.top  - r / 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${r}px;height:${r}px;left:${x}px;top:${y}px`;
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    });
  }

  document.querySelectorAll('.btn, .nav-item, .garage-card, .fab').forEach(addRipple);

  /* ── Scroll-Aware App Bar ───────────────────────────────────────────────── */
  const appBar = document.querySelector('.app-bar');
  if (appBar) {
    const mainEl = document.querySelector('.main-content');
    const scrollTarget = mainEl || window;
    const getScrollTop = () => mainEl ? mainEl.scrollTop : window.scrollY;
    scrollTarget.addEventListener('scroll', function () {
      appBar.classList.toggle('scrolled', getScrollTop() > 6);
    }, { passive: true });
  }

  /* ── User Avatar Menu (logout dropdown) ────────────────────────────────── */
  const avatar  = document.getElementById('userAvatar');
  const menu    = document.getElementById('avatarMenu');
  if (avatar && menu) {
    avatar.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      menu.classList.remove('open');
    });
  }

  /* ── Bottom Sheet System ────────────────────────────────────────────────── */
  const backdrop = document.getElementById('sheetBackdrop');

  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    backdrop && backdrop.classList.add('open');
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';

    // drag-to-dismiss
    setupDrag(sheet);
  }

  function closeSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    sheet.classList.remove('open');
    backdrop && backdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Reset FAB rotation if it was for this sheet
    if (id === 'addRecordSheet') {
      const fab = document.getElementById('addFab');
      if (fab) fab.classList.remove('sheet-open');
    }
  }

  function closeAllSheets() {
    document.querySelectorAll('.bottom-sheet.open').forEach(s => {
      s.classList.remove('open');
    });
    backdrop && backdrop.classList.remove('open');
    document.body.style.overflow = '';
    const fab = document.getElementById('addFab');
    if (fab) fab.classList.remove('sheet-open');
  }

  // Backdrop tap = close all
  if (backdrop) backdrop.addEventListener('click', closeAllSheets);

  // Sheet close buttons
  document.querySelectorAll('[data-close-sheet]').forEach(btn => {
    btn.addEventListener('click', function () {
      closeSheet(this.getAttribute('data-close-sheet'));
    });
  });

  // FAB → open Add Record sheet
  const addFab = document.getElementById('addFab');
  if (addFab) {
    addFab.addEventListener('click', function () {
      const isOpen = document.getElementById('addRecordSheet').classList.contains('open');
      if (isOpen) {
        closeSheet('addRecordSheet');
      } else {
        openSheet('addRecordSheet');
        addFab.classList.add('sheet-open');
      }
    });
    addRipple(addFab);
  }

  /* Drag-to-dismiss gesture */
  function setupDrag(sheet) {
    const handle = sheet.querySelector('.sheet-handle');
    if (!handle) return;
    let startY = 0, currentY = 0, dragging = false;

    function onStart(e) {
      startY = (e.touches ? e.touches[0] : e).clientY;
      dragging = true;
      sheet.style.transition = 'none';
    }
    function onMove(e) {
      if (!dragging) return;
      currentY = (e.touches ? e.touches[0] : e).clientY;
      const delta = Math.max(0, currentY - startY);
      sheet.style.transform = `translateY(${delta}px)`;
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      if (currentY - startY > 120) {
        closeSheet(sheet.id);
        sheet.style.transform = '';
      } else {
        sheet.style.transform = '';
      }
    }

    handle.addEventListener('touchstart', onStart, { passive: true });
    handle.addEventListener('touchmove',  onMove,  { passive: true });
    handle.addEventListener('touchend',   onEnd);
    handle.addEventListener('mousedown',  onStart);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',    onEnd);
  }

  /* ── Bottom Navigation Tab Switching ───────────────────────────────────── */
  const navItems   = document.querySelectorAll('.nav-item[data-tab]');
  const tabSections = document.querySelectorAll('.tab-section');

  function switchTab(targetTab) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === targetTab));
    tabSections.forEach(s => {
      const active = s.id === targetTab;
      s.classList.toggle('active', active);
    });

    // Trigger health bar animations when switching to health tab
    if (targetTab === 'healthTab') {
      animateHealthBars();
    }
  }

  navItems.forEach(item => {
    if (item.dataset.tab === 'chatTab') {
      item.addEventListener('click', () => openSheet('chatSheet'));
    } else {
      item.addEventListener('click', () => switchTab(item.dataset.tab));
    }
  });

  /* ── Garage Car Selection ───────────────────────────────────────────────── */
  function selectCar(el) {
    document.querySelectorAll('.garage-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const brand   = el.dataset.brand   || '';
    const model   = el.dataset.model   || '';
    const number  = el.dataset.number  || '';
    const label   = document.getElementById('vehicleBadge');
    if (label) label.textContent = `${brand} ${model}`;

    // Update health bars with transition
    setBar('oil',     el.dataset.oil,     el.dataset.oilMsg);
    setBar('brake',   el.dataset.brake,   el.dataset.brakeMsg);
    setBar('air',     el.dataset.air,     el.dataset.airMsg);
    setBar('coolant', el.dataset.coolant, el.dataset.coolantMsg);
  }

  function setBar(key, value, msg) {
    const pct  = parseInt(value) || 0;
    const bar  = document.getElementById(`${key}Bar`);
    const pctEl = document.getElementById(`${key}Pct`);
    const msgEl = document.getElementById(`${key}Msg`);

    if (bar) {
      // Force reflow for re-animation
      bar.style.width = '0%';
      bar.offsetWidth; // reflow
      bar.style.width = `${pct}%`;
      bar.style.boxShadow = getBarGlow(pct);
      bar.style.background = getBarColor(pct);
    }
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (msgEl) msgEl.textContent = msg || '--';
    if (pctEl) pctEl.style.color = getBarColor(pct);
  }

  function getBarColor(pct) {
    if (pct < 30) return 'var(--red)';
    if (pct < 60) return 'var(--orange)';
    return 'var(--gold)';
  }

  function getBarGlow(pct) {
    if (pct < 30) return '0 0 8px rgba(255,71,87,0.5)';
    if (pct < 60) return '0 0 8px rgba(255,165,2,0.5)';
    return '0 0 8px rgba(255,215,0,0.5)';
  }

  function animateHealthBars() {
    const firstActive = document.querySelector('.garage-card.active');
    if (firstActive) selectCar(firstActive);
  }

  // Garage card click handlers
  document.querySelectorAll('.garage-card').forEach(card => {
    card.addEventListener('click', function () {
      selectCar(this);
    });
    addRipple(card);
  });

  /* ── AI Chatbot ─────────────────────────────────────────────────────────── */
  const chatInput  = document.getElementById('chatInput');
  const chatBody   = document.getElementById('chatBody');
  const chatSend   = document.getElementById('chatSendBtn');

  function appendMsg(text, type) {
    if (!chatBody) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'typingIndicator';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    if (chatBody) chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function sendMsg() {
    if (!chatInput) return;
    const val = chatInput.value.trim();
    if (!val) return;
    appendMsg(val, 'user');
    chatInput.value = '';
    showTyping();

    fetch(`/chatbot-response/?message=${encodeURIComponent(val)}`)
      .then(r => r.json())
      .then(d => {
        hideTyping();
        appendMsg(d.response || 'No response.', 'bot');
      })
      .catch(() => {
        hideTyping();
        appendMsg('Connection error. Please try again.', 'bot');
      });
  }

  if (chatSend) chatSend.addEventListener('click', sendMsg);
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    });
  }

  // Nav chat button
  document.querySelectorAll('[data-open-chat]').forEach(btn => {
    btn.addEventListener('click', () => openSheet('chatSheet'));
  });

  /* ── Form Submit: Loading State ─────────────────────────────────────────── */
  document.querySelectorAll('form[data-loading]').forEach(form => {
    form.addEventListener('submit', function () {
      const btn = this.querySelector('.btn[type="submit"]');
      if (btn) btn.classList.add('loading');
    });
  });

  /* ── Custom Delete Confirmation Modal ───────────────────────────────────── */
  const confirmBackdrop = document.getElementById('confirmBackdrop');
  const confirmModal    = document.getElementById('confirmModal');
  const confirmOkBtn    = document.getElementById('confirmOk');
  const confirmCancelBtn = document.getElementById('confirmCancel');
  let _pendingDeleteForm = null;

  window.confirmDelete = function (btn) {
    _pendingDeleteForm = btn.closest('form');
    if (!_pendingDeleteForm) return;
    if (confirmBackdrop) confirmBackdrop.classList.add('open');
    if (confirmModal)    confirmModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeConfirmModal() {
    if (confirmBackdrop) confirmBackdrop.classList.remove('open');
    if (confirmModal)    confirmModal.classList.remove('open');
    document.body.style.overflow = '';
    _pendingDeleteForm = null;
  }

  if (confirmOkBtn) {
    confirmOkBtn.addEventListener('click', function () {
      if (_pendingDeleteForm) {
        // Animate card out
        const card = _pendingDeleteForm.closest('.record-card');
        if (card) {
          card.style.transition = 'opacity 0.25s, transform 0.25s';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => _pendingDeleteForm.submit(), 220);
        } else {
          _pendingDeleteForm.submit();
        }
      }
      closeConfirmModal();
    });
  }

  if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', closeConfirmModal);
  if (confirmBackdrop)  confirmBackdrop.addEventListener('click', closeConfirmModal);

  /* ── Password Toggle (auth pages) ──────────────────────────────────────── */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = document.getElementById(this.dataset.target);
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      this.textContent = isText ? '👁️' : '🙈';
    });
  });

  /* ── Password Strength (signup page) ───────────────────────────────────── */
  const passInput     = document.getElementById('signupPassword');
  const strengthBar   = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');
  const confirmInput  = document.getElementById('signupConfirmPassword');
  const matchInd      = document.getElementById('matchIndicator');

  if (passInput && strengthBar) {
    passInput.addEventListener('input', function () {
      const v = this.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;

      const colors  = ['', '#ff4757', '#ffa502', '#ffd700', '#00d26a'];
      const labels  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      strengthBar.style.width   = `${score * 25}%`;
      strengthBar.style.background = colors[score] || '';
      if (strengthLabel) {
        strengthLabel.textContent = score ? labels[score] : '';
        strengthLabel.style.color = colors[score] || '';
      }
    });
  }

  if (confirmInput && matchInd && passInput) {
    confirmInput.addEventListener('input', function () {
      if (!this.value) { matchInd.textContent = ''; return; }
      matchInd.textContent = this.value === passInput.value ? '✅' : '❌';
    });
  }

  /* ── Service Worker ─────────────────────────────────────────────────────── */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('VehicleCare+ SW registered.'))
      .catch(e => console.warn('SW failed:', e));
  }

  /* ── Init on DOMContentLoaded ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Activate first garage card + show health bars
    const firstCard = document.querySelector('.garage-card');
    if (firstCard) {
      firstCard.classList.add('active');
      selectCar(firstCard);
    }

    // Activate first tab
    const firstNav = document.querySelector('.nav-item[data-tab]');
    if (firstNav) switchTab(firstNav.dataset.tab);

    // Intersection observer for health bars (animate when visible)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) animateHealthBars(); });
      }, { threshold: 0.2 });
      const healthSection = document.getElementById('healthTab');
      if (healthSection) observer.observe(healthSection);
    }

    // Back button closes sheets
    window.addEventListener('popstate', closeAllSheets);
  });

})();
