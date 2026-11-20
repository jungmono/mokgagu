/* e뮤지엄 소장품 서가 — 기관별 한 쪽(nfm.html 등)이 window.EMU_KEY 를 정하면 emuseum-data.js 의 그 기관 목록을 보여 줌 */
(function () {
  const E = window.EMU, org = E.orgs.find((o) => o.k === window.EMU_KEY);
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const items = org.rows.map((r, i) => ({ i, name: E.names[r[0]], pre: E.prefs[r[1]], no: r[2], kind: r[3] }));
  const PH = window.EMU_PH || {}, PHBASE = 'https://jungmono.github.io/mokgagu-photos/photos/emuseum/';
  const pid = (x) => (PH[x.pre + ' ' + x.no] || [])[0];
  const KOGL = { 1: '출처표시', 2: '출처표시·상업적 이용금지', 3: '출처표시·변경금지', 4: '출처표시·상업적 이용금지·변경금지' };
  const typ = (x) => (PH[x.pre + ' ' + x.no] || [])[1] || 1;
  const INFO = window.EMU_INFO || {};
  const inf = (x) => INFO[x.pre + ' ' + x.no] || [];
  const era = (x) => String(inf(x)[0] || '').replace(/^한국\s*-?\s*/, '');
  const link = (x) => pid(x) ? 'https://emuseum.go.kr/detail?relicId=' + pid(x) : 'https://emuseum.go.kr/';
  const cnt = (k) => items.filter((x) => x.kind === k).length;
  const skip = org.k === 'nfm' && E.skipped ? `<li>『민속유물이해Ⅰ 목가구』(2003)에 이미 실린 ${E.skipped}점은 그 서가에 있어 여기서는 뺐습니다.</li>` : '';
  document.getElementById('lead').innerHTML = items.length ? `<li>e뮤지엄 전국박물관소장품검색에서 모은 ${esc(org.n)}의 가구 가운데 공공누리 사진이 있는 <b>${items.length}</b>점</li>${skip}<li>사진이 없는 기물은 싣지 않았고 사진을 모으는 대로 늘립니다. 크기·설명은 e뮤지엄 검색창에 소장번호를 넣어 원본에서 확인하세요.</li><li>기획전 도록(목가구, 나무의 이치를 담다 등)에 실린 같은 기물과는 겹칠 수 있습니다.</li>` : `<li>${esc(org.n)}의 가구 사진을 e뮤지엄에서 모으는 중입니다. 사진이 갖춰진 기물부터 이곳에 싣겠습니다.</li>`;
  let kind = -1, q = '', shown = 60, view = [];
  const tiles = document.getElementById('tiles');
  function renderTiles() {
    tiles.innerHTML = [['', '전체', items.length]].concat(E.kinds.map((k, n) => [n, k, cnt(n)]).filter((t) => t[2])).map(([v, k, n]) => `<button type="button" class="tile${(v === '' ? kind === -1 : kind === v) ? ' on' : ''}" data-k="${v}"><div class="k">${k}</div><div class="v">${n}<small>점</small></div></button>`).join('');
  }
  tiles.addEventListener('click', (e) => { const b = e.target.closest('.tile'); if (!b) return; kind = b.dataset.k === '' ? -1 : +b.dataset.k; shown = 60; render(); });
  document.getElementById('q').addEventListener('input', (e) => { q = e.target.value.trim(); shown = 60; render(); });
  function render() {
    renderTiles();
    view = items.filter((x) => (kind < 0 || x.kind === kind) && (!q || (x.name + ' ' + x.pre + ' ' + x.no).includes(q)));
    document.getElementById('cnt').textContent = view.length + '점';
    document.getElementById('grid').innerHTML = view.slice(0, shown).map((x, n) => `<button type="button" class="card" data-n="${n}" data-cid="emuseum/${pid(x)}">${pid(x) ? `<div class="ph"><img loading="lazy" src="thumbs/emu/${pid(x)}.jpg" alt="${esc(x.name)}"></div>` : ''}<div class="bd"><span class="badge">${esc(E.kinds[x.kind])}</span><span class="nm">${esc(x.name)}</span><span class="mt">${esc(x.pre)} ${x.no}${era(x) ? ' · ' + esc(era(x)) : ''}${inf(x)[2] ? ' · ' + esc(inf(x)[2]) : ''}</span></div></button>`).join('') + (view.length > shown ? `<button type="button" class="card" id="more"><div class="bd"><span class="nm">더 보기 (${view.length - shown}점 남음)</span></div></button>` : '');
  }
  const dlg = document.getElementById('dlg'); let cur = 0;
  const $ = (id) => document.getElementById(id);
  const phSrc = (x) => PHBASE + pid(x) + '.jpg';
  function showPic() {
    const x = view[cur], im = $('d-img'), ph = pid(x);
    if (ph) { im.src = 'thumbs/emu/' + ph + '.jpg'; const hi = new Image(); hi.onload = () => { if (view[cur] === x) im.src = hi.src; }; hi.src = phSrc(x); im.alt = x.name; im.hidden = false; }
    else { im.removeAttribute('src'); im.hidden = true; }
    $('d-cap').textContent = ph ? `1 / 1 · 공공누리 제${typ(x)}유형(${KOGL[typ(x)]}) · ${org.n} · e뮤지엄` : '사진이 아직 없습니다. e뮤지엄에서 소장번호로 찾아 보세요.';
    $('p-prev').hidden = $('p-next').hidden = true;
  }
  function open_(n) {
    cur = (n + view.length) % view.length; const x = view[cur];
    dlg.dataset.cid = 'emuseum/' + pid(x);
    $('d-strip').innerHTML = '';
    showPic();
    $('d-info').innerHTML = `<span class="badge">${esc(E.kinds[x.kind])}</span><h3>${esc(x.name)}</h3><div class="hj"></div><dl>${era(x) ? `<dt>시대</dt><dd>${esc(era(x))}</dd>` : ''}${inf(x)[1] ? `<dt>재질</dt><dd>${esc(inf(x)[1])}</dd>` : ''}${inf(x)[2] ? `<dt>크기</dt><dd>${esc(inf(x)[2])}</dd>` : ''}<dt>분류</dt><dd>${esc(E.kinds[x.kind])}</dd><dt>소장품번호</dt><dd>${esc(x.pre)} ${x.no}</dd><dt>소장</dt><dd>${esc(org.n)}</dd></dl>`;
    $('d-pos').textContent = `${cur + 1} / ${view.length}`;
    if (!dlg.open) dlg.showModal();
  }
  $('grid').addEventListener('click', (e) => {
    if (e.target.closest('#more')) { shown += 120; render(); return; }
    const c = e.target.closest('.card'); if (c) open_(+c.dataset.n);
  });
  if (window.MOKGAGU_PHOTOZOOM) MOKGAGU_PHOTOZOOM.attach({ dialog: dlg, area: $('d-main'), next: () => open_(cur + 1), prev: () => open_(cur - 1), canNext: () => view.length > 1, canPrev: () => view.length > 1 });
  $('d-prev').onclick = () => open_(cur - 1);
  $('d-next').onclick = () => open_(cur + 1);
  $('d-close').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  render();
})();
