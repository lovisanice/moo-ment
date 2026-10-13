// 换算：这次的钱 ÷ 重要之物单价 = 几份
window.Moo = window.Moo || {};

(function () {
  // 数字按大小显示得好读：≥10 取整，1~10 一位小数，<1 两位有效数字
  function fmt(n) {
    if (!isFinite(n) || n <= 0) return '0';
    if (n >= 10) return Math.round(n).toLocaleString('zh-CN');
    if (n >= 1) return String(Math.round(n * 10) / 10);
    // 小于 1：保留两位有效数字，不用科学计数法
    const digits = Math.min(12, Math.max(2, 1 - Math.floor(Math.log10(n))));
    return Number(n.toFixed(digits)).toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
  }

  function money(n) {
    return '￥' + (Math.round(n * 100) / 100).toLocaleString('zh-CN');
  }

  function convert(amount, treasures) {
    return treasures
      .filter(t => t.price > 0)
      .map(t => ({ treasure: t, count: amount / t.price, text: fmt(amount / t.price) }));
  }

  Moo.convert = { fmt, money, convert };
})();
