/* 공부방 「지식 지도」 — 수업·개념·지역을 점과 선으로 잇는 화면.
   window.MOKGAGU_KG.mount(el, { sessions, load(), goSession(s) })  (d3.min.js 필요) */
(function () {
  if (window.MOKGAGU_KG) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) { var p = d.split('-'); return (+p[1]) + '. ' + (+p[2]) + '.'; }

  var CSS = '.kg{margin-top:16px}.kg *{box-sizing:border-box}' +
    '.kg-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}' +
    '.kg-bar input{flex:1;min-width:140px;font:inherit;font-size:15px;border:1.5px solid #cfc8bd;border-radius:999px;padding:9px 16px;background:#fff}' +
    '.kg-seg{display:flex;border:1.5px solid #111;border-radius:999px;overflow:hidden}' +
    '.kg-seg button{font:inherit;font-size:14px;font-weight:800;border:0;background:#fff;color:#111;padding:8px 16px;cursor:pointer}' +
    '.kg-seg button.on{background:#111;color:#fff}' +
    '.kg-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:#6b645a;margin:0 2px 8px}' +
    '.kg-legend i{display:inline-block;vertical-align:-2px;margin-right:4px}' +
    '.kg-stage{position:relative;border:1px solid #ddd6ca;border-radius:16px;background:#fff;overflow:hidden;touch-action:none}' +
    '.kg-stage svg{display:block;width:100%;height:min(66vh,560px);cursor:grab}' +
    '.kg-stage svg:active{cursor:grabbing}' +
    '.kg-hint{position:absolute;left:12px;bottom:8px;font-size:12px;color:#8a837a;pointer-events:none}' +
    '.kg-zoom{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px}' +
    '.kg-zoom button{width:38px;height:38px;border-radius:10px;border:1.5px solid #111;background:#fff;font:inherit;font-size:20px;font-weight:800;cursor:pointer}' +
    '.kg-list{display:none}.kg-list h3{margin:18px 2px 8px;font-size:15px;font-weight:900}' +
    '.kg-list button{display:inline-flex;align-items:center;gap:6px;margin:0 6px 8px 0;font:inherit;font-size:14px;font-weight:700;border:1.5px solid #cfc8bd;border-radius:999px;background:#fff;padding:8px 14px;cursor:pointer;text-align:left}' +
    '.kg-list button small{color:#8a837a;font-weight:600}' +
    '.kg-det{margin-top:14px;border:1px solid #ddd6ca;border-radius:16px;background:#fcfbf8;padding:16px 18px}' +
    '.kg-det h2{margin:0 0 4px;font-size:19px;font-weight:900}.kg-det .ty{font-size:12.5px;color:#8a837a;font-weight:700}' +
    '.kg-det p,.kg-det li{font-size:15px;line-height:1.75}.kg-det ul{padding-left:20px;margin:6px 0}' +
    '.kg-det h4{margin:14px 0 4px;font-size:14.5px;font-weight:900}' +
    '.kg-det .lk{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}' +
    '.kg-det .lk button,.kg-det a.wl{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #cfc8bd;border-radius:999px;background:#fff;padding:5px 12px;cursor:pointer;color:#111;text-decoration:none}' +
    '.kg-det .go{display:inline-block;margin-top:10px;font:inherit;font-weight:800;border:0;border-radius:10px;background:#111;color:#fff;padding:9px 18px;cursor:pointer}' +
    '.kg-det .empty{color:#8a837a}';

  function md(t, nodes) {   // 아주 단순한 마크다운 → HTML ([[링크]] 지원)
    var out = '', inl = false;
    function inline(s) {
      s = esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
      s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, id, label) {
        var key = id.replace(/&amp;/g, '&');
        return nodes[key] ? '<a class="wl" href="#" data-go="' + esc(key) + '">' + esc(label || nodes[key].title) + '</a>' : esc(label || id.split('/').pop());
      });
      return s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }
    t.split('\n').forEach(function (l) {
      var m;
      if ((m = /^\s*[-*] (.*)$/.exec(l))) { if (!inl) { out += '<ul>'; inl = true; } out += '<li>' + inline(m[1]) + '</li>'; return; }
      if (inl) { out += '</ul>'; inl = false; }
      if ((m = /^#{1,2} (.*)$/.exec(l))) { out += '<h4 style="font-size:16px">' + inline(m[1]) + '</h4>'; }
      else if ((m = /^#{3,} (.*)$/.exec(l))) out += '<h4>' + inline(m[1]) + '</h4>';
      else if ((m = /^>\s?(.*)$/.exec(l))) out += '<p style="color:#6b645a">' + inline(m[1]) + '</p>';
      else if (l.trim()) out += '<p>' + inline(l) + '</p>';
    });
    return out + (inl ? '</ul>' : '');
  }

  function build(sessions, K) {
    var N = {}, L = [], seen = {};
    function add(n) { if (!N[n.id]) { n.deg = 0; N[n.id] = n; } return N[n.id]; }
    function link(a, b) { if (a === b || !N[a] || !N[b]) return; var k = a < b ? a + '|' + b : b + '|' + a; if (seen[k]) return; seen[k] = 1; L.push({ source: a, target: b }); N[a].deg++; N[b].deg++; }
    K.nodes.forEach(function (n) { add({ id: n.id, type: n.type, title: n.title, text: n.text }); });
    K.links.forEach(function (l) { link(l[0], l[1]); });
    sessions.forEach(function (s) {
      var id = 's:' + (s.owner || '거믄') + s.date;
      add({ id: id, type: 's', title: fmt(s.date) + ' ' + (s.title || '').split(' — ')[0].split(' · ')[0], owner: s.owner || '거믄', date: s.date, s: s });
      (s.tags || []).forEach(function (t) {
        var m = K.tagmap[t];
        if (m) { (Array.isArray(m) ? m : [m]).forEach(function (x) { link(id, x); }); }
        else { add({ id: 't:' + t, type: 't', title: t }); link(id, 't:' + t); }
      });
      (K.sessLinks[s.date] || []).forEach(function (x) { link(id, x); });
    });
    return { N: N, L: L };
  }

  var TYPE = { s: '수업', c: '개념', r: '지역', x: '기타', t: '태그' };

  function mount(el, opt) {
    if (!document.getElementById('kg-css')) { var st = document.createElement('style'); st.id = 'kg-css'; st.textContent = CSS; document.head.appendChild(st); }
    el.innerHTML = '<div class="kg"><p style="color:#8a837a">지식 지도를 여는 중…</p></div>';
    opt.load().then(function (K) { draw(el, opt, build(opt.sessions, K)); }).catch(function () { el.innerHTML = '<div class="kg"><p style="color:#8a2f22">지식 지도를 열지 못했어요. 새로고침해 주세요.</p></div>'; });
  }

  function draw(el, opt, G) {
    var N = G.N, nodes = Object.keys(N).map(function (k) { return N[k]; }), links = G.L;
    el.innerHTML = '<div class="kg"><div class="kg-bar"><input type="search" id="kg-q" placeholder="점 찾기 — 예: 감정, 전라도, 자물쇠" aria-label="지식 지도 검색">' +
      '<div class="kg-seg"><button type="button" data-v="g" class="on">그래프</button><button type="button" data-v="l">목록</button></div></div>' +
      '<div class="kg-legend"><span><i><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#111"/></svg></i>거믄 수업</span><span><i><svg width="14" height="14"><circle cx="7" cy="7" r="5.5" fill="#fff" stroke="#111" stroke-width="2"/></svg></i>힌 수업</span><span><i><svg width="14" height="14"><rect x="1.5" y="1.5" width="11" height="11" rx="3" fill="#8a837a"/></svg></i>개념</span><span><i><svg width="14" height="14"><path d="M7 1L13 7 7 13 1 7z" fill="#5b3a05"/></svg></i>지역</span><span><i><svg width="14" height="14"><circle cx="7" cy="7" r="3" fill="#cfc8bd"/></svg></i>태그</span></div>' +
      '<div class="kg-stage"><svg id="kg-sv" role="img" aria-label="수업·개념·지역 연결 그래프"></svg><div class="kg-zoom"><button type="button" id="kg-zi" aria-label="확대">+</button><button type="button" id="kg-zo" aria-label="축소">−</button><button type="button" id="kg-zr" aria-label="처음 크기" style="font-size:14px">⟲</button></div><div class="kg-hint">끌어서 이동 · 두 손가락으로 확대 · 점을 누르면 내용</div></div>' +
      '<div class="kg-list" id="kg-ls"></div><div class="kg-det" id="kg-det"><span class="empty">점이나 목록의 이름을 누르면 여기에 내용과 연결된 곳이 나와요.</span></div></div>';
    var svg = d3.select(el.querySelector('#kg-sv')), W = 0, H = 0;
    var nb = {}; links.forEach(function (l) { (nb[l.source] = nb[l.source] || []).push(l.target); (nb[l.target] = nb[l.target] || []).push(l.source); });
    function R(n) { return n.type === 't' ? 4.5 : n.type === 's' ? 9 + Math.min(n.deg, 8) * .6 : 8 + Math.min(n.deg, 10) * 1.3; }
    var g = svg.append('g'), gl = g.append('g'), gn = g.append('g');
    var le = gl.selectAll('line').data(links).join('line').attr('stroke', '#c9c1b4').attr('stroke-width', 1.2);
    var ne = gn.selectAll('g').data(nodes).join('g').style('cursor', 'pointer');
    ne.each(function (n) {
      var s = d3.select(this), r = R(n);
      if (n.type === 's') s.append('circle').attr('r', r).attr('fill', n.owner === '힌' ? '#fff' : '#111').attr('stroke', '#111').attr('stroke-width', 2.4);
      else if (n.type === 'r') s.append('path').attr('d', 'M0,' + -r * 1.25 + 'L' + r * 1.25 + ',0L0,' + r * 1.25 + 'L' + -r * 1.25 + ',0Z').attr('fill', '#5b3a05');
      else if (n.type === 't') s.append('circle').attr('r', r).attr('fill', '#cfc8bd');
      else s.append('rect').attr('x', -r).attr('y', -r).attr('width', 2 * r).attr('height', 2 * r).attr('rx', 3.5).attr('fill', '#8a837a');
      s.append('circle').attr('r', Math.max(r + 8, 16)).attr('fill', 'transparent');   // 누르기 쉽게
      if (n.type !== 't') s.append('text').text(n.title.length > 14 ? n.title.slice(0, 13) + '…' : n.title).attr('y', r + 14).attr('text-anchor', 'middle').attr('font-size', 12.5).attr('font-weight', 800).attr('fill', '#111').attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3.5).style('pointer-events', 'none');
      else s.append('text').text(n.title).attr('y', r + 12).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#8a837a').attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).style('pointer-events', 'none').style('opacity', 0).attr('class', 'tl');
    });
    var sim = d3.forceSimulation(nodes).force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(function (l) { return (l.source.type === 't' || l.target.type === 't') ? 34 : 78; }).strength(.7))
      .force('charge', d3.forceManyBody().strength(-180)).force('collide', d3.forceCollide(function (n) { return R(n) + 14; })).force('x', d3.forceX().strength(.16)).force('y', d3.forceY().strength(.2));
    sim.on('tick', function () {
      le.attr('x1', function (d) { return d.source.x; }).attr('y1', function (d) { return d.source.y; }).attr('x2', function (d) { return d.target.x; }).attr('y2', function (d) { return d.target.y; });
      ne.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });
    ne.call(d3.drag().on('start', function (e, d) { if (!e.active) sim.alphaTarget(.25).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', function (e, d) { d.fx = e.x; d.fy = e.y; }).on('end', function (e, d) { if (!e.active) sim.alphaTarget(0); d.fx = d.fy = null; }));
    var zoom = d3.zoom().scaleExtent([.4, 5]).on('zoom', function (e) { g.attr('transform', e.transform); });
    function size() { var b = svg.node().getBoundingClientRect(); W = b.width; H = b.height; svg.attr('viewBox', [-W / 2, -H / 2, W, H].join(' ')); }
    size(); svg.call(zoom).on('dblclick.zoom', null);
        el.querySelector('#kg-zi').onclick = function () { svg.transition().duration(150).call(zoom.scaleBy, 1.4); };
    el.querySelector('#kg-zo').onclick = function () { svg.transition().duration(150).call(zoom.scaleBy, 1 / 1.4); };

    var cur = null, det = el.querySelector('#kg-det');
    function show(id, scroll) {
      var n = N[id]; if (!n) return; cur = id;
      var near = (nb[id] || []).map(function (k) { return N[k]; }).sort(function (a, b) { return (a.type === b.type ? 0 : a.type < b.type ? -1 : 1) || a.title.localeCompare(b.title); });
      var h = '<span class="ty">' + TYPE[n.type] + '</span><h2>' + esc(n.title) + '</h2>';
      if (n.type === 's') {
        h += '<p>' + esc(n.owner) + '의 노트 · ' + n.date.replace(/-/g, '. ') + '.</p>' + (n.s.lead ? '<p>' + esc(n.s.lead) + '</p>' : '') + '<button type="button" class="go" data-ses="' + esc(id) + '">이 수업 노트 열기 ›</button>';
      } else if (n.type === 't') h += '<p>수업 노트에 붙은 꼬리표예요. 아래 수업들에 나와요.</p>';
      else h += n.text ? md(n.text, N) : '<p class="empty">아직 정리한 내용이 없어요.</p>';
      if (near.length) h += '<h4>연결된 곳 ' + near.length + '</h4><div class="lk">' + near.map(function (x) { return '<button type="button" data-go="' + esc(x.id) + '">' + esc(x.title) + '</button>'; }).join('') + '</div>';
      det.innerHTML = h;
      var set = {}; set[id] = 1; (nb[id] || []).forEach(function (k) { set[k] = 1; });
      ne.style('opacity', function (d) { return set[d.id] ? 1 : .18; }); le.attr('stroke', function (d) { return (d.source.id === id || d.target.id === id) ? '#111' : '#c9c1b4'; }).attr('stroke-width', function (d) { return (d.source.id === id || d.target.id === id) ? 2.2 : 1.2; }).style('opacity', function (d) { return (d.source.id === id || d.target.id === id) ? 1 : .35; });
      ne.select('.tl').style('opacity', function (d) { return set[d.id] ? 1 : 0; });
      if (scroll) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    var moved = false;
    ne.on('click', function (e, d) { if (e.defaultPrevented) return; show(d.id, true); });
    svg.on('click', function (e) { if (e.target === svg.node()) { cur = null; ne.style('opacity', 1); le.attr('stroke', '#c9c1b4').attr('stroke-width', 1.2).style('opacity', 1); ne.select('.tl').style('opacity', 0); } });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); show(b.dataset.go, true); return; }
      b = e.target.closest('[data-ses]'); if (b) { var n = N[b.dataset.ses]; if (n && n.s) opt.goSession(n.s); }
    });

    /* 목록 보기 */
    var ls = el.querySelector('#kg-ls');
    ['s', 'c', 'r', 'x', 't'].forEach(function (t) {
      var A = nodes.filter(function (n) { return n.type === t; }).sort(function (a, b) { return t === 's' ? (a.date < b.date ? 1 : -1) : b.deg - a.deg || a.title.localeCompare(b.title); });
      if (!A.length) return;
      ls.insertAdjacentHTML('beforeend', '<h3>' + TYPE[t] + ' ' + A.length + '</h3>' + A.map(function (n) { return '<button type="button" data-go="' + esc(n.id) + '">' + (t === 's' ? '<i style="font-style:normal;font-weight:900">' + esc(n.owner) + '</i> ' : '') + esc(n.title) + ' <small>' + n.deg + '</small></button>'; }).join(''));
    });
    el.querySelector('.kg-seg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(el.querySelectorAll('.kg-seg button'), function (x) { x.classList.toggle('on', x === b); });
      var g1 = b.dataset.v === 'g';
      el.querySelector('.kg-stage').style.display = g1 ? '' : 'none'; el.querySelector('.kg-legend').style.display = g1 ? '' : 'none'; ls.style.display = g1 ? 'none' : 'block';
      if (g1) size();
    });
    el.querySelector('#kg-q').addEventListener('input', function (e) {
      var q = e.target.value.trim();
      ne.style('opacity', function (d) { return !q || d.title.indexOf(q) >= 0 ? 1 : .15; });
      [].forEach.call(ls.querySelectorAll('button'), function (b) { b.style.display = !q || b.textContent.indexOf(q) >= 0 ? '' : 'none'; });
      if (q) { var hit = nodes.filter(function (d) { return d.title.indexOf(q) >= 0; }); if (hit.length === 1) show(hit[0].id, false); }
    });
    window.addEventListener('resize', size);
    function fit() {   // 처음에 전체가 한눈에 들어오게
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; nodes.forEach(function (d) { x0 = Math.min(x0, d.x); x1 = Math.max(x1, d.x); y0 = Math.min(y0, d.y); y1 = Math.max(y1, d.y); });
      if (!isFinite(x0) || !W) return; var pw = 70, k = Math.min(1.1, Math.min((W - pw) / Math.max(1, x1 - x0), (H - pw) / Math.max(1, y1 - y0)));
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity.scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2));
    }
    el.querySelector('#kg-zr').onclick = fit;
    sim.on('end', fit); setTimeout(fit, 1800);
    setTimeout(function () { sim.alpha(.9).restart(); }, 50);
  }
  window.MOKGAGU_KG = { mount: mount };
})();
