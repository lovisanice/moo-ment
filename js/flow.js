// 主流程：想吃/想买 → 计算中便签 → 换算卡片 → 不要了 / 依然要
window.Moo = window.Moo || {};

Moo.flow = {
  current: null, // { kind, what, price, why }

  // ① 弹窗：今天想吃/买什么？
  ask(kind) {
    const w = Moo.words.ask[kind];
    Moo.ui.openSheet(`
      <h2>${w.title}</h2>
      <label class="field"><span>${w.what}</span>
        <input id="a-what" maxlength="30" placeholder="${w.whatPh}"></label>
      <label class="field"><span>价格（元）</span>
        <input id="a-price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label>
      <label class="field"><span>${w.why}</span>
        <textarea id="a-why" maxlength="200" placeholder="${w.whyPh}"></textarea></label>
      <button class="capsule btn-main" id="a-go">Moo.</button>
    `, {
      onMount: sheet => {
        sheet.querySelector('#a-go').onclick = () => this.submit(kind);
      },
    });
  },

  submit(kind) {
    const what = document.getElementById('a-what').value.trim();
    const price = parseFloat(document.getElementById('a-price').value);
    const why = document.getElementById('a-why').value.trim();
    if (!what) return Moo.ui.toast('写一下是什么吧');
    if (!(price > 0)) return Moo.ui.toast('价格要大于 0 哦');

    this.current = { kind, what, price, why };
    Moo.ui.closeSheet();
    this.calculating();
  },

  // ② 屏幕正中一张白色朦胧的方圆卡片：思考牛 + 计算中…（这期间才去换算）
  calculating() {
    const phone = document.getElementById('phone');
    const mask = document.getElementById('card-mask');
    const card = document.createElement('div');
    card.className = 'calc-card';
    card.innerHTML = `<div class="calc-gif" style="background-image:url('${Moo.images.calc}')"></div><div class="calc-text">计算中…</div>`;
    phone.appendChild(card);
    document.getElementById('stage').innerHTML = '';
    requestAnimationFrame(() => { mask.classList.add('show'); card.classList.add('show'); });

    const rows = Moo.convert.convert(this.current.price, Moo.store.data.treasures);
    const mascot = document.getElementById('mascot');
    mascot.classList.add('busy');
    setTimeout(() => {
      mascot.classList.remove('busy');
      mask.classList.remove('show');
      card.classList.remove('show');
      setTimeout(() => card.remove(), 300);
      this.showResult(rows);
    }, 1600);
  },

  // ③ 换算卡片，一行一行冒出来
  showResult(rows) {
    const { esc } = Moo.ui;
    const { money } = Moo.convert;
    const c = this.current;
    const stage = document.getElementById('stage');

    const lines = rows.length
      ? rows.map((r, i) => `<div class="result-line" style="animation-delay:${0.15 + i * 0.22}s">
          <span>= <b>${r.text}</b> ${esc(r.treasure.unit)}<span class="item-name c-${r.treasure.color}">${esc(r.treasure.name)}</span></span>
          <span class="line-unit">${money(r.treasure.price)}/${esc(r.treasure.unit)}</span></div>`).join('')
      : '<div class="result-none">还没有重要之物，先去加几个吧</div>';

    stage.innerHTML = `
      <div class="result glass">
        <div class="result-head">一份 ${esc(c.what)} <span class="price">${money(c.price)}</span> =</div>
        <div class="result-lines">${lines}</div>
        <div class="decide" style="animation-delay:${0.3 + rows.length * 0.22}s">
          <button class="capsule btn-skip" id="d-skip">不要了</button>
          <button class="capsule btn-keep" id="d-keep">依然要</button>
        </div>
      </div>`;

    stage.querySelector('#d-skip').onclick = () => this.skip();
    stage.querySelector('#d-keep').onclick = () => this.keep();
  },

  resetStage() {
    document.getElementById('stage').innerHTML = '';
    this.current = null;
  },

  // ④a 不要了 → 祝贺卡片，顺便选一个重要之物存进去
  skip() {
    const c = this.current;
    const { data } = Moo.store;
    const { esc } = Moo.ui;
    const { money } = Moo.convert;
    let pick = null;

    const chips = data.treasures.map(t =>
      `<button class="chip" data-id="${t.id}">${esc(t.name)}</button>`).join('');

    Moo.ui.openCard(`
      <div class="pop-card-img" style="background-image:url('${Moo.images.skip}')"></div>
      <p class="pop-card-text">${esc(Moo.words.pick(Moo.words.skip))}</p>
      ${chips ? `<p class="redirect-title">把这 ${money(c.price)} 存给哪个重要之物？</p><div class="chips">${chips}</div>` : ''}
      <button class="capsule btn-main" id="c-ok">收下</button>
    `, card => {
      card.querySelectorAll('.chip').forEach(ch => ch.onclick = () => {
        const on = !ch.classList.contains('on');
        card.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
        if (on) ch.classList.add('on');
        pick = on ? ch.dataset.id : null;
      });
      card.querySelector('#c-ok').onclick = () => {
        data.savedTotal = Math.round((data.savedTotal + c.price) * 100) / 100;
        if (pick) data.redirects[pick] = (data.redirects[pick] || 0) + c.price;
        data.skips.push({ id: Moo.store.uid(), ...c, to: pick, ts: Date.now() });
        Moo.store.save();
        Moo.ui.closeCard();
        Moo.savings.render();
        this.resetStage();
      };
    });
  },

  // ④b 依然要 → 小牛趴在顶上：此刻还好吗？
  keep() {
    Moo.ui.openSheet(`
      <h2>此刻还好吗？</h2>
      <label class="field">
        <textarea id="k-mood" maxlength="300" placeholder="累了、委屈、开心、就是想要……都可以"></textarea></label>
      <button class="capsule btn-main" id="k-go">犒劳自己！</button>
    `, {
      cow: true,
      onMount: sheet => {
        sheet.querySelector('#k-go').onclick = () => this.treat();
      },
    });
  },

  treat() {
    const mood = document.getElementById('k-mood').value.trim();
    const { data } = Moo.store;
    data.moments.unshift({ id: Moo.store.uid(), ...this.current, mood, ts: Date.now() });
    Moo.store.save();
    Moo.ui.closeSheet();
    Moo.moments.render();

    Moo.ui.openCard(`
      <div class="pop-card-img" style="background-image:url('${Moo.images.keep}')"></div>
      <p class="pop-card-text">${Moo.ui.esc(Moo.words.pick(Moo.words.keep))}</p>
      <button class="capsule btn-main" id="c-ok">好</button>
    `, card => {
      card.querySelector('#c-ok').onclick = () => {
        Moo.ui.closeCard();
        this.resetStage();
      };
    });
  },
};
