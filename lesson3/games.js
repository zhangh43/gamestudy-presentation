(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const shuffle = values => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function feedback(id, message, state = '') {
    $(id).textContent = message;
    $(id).dataset.state = state;
  }

  // 近义关系只对应这里标明的常见词义，例句展示可替换的具体语境。
  const pairs = [
    {left: 'big', right: 'large', meaning: '大的（尺寸）', example: 'a big / large house（一座大房子）'},
    {left: 'small', right: 'little', meaning: '小的（尺寸）', example: 'a small / little village（一个小村庄）'},
    {left: 'happy', right: 'glad', meaning: '高兴的', example: 'I am happy / glad to see you.（见到你很高兴。）'},
    {left: 'fast', right: 'quick', meaning: '快的（速度）', example: 'a fast / quick runner（一位跑得快的选手）'}
  ];
  let selected = {left: null, right: null};
  const matched = new Set();
  function selectWord(side, index) {
    if (matched.has(index)) return;
    selected[side] = selected[side] === index ? null : index;
    if (selected.left !== null && selected.right !== null) {
      const left = pairs[selected.left], right = pairs[selected.right];
      if (selected.left === selected.right) {
        matched.add(selected.left);
        feedback('match-feedback', `${left.left} ↔ ${left.right}：${left.meaning}。${left.example}${matched.size === pairs.length ? ' 四组配对完成！不看卡片，你还能说出哪一组？' : ''}`, 'correct');
      } else {
        feedback('match-feedback', `${left.left} 是“${left.meaning}”，${right.right} 是“${right.meaning}”，这一组词义不同。重新选一对。`, 'error');
      }
      selected = {left: null, right: null};
    }
    document.querySelectorAll('.word').forEach(button => {
      const index = Number(button.dataset.index), done = matched.has(index);
      button.disabled = done;
      button.classList.toggle('matched', done);
      button.setAttribute('aria-pressed', String(selected[button.dataset.side] === index));
      button.textContent = `${pairs[index][button.dataset.side]}${done ? ' ✓' : ''}`;
    });
    $('match-progress').textContent = `已配对 ${matched.size} / ${pairs.length}`;
    if (matched.size === pairs.length) $('match-reset').focus({preventScroll: true});
  }
  function resetMatch() {
    matched.clear();
    selected = {left: null, right: null};
    ['left', 'right'].forEach(side => {
      const indices = side === 'left' ? pairs.map((_, i) => i) : shuffle(pairs.map((_, i) => i));
      $(`match-${side}`).replaceChildren(...indices.map(index => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'word';
        button.dataset.side = side; button.dataset.index = index;
        button.lang = 'en'; button.textContent = pairs[index][side];
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => selectWord(side, index));
        return button;
      }));
    });
    $('match-progress').textContent = '已配对 0 / 4';
    feedback('match-feedback', '试试 big 的近义词。先点左侧，再点右侧，也可以反过来。');
  }
  $('match-reset').addEventListener('click', resetMatch);
  resetMatch();

  const words = [
    {word: 'apple', meaning: '苹果'}, {word: 'book', meaning: '书'},
    {word: 'water', meaning: '水'}, {word: 'sun', meaning: '太阳'},
    {word: 'school', meaning: '学校'}, {word: 'friend', meaning: '朋友'},
    {word: 'green', meaning: '绿色的'}, {word: 'jump', meaning: '跳跃'}
  ];
  let state = 'idle', remaining = 30000, deadline = null;
  let score = 0, target = null, solved = false, questionQueue = [];
  const missed = new Set();
  function drawTime() { $('mole-time').textContent = `${Math.ceil(remaining / 1000)} 秒`; }
  function drawControls() {
    const running = state === 'running', paused = state === 'paused';
    $('mole-start').hidden = running || paused;
    $('mole-start').textContent = state === 'finished' ? '再挑战一次' : '开始挑战';
    $('mole-pause').hidden = !running && !paused;
    $('mole-pause').textContent = paused ? '继续' : '暂停';
    $('mole-next').hidden = !running || !solved;
    $('mole-grid').querySelectorAll('button').forEach(button => { button.disabled = !running || solved; });
  }
  function finish() {
    state = 'finished'; deadline = null; remaining = 0;
    drawTime(); drawControls();
    $('mole-question').textContent = `挑战结束！答对 ${score} 题`;
    const review = [...missed].map(index => `${words[index].word} = ${words[index].meaning}`).join('；');
    feedback('mole-feedback', review ? `错词复习：${review}。读一遍，再遮住英文回忆。` : `本轮没有错词记录。${score ? '试着不看选项，说出“朋友”和“学校”的英文。' : '先读懂词义，再开始一轮吧。'}`);
  }
  function tick() {
    if (state !== 'running') return;
    remaining = Math.max(0, deadline - Date.now());
    if (remaining === 0) finish();
    else drawTime();
  }
  function answer(index, button) {
    tick();
    if (state !== 'running' || solved) return;
    const chosen = words[index], correct = words[target];
    if (index !== target) {
      missed.add(target); missed.add(index);
      feedback('mole-feedback', `${chosen.word} 是“${chosen.meaning}”；要找的是“${correct.meaning}”。再试一次，答错不加分。`, 'error');
      return;
    }
    solved = true; score++;
    button.classList.add('hit');
    $('mole-score').textContent = `得分 ${score}`;
    feedback('mole-feedback', `答对了！${correct.word} = ${correct.meaning}。读一遍单词，再点“下一题”。`, 'correct');
    drawControls();
    $('mole-next').focus({preventScroll: true});
  }
  function nextQuestion() {
    if (!questionQueue.length) questionQueue = shuffle(words.map((_, index) => index));
    target = questionQueue.shift(); solved = false;
    const distractors = shuffle(words.map((_, i) => i).filter(i => i !== target)).slice(0, 2);
    $('mole-question').textContent = `找到：${words[target].meaning}`;
    $('mole-grid').replaceChildren(...shuffle([target, ...distractors]).map((index, position) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'mole'; button.dataset.word = words[index].word;
      const animal = document.createElement('span'); animal.className = 'animal'; animal.textContent = '🐹'; animal.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.textContent = words[index].word; label.lang = 'en';
      const key = document.createElement('small'); key.textContent = position + 1; key.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-label', `${position + 1}：${words[index].word}`);
      button.append(animal, label, key);
      button.addEventListener('click', () => answer(index, button));
      return button;
    }));
    feedback('mole-feedback', '先想一想，再打中符合中文提示的单词。');
    drawControls();
  }
  function pause() {
    tick();
    if (state !== 'running') return;
    state = 'paused'; deadline = null; drawControls();
  }
  function resetMole() {
    state = 'idle'; remaining = 30000; deadline = null; score = 0;
    target = null; solved = false; questionQueue = []; missed.clear();
    $('mole-score').textContent = '得分 0';
    $('mole-question').textContent = '准备好了吗？';
    $('mole-grid').replaceChildren(...[1, 2, 3].map(() => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'mole'; button.textContent = '？'; button.disabled = true;
      return button;
    }));
    feedback('mole-feedback', '点击“开始挑战”，让单词地鼠出现。');
    drawTime(); drawControls();
  }
  $('mole-start').addEventListener('click', () => {
    resetMole(); state = 'running'; deadline = Date.now() + remaining;
    nextQuestion();
  });
  $('mole-pause').addEventListener('click', () => {
    if (state === 'running') pause();
    else if (state === 'paused') { state = 'running'; deadline = Date.now() + remaining; drawControls(); }
  });
  $('mole-next').addEventListener('click', () => {
    tick();
    if (state === 'running' && solved) { nextQuestion(); $('mole-grid').firstElementChild.focus({preventScroll: true}); }
  });
  $('mole-reset').addEventListener('click', resetMole);
  document.addEventListener('lesson:slidechange', event => { if (event.detail.index !== 2) pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', pause);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat || event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (!/^[123]$/.test(event.key) || state !== 'running' || $('mole-grid').closest('.slide').hidden) return;
    event.preventDefault();
    $('mole-grid').children[Number(event.key) - 1]?.click();
  });
  setInterval(tick, 100);
  resetMole();
})();
