// 开屏：两帧来回切，点一下小牛进入
window.Moo = window.Moo || {};

Moo.splash = {
  init() {
    const splash = document.getElementById('splash');
    const timer = setInterval(() => splash.classList.toggle('step'), 800);

    splash.addEventListener('click', () => {
      clearInterval(timer);
      splash.classList.add('leaving');
      setTimeout(() => splash.remove(), 460);
    }, { once: true });
  },
};
