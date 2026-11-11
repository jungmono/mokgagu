/* 조선의 목가구 — 사람 모양(한복, 쪽빛 담채). 2026-11-11
 * MOKGAGU_PERSON.svg(x, yFloor, pxPerCm, H, who, sit) → SVG 조각
 *   who: 'm' 선비(도포·갓) | 'w' 여인(저고리·치마), sit: 앉은 모습(양반다리·퍼진 치마)
 *   그림 단위는 키 170 = 정수리 0 ~ 바닥 170. 가운데 x=0.
 * MOKGAGU_PERSON.width(H, who, sit) → 차지하는 가로 cm, top(H, who) → 갓까지 높이 cm
 */
(function () {
  var M = { robe: '#d7e0ec', sk: '#ecdcc8', ln: '#5d6b80', gat: '#6e6a64', belt: '#5d6b80', shoe: '#6e5e50' };
  var W = { jeo: '#f3e6c4', chima: '#a9b9d6', goreum: '#7a5a8a', kkut: '#7a5a8a', sk: '#ecdcc8', hair: '#4a3f36', ln: '#5d6b80' };
  function sym(h) { var L = h.slice().reverse().map(function (p) { return [-p[0], p[1]]; }); return 'M' + h.concat(L).map(function (p) { return p.join(','); }).join(' L') + 'Z'; }
  function poly(p) { return 'M' + p.map(function (q) { return q.join(','); }).join(' L') + 'Z'; }
  function mir(p) { return p.map(function (q) { return [-q[0], q[1]]; }); }
  function F(f, ln) { return 'fill="' + f + '" stroke="' + ln + '" stroke-width="1" stroke-linejoin="round" vector-effect="non-scaling-stroke"'; }
  function line(d, c) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/>'; }
  function gat(cy) { return '<g ' + F(M.gat, M.ln) + '><path d="M-7,' + (cy - 8) + ' L-6,' + (cy - 20) + ' Q0,' + (cy - 22) + ' 6,' + (cy - 20) + ' L7,' + (cy - 8) + 'Z"/><ellipse cx="0" cy="' + (cy - 7.5) + '" rx="22" ry="2.2"/></g>'; }
  function hair(cy) { return '<path d="M-10.5,' + (cy + 1) + ' Q-11,' + (cy - 12) + ' 0,' + (cy - 12) + ' Q11,' + (cy - 12) + ' 10.5,' + (cy + 1) + ' Q9,' + (cy - 7) + ' 0.6,' + (cy - 8.5) + ' L0,' + (cy - 10) + ' L-0.6,' + (cy - 8.5) + ' Q-9,' + (cy - 7) + ' -10.5,' + (cy + 1) + 'Z" ' + F(W.hair, W.ln) + '/>'; }
  function goreum(y) { return '<path d="M1,' + y + ' L9,' + (y + 16) + ' L6.5,' + (y + 17) + ' Z M1,' + y + ' L4,' + (y + 19) + ' L1.5,' + (y + 19) + 'Z" fill="' + W.goreum + '"/>'; }
  var SLV = [[20, 33], [31, 46], [37, 82], [35, 97], [23, 94], [21, 60]], SLV2 = [[20, 114], [30, 124], [36, 146], [30, 152], [22, 148]];
  var WSL = [[19, 33], [24, 40], [26, 66], [25, 92], [21, 93], [21, 66], [18, 46]], KK = [[21, 86], [25.6, 86], [25, 92], [21, 93]], WSL2 = [[19, 115], [25, 122], [28, 146], [22, 150], [20, 140], [18, 128]];
  var P = {
    m0: function () {
      return '<path d="' + sym([[0, 22], [6, 22], [8, 27], [20, 32], [22, 42], [22, 70], [25, 110], [30, 160], [29, 164], [0, 164]]) + '" ' + F(M.robe, M.ln) + '/>' +
        '<path d="' + poly(SLV) + '" ' + F(M.robe, M.ln) + '/><path d="' + poly(mir(SLV)) + '" ' + F(M.robe, M.ln) + '/>' + line('M0,24 L-9,48', M.ln) +
        '<rect x="-21" y="60" width="42" height="2.6" fill="' + M.belt + '"/><path d="M-8,62 L-10,92 M-5,62 L-6,90" stroke="' + M.belt + '" stroke-width="1.4" vector-effect="non-scaling-stroke"/>' +
        '<rect x="-14" y="164" width="11" height="6" rx="2" fill="' + M.shoe + '"/><rect x="3" y="164" width="11" height="6" rx="2" fill="' + M.shoe + '"/>' +
        '<circle cx="0" cy="11" r="10" ' + F(M.sk, M.ln) + '/>' + gat(11);
    },
    m1: function () {
      return '<path d="M-46,170 Q-48,152 -30,147 L-22,146 L-21,124 L-20,114 L-8,110 L-6,104 L6,104 L8,110 L20,114 L21,124 L22,146 L30,147 Q48,152 46,170Z" ' + F(M.robe, M.ln) + '/>' +
        '<path d="' + poly(SLV2) + '" ' + F(M.robe, M.ln) + '/><path d="' + poly(mir(SLV2)) + '" ' + F(M.robe, M.ln) + '/>' + line('M0,106 L-9,130', M.ln) +
        '<rect x="-21" y="136" width="42" height="2.6" fill="' + M.belt + '"/><circle cx="0" cy="93" r="10" ' + F(M.sk, M.ln) + '/>' + gat(93);
    },
    w0: function () {
      return '<path d="' + sym([[0, 40], [17, 40], [19, 60], [23, 100], [28, 140], [31, 166], [0, 168]]) + '" ' + F(W.chima, W.ln) + '/>' +
        '<path d="' + sym([[0, 22], [6, 22], [7, 27], [18, 31], [20, 36], [19, 44], [0, 44]]) + '" ' + F(W.jeo, W.ln) + '/>' +
        '<path d="' + poly(WSL) + '" ' + F(W.jeo, W.ln) + '/><path d="' + poly(mir(WSL)) + '" ' + F(W.jeo, W.ln) + '/>' +
        '<path d="' + poly(KK) + '" fill="' + W.kkut + '"/><path d="' + poly(mir(KK)) + '" fill="' + W.kkut + '"/>' + line('M0,24 L-8,40', W.ln) + goreum(36) +
        '<circle cx="0" cy="11" r="10" ' + F(W.sk, W.ln) + '/>' + hair(11);
    },
    w1: function () {
      return '<path d="M-50,170 Q-52,150 -24,128 L24,128 Q52,150 50,170Z" ' + F(W.chima, W.ln) + '/>' +
        '<path d="' + sym([[0, 104], [6, 104], [7, 109], [18, 113], [20, 118], [19, 128], [0, 128]]) + '" ' + F(W.jeo, W.ln) + '/>' +
        '<path d="' + poly(WSL2) + '" ' + F(W.jeo, W.ln) + '/><path d="' + poly(mir(WSL2)) + '" ' + F(W.jeo, W.ln) + '/>' + line('M0,106 L-8,122', W.ln) + goreum(118) +
        '<circle cx="0" cy="93" r="10" ' + F(W.sk, W.ln) + '/>' + hair(93);
    }
  };
  var HALF = { m0: 37, m1: 48, w0: 31, w1: 52 };
  window.MOKGAGU_PERSON = {
    svg: function (x, y0, s, H, who, sit) {
      var k = (who === 'w' ? 'w' : 'm') + (sit ? 1 : 0), u = s * H / 170;
      return '<g transform="translate(' + x + ',' + y0 + ') scale(' + u + ') translate(0,-170)">' + P[k]() + '</g>';
    },
    width: function (H, who, sit) { return 2 * HALF[(who === 'w' ? 'w' : 'm') + (sit ? 1 : 0)] * H / 170; },
    top: function (H, who, sit) { return (sit ? 88 : 170) * H / 170 + (who === 'w' ? 1 : 11) * H / 170; }
  };
})();
