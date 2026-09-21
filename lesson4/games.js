(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function feedback(id, message, state = '') {
    $(id).textContent = message;
    $(id).dataset.state = state;
  }
  const fills = [
    {source: '《静夜思》· 唐 · 李白', first: '床前明月光，', before: '疑是地上', after: '。', answer: '霜', options: ['雪', '霜', '光'], hint: '想一想：诗人把月光误认成地上的什么？', explanation: '月光洒在床前，诗人疑心是地上的白霜。'},
    {source: '《登鹳雀楼》· 唐 · 王之涣', first: '欲穷千里目，', before: '更上一', after: '楼。', answer: '层', options: ['座', '重', '层'], hint: '想看得更远，就要登得更高。回忆原诗用的是哪个字。', explanation: '想要看得更远，就再登上一层楼。'},
    {source: '《悯农》（其二）· 唐 · 李绅', first: '谁知盘中餐，', before: '', after: '粒皆辛苦。', answer: '粒', options: ['粒', '颗', '滴'], hint: '原句用两个相同的字，强调每一粒粮食。', explanation: '每一粒粮食都来之不易，要珍惜劳动成果。'}
  ];
  let fillRound = 0, fillSolved = false;
  function drawFill(reveal = false) {
    const item = fills[fillRound];
    const first = document.createElement('span'); first.textContent = item.first;
    const blank = document.createElement('mark'); blank.textContent = reveal ? item.answer : '＿';
    blank.setAttribute('aria-label', reveal ? item.answer : '待填的字');
    $('fill-poem').replaceChildren(first, document.createElement('br'), document.createTextNode(item.before), blank, document.createTextNode(item.after));
  }
  function loadFill() {
    const item = fills[fillRound]; fillSolved = false;
    $('fill-progress').textContent = `第 ${fillRound + 1} / ${fills.length} 题`;
    $('fill-source').textContent = item.source;
    $('fill-next').hidden = true; drawFill();
    $('fill-answers').replaceChildren(...item.options.map(value => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'answer'; button.textContent = value;
      button.addEventListener('click', () => {
        if (fillSolved) return;
        if (value !== item.answer) {
          button.classList.add('wrong');
          feedback('fill-feedback', `“${value}”不是原句中的字。${item.hint}`, 'error');
          return;
        }
        fillSolved = true; drawFill(true);
        $('fill-answers').querySelectorAll('button').forEach(option => { option.disabled = true; option.classList.remove('wrong'); });
        button.classList.add('correct');
        const final = fillRound === fills.length - 1;
        $('fill-next').hidden = final;
        feedback('fill-feedback', `答对了！${item.explanation}${final ? ' 三题完成！把刚才的诗句完整读一遍。' : ''}`, 'correct');
        (final ? $('fill-reset') : $('fill-next')).focus({preventScroll: true});
      });
      return button;
    }));
    feedback('fill-feedback', '先读整句，再选择原诗中的字。');
  }
  $('fill-next').addEventListener('click', () => {
    if (!fillSolved || fillRound >= fills.length - 1) return;
    fillRound++; loadFill(); $('fill-answers').firstElementChild.focus({preventScroll: true});
  });
  $('fill-reset').addEventListener('click', () => { fillRound = 0; loadFill(); });
  loadFill();

  const poem = ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'];
  const chainRounds = [
    {options: ['夜来风雨声，', '花落知多少。', '处处闻啼鸟。'], hint: '从睡醒后的听觉想一想：四处传来了什么声音？', explanation: '睡醒后，听到四处传来鸟鸣。'},
    {options: ['夜来风雨声，', '春眠不觉晓，', '花落知多少。'], hint: '诗人接着回想昨夜：听到了什么？', explanation: '诗人由眼前的清晨，想到昨夜的风雨声。'},
    {options: ['处处闻啼鸟。', '花落知多少。', '春眠不觉晓，'], hint: '想起昨夜的风雨，诗人担心花儿怎么样了？', explanation: '从风雨想到落花，一首《春晓》接完了！一起读：醒来 → 闻鸟 → 忆风雨 → 惜落花。'}
  ];
  let chainRound = 0, chainSolved = false, lineCount = 1;
  function drawTrail() {
    $('chain-trail').replaceChildren(...poem.slice(0, lineCount).map(line => {
      const span = document.createElement('span'); span.textContent = line; return span;
    }));
    $('chain-progress').textContent = `已接 ${lineCount} / 4 句`;
  }
  function loadChain() {
    chainSolved = false;
    const round = chainRounds[chainRound];
    drawTrail(); $('chain-next').hidden = true;
    $('chain-instruction').textContent = '下一句是哪一句？';
    $('chain-answers').replaceChildren(...round.options.map(line => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'answer'; button.textContent = line;
      button.addEventListener('click', () => {
        if (chainSolved) return;
        if (line !== poem[chainRound + 1]) {
          button.classList.add('wrong');
          feedback('chain-feedback', `这句没有接对顺序。${round.hint}`, 'error');
          return;
        }
        chainSolved = true; lineCount++; drawTrail();
        $('chain-answers').querySelectorAll('button').forEach(option => { option.disabled = true; option.classList.remove('wrong'); });
        button.classList.add('correct');
        const final = chainRound === chainRounds.length - 1;
        $('chain-next').hidden = final;
        if (final) {
          $('chain-answers').replaceChildren();
          $('chain-instruction').textContent = '全诗接龙完成，试着遮住诗句背一遍。';
        }
        feedback('chain-feedback', `接对了！${round.explanation}`, 'correct');
        (final ? $('chain-reset') : $('chain-next')).focus({preventScroll: true});
      });
      return button;
    }));
    feedback('chain-feedback', '按《春晓》的原诗顺序接下一句。');
  }
  $('chain-next').addEventListener('click', () => {
    if (!chainSolved || chainRound >= chainRounds.length - 1) return;
    chainRound++; loadChain(); $('chain-answers').firstElementChild.focus({preventScroll: true});
  });
  $('chain-reset').addEventListener('click', () => { chainRound = 0; lineCount = 1; loadChain(); });
  loadChain();
})();
