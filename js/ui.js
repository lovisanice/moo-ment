// 通用：底部弹窗、小卡片、toast、转义
window.Moo = window.Moo || {};

(function () {
  const $ = sel => document.querySelector(sel);

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- 底部弹窗 ----
  function openSheet(html, { cow = false, onMount } = {}) {
    const sheet = $('#sheet');
    sheet.className = 'sheet' + (cow ? ' has-cow' : '');
    sheet.innerHTML = (cow ? '<div class="sheet-cow"></div>' : '')
      + '<button class="sheet-close" aria-label="关闭"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + html;
    sheet.querySelector('.sheet-close').onclick = closeSheet;
    requestAnimationFrame(() => {
      $('#sheet-mask').classList.add('show');
      sheet.classList.add('show');
    });
    if (onMount) onMount(sheet);
  }

  function closeSheet() {
    $('#sheet-mask').classList.remove('show');
    $('#sheet').classList.remove('show');
  }

  // ---- 小卡片 ----
  function openCard(html, onMount) {
    const card = $('#pop-card');
    card.innerHTML = html;
    $('#card-mask').classList.add('show');
    card.classList.add('show');
    if (onMount) onMount(card);
  }

  function closeCard() {
    $('#card-mask').classList.remove('show');
    $('#pop-card').classList.remove('show');
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    $('#phone').appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function bindMasks() {
    $('#sheet-mask').addEventListener('click', closeSheet);
    // 小卡片要点按钮关，不点遮罩关，免得误触
  }

  Moo.ui = { $, esc, openSheet, closeSheet, openCard, closeCard, toast, bindMasks };
})();
