// 数据全存在自己浏览器里（localStorage），谁打开就是谁的
window.Moo = window.Moo || {};

(function () {
  const KEY = 'moo-ment-data';

  // 新用户的预设重要之物，让人一眼看懂怎么用（都能删）
  const PRESET_TREASURES = [
    { name: '电影票', price: 45, unit: '张' },
    { name: '奶茶', price: 15, unit: '杯' },
    { name: '房子', price: 20000, unit: '平米' },
  ];

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function fresh() {
    return {
      version: 1,
      treasures: PRESET_TREASURES.map(t => ({ id: uid(), ...t })),
      savedTotal: 0,          // 「不要了」攒下的总钱数
      redirects: {},          // 代偿计数：{ 重要之物id: 存进去的钱 }
      skips: [],              // 每次「不要了」的记录
      moments: [],            // 每次「依然要」写下的瞬间
    };
  }

  let data = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : fresh();
    } catch (e) {
      data = fresh();
    }
    // 老数据缺字段时补上
    const base = fresh();
    for (const k of Object.keys(base)) if (data[k] === undefined) data[k] = base[k];
    data.treasures.forEach((t, i) => { if (t.color === undefined) t.color = i % 8; });
    return data;
  }

  // 新加的重要之物：挑一个还没人用的颜色，用完了就从头轮
  function nextColor() {
    const used = new Set(data.treasures.map(t => t.color));
    for (let i = 0; i < 8; i++) if (!used.has(i)) return i;
    return data.treasures.length % 8;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  Moo.store = {
    KEY,
    uid,
    nextColor,
    load,
    save,
    get data() { return data; },
    replace(next) {
      localStorage.setItem(KEY, JSON.stringify(next));
      load();
    },
    isEmpty() {
      return !localStorage.getItem(KEY);
    },
  };
})();
