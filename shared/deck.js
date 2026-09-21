(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const slides = [...document.querySelectorAll('.slide')];
  let current = 0;
  function pageFromHash() {
    const value = Number(location.hash.slice(1));
    return Number.isSafeInteger(value) && value >= 1 ? value - 1 : 0;
  }
  function show(index, focus = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    slides[current].scrollTop = 0;
    document.dispatchEvent(new CustomEvent('lesson:slidechange', {detail: {index: current}}));
    $('counter').textContent = `${current + 1} / ${slides.length}`;
    $('progress-bar').style.width = `${(current + 1) / slides.length * 100}%`;
    $('prev').disabled = current === 0;
    $('next').disabled = current === slides.length - 1;
    $('nav-hint').style.color = current === slides.length - 1 ? '#b9c7d8' : '';
    try { history.replaceState(null, '', `#${current + 1}`); } catch { /* 翻页在文件模式下仍可使用。 */ }
    if (focus) slides[current].focus({preventScroll: true});
  }
  $('prev').addEventListener('click', () => show(current - 1));
  $('next').addEventListener('click', () => show(current + 1));
  window.addEventListener('hashchange', () => show(pageFromHash()));
  const setHelp = open => {
    $('help-panel').hidden = !open;
    $('help-button').setAttribute('aria-expanded', String(open));
  };
  $('help-button').addEventListener('click', () => setHelp($('help-panel').hidden));
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else $('presentation-status').textContent = '当前浏览器不支持网页全屏，可使用浏览器的全屏菜单。';
    } catch {
      $('presentation-status').textContent = '无法进入全屏，可使用浏览器的全屏菜单。';
    }
  }
  $('fullscreen').addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? '退出全屏' : '进入全屏';
    $('fullscreen').setAttribute('aria-label', label);
    $('fullscreen').title = `${label}（F）`;
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (event.key === 'Escape') { setHelp(false); return; }
    if (event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === ' ' && event.target.closest('button, a, summary')) return;
    const actions = {ArrowRight: () => show(current + 1), PageDown: () => show(current + 1), ' ': () => show(current + 1), ArrowLeft: () => show(current - 1), PageUp: () => show(current - 1), Home: () => show(0), End: () => show(slides.length - 1)};
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });
  let touchStart = null;
  $('deck').addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button, input, select, a, .game-panel')) { touchStart = null; return; }
    const touch = event.touches[0];
    touchStart = {x: touch.clientX, y: touch.clientY};
  }, {passive: true});
  $('deck').addEventListener('touchend', event => {
    if (!touchStart || event.touches.length || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x, dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  $('deck').addEventListener('touchcancel', () => { touchStart = null; }, {passive: true});

  // 制作计时不因临时翻页而中断；以时间戳计算，避免后台标签页计时漂移。
  const timer = $('work-timer');
  if (timer) {
    const initial = 24 * 60;
    let remaining = initial, deadline = null;
    function drawTimer() {
      $('timer-output').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
      timer.classList.toggle('done', remaining === 0);
    }
    function tick() {
      if (deadline === null) return;
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (remaining === 0) {
        deadline = null;
        $('timer-start').textContent = '再计时';
        $('presentation-status').textContent = '制作时间到，请准备展示答辩。';
      }
      drawTimer();
    }
    $('timer-start').addEventListener('click', () => {
      tick();
      if (deadline !== null) {
        deadline = null;
        $('timer-start').textContent = '继续';
      } else {
        if (remaining === 0) remaining = initial;
        deadline = Date.now() + remaining * 1000;
        $('timer-start').textContent = '暂停';
      }
      drawTimer();
    });
    $('timer-reset').addEventListener('click', () => {
      deadline = null; remaining = initial;
      $('timer-start').textContent = '开始';
      drawTimer();
    });
    setInterval(tick, 250);
    drawTimer();
  }
  show(pageFromHash(), false);
})();
