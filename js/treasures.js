// 重要之物：弹窗卡片里添加、编辑、删除（名称、价格、量词）
window.Moo = window.Moo || {};

Moo.treasures = {
  editingId: null,

  open() {
    this.editingId = null;
    Moo.ui.openSheet('<h2>重要之物</h2><div id="treasure-body"></div>');
    this.render();
  },

  render() {
    const { data } = Moo.store;
    const { esc } = Moo.ui;
    const { money } = Moo.convert;
    const body = document.getElementById('treasure-body');
    if (!body) return;
    const editing = data.treasures.find(t => t.id === this.editingId);

    const list = data.treasures.length
      ? data.treasures.map(t => `
          <div class="treasure-item">
            <span class="treasure-name c-${t.color}">${esc(t.name)}</span>
            <span class="treasure-price">${money(t.price)} / ${esc(t.unit)}</span>
            <button class="mini-btn" data-edit="${t.id}" aria-label="编辑"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg></button>
            <button class="mini-btn" data-del="${t.id}" aria-label="删除"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>`).join('')
      : '<div class="treasure-empty">还没有重要之物，加一个吧</div>';

    body.innerHTML = `
      <div class="treasure-list">${list}</div>
      <p class="form-title">${editing ? '修改「' + esc(editing.name) + '」' : '添加一个'}</p>
      <label class="field"><span>名称</span>
        <input id="t-name" maxlength="20" placeholder="比如：电影票" value="${esc(editing?.name || '')}"></label>
      <div class="field-row">
        <label class="field"><span>价格（元）</span>
          <input id="t-price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="45" value="${editing ? editing.price : ''}"></label>
        <label class="field"><span>量词</span>
          <input id="t-unit" maxlength="6" placeholder="张" value="${esc(editing?.unit || '')}"></label>
      </div>
      <button class="capsule btn-main" id="t-save">${editing ? '保存' : '添加'}</button>
      ${editing ? '<button class="capsule btn-ghost" id="t-cancel">取消修改</button>' : ''}
    `;

    body.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { this.editingId = b.dataset.edit; this.render(); });
    body.querySelectorAll('[data-del]').forEach(b => b.onclick = () => this.remove(b.dataset.del));
    body.querySelector('#t-save').onclick = () => this.save();
    const cancel = body.querySelector('#t-cancel');
    if (cancel) cancel.onclick = () => { this.editingId = null; this.render(); };
  },

  save() {
    const name = document.getElementById('t-name').value.trim();
    const price = parseFloat(document.getElementById('t-price').value);
    const unit = document.getElementById('t-unit').value.trim() || '个';
    if (!name) return Moo.ui.toast('写个名字吧');
    if (!(price > 0)) return Moo.ui.toast('价格要大于 0 哦');

    const { data } = Moo.store;
    const t = data.treasures.find(x => x.id === this.editingId);
    if (t) Object.assign(t, { name, price, unit });
    else data.treasures.push({ id: Moo.store.uid(), name, price, unit, color: Moo.store.nextColor() });

    Moo.store.save();
    this.editingId = null;
    this.render();
    Moo.savings.render();
  },

  async remove(id) {
    const { data } = Moo.store;
    const t = data.treasures.find(x => x.id === id);
    if (!t) return;
    const hasSaved = data.redirects[id] > 0;
    if (!await Moo.ui.ask(`删掉「${t.name}」吗？` + (hasSaved ? '\n存给它的代偿计数也会一起消失，总计节省不变。' : ''))) return;
    data.treasures = data.treasures.filter(x => x.id !== id);
    delete data.redirects[id];
    Moo.store.save();
    this.render();
    Moo.savings.render();
  },
};
