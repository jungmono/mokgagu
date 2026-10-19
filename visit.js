/* 방문자 수 — 오늘 / 누적.
   - 한 브라우저는 하루(한국 시각)에 한 번만 센다. 어느 페이지로 들어와도 같다.
   - 저장: 기물 이야기와 같은 구글 시트의 「방문」 탭(날짜 | 방문 수).
   - 첫 화면 아래 #v-today, #v-total 이 있으면 숫자를 채운다. comments.js 가 이 파일을 불러온다. */
(function () {
  if (window.MOKGAGU_VISIT) return; window.MOKGAGU_VISIT = 1;
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var K_DAY = 'mokgagu_visit_day', K_LAST = 'mokgagu_visit_last';
  function get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);   // 한국 날짜
  var isNew = get(K_DAY) !== today;
  if (/[?&]novisit\b/.test(location.search)) isNew = false;
  function fmt(n) { return Number(n || 0).toLocaleString('ko-KR'); }
  function show(j) {
    var a = document.getElementById('v-today'), b = document.getElementById('v-total');
    if (a && j) a.textContent = fmt(j.today);
    if (b && j) b.textContent = fmt(j.total);
  }
  function run() {
    try { var last = JSON.parse(get(K_LAST) || 'null'); if (last && last.day === today) show(last); } catch (e) {}
    fetch(API + '?action=visit&day=' + today + (isNew ? '&new=1' : ''), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) return;
        if (isNew) set(K_DAY, today);
        set(K_LAST, JSON.stringify({ day: today, today: j.today, total: j.total }));
        show(j);
      }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
