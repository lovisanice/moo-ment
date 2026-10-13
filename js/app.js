// 入口：读数据、本地预览埋 mock、绑定 tab 和按钮
window.Moo = window.Moo || {};

(function () {
  const store = Moo.store;

  // 本地双击打开（file://）且没有数据时，埋几条 mock，让每个 tab 都有东西看
  function seedDemo() {
    const d = store.data;
    const [movie, tea] = d.treasures;
    d.savedTotal = 23;
    d.redirects[tea.id] = 15;
    d.redirects[movie.id] = 8;
    const now = Date.now();
    d.moments = [
      { id: store.uid(), kind: 'eat', what: '塔斯汀翅根桶', price: 17, why: '哭了一晚上，饿', mood: '吃上这顿才能睡着觉', ts: now - 864e5 },
      { id: store.uid(), kind: 'buy', what: '奶牛纹抓夹', price: 2.9, why: '好可爱', mood: '想要一个每天都能戴着的小东西', ts: now - 3 * 864e5 },
      { id: store.uid(), kind: 'eat', what: '麻辣烫', price: 32, why: '加班到八点', mood: '累，但是想对自己好一点', ts: now - 6 * 864e5 },
    ];
    store.save();
  }

  Moo.refreshAll = function () {
    Moo.savings.render();
    Moo.moments.render();
    Moo.flow.resetStage();
  };

  function bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === tab.dataset.page));
        // 壁纸跟着 tab 换
        const phone = document.getElementById('phone');
        phone.classList.toggle('on-moo', tab.dataset.page === 'page-moo');
        phone.classList.toggle('on-moments', tab.dataset.page === 'page-moments');
        document.documentElement.classList.toggle('on-moo', tab.dataset.page === 'page-moo');
        document.documentElement.classList.toggle('on-moments', tab.dataset.page === 'page-moments');
        document.getElementById('app').scrollTop = 0;
      });
    });
  }

  function init() {
    const empty = store.isEmpty();
    store.load();
    if (empty && (location.protocol === 'file:' || location.search.includes('demo'))) seedDemo();
    store.save();

    Moo.backup.daily();
    Moo.ui.bindMasks();
    bindTabs();

    document.querySelectorAll('[data-ask]').forEach(b => b.onclick = () => Moo.flow.ask(b.dataset.ask));
    document.getElementById('btn-treasures').onclick = () => Moo.treasures.open();
    document.getElementById('btn-backup').onclick = () => Moo.backup.open();

    Moo.refreshAll();
    Moo.splash.init();

    // 点一下顶栏上的牛，扭一扭
    const mascot = document.getElementById('mascot');
    mascot.addEventListener('click', () => {
      mascot.classList.remove('wiggle');
      void mascot.offsetWidth;
      mascot.classList.add('wiggle');
    });
    mascot.addEventListener('animationend', e => { if (e.animationName === 'mascot-wiggle') mascot.classList.remove('wiggle'); });

    // 离线缓存（本地双击打开时不注册）
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
