/* 동인방 수업 날짜 — 기본은 매달 둘째·넷째 토요일.
   수업이 빠지거나 옮겨지면 아래 두 줄만 고친다.
   - cancel : 수업이 없는 날 (이 날로 적힌 질문은 다음 수업으로 저절로 넘어간다)
   - add    : 원래 날이 아닌데 수업이 있는 날 */
(function () {
  if (window.MOKGAGU_CLASS) return;
  var cancel = ['2026-10-24'];
  var add = ['2026-10-31'];

  function today() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function base(y, m) {                       // m: 0~11
    var d = new Date(Date.UTC(y, m, 1)), f = (6 - d.getUTCDay() + 7) % 7 + 1;
    return [f + 7, f + 21].map(function (x) { return new Date(Date.UTC(y, m, x)).toISOString().slice(0, 10); });
  }
  function days(y, m) {
    var key = y + '-' + String(m + 1).padStart(2, '0');
    return base(y, m).filter(function (d) { return cancel.indexOf(d) < 0; })
      .concat(add.filter(function (d) { return d.slice(0, 7) === key; }))
      .filter(function (d, i, a) { return a.indexOf(d) === i; }).sort();
  }
  function upcoming(n, from) {
    from = from || today(); var y = +from.slice(0, 4), m = +from.slice(5, 7) - 1, out = [], guard = 0;
    while (out.length < n && guard++ < 36) { days(y, m).forEach(function (d) { if (d >= from && out.length < n) out.push(d); }); m++; if (m > 11) { m = 0; y++; } }
    return out;
  }
  function next(from) { return upcoming(1, from)[0]; }
  /* 수업이 없어진 날로 적힌 질문은 그다음 수업 날로 */
  function fix(d) { return d && cancel.indexOf(d) >= 0 ? next(d) : d; }
  window.MOKGAGU_CLASS = { cancel: cancel, add: add, today: today, days: days, upcoming: upcoming, next: next, fix: fix };
})();
