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

  // 页面自己的确认小卡片（不用浏览器的 confirm，那个在手机上是系统弹窗）
  function ask(message, okText = '删除') {
    return new Promise(resolve => {
      const phone = $('#phone');
      const mask = document.createElement('div');
      mask.className = 'confirm-mask';
      const card = document.createElement('div');
      card.className = 'confirm-card';
      card.innerHTML = `
        <p class="confirm-text">${esc(message).replace(/\n/g, '<br>')}</p>
        <div class="confirm-btns">
          <button class="confirm-cancel">取消</button>
          <button class="confirm-ok">${esc(okText)}</button>
        </div>`;
      phone.append(mask, card);
      requestAnimationFrame(() => { mask.classList.add('show'); card.classList.add('show'); });
      const done = ok => {
        mask.classList.remove('show');
        card.classList.remove('show');
        setTimeout(() => { mask.remove(); card.remove(); }, 250);
        resolve(ok);
      };
      mask.onclick = () => done(false);
      card.querySelector('.confirm-cancel').onclick = () => done(false);
      card.querySelector('.confirm-ok').onclick = () => done(true);
    });
  }

  function bindMasks() {
    $('#sheet-mask').addEventListener('click', closeSheet);
    // 小卡片要点按钮关，不点遮罩关，免得误触
  }

  Moo.ui = { $, esc, ask, openSheet, closeSheet, openCard, closeCard, toast, bindMasks };
})();
