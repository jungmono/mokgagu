/* 공부방 「복습 퀴즈」 탭 — 수업 노트로 만든 문제(study/quiz.bin, 가족 암호로 잠김).
   새 문제는 tools/quiz_tool.py 로 보탠다.  MOKGAGU_QUIZ.mount(요소, 암호키) */
(function () {
  var K_QZ = 'mokgagu_quiz_v1', ROUND = 5;
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var cacheData = null;
  async function load(key) {
    if (cacheData) return cacheData;
    var buf = new Uint8Array(await fetch('study/quiz.bin', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('net'); return r.arrayBuffer(); }));
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12));
    return (cacheData = JSON.parse(new TextDecoder().decode(plain)));
  }
  function mount(el, key) {
    var DATA = null, ST = {}, scope = '', run = null;
    try { ST = JSON.parse(ls.get(K_QZ) || '{}') || {}; } catch (e) { ST = {}; }
    function save() { ls.set(K_QZ, JSON.stringify(ST)); }
    function pool() { return DATA.qs.filter(function (q) { return !scope || q.d === scope; }); }
    function wrongList() { return pool().filter(function (q) { var s = ST[q.id]; return s && s.last === 0; }); }
    function pick(n) {
      var P = pool().map(function (q) { var s = ST[q.id]; var w = !s ? 3 : s.last === 0 ? 6 : 1 / (1 + (s.streak || 0)); return { q: q, k: Math.random() / w }; });
      P.sort(function (a, b) { return a.k - b.k; });
      return P.slice(0, n).map(function (x) { return x.q; });
    }
    function head() { return '<div class="hd"><h2>복습 퀴즈</h2><p>수업 노트로 만든 문제로 배운 것을 다시 꺼내 봐요</p></div>'; }
    function home() {
      var all = DATA.qs, done = 0, right = 0, wr = 0;
      all.forEach(function (q) { var s = ST[q.id]; if (s) { done++; right += s.r || 0; wr += s.w || 0; } });
      var wrongAll = all.filter(function (q) { return ST[q.id] && ST[q.id].last === 0; }).length;
      var rate = (right + wr) ? Math.round(right / (right + wr) * 100) + '%' : '-';
      var sess = Object.keys(DATA.sessions).sort();
      var chips = '<button data-s="" class="' + (!scope ? 'on' : '') + '">전체<small>' + all.length + '</small></button>' + sess.filter(function (k) { return all.some(function (q) { return q.d === k; }); }).map(function (k) {
        return '<button data-s="' + k + '" class="' + (scope === k ? 'on' : '') + '">' + esc(DATA.sessions[k]) + '<small>' + all.filter(function (q) { return q.d === k; }).length + '</small></button>'; }).join('');
      var wl = wrongList().length;
      el.innerHTML = head() + '<div class="card"><div class="sum"><div><b>' + done + '<small style="font-size:13px;font-weight:500">/' + all.length + '</small></b><span>풀어 본 문제</span></div><div><b>' + rate + '</b><span>정답률</span></div><div><b>' + wrongAll + '</b><span>다시 볼 문제</span></div></div>' +
        '<p class="lab">어느 수업으로 풀까요</p><div class="chips" id="qz-chips">' + chips + '</div>' +
        '<button class="big" id="qz-go">' + ROUND + '문제 풀기</button><button class="big sub" id="qz-gw"' + (wl ? '' : ' disabled') + '>틀린 것만 다시 (' + wl + ')</button></div>' +
        '<div class="note">수업 노트에서 뽑은 참고용 문제예요. 노트에 물음표(?)가 있던 내용은 뺐어요.<br>푼 기록은 이 기기에만 저장돼요. <button id="qz-rs">기록 지우기</button></div>';
      el.querySelector('#qz-chips').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; scope = b.dataset.s; home(); };
      el.querySelector('#qz-go').onclick = function () { start(pick(ROUND)); };
      el.querySelector('#qz-gw').onclick = function () { if (wl) start(shuffle(wrongList()).slice(0, ROUND)); };
      el.querySelector('#qz-rs').onclick = function () { if (confirm('푼 기록을 모두 지울까요?')) { ST = {}; save(); home(); } };
    }
    function start(list) { if (!list.length) return; run = { L: list, i: 0, ok: 0, miss: [] }; ask(); }
    function ask() {
      var q = run.L[run.i], opts = shuffle(q.o.map(function (t, k) { return { t: t, c: k === 0 }; }));
      el.innerHTML = head() + '<div class="card"><div class="pg"><span>' + (run.i + 1) + ' / ' + run.L.length + '</span><span>맞힌 것 ' + run.ok + '</span></div><div class="bar"><i style="width:' + (run.i / run.L.length * 100) + '%"></i></div>' +
        '<span class="src">' + esc(q.s) + '</span><p class="q">' + esc(q.q) + '</p><div id="qz-opts">' + opts.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><span class="n">' + (k + 1) + '</span><span>' + esc(o.t) + '</span></button>'; }).join('') + '</div><div id="qz-ex"></div></div>';
      el.querySelector('#qz-opts').onclick = function (e) {
        var b = e.target.closest('.opt'); if (!b || b.disabled) return;
        var k = +b.dataset.k, good = opts[k].c;
        [].forEach.call(el.querySelectorAll('.opt'), function (x, n) { x.disabled = true; if (opts[n].c) x.classList.add('ok'); });
        if (!good) b.classList.add('no');
        var s = ST[q.id] || { r: 0, w: 0, streak: 0 };
        if (good) { s.r++; s.streak = (s.streak || 0) + 1; s.last = 1; run.ok++; } else { s.w++; s.streak = 0; s.last = 0; run.miss.push(q); }
        ST[q.id] = s; save();
        var last = run.i === run.L.length - 1;
        el.querySelector('#qz-ex').innerHTML = '<div class="ex' + (good ? '' : ' bad') + '"><b>' + (good ? '맞았어요' : '아쉬워요') + '</b>' + esc(q.e) + '</div><button class="big" id="qz-nx">' + (last ? '결과 보기' : '다음 문제') + '</button>';
        var nx = el.querySelector('#qz-nx'); nx.onclick = function () { if (last) finish(); else { run.i++; ask(); } };
        nx.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
    }
    function finish() {
      var n = run.L.length, msg = run.ok === n ? '모두 맞혔어요' : run.ok >= n * .6 ? '잘했어요' : '다시 보면 더 좋아져요';
      el.innerHTML = head() + '<div class="card"><div class="score"><b>' + run.ok + ' / ' + n + '</b><span>' + msg + '</span></div>' +
        (run.miss.length ? '<p class="lab">틀린 문제</p>' + run.miss.map(function (q) { return '<div class="miss"><b>' + esc(q.q) + '</b><span>정답: ' + esc(q.o[0]) + '</span>' + esc(q.e) + '</div>'; }).join('') : '') +
        (run.miss.length ? '<button class="big" id="qz-miss">방금 틀린 ' + run.miss.length + '문제만 다시</button>' : '') + '<button class="big' + (run.miss.length ? ' sub' : '') + '" id="qz-again">새 문제로 한 번 더</button><button class="big sub" id="qz-hm">처음으로</button></div>';
      var mb = el.querySelector('#qz-miss'); if (mb) mb.onclick = function () { start(shuffle(run.miss)); };
      el.querySelector('#qz-again').onclick = function () { start(pick(ROUND)); };
      el.querySelector('#qz-hm').onclick = home;
    }
    el.innerHTML = '<p style="text-align:center;color:#756e65;margin:30px 0">문제를 불러오는 중…</p>';
    load(key).then(function (d) { DATA = d; home(); }).catch(function (er) { el.innerHTML = '<p style="text-align:center;color:#8a2f22;margin:30px 0">' + (er && er.message === 'net' ? '인터넷 연결을 확인해 주세요.' : '문제를 열지 못했어요.') + '</p>'; });
  }
  window.MOKGAGU_QUIZ = { mount: mount };
})();
