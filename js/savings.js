// 首页常驻：总计节省 + 重要之物一件一件（带代偿计数和进度）
window.Moo = window.Moo || {};

Moo.savings = {
  render() {
    const { data } = Moo.store;
    const { fmt, money } = Moo.convert;
    const { esc } = Moo.ui;

    document.getElementById('savings').innerHTML = `
      <div class="savings-label">总计节省</div>
      <div class="savings-amount">${money(data.savedTotal)}</div>`;

    // 进度条 = 存给它的钱凑够下一份的比例；已经凑够几份就写在右边
    document.getElementById('treasures').innerHTML = data.treasures.map(t => {
      const saved = data.redirects[t.id] || 0;
      const count = t.price > 0 ? saved / t.price : 0;
      const pct = count >= 1 && count % 1 === 0 ? 100 : (count % 1) * 100;
      return `
        <div class="treasure-card glass t-${t.color}">
          <div class="treasure-main">
            <div class="treasure-left">
              <div class="item-name c-${t.color}">${esc(t.name)}</div>
              <div class="treasure-unit">${money(t.price)} / ${esc(t.unit)}</div>
            </div>
            <div class="treasure-count">get了<b>${fmt(count)}</b>${esc(t.unit)}！</div>
          </div>
          <div class="treasure-bar"><span style="width:${pct.toFixed(1)}%"></span></div>
        </div>`;
    }).join('');
  },
};
