// 每日自动备份：本地快照留 30 天 + 导出导入 JSON + 可选的自动上传
window.Moo = window.Moo || {};

(function () {
  const SNAP_KEY = 'moo-ment-backups';
  const UPLOAD_KEY = 'moo-ment-upload';  // { url, last }
  const KEEP_DAYS = 30;

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function snaps() {
    try { return JSON.parse(localStorage.getItem(SNAP_KEY)) || []; } catch (e) { return []; }
  }

  function uploadConf() {
    try { return JSON.parse(localStorage.getItem(UPLOAD_KEY)) || {}; } catch (e) { return {}; }
  }

  // 每天第一次打开时调用
  function daily() {
    const list = snaps();
    const day = today();
    if (!list.length || list[0].date !== day) {
      list.unshift({ date: day, data: Moo.store.data });
      localStorage.setItem(SNAP_KEY, JSON.stringify(list.slice(0, KEEP_DAYS)));
    }
    autoUpload(day);
  }

  async function autoUpload(day) {
    const conf = uploadConf();
    if (!conf.url || conf.last === day) return;
    try {
      const res = await fetch(conf.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: 'moo-ment', date: day, data: Moo.store.data }),
      });
      if (res.ok) {
        conf.last = day;
        localStorage.setItem(UPLOAD_KEY, JSON.stringify(conf));
      }
    } catch (e) { /* 没连上就明天再试 */ }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(Moo.store.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `moo-ment-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const next = JSON.parse(reader.result);
        if (!Array.isArray(next.treasures)) throw new Error('bad');
        if (!await Moo.ui.ask('用这份备份替换现在的数据吗？', '替换')) return;
        Moo.store.replace(next);
        Moo.refreshAll();
        Moo.ui.closeSheet();
        Moo.ui.toast('导入好啦');
      } catch (e) {
        Moo.ui.toast('这个文件读不懂哦');
      }
    };
    reader.readAsText(file);
  }

  async function restore(date) {
    const snap = snaps().find(s => s.date === date);
    if (!snap || !await Moo.ui.ask(`回到 ${date} 那天的数据吗？\n现在的数据会被替换。`, '回去')) return;
    Moo.store.replace(snap.data);
    Moo.refreshAll();
    Moo.ui.closeSheet();
    Moo.ui.toast(`回到 ${date} 啦`);
  }

  function open() {
    const { esc } = Moo.ui;
    const conf = uploadConf();
    const list = snaps();
    const snapHtml = list.length
      ? list.map(s => `<button class="chip" data-date="${s.date}">${s.date}</button>`).join('')
      : '<span class="treasure-empty">还没有快照</span>';

    Moo.ui.openSheet(`
      <h2>备份</h2>
      <div class="capsule-row">
        <button class="capsule" id="b-export">导出</button>
        <button class="capsule" id="b-import">导入</button>
      </div>
      <input type="file" id="b-file" accept="application/json,.json" hidden>
      <p class="form-title">最近 ${KEEP_DAYS} 天的快照</p>
      <div class="chips">${snapHtml}</div>
      <label class="field"><span>自动上传地址（可不填）</span>
        <input id="b-url" placeholder="https://..." value="${esc(conf.url || '')}"></label>
      <button class="capsule btn-main" id="b-save">保存</button>
    `, {
      onMount: sheet => {
        sheet.querySelector('#b-export').onclick = exportJSON;
        const file = sheet.querySelector('#b-file');
        sheet.querySelector('#b-import').onclick = () => file.click();
        file.onchange = () => file.files[0] && importJSON(file.files[0]);
        sheet.querySelectorAll('[data-date]').forEach(b => b.onclick = () => restore(b.dataset.date));
        sheet.querySelector('#b-save').onclick = () => {
          const url = sheet.querySelector('#b-url').value.trim();
          localStorage.setItem(UPLOAD_KEY, JSON.stringify({ url, last: null }));
          Moo.ui.closeSheet();
          Moo.ui.toast(url ? '存好了，今天就会传一份' : '存好了');
          if (url) autoUpload(today());
        };
      },
    });
  }

  Moo.backup = { daily, open };
})();
