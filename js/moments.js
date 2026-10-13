// Tab 2：「依然要」时写下的那些瞬间——一行一行的缩略，点开看整张卡片（照琥珀厅记忆）
window.Moo = window.Moo || {};

Moo.moments = {
  fmtDate(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  render() {
    const { data } = Moo.store;
    const { esc } = Moo.ui;
    const { money } = Moo.convert;

    document.getElementById('moments-lead').innerHTML = esc(Moo.words.momentsLead).replace(/\n/g, '<br>');

    const el = document.getElementById('moments');
    if (!data.moments.length) { el.innerHTML = ''; return; }

    // 按月分组：每组上面一行小灰字，行里不再放日期
    let html = '', month = '';
    for (const m of data.moments) {
      const d = new Date(m.ts);
      const ym = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (ym !== month) { month = ym; html += `<div class="moment-month">${ym}</div>`; }
      html += `
      <button class="glass moment-row" data-id="${m.id}">
        <span class="moment-kind ${m.kind}">${m.kind === 'eat' ? '吃了' : '买了'}</span>
        <span class="moment-what">${esc(m.what)}</span>
        <span class="moment-price">${money(m.price)}</span>
      </button>`;
    }
    el.innerHTML = html;

    el.querySelectorAll('[data-id]').forEach(b => b.onclick = () => this.open(b.dataset.id));
  },

  // 点开：整张卡片，心情在这里才看得到
  open(id) {
    const m = Moo.store.data.moments.find(x => x.id === id);
    if (!m) return;
    const { esc } = Moo.ui;
    const { money } = Moo.convert;
    const why = m.kind === 'eat' ? '为什么想吃' : '为什么想买';

    Moo.ui.openSheet(`
      <div class="m-what">${esc(m.what)}</div>
      <div class="m-meta">
        <span class="m-chip">${this.fmtDate(m.ts)}</span>
        <span class="m-chip m-chip-accent">${m.kind === 'eat' ? '吃了' : '买了'} ${money(m.price)}</span>
      </div>
      ${m.why ? `<div class="m-label">${why}</div><div class="m-quote">${esc(m.why)}</div>` : ''}
      ${m.mood ? `<div class="m-label">那一刻的心情</div><div class="m-quote m-quote-mood">${esc(m.mood)}</div>` : ''}
      <div class="m-footer">
        <button class="m-del" id="m-del">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg><span>删除</span>
        </button>
      </div>
    `, {
      onMount: sheet => {
        const btn = sheet.querySelector('#m-del');
        btn.onclick = () => {
          // 点第一下变成「确定删除？」，再点一下才删
          if (!btn.classList.contains('confirm')) {
            btn.classList.add('confirm');
            btn.querySelector('span').textContent = '确定删除？';
            return;
          }
          const { data } = Moo.store;
          data.moments = data.moments.filter(x => x.id !== id);
          Moo.store.save();
          Moo.ui.closeSheet();
          this.render();
        };
      },
    });
  },
};
