// 크기 읽기 검증: node tools/audit_sizes.js  (이름과 비율이 어긋난 기물 목록. compare.html의 dims0와 같은 코드)
global.window={};require('../search.js');
  function dims0(sz, b) {
    if (!sz) return null; sz = String(sz).replace(/cm|㎝/g, '');
    var pair = function (x, y, h) { return { w: Math.max(x, y), d: Math.min(x, y), h: h }; };
    var m = sz.match(/^\s*([\d.]+)\s*[×xX]\s*([\d.]+)\s*[×xX]\s*([\d.]+)/);
    if (m) { var A = +m[1], B = +m[2], C = +m[3];
      return b === 'auction' ? pair(B, C, A) : pair(A, B, C); }
    var m2 = sz.match(/높이\s*([\d.]+)\s*[·,/]?\s*([\d.]+)\s*[×xX]\s*([\d.]+)/);
    if (m2) return pair(+m2[2], +m2[3], +m2[1]);
    var h = sz.match(/높이\s*([\d.]+)/); if (!h) return null;
    var hs = [], re = /(?:가로|세로|너비|길이|옆너비|깊이|폭)\s*([\d.]+)/g, x;
    while ((x = re.exec(sz))) hs.push(+x[1]);
    if (!hs.length) return null;
    if (hs.length === 1) return { w: hs[0], d: null, h: +h[1] };
    hs.sort(function (p, q) { return q - p; });
    return pair(hs[0], hs[1], +h[1]);
  }

const R=window.SEARCH||[];const out=[];let ok=0,nul=0;
for(const r of R){const d=dims0(r.size,r.b);if(!d){nul++;continue}ok++;
 const nm=(r.name||'')+(r.kind||'');let why=null;const ratio=d.h/d.w;
 if(/사방탁자|사층|오층|삼층탁자|층탁자/.test(nm)&&!/책장/.test(nm)&&ratio<1.0)why='탁자인데 높이<가로';
 else if(/반닫이/.test(nm)&&!/장|탁자/.test(nm)&&(ratio>1.3||ratio<0.3))why='반닫이 비율';
 else if(/책장/.test(nm)&&ratio>3)why='책장 비율';
 else if(d.d!=null&&(d.d>d.w*1.5||d.d>d.h*1.5)&&!/탁자|교자|소반/.test(nm))why='깊이가 가장 큼';
 else if(d.h>230||d.w>260||d.h<8)why='범위';
 if(why)out.push([why,r.b,r.pid,r.name,r.size,JSON.stringify(d)].join(' | '));}
console.log(ok,nul,out.length);console.log(out.join('\n'));
