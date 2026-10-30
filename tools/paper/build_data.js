/* 논문 「조선 후기 반닫이 정면 비례의 지역별 분포」(2026) 자료표 만들기 — 자세한 것은 tools/paper/README.md
   node tools/paper/build_data.js            → 공개판(『조선의 궤』 빼고)
   PW=가족암호 node tools/paper/build_data.js → 가족판(『조선의 궤』 넣음, 암호는 메모리에서만 쓰고 남기지 않음)
   결과: tools/paper/out/data.csv · excluded.csv · dupcand.json (out/ 은 저장소에 올리지 않음) */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const M=path.join(__dirname,'..','..'),OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
global.window={innerWidth:800};
eval(fs.readFileSync(M+'/search.js','utf8'));
const t=fs.readFileSync(M+'/region-ruler.html','utf8');
eval(t.slice(t.indexOf('const REG'),t.indexOf('const P = [];')).replace(/const /g,'var '));
const mk=fs.readFileSync(M+'/mklink.js','utf8');const N2L=JSON.parse(mk.match(/var N2L = (\{[^;]*\});/)[1]);const L2N={};for(const k in N2L)L2N[N2L[k]]=k;
/* 『조선의 궤』: study/joseongwe.bin 을 PW 로 풀어 메모리에서만 쓴다(study.html·반닫이여지도와 같은 암호틀) */
window.JOSEONGWE=[];
if(process.env.PW){const meta=JSON.parse(fs.readFileSync(M+'/study/salt.json','utf8'));const key=crypto.pbkdf2Sync(process.env.PW,Buffer.from(meta.salt,'base64'),meta.iter,32,'sha256');
 const raw=fs.readFileSync(M+'/study/joseongwe.bin'),iv=raw.subarray(0,12),body=raw.subarray(12,raw.length-16),tag=raw.subarray(raw.length-16);
 const d=crypto.createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(tag);const o=JSON.parse(Buffer.concat([d.update(body),d.final()]).toString('utf8'));new Function('window',o.j)(window);}
const BOOK={nmk:'국립중앙박물관 소장품',lee:'이건희 기증',minsok:'민속유물이해Ⅰ',auction:'아이옥션',yangsan:'양산 반닫이',kwon:'권옥연 구장',myart:'마이아트옥션',seoulauction:'서울옥션',joseongwe:'조선의 궤'};
const rows=[],exc=[];
const depthOf=(s,b)=>{const m=String(s||'').match(/([0-9.]+)\s*×\s*([0-9.]+)\s*×\s*([0-9.]+)/);if(m){return b==='auction'?+m[2]:Math.min(+m[1],+m[2])}const d=String(s||'').match(/(?:세로|옆너비|깊이|폭)\s*([0-9.]+)/);return d?+d[1]:null};
(window.SEARCH||[]).forEach(r=>{
 if(!/반닫이/.test((r.name||'')+(r.hanja||'')))return;
 const id=r.b+'/'+r.pid;
 if(/반닫이\s*(장|탁자|연상|농|함|문갑|책)/.test(r.name||'')){exc.push([id,r.name,'다른 가구']);return}
 if(/책\s*반닫이|冊/.test((r.name||'')+(r.hanja||''))){exc.push([id,r.name,'책반닫이']);return}
 const g=regOf(r);if(!g){exc.push([id,r.name,'지역 없음']);return}
 const d=dims(r.size,r.b);if(!d){exc.push([id,r.name,'치수 없음·범위 밖']);return}
 rows.push({id,src:r.b,book:BOOK[r.b]||r.b,name:r.name,region:g,town:(((r.name||'')+' '+(r.hanja||'')).match(new RegExp(REG.join('|')))||[''])[0],w:d.w,h:d.h,dp:depthOf(r.size,r.b),size:r.size,era:r.era||''});
});
const DO={haeju:'황해',gaeseong:'경기',ganghwa:'경기',gyeongdo:'경기',namhan:'경기',geumsan:'충청',sangju:'경상',yecheon:'경상',eonyang:'경상',miryang:'경상',yangsan:'경상',jinju:'경상',gimhae:'경상',namhae:'경상',tongyeong:'경상',iksan:'전라',jeonju:'전라',namwon:'전라',naju:'전라',yeonggwang:'전라',jangheung:'전라',jeju:'제주'};
window.JOSEONGWE.forEach(r=>{const id='joseongwe/'+r.pid;
 if(/윗닫이/.test(r.name)){exc.push([id,r.name,'윗닫이']);return}
 const g=DO[r.r]||(r.p||'').replace(/도$/,'');if(!g){exc.push([id,r.name,'지역 없음']);return}
 if(!r.size){exc.push([id,r.name,'치수 없음']);return}
 if(/\(/.test(r.size)){exc.push([id,r.name,'괄호 치수(족대 포함 병기)']);return}
 const m=r.size.match(/^([0-9.]+)×([0-9.]+)×([0-9.]+)$/);if(!m){exc.push([id,r.name,'치수 형식']);return}
 const w=+m[1],dp=+m[2],h=+m[3];if(w<40||w>140||h<25||h>120){exc.push([id,r.name,'범위 밖']);return}
 rows.push({id,src:'joseongwe',book:'조선의 궤',name:r.name,region:g,town:r.r||'',w,h,dp,size:r.size,era:''});
});
// 중복 1: 이건희↔국립중앙박물관 같은 물건 번호
const have=new Set(rows.map(r=>r.id));
for(let i=rows.length-1;i>=0;i--){const r=rows[i];if(r.src==='lee'){const n=L2N[r.id.slice(4)];if(n&&have.has('nmk/'+n)){exc.push([r.id,r.name,'중복(국립중앙박물관 '+n+')']);rows.splice(i,1)}}}
// 중복 후보 2: 출처가 다른데 가로·높이·깊이가 모두 같은 것
const key=r=>[r.w,r.h,r.dp].join('|');const by={};rows.forEach(r=>{(by[key(r)]=by[key(r)]||[]).push(r)});
const cand=Object.values(by).filter(a=>a.length>1&&new Set(a.map(x=>x.src)).size>1);
fs.writeFileSync(OUT+'/dupcand.json',JSON.stringify(cand.map(a=>a.map(r=>[r.id,r.name,r.region,r.size])),null,1));
const csv=a=>a.map(x=>x.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\n');
fs.writeFileSync(OUT+'/data.csv','﻿'+csv([['id','src','book','name','region','town','w','h','depth','size','era'],...rows.map(r=>[r.id,r.src,r.book,r.name,r.region,r.town,r.w,r.h,r.dp,r.size,r.era])]));
fs.writeFileSync(OUT+'/excluded.csv','﻿'+csv([['id','name','reason'],...exc]));
const c={};rows.forEach(r=>{c[r.region]=c[r.region]||{};c[r.region][r.src]=(c[r.region][r.src]||0)+1});
console.log('표본',rows.length,'제외',exc.length);console.log(JSON.stringify(c));
const er={};exc.forEach(e=>er[e[2].replace(/\(.*/,'')]=(er[e[2].replace(/\(.*/,'')]||0)+1);console.log(er);console.log('중복 후보 묶음',cand.length);
