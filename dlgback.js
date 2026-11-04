/* 휴대폰 뒤로가기: 사진 창 등 열린 창만 닫고, 보던 화면은 그대로 둔다 (창이 열릴 때 기록을 한 칸 더한다) */
(function () {
  if (window.__dlgback || document.documentElement.classList.contains('emb')) return; window.__dlgback = 1;
  var stack = [], byPop = false;
  function sync() {
    document.querySelectorAll('dialog[open]').forEach(function (d) {
      if (stack.indexOf(d) < 0) { stack.push(d); try { history.pushState({ mkdlg: 1 }, '', location.href); } catch (e) {} }
    });
  }
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['open'] });
  window.addEventListener('popstate', function () {
    var d; while (stack.length) { d = stack.pop(); if (d.open) { byPop = true; try { d.close(); } catch (e) {} byPop = false; return; } }
  });
  document.addEventListener('close', function (e) {
    var d = e.target, i = stack.indexOf(d); if (i < 0) return; stack.splice(i, 1);
    if (!byPop) { try { history.back(); } catch (x) {} }
  }, true);
})();
