/* 좋아요(빨간 별) — 거믄·힌이 마음에 드는 기물에 별을 단다.
   - 누구세요?  : 처음 들어온 기기에서 가족 암호 + 거믄/힌을 한 번 고르면 그 기기가 기억한다.
                  「이 기기는 같이 써요」를 켜면 브라우저를 새로 열 때마다 다시 묻는다.
                  처음 화면 왼쪽 위 「거믄 힌」 표시와 떠 있는 창의 이름표를 누르면 언제든 바꾼다.
   - 별 모양    : 거믄 = 빨간 별, 힌 = 흰 바탕에 빨간 테두리 별. 둘 다 누르면 두 별이 나란히.
                  목록 사진 왼쪽 위(오른쪽 위는 기물 이야기 별 자리), 사진 창 안에도 별 단추.
   - 모아보기   : 오른쪽 아래 떠 있는 창 맨 위 「★ 좋아요」 → 거믄·힌·둘 다로 골라 보기.
   - 저장       : 기물 이야기와 같은 구글 시트(「좋아요」 탭). 가족 암호가 있는 기기에서만 보인다.
                  시트에 못 올린 별은 이 기기에 두었다가 다음에 다시 올린다.
   comments.js 가 이 파일을 불러온다. 가족 암호·거믄/힌 기억은 comments.js 와 같은 열쇠를 쓴다. */
(function () {
  if (window.MOKGAGU_LIKES) return;
  /* 수업 날짜(빠진 날·옮긴 날)는 classes.js 한 곳에서 */
  if (!window.MOKGAGU_CLASS && !document.querySelector('script[src^="classes.js"]')) { var cs = document.createElement('script'); cs.src = 'classes.js?v=20261019'; document.head.appendChild(cs); }
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var K_CODE = 'mokgagu_cm_code', K_WHO = 'mokgagu_cm_who', K_FAM = 'mokgagu_cm_fam';
  var K_BEOT = 'mokgagu_lk_beot', K_LIKES = 'mokgagu_lk_cache', K_PEND = 'mokgagu_lk_pending', K_SHARED = 'mokgagu_lk_shared', K_SKIP = 'mokgagu_lk_skip', S_WHO = 'mokgagu_lk_who_s';
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    json: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  };
  var ss = { get: function (k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  var FAMW = { '거믄': 1, '힌': 1 };
  var likes = ls.json(K_LIKES, []);       // [{cid, who, t}]
  var beot = ls.json(K_BEOT, {});        // 벗의 좋아요 {cid: 시각} — 이 기기에만, 거믄·힌 기록과 섞지 않는다
  var pend = ls.json(K_PEND, []);         // [{cid, who, on, t}] 시트에 아직 못 올린 것
  var serverOk = true;                    // 시트 스크립트가 좋아요를 알아듣는지
  function fam() { return ls.get(K_FAM, '') === '1' && !!ls.get(K_CODE, ''); }
  function shared() { return ls.get(K_SHARED, '') === '1'; }
  function me() {
    var w = shared() ? ss.get(S_WHO) : ls.get(K_WHO, '');
    if (w === '벗') return '벗';
    if (!fam()) return '';
    return FAMW[w] ? w : '';
  }
  function canStar() { return fam() || me() === '벗'; }
  function icon(w, on) { return w === '벗' ? star(on ? '벗' : '벗0') : star(on ? w : ''); }
  function setMe(w) { ls.set(K_WHO, w); ss.set(S_WHO, w); }

  /* ── 지금 상태: 시트 목록 + 이 기기의 아직 못 올린 것 ── */
  function state() {
    var m = {};
    likes.forEach(function (x) { if (FAMW[x.who]) (m[x.cid] = m[x.cid] || {})[x.who] = x.t || 1; });
    pend.forEach(function (p) { var o = m[p.cid] = m[p.cid] || {}; if (p.on) o[p.who] = p.t; else delete o[p.who]; });
    Object.keys(beot).forEach(function (cid) { (m[cid] = m[cid] || {})['벗'] = beot[cid]; });
    return m;
  }
  function isOn(cid, w) { var s = state()[cid]; return !!(s && s[w]); }
  function save() { ls.set(K_LIKES, JSON.stringify(likes)); ls.set(K_PEND, JSON.stringify(pend)); }

  function load() {
    if (!fam()) return Promise.resolve();
    return fetch(API, { method: 'POST', body: JSON.stringify({ action: 'likes', code: ls.get(K_CODE, '') }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { var good = j && j.ok && Array.isArray(j.list) && j.list.every(function (x) { return x && x.who && !('text' in x); });
        if (good) { serverOk = true; likes = j.list; save(); flush(); } else serverOk = false; paintAll(); })
      .catch(function () { paintAll(); });
  }
  function flush() {
    if (!pend.length || !fam()) return;
    var p = pend[0];
    post({ action: 'like', cid: p.cid, who: p.who, on: p.on }).then(function (ok) {
      if (!ok) return;
      pend.shift();
      likes = likes.filter(function (x) { return !(x.cid === p.cid && x.who === p.who); });
      if (p.on) likes.push({ cid: p.cid, who: p.who, t: p.t });
      save(); flush();
    });
  }
  function post(d) {
    d.code = ls.get(K_CODE, '');
    return fetch(API, { method: 'POST', body: JSON.stringify(d) }).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok) { serverOk = true; return true; } if (j && j.err === 'action') serverOk = false; return false; })
      .catch(function () { return false; });
  }
  function toggle(cid) {
    var w = me(); if (!w) { ask(); return; }
    var on = !isOn(cid, w), t = new Date().toISOString();
    if (w === '벗') {
      if (on) beot[cid] = t; else delete beot[cid];
      ls.set(K_BEOT, JSON.stringify(beot));
      document.querySelectorAll('[data-lk="' + cid.replace(/"/g, '\\"') + '"]').forEach(function (b) {
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
        b.innerHTML = b.classList.contains('lk-big') ? icon(w, on) + (on ? '좋아요 했어요' : '좋아요') : icon(w, on);
      });
      post({ action: 'like', cid: cid, who: '벗', on: on });
      paintAll(cid); toast(on ? '벗의 좋아요 — 이 기기에 담아 둘게요' : '좋아요를 거뒀어요'); return;
    }
    pend = pend.filter(function (p) { return !(p.cid === cid && p.who === w); });
    pend.push({ cid: cid, who: w, on: on, t: t }); save();
    // 누른 자리부터 바로 바꾼다 — 나머지(떠 있는 창·사진 창)는 곧이어 다시 그린다
    document.querySelectorAll('[data-lk="' + cid.replace(/"/g, '\\"') + '"]').forEach(function (b) {
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
      if (b.classList.contains('lk-big')) b.innerHTML = star(on ? w : '') + (on ? '좋아요 했어요' : '좋아요');
      else { b.innerHTML = star(on ? w : ''); b.classList.remove('lk-pop'); void b.offsetWidth; b.classList.add('lk-pop'); }
    });
    paintAll(cid);
    toast(on ? w + '의 좋아요 ★' : '좋아요를 거뒀어요');
    flush();
  }

  /* ── 모양 ── */
  var SP = 'M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';
  var RED = '#d0312d';
  function star(kind) {
    if (kind === '거믄') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + SP + '" fill="' + RED + '" stroke="' + RED + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    if (kind === '힌') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + SP + '" fill="#fff" stroke="' + RED + '" stroke-width="2.2" stroke-linejoin="round"/></svg>';
    if (kind === '벗' || kind === '벗0') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + BUB + '" fill="' + (kind === '벗' ? RED : 'none') + '" stroke="' + (kind === '벗' ? RED : '#a39c92') + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + SP + '" fill="none" stroke="#a39c92" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }
  var BUB = 'M5 4.5h14A2.5 2.5 0 0 1 21.5 7v8.5A2.5 2.5 0 0 1 19 18h-7.2l-4.6 3.6c-.4.3-.9 0-.9-.5V18H5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 5 4.5z';
  var css = document.createElement('style');
  css.textContent = [
    '.lk-st{position:absolute;top:4px;left:4px;z-index:5;display:inline-flex;align-items:center;gap:1px}',
    '.lk-btn{position:relative;width:22px;height:22px;border-radius:50%;border:0;padding:0;margin:0;background:rgba(255,255,255,.88);box-shadow:0 1px 3px rgba(0,0,0,.16);display:grid;place-items:center;cursor:pointer;transition:transform .12s}.lk-btn::before{content:"";position:absolute;inset:-8px}',
    '.lk-btn{width:26px!important;height:26px!important;background:rgba(255,255,255,.7)!important;border:0!important;outline:0!important;box-shadow:none!important}.lk-btn svg{width:15px!important;height:15px!important}',
    '.lk-big[data-lk]{width:34px;height:34px;padding:0;border-radius:50%;border:1px solid #b5aa98;font-size:0;gap:0;justify-content:center}.lk-big[data-lk] svg{width:18px;height:18px}.lk-big[data-lk].on{border-color:#b5aa98}',
    '.lk-btn:hover{transform:scale(1.08)}.lk-btn:active{transform:scale(.92)}.lk-btn svg{width:14px;height:14px;display:block}',
    ".lk-btn.on{box-shadow:none}",
    '.lk-other{display:inline-flex;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));pointer-events:none}.lk-other svg{width:13px;height:13px;display:block}',
    '.lk-pop{animation:lkpop .35s ease}@keyframes lkpop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}',
    '#rv .rv-it .lk-st{top:1px;left:1px}#rv .rv-it .lk-btn{display:none}#rv .rv-it .lk-other svg{width:12px;height:12px}',
    '.lk-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 0;padding:8px 0;border-top:1px solid #e5e1da;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}',
    '.lk-bar+.cm{margin-top:0;padding-top:8px}',
    '.lk-big{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:14.5px;font-weight:700;color:#1d1b18;background:#fff;border:1.5px solid #d9d4cc;border-radius:999px;padding:7px 15px;cursor:pointer}',
    '.lk-big.on{border-color:' + RED + ';color:' + RED + '}.lk-big svg{width:19px;height:19px}',
    '.lk-askq{font:inherit;font-size:13.5px;font-weight:700;color:#1d1b18;background:#fbf6e9;border:1.5px solid #e7d9b4;border-radius:999px;padding:7px 13px;cursor:pointer}.lk-askq:hover{background:#f5ecd4}',
    '.lk-qf{margin:0 0 10px;padding:12px;border:1px solid #e7d9b4;background:#fdfaf2;border-radius:12px;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}.lk-qh{font-size:13px;color:#6b5a2e;margin-bottom:6px}',
    '.lk-qf textarea{width:100%;box-sizing:border-box;min-height:70px;font:inherit;font-size:14px;line-height:1.6;border:1px solid #ddd2b8;border-radius:8px;padding:8px 10px;resize:vertical}',
    '.lk-qr{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin-top:6px}.lk-qr a{margin-right:auto;font-size:12.5px;color:#6b665e}.lk-qr button{font:inherit;font-size:13.5px;border-radius:8px;padding:6px 12px;cursor:pointer;border:1px solid #d9d4cc;background:#fff}.lk-qr .lk-qgo{background:#1d1b18;color:#fff;border-color:#1d1b18;font-weight:700}',
    '.lk-who{font-size:13px;color:#6b665e;display:inline-flex;align-items:center;gap:4px}.lk-who svg{width:15px;height:15px}',
    /* 떠 있는 창 맨 위 상자 */
    '#lk-box{background:#fff;border:1px solid #e3ded6;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.14);padding:5px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;width:60px;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}',
    '#lk-box .lk-me{display:flex;border:0;background:none;padding:0;cursor:pointer;font:inherit}',
    '#lk-box .lk-me span{font-size:10px;font-weight:900;padding:1px 3px;border:1.5px solid #111;line-height:1.25;opacity:.25}',
    '#lk-box .lk-me span.b{background:#fff;color:#6b665e;border-style:dashed;border-color:#a39c92}#lk-box .lk-me span.g{background:#111;color:#fff}#lk-box .lk-me span.h{background:#fff;color:#111}#lk-box .lk-me span.cur{opacity:1}',
    '#lk-box .lk-open{border:0;background:#fdf1f0;border-radius:9px;width:100%;padding:6px 2px 5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;color:' + RED + ';font:inherit;font-size:11px;font-weight:800}',
    '#lk-box .lk-open svg{width:18px;height:18px}#lk-box .lk-open b{font-size:11px}',
    '#lk-box .lk-hint{font-size:12px;color:#8a837a;text-align:center;line-height:1.3;border:0;background:none;cursor:pointer;padding:0;font:inherit;font-size:10.5px}#lk-box .lk-hint svg{width:24px;height:24px}',
    '@media (max-width:720px){#lk-box{width:56px;padding:5px 3px}#lk-box .lk-me span{font-size:9.5px;padding:1px 3px}#lk-box .lk-open{font-size:9.5px}}',
    /* 누구세요? · 모아보기 창 */
    '#lk-who{border:0;border-radius:16px;padding:0;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;color:#1d1b18}',
    '#lk-who::backdrop{background:rgba(20,18,15,.55)}',
    '#lk-who{width:min(420px,92vw);text-align:center;padding:26px 22px 20px}',
    '#lk-who h2{margin:0 0 6px;font-size:22px;font-weight:900}#lk-who p{margin:0 0 14px;color:#6b665e;font-size:14px;line-height:1.6}',
    '#lk-who .lk-err{color:#8a2f22;font-size:13px;min-height:18px;margin:0 0 6px}',
    '#lk-who .lk-code{font:inherit;font-size:16px;width:180px;padding:9px 14px;border:1.5px solid #111;border-radius:10px;text-align:center;margin:0 0 12px}',
    '#lk-who{width:min(460px,94vw);box-sizing:border-box;padding:24px 16px 18px}#lk-who *{box-sizing:border-box}#lk-who .lk-pick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:6px 0 12px}',
    '#lk-who .lk-pick button{font:inherit;cursor:pointer;border-radius:14px;padding:16px 6px 12px;display:flex;flex-direction:column;align-items:center;gap:6px;border:2px solid #111;background:#fff;color:#111;min-height:118px;justify-content:center}',
    '#lk-who .lk-pick button.bt{border:2px dashed #a39c92;color:#4a463f}#lk-who .lk-pick button.sel{box-shadow:0 0 0 3px #fff,0 0 0 5px ' + RED + '}',
    '#lk-who .lk-step{margin:0 0 12px;padding:12px;border-radius:12px;background:#faf8f5;text-align:left}#lk-who .lk-st-t{font-size:13.5px;color:#4a463f;margin-bottom:8px;line-height:1.5}',
    '#lk-who .lk-row{display:flex;gap:8px}#lk-who .lk-row .lk-code{flex:1;width:auto;margin:0}#lk-who .lk-go{font:inherit;font-weight:800;border:0;border-radius:10px;background:#111;color:#fff;padding:0 16px;cursor:pointer}',
    '#lk-who .lk-step .lk-err{margin:6px 0 0;min-height:0}',
    '#lk-who .lk-pick b{font-size:25px;font-weight:900;letter-spacing:.05em}#lk-who .lk-pick small{font-size:12px;opacity:.8}#lk-who .lk-pick svg{width:28px;height:28px}',
    '#lk-who label{font-size:13px;color:#6b665e;display:flex;gap:6px;justify-content:center;align-items:center}',
    '#lk-who .lk-skip{margin-top:10px;font:inherit;font-size:13px;color:#8a837a;background:none;border:0;text-decoration:underline;cursor:pointer}',
    '#lk-col{position:fixed;inset:0;z-index:1500;background:rgba(20,18,15,.55);display:none;align-items:center;justify-content:center;padding:3vh 3vw;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;color:#1d1b18}',
    '#lk-col.on{display:flex}',
    '#lk-col .lc-panel{width:min(980px,100%);max-height:94vh;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden}',
    'html.lk-lock,html.lk-lock body{overflow:hidden!important}',
    'html.lk-lock body>*:not(#lk-col):not(script):not(style){visibility:hidden!important}html.lk-lock #lk-col{background:#2b2925}',
    '#lk-col .lc-hd{flex:none;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #e5e1da;background:#fff}',
    '#lk-col h2{margin:0;font-size:20px;font-weight:900;display:flex;align-items:center;gap:6px;color:#1d1b18}#lk-col h2 svg{width:22px;height:22px}',
    '#lk-col .lc-chips{display:flex;gap:6px;flex-wrap:wrap}',
    '#lk-col .lc-chips button{font:inherit;font-size:13px;border:1px solid #d9d4cc;background:#fff;border-radius:999px;padding:5px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;color:#1d1b18}#lk-col .lc-chips svg{width:14px;height:14px}',
    '#lk-col .lc-chips button.on{background:#1d1b18;color:#fff;border-color:#1d1b18}',
    '#lk-col .lc-x{margin-left:auto;font:inherit;border:1px solid #d9d4cc;background:#fff;border-radius:8px;padding:5px 12px;cursor:pointer}',
    '#lk-col .lc-body{flex:1 1 auto;min-height:0;padding:16px 18px 24px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y}',
    '#lk-col .lc-x{font-size:15px;padding:7px 16px}',
    '@media (max-width:720px){#lk-col{padding:0;align-items:flex-end}#lk-col .lc-panel{max-height:88vh;border-radius:16px 16px 0 0}#lk-col .lc-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px}#lk-col h2{font-size:17px}}',
    '#lk-col .lc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}',
    '#lk-col .lc-it{position:relative;display:flex;flex-direction:column;text-align:left;font:inherit;color:inherit;background:#fff;border:1px solid #e5e1da;border-radius:12px;padding:0;overflow:hidden;cursor:pointer}',
    '#lk-col .lc-it:hover{box-shadow:0 6px 18px rgba(0,0,0,.08)}#lk-col .lc-it{contain:layout paint style}#lk-col .lc-ph{background:#fff}#lk-col .lc-panel{transform:translateZ(0);backface-visibility:hidden}#lk-col .lc-body{contain:layout paint;scroll-behavior:auto}#lk-col .lc-ph img{content-visibility:visible;image-rendering:auto}',
    '#lk-col .lc-ph{position:relative;height:0;padding-top:100%;background:#f6f6f4}#lk-col .lc-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}',
    '#lk-col .lc-tx{padding:8px 10px 10px}#lk-col .lc-nm{font-weight:700;font-size:14px;line-height:1.3}#lk-col .lc-ct{font-size:11.5px;color:#8a837a;margin-top:2px}',
    '#lk-col .lc-stars{position:absolute;top:5px;left:5px;display:flex;gap:1px;}#lk-col .lc-stars svg{width:18px;height:18px}',
    '#lk-col .lc-empty{color:#8a837a;text-align:center;padding:40px 0}#lk-col .lc-note{font-size:12px;color:#8a837a;margin:12px 0 0}',
    '.lk-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(20px);background:#1d1b18;color:#fff;font:600 14px system-ui,sans-serif;padding:9px 16px;border-radius:999px;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;z-index:2000}',
    '.lk-toast.on{opacity:1;transform:translateX(-50%)}',
    '.eyebrow.eb-top.lk-me-top{cursor:pointer}.eyebrow.eb-top.lk-me-top:hover{opacity:.85}',
    '.eyebrow.eb-top.lk-g .ew-wht,.eyebrow.eb-top.lk-h .ew-blk,.eyebrow.eb-top.lk-b .ew-wht,.eyebrow.eb-top.lk-b .ew-blk{opacity:.25}',
    '@media print{.lk-st,.lk-bar,#lk-box{display:none}}'
  ].join('');
  document.head.appendChild(css);

  /* 조사 이/가 — 마지막 글자에 받침이 있으면 「이」, 없으면 「가」. 한글이 아니면 「이(가)」 */
  function iga(s) { var c = String(s).slice(-1).charCodeAt(0) - 0xAC00; return c >= 0 && c <= 11171 ? (c % 28 ? '이' : '가') : '이(가)'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var toastEl;
  function toast(t) { if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'lk-toast'; document.body.appendChild(toastEl); } toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 1600); }

  /* ── 목록 사진 위 별 ── */
  var SKIP = '.cm,.lk-st,#lk-col,#lk-box';
  function paintCards(pop) {
    var w = me(), m = state(), on = canStar();
    document.querySelectorAll('[data-cid]').forEach(function (el) {
      if (el.tagName === 'DIALOG' || el.classList.contains('cm') || el.closest(SKIP)) return;
      var cid = el.dataset.cid, s = m[cid] || {}, b = el.querySelector(':scope > .lk-st');
      var inRv = !!el.closest('#rv');
      var others = ['거믄', '힌'].filter(function (k) { return s[k] && (k !== w || inRv); });
      if (!on || (!w && !others.length) || (inRv && !others.length)) { if (b) b.remove(); return; }
      var mine = w && !inRv ? '<button type="button" class="lk-btn' + (s[w] ? ' on' : '') + (pop === cid ? ' lk-pop' : '') + '" data-lk="' + esc(cid) + '" aria-pressed="' + !!s[w] + '" aria-label="' + w + '의 좋아요" title="' + (s[w] ? '좋아요 거두기' : w + '의 좋아요') + '">' + icon(w, !!s[w]) + '</button>' : '';
      var oth = others.length ? '<span class="lk-other" title="' + others.join(' · ') + iga(others[others.length - 1]) + ' 좋아해요">' + others.map(star).join('') + '</span>' : '';
      var html = mine + oth;
      if (!b) { b = document.createElement('span'); b.className = 'lk-st'; el.appendChild(b); }
      if (b.innerHTML !== html) b.innerHTML = html;
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lk]'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); toggle(b.dataset.lk);
  }, true);

  /* ── 사진 창 안 별 단추 ── */
  function infoBox(d) { return d.querySelector('#d-info') || d.querySelector('.d-info') || (d.querySelector('dl') && d.querySelector('dl').parentElement) || d.querySelector('.d-body') || d; }
  function paintDlg() {
    document.querySelectorAll('dialog[open]').forEach(function (d) {
      if (d.id === 'lk-who') return;
      var cid = d.dataset.cid, box = infoBox(d), bar = box.querySelector(':scope > .lk-bar');
      if (!cid || !canStar()) { if (bar) bar.remove(); return; }
      var w = me(), s = state()[cid] || {};
      var whoTxt = fam() ? ['거믄', '힌'].filter(function (k) { return s[k]; }) : [];
      if (w) logView(cid);
      var html = (w ? '<button type="button" class="lk-big' + (s[w] ? ' on' : '') + '" data-lk="' + esc(cid) + '">' + icon(w, !!s[w]) + (s[w] ? '좋아요 했어요' : '좋아요') + '</button>' +
                      (w !== '벗' ? '<button type="button" class="lk-askq" data-lkq="' + esc(cid) + '">✎ 선생님께 여쭤보기</button>' : '')
                    : '<button type="button" class="lk-big" data-lkask="1">' + star('') + '누구세요? 고르고 별 달기</button>') +
        (whoTxt.length ? '<span class="lk-who">' + whoTxt.map(star).join('') + whoTxt.join(' · ') + (whoTxt.length > 1 ? ' 둘 다' : '') + ' 좋아해요</span>' : '');
      if (!bar) { bar = document.createElement('div'); bar.className = 'lk-bar'; var cm = box.querySelector(':scope > .cm'); box.insertBefore(bar, cm || null); }
      if (bar.innerHTML !== html) bar.innerHTML = html;
    });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-lkask]'); if (b) { e.preventDefault(); ask(); } });

  /* ── 수업일: 매달 둘째·넷째 토요일 (한국 시각) ── */
  function kstToday() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function classDays(y, m) {          // m: 0~11
    var out = [], d = new Date(Date.UTC(y, m, 1)), first = (6 - d.getUTCDay() + 7) % 7 + 1, ym = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
    [first + 7, first + 21].forEach(function (dd) { out.push(new Date(Date.UTC(y, m, dd)).toISOString().slice(0, 10)); });
    return out.sort();
  }
  function nextClass(from) {
    if (window.MOKGAGU_CLASS) return window.MOKGAGU_CLASS.next(from);
    from = from || kstToday(); var y = +from.slice(0, 4), m = +from.slice(5, 7) - 1;
    for (var k = 0; k < 3; k++) { var L = classDays(y, m).filter(function (x) { return x >= from; }); if (L.length) return L[0]; m++; if (m > 11) { m = 0; y++; } }
    return from;
  }
  function md(d) { var x = new Date(d + 'T00:00:00Z'); return (x.getUTCMonth() + 1) + '월 ' + x.getUTCDate() + '일'; }

  /* ── 찾아본 기물 · 검색어 기록 (거믄·힌으로 들어온 기기만) ── */
  function seenSet() { try { return JSON.parse(sessionStorage.getItem('mokgagu_lg_seen') || '{}'); } catch (e) { return {}; } }
  function logView(cid) {
    var S = seenSet(), k = me() + '|' + cid; if (S[k]) return; S[k] = 1;
    try { sessionStorage.setItem('mokgagu_lg_seen', JSON.stringify(S)); } catch (e) {}
    post({ action: 'log', who: me(), kind: 'view', cid: cid, page: location.pathname.split('/').pop() || 'index.html' });
  }
  var qT = 0, lastQ = '';
  document.addEventListener('input', function (e) {
    var el = e.target; if (!el || !/^(q|st-q)$/.test(el.id || '')) return;
    clearTimeout(qT); qT = setTimeout(function () {
      var q = (el.value || '').trim(); if (q.length < 2 || q === lastQ || !me()) return;
      lastQ = q; post({ action: 'log', who: me(), kind: 'search', q: q, page: location.pathname.split('/').pop() || 'index.html' });
    }, 1800);
  });

  /* ── 기물 이야기 속 질문 → 선생님께 여쭤볼 것 (거믄·힌 글만, 글 하나에 한 번) ── */
  function isAsk(t) {
    t = String(t || '');
    if (/[?？]/.test(t)) return true;
    if (/(궁금|여쭤|여쭈|문의|질문|알고\s?싶|모르겠|선생님께|확인\s?필요)/.test(t)) return true;
    return t.split(/[\n.!。]+/).some(function (x) { return /(나요|[인은는떤한된운난큰작]가요|까요|는지요|인지요|습니까|할까)\s*$/.test(x.trim()); });
  }
  var K_ASKED = 'mokgagu_ask_from_cm';
  function syncAsk(list) {
    if (!fam()) return Promise.resolve([]);
    var done; try { done = JSON.parse(localStorage.getItem(K_ASKED) || '{}'); } catch (e) { done = {}; }
    var todo = (list || []).filter(function (c) { return (c.author === '거믄' || c.author === '힌') && !c.del && !c.pending && c.id && !done[c.id] && isAsk(c.text); });
    var cls = nextClass(), made = [];
    return todo.reduce(function (pr, c) {
      return pr.then(function () {
        var q = { id: 'cm_' + c.id, who: c.author, text: String(c.text).trim().slice(0, 2000), cid: c.cid, cls: cls };
        return post({ action: 'qadd', q: q }).then(function (ok) { if (ok) { done[c.id] = 1; made.push(q); try { localStorage.setItem(K_ASKED, JSON.stringify(done)); } catch (e) {} } });
      });
    }, Promise.resolve()).then(function () { if (made.length) toast('기물 이야기 속 질문 ' + made.length + '개를 ' + md(cls) + ' 수업 질문에 넣었어요'); return made; });
  }
  function hookComments() {
    var C = window.MOKGAGU_COMMENTS; if (!C || !C.onChange) return setTimeout(hookComments, 400);
    var t2 = 0; C.onChange(function () { clearTimeout(t2); t2 = setTimeout(function () { syncAsk(C.list()); }, 1500); });
    setTimeout(function () { syncAsk(C.list()); }, 3000);
  }
  hookComments();

  /* ── 사진 창: 선생님께 여쭤보기 ── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lkq]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var bar = b.closest('.lk-bar'), f = bar.nextElementSibling;
    if (f && f.classList.contains('lk-qf')) { f.remove(); return; }
    var cls = nextClass();
    f = document.createElement('div'); f.className = 'lk-qf';
    f.innerHTML = '<div class="lk-qh">' + esc(me()) + '의 질문 · <b>' + md(cls) + ' 수업</b>에 여쭤볼게요</div>' +
      '<textarea placeholder="이 기물에 대해 선생님께 여쭤볼 것을 적어 주세요 (예: 이 장석은 언제쯤 것인가요?)"></textarea>' +
      '<div class="lk-qr"><a href="stats.html#ask">모아보기 →</a><button type="button" class="lk-qno">그만두기</button><button type="button" class="lk-qgo">질문에 넣기</button></div>';
    bar.parentNode.insertBefore(f, bar.nextSibling);
    var ta = f.querySelector('textarea'); ta.focus();
    f.querySelector('.lk-qno').onclick = function () { f.remove(); };
    f.querySelector('.lk-qgo').onclick = function () {
      var text = ta.value.trim(); if (!text) { ta.focus(); return; }
      var btn = this; btn.disabled = true; btn.textContent = '넣는 중…';
      post({ action: 'qadd', q: { id: uid(), who: me(), text: text, cid: b.dataset.lkq, cls: cls } }).then(function (ok) {
        if (ok) { f.remove(); toast(md(cls) + ' 수업 질문에 넣었어요'); }
        else { btn.disabled = false; btn.textContent = '질문에 넣기'; toast('넣지 못했어요. 인터넷 연결을 확인해 주세요'); }
      });
    };
  });

  /* ── 떠 있는 창 맨 위: 이름표 + 좋아요 모아보기 ── */
  var box = document.createElement('div'); box.id = 'lk-box';
  function paintBox() {
    var rv = document.getElementById('rv');
    if (!rv) return;
    if (!box.parentNode) rv.insertBefore(box, rv.firstChild);
    var w = me(), m = state(), n = Object.keys(m).filter(function (k) { return w ? m[k][w] : m[k]['거믄'] || m[k]['힌']; }).length;
    if (!fam() && !w) {
      var h0 = '<button type="button" class="lk-hint" data-lkask="1">' + star('') + '<br>누구세요?</button>';
      if (box._h !== h0) { box._h = h0; box.innerHTML = h0; }
      return;
    }
    var h1 = '<button type="button" class="lk-me" data-lkask="1" title="누구인지 바꾸기">' + (w === '벗' ? '<span class="b cur">벗</span>' : '<span class="g' + (w === '거믄' ? ' cur' : '') + '">거믄</span><span class="h' + (w === '힌' ? ' cur' : '') + '">힌</span>') + '</button>' +
      '<button type="button" class="lk-open" id="lk-open" title="좋아요 모아보기">' + star(w || '거믄') + '<span>좋아요</span><b>' + n + '</b></button>';
    if (box._h !== h1) { box._h = h1; box.innerHTML = h1; }
  }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#lk-open')) { e.preventDefault(); e.stopPropagation(); openCol(); } }, true);

  /* ── 처음 화면 왼쪽 위 「거믄 힌」 표시 ── */
  function paintTop() {
    var t = document.querySelector('.eyebrow.eb-top'); if (!t) return;
    var w = me();
    t.classList.add('lk-me-top'); t.classList.toggle('lk-g', w === '거믄'); t.classList.toggle('lk-h', w === '힌'); t.classList.toggle('lk-b', w === '벗');
    var tt = w ? w + '으로 보는 중 — 눌러서 바꾸기' : '누구세요? 눌러서 고르기'; if (t.title !== tt) t.title = tt;
    if (!t.dataset.lkBound) { t.dataset.lkBound = '1'; t.addEventListener('click', ask); }
    var rest = t.querySelector('.ew-rest'), txt = w ? w + '으로 보는 중' : '고미술공부방'; if (rest && rest.textContent !== txt) rest.textContent = txt;
  }

  /* ── 누구세요? ── */
  var whoDlg;
  function ask() {
    if (!whoDlg) {
      whoDlg = document.createElement('dialog'); whoDlg.id = 'lk-who'; whoDlg.setAttribute('aria-label', '누구세요');
      whoDlg.innerHTML = '<h2>누구세요?</h2><p>고르면 좋아요와 기물 이야기에 이름이 붙어요.</p>' +
        '<div class="lk-pick"><button type="button" data-w="거믄">' + star('거믄') + '<b>거믄</b></button>' +
        '<button type="button" data-w="힌">' + star('힌') + '<b>힌</b></button>' +
        '<button type="button" class="bt" data-w="벗">' + star('벗') + '<b>벗</b><small>함께 보는 분</small></button></div>' +
        '<div class="lk-step" hidden><div class="lk-st-t"></div><div class="lk-row"><input class="lk-code" type="password" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="가족 암호" autocomplete="off"><button type="button" class="lk-go">들어가기</button></div><div class="lk-err"></div></div>' +
        '<label><input type="checkbox" class="lk-shared"> 이 기기는 같이 써요 (새로 열 때마다 물어보기)</label>';
      document.body.appendChild(whoDlg);
      var want = '';
      var step = whoDlg.querySelector('.lk-step'), err = whoDlg.querySelector('.lk-err'), code = whoDlg.querySelector('.lk-code'), go = whoDlg.querySelector('.lk-go');
      var pick = function (w) {
        ls.set(K_SHARED, whoDlg.querySelector('.lk-shared').checked ? '1' : ''); setMe(w); ls.del(K_SKIP);
        whoDlg.close(); toast(w === '벗' ? '벗으로 둘러봐요' : w + '으로 들어왔어요'); load(); paintAll();
        if (window.MOKGAGU_COMMENTS && window.MOKGAGU_COMMENTS.reload) window.MOKGAGU_COMMENTS.reload();
      };
      var check = function () {
        var v = (code.value || '').trim(); if (!v) { err.textContent = '가족 암호를 넣어 주세요.'; code.focus(); return; }
        go.disabled = true; err.textContent = '확인하는 중…';
        var C = window.MOKGAGU_COMMENTS;
        var c = C && C.login ? C.login(v) : fetch(API, { method: 'POST', body: JSON.stringify({ action: 'list', code: v }) }).then(function (r) { return r.json(); }).then(function (j) { if (j.fam) { ls.set(K_CODE, v); ls.set(K_FAM, '1'); } return !!j.fam; });
        c.then(function (ok) { go.disabled = false; if (ok && fam()) { err.textContent = ''; pick(want); } else { err.textContent = '가족 암호가 맞지 않아요. 가족이 아니면 「벗」을 골라 주세요.'; code.select(); } })
          .catch(function () { go.disabled = false; err.textContent = '인터넷 연결을 확인해 주세요.'; });
      };
      whoDlg.addEventListener('click', function (e) {
        if (e.target === whoDlg) { whoDlg.close(); return; }
        if (e.target.closest('.lk-go')) { check(); return; }
        var b = e.target.closest('[data-w]'); if (!b) return;
        var w = b.dataset.w;
        [].forEach.call(whoDlg.querySelectorAll('[data-w]'), function (x) { x.classList.toggle('sel', x === b); });
        if (w === '벗' || fam()) { pick(w); return; }
        want = w; step.hidden = false; err.textContent = '';
        whoDlg.querySelector('.lk-st-t').textContent = w + '으로 들어가려면 가족 암호를 넣어 주세요. 이 기기에서 한 번만 물어요.';
        code.value = ''; code.focus();
      });
      code.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      code.addEventListener('input', function () { err.textContent = ''; });
    }
    whoDlg.querySelector('.lk-step').hidden = true;
    [].forEach.call(whoDlg.querySelectorAll('[data-w]'), function (x) { x.classList.toggle('sel', x.dataset.w === me()); });
    whoDlg.querySelector('.lk-shared').checked = shared();
    if (!whoDlg.open) whoDlg.showModal();
  }

  /* ── 좋아요 모아보기 ── */
  var colDlg, colPanel, colOpen = false, colView = '';
  function needIndex() {
    var ld = function (src) { return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); }); };
    return Promise.all([window.SEARCH ? 0 : ld('search.js'), window.LK_EXTRA ? 0 : ld('likes-extra.js?v=20261024b')]);
  }
  function openCol() {
    if (!colDlg) {
      colDlg = document.createElement('div'); colDlg.id = 'lk-col'; colDlg.setAttribute('role', 'dialog'); colDlg.setAttribute('aria-label', '좋아요 모아보기');
      colDlg.innerHTML = '<div class="lc-panel"></div>'; colPanel = colDlg.firstChild;
      document.body.appendChild(colDlg);
      colDlg.addEventListener('click', function (e) {
        if (e.target === colDlg || e.target.closest('.lc-x')) { closeCol(); return; }
        var c = e.target.closest('[data-v]'); if (c) { colView = c.dataset.v; drawCol(); return; }
        var it = e.target.closest('.lc-it'); if (it) {
          var ids = [].map.call(colDlg.querySelectorAll('.lc-it'), function (x) { return x.dataset.key; });
          try { sessionStorage.setItem('mokgagu_see_list', JSON.stringify({ from: 'likes', list: ids })); } catch (x) {}
          var target = 'see=' + it.dataset.key.split('/').map(encodeURIComponent).join('/');
          closeCol();
          if (/^(seoul|overseas)\//.test(it.dataset.key)) location.href = (it.dataset.key.indexOf('seoul') === 0 ? 'seoulauction.html' : 'overseas.html'); else if (window.RV_OPEN && /(^|\/)(index\.html)?$/.test(location.pathname)) location.hash = target; else location.href = 'index.html#' + target;
        }
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && colOpen) closeCol(); });
    }
    colView = colView || 'all';
    colPanel.innerHTML = '<div class="lc-hd"><h2>' + star(me() === '벗' ? '벗' : '거믄') + '좋아요 모아보기</h2><button type="button" class="lc-x">닫기</button></div><div class="lc-body"><p class="lc-empty">불러오는 중…</p></div>';
    colOpen = true; colDlg.classList.add('on'); document.documentElement.classList.add('lk-lock');
    needIndex().then(drawCol);
  }
  function closeCol() { colOpen = false; if (colDlg) colDlg.classList.remove('on'); document.documentElement.classList.remove('lk-lock'); }
  function drawCol() {
    var m = state(), IX = {};
    (window.SEARCH || []).forEach(function (r) { IX[r.b + '/' + r.pid] = r; });
    Object.keys(window.LK_EXTRA || {}).forEach(function (k) { var e = window.LK_EXTRA[k], p = k.split('/'); IX[k] = { b: p[0], pid: p[1], n: p[1], name: e[0], cat: e[1], t: true, x: 1, u: e[2] || '' }; });
    if (me() === '벗') return drawColBeot(m, IX);
    var count = function (f) { return Object.keys(m).filter(f).length; };
    var fG = function (k) { return m[k]['거믄']; }, fH = function (k) { return m[k]['힌']; };
    var F = { all: function (k) { return fG(k) || fH(k); }, '거믄': fG, '힌': fH, both: function (k) { return fG(k) && fH(k); } };
    var keys = Object.keys(m).filter(F[colView] || F.all).sort(function (a, b) {
      var ta = m[a]['거믄'] > m[a]['힌'] ? m[a]['거믄'] : m[a]['힌'], tb = m[b]['거믄'] > m[b]['힌'] ? m[b]['거믄'] : m[b]['힌'];
      return String(tb || '').localeCompare(String(ta || ''));
    });
    var chip = function (v, label, n, icon) { return '<button type="button" data-v="' + v + '" class="' + (colView === v ? 'on' : '') + '">' + (icon || '') + label + ' ' + n + '</button>'; };
    var html = '<div class="lc-hd"><h2>' + star('거믄') + '좋아요 모아보기</h2><div class="lc-chips">' +
      chip('all', '전체', count(F.all)) + chip('거믄', '거믄', count(fG), star('거믄')) + chip('힌', '힌', count(fH), star('힌')) + chip('both', '둘 다', count(F.both)) +
      '</div><button type="button" class="lc-x">닫기</button></div><div class="lc-body">';
    if (!keys.length) html += '<p class="lc-empty">' + (colView === 'both' ? '둘 다 별을 단 기물이 아직 없어요.' : '아직 별을 단 기물이 없어요. 사진 왼쪽 위 ☆을 눌러 보세요.') + '</p>';
    else html += '<div class="lc-grid">' + keys.map(function (k) {
      var r = IX[k], s = m[k];
      var st = (s['거믄'] ? star('거믄') : '') + (s['힌'] ? star('힌') : '');
      return '<button type="button" class="lc-it" data-key="' + esc(k) + '"><div class="lc-ph">' + (r && r.t ? '<img decoding="async" width="300" height="300" referrerpolicy="no-referrer" src="' + (r.u || 'thumbs/' + r.b + '/' + r.n + '.jpg') + '" alt="" onerror="this.remove()">' : '') +
        '<span class="lc-stars">' + st + '</span></div><div class="lc-tx"><div class="lc-nm">' + esc(r ? r.name : k) + '</div><div class="lc-ct">' + esc(r ? r.cat : '') + '</div></div></button>';
    }).join('') + '</div>';
    if (pend.length) html += '<p class="lc-note">' + (serverOk ? '별 ' + pend.length + '개를 시트에 올리는 중이에요.' : '별 ' + pend.length + '개가 아직 이 기기에만 있어요. 시트 연결이 열리면 저절로 올라가요.') + '</p>';
    var keepTop = colPanel.querySelector('.lc-body') ? colPanel.querySelector('.lc-body').scrollTop : 0;
    colPanel.innerHTML = html + '</div>';
    colPanel.querySelector('.lc-body').scrollTop = keepTop;
  }

  function drawColBeot(m, IX) {
    var keys = Object.keys(beot).sort(function (a, b) { return String(beot[b]).localeCompare(String(beot[a])); });
    var html = '<div class="lc-hd"><h2>' + star('벗') + '벗의 좋아요</h2><button type="button" class="lc-x">닫기</button></div><div class="lc-body">';
    html += keys.length ? '<div class="lc-grid">' + keys.map(function (k) { var r = IX[k];
      return '<button type="button" class="lc-it" data-key="' + esc(k) + '"><div class="lc-ph">' + (r && r.t ? '<img decoding="async" width="300" height="300" referrerpolicy="no-referrer" src="' + (r.u || 'thumbs/' + r.b + '/' + r.n + '.jpg') + '" alt="" onerror="this.remove()">' : '') +
        '<span class="lc-stars">' + star('벗') + '</span></div><div class="lc-tx"><div class="lc-nm">' + esc(r ? r.name : k) + '</div><div class="lc-ct">' + esc(r ? r.cat : '') + '</div></div></button>'; }).join('') + '</div>'
      : '<p class="lc-empty">아직 좋아요 한 기물이 없어요. 사진 왼쪽 위 말풍선을 눌러 보세요.</p>';
    html += '<p class="lc-note">벗의 좋아요는 이 기기에만 담겨요.</p>';
    colPanel.innerHTML = html + '</div>';
  }

  /* ── 다시 그리기 ── */
  var t = 0, popId = '';
  function paintAll(pop) { if (pop) popId = pop; clearTimeout(t); t = setTimeout(function () { paintCards(popId); popId = ''; paintDlg(); paintBox(); paintTop(); if (colOpen) drawCol(); }, 30); }

  function start() {
    paintAll();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (x.closest && x.closest('.lk-st,.lk-bar,#lk-box,#lk-col,#lk-who,.lk-toast,.eyebrow.eb-top')) continue; paintAll(); return; }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'data-cid'] });
    load();
    window.addEventListener('storage', function (e) { if (e.key === K_LIKES || e.key === K_PEND || e.key === K_WHO || e.key === K_FAM) { likes = ls.json(K_LIKES, []); pend = ls.json(K_PEND, []); paintAll(); } });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') load(); });
    /* 처음 들어온 사람에게 「누구세요?」를 먼저 묻지 않는다 — 별을 달거나 글을 쓰려 할 때, 또는 오른쪽 아래 별 단추를 누를 때 묻는다 */
  }
  window.MOKGAGU_LIKES = { ask: ask, me: me, state: state, open: openCol, reload: load, post: post, nextClass: nextClass, importAsks: syncAsk, isAsk: isAsk, syncAsk: syncAsk, classDays: classDays, today: kstToday, star: star, fam: fam };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
