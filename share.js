/* 기물 창(dialog)에 「공유」 단추를 달고, 홈 화면 공유 칩도 처리한다. */
(function(){
var css=document.createElement('style');
css.textContent='.shr{position:absolute;top:8px;left:8px;z-index:5;background:#fff;color:#111;border:1.5px solid #111;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer}.shr:active{background:#111;color:#fff}';
document.head.appendChild(css);
var BASE='https://jungmono.github.io/mokgagu/';
function say(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 16px;border-radius:999px;font-size:14px;z-index:2147483647';(document.querySelector('dialog[open]')||document.body).appendChild(d);setTimeout(function(){d.remove();},1800);}
/* ── 공유창: 카카오톡 · 문자 · 인스타그램 · 링크복사 ──
   카카오톡 대화창으로 바로 보내려면 카카오 개발자(developers.kakao.com)에서 앱을 만들고
   「JavaScript 키」를 아래에 넣고, 플랫폼 → Web 에 https://jungmono.github.io 를 등록한다. 키가 비어 있으면 링크를 복사해 준다. */
var KAKAO_KEY='c9f47b5a6780c5bb506586cda58fab6e';
var ISM=/Android|iPhone|iPad/i.test(navigator.userAgent),ISI=/iPhone|iPad/i.test(navigator.userAgent);
var sheetCss=document.createElement('style');
sheetCss.textContent='#mk-sh{position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-family:"Noto Sans KR","Malgun Gothic",system-ui,sans-serif}#mk-sh[hidden]{display:none}'+
'#mk-sh .b{background:#fff;border-radius:6px;width:min(310px,calc(100vw - 24px));box-shadow:0 10px 36px rgba(0,0,0,.3)}'+
'#mk-sh .h{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #e5e5e5}'+
'#mk-sh .x{border:0;background:none;padding:2px;cursor:pointer;color:#777;display:grid}#mk-sh .x svg{width:18px;height:18px}'+
'#mk-sh .g{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 10px;padding:16px 10px 14px}'+
'#mk-sh .g button{width:60px;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:11.5px;color:#222}'+
'#mk-sh .g i{width:42px;height:42px;border-radius:50%;display:grid;place-items:center}#mk-sh .g i svg{width:23px;height:23px}'+
'#mk-sh .m{margin:-4px 14px 12px;text-align:center;font-size:12px;color:#0f6e56;font-weight:700;min-height:1.2em;word-break:break-all}'+
'@media (max-width:520px){#mk-sh{align-items:flex-end}#mk-sh .b{width:100%;border-radius:16px 16px 0 0}}';
document.head.appendChild(sheetCss);
var IC={
 kakao:'<svg viewBox="0 0 24 24"><path fill="#3a1d1d" d="M12 4C7 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.7l-1 3.6c-.1.3.2.5.5.3l4.2-2.8c.4 0 .9.1 1.3.1 5 0 9-3.1 9-6.9S17 4 12 4z"/></svg>',
 sms:'<svg viewBox="0 0 24 24"><path fill="#fff" d="M5 4h14a2.5 2.5 0 012.5 2.5v8A2.5 2.5 0 0119 17h-6.6l-4.2 3.5c-.4.3-1-.1-1-.6V17H5a2.5 2.5 0 01-2.5-2.5v-8A2.5 2.5 0 015 4z"/><circle cx="8.2" cy="10.5" r="1.2" fill="#34c759"/><circle cx="12" cy="10.5" r="1.2" fill="#34c759"/><circle cx="15.8" cy="10.5" r="1.2" fill="#34c759"/></svg>',
 insta:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.2-1.2"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>'};
var cur=null,sh=null;
function copy(u){return(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(u):Promise.reject()).then(function(){return true;},function(){return false;});}
function go(u){var a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();}
function msg(t){var m=document.getElementById('mk-sh-m');if(m)m.textContent=t;}
function kakaoSend(c){
  function send(){try{
    if(!window.Kakao.isInitialized())window.Kakao.init(KAKAO_KEY);
    window.Kakao.Share.sendDefault({objectType:'feed',content:{title:c.title,description:c.text,imageUrl:BASE+'og.jpg',link:{mobileWebUrl:c.url,webUrl:c.url}},buttons:[{title:'열어 보기',link:{mobileWebUrl:c.url,webUrl:c.url}}]});
    close();}catch(e){fallback();}}
  function fallback(){copy(c.url).then(function(ok){msg(ok?'링크를 복사했어요. 카카오톡 대화창에 붙여넣으세요.':c.url);if(ISM)go('kakaotalk://launch');});}
  if(!KAKAO_KEY){fallback();return;}
  if(window.Kakao){send();return;}
  var s=document.createElement('script');s.src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';s.onload=send;s.onerror=fallback;document.head.appendChild(s);
}
function close(){if(sh)sh.hidden=true;}
function build(){
  sh=document.createElement('div');sh.id='mk-sh';sh.hidden=true;
  sh.innerHTML='<div class="b" role="dialog" aria-label="친구에게 공유하기"><div class="h">친구에게 공유하기<button type="button" class="x" aria-label="닫기">'+IC.x+'</button></div><div class="g">'+
   '<button type="button" data-k="kakao"><i style="background:#fee500">'+IC.kakao+'</i>카카오톡</button>'+
   '<button type="button" data-k="sms"><i style="background:#34c759">'+IC.sms+'</i>문자</button>'+
   '<button type="button" data-k="insta"><i style="background:linear-gradient(45deg,#feda75,#fa7e1e 25%,#d62976 55%,#4f5bd5)">'+IC.insta+'</i>인스타그램</button>'+
   '<button type="button" data-k="copy"><i style="background:#e6e6e6">'+IC.link+'</i>링크복사</button></div><p class="m" id="mk-sh-m" aria-live="polite"></p></div>';
  document.body.appendChild(sh);
  sh.onclick=function(e){
    if(e.target===sh||e.target.closest('.x')){close();return;}
    var b=e.target.closest('[data-k]');if(!b||!cur)return;var k=b.dataset.k,c=cur;
    if(k==='kakao')kakaoSend(c);
    else if(k==='sms'){if(ISM)go('sms:'+(ISI?'&':'?')+'body='+encodeURIComponent(c.text+'\n'+c.url));else copy(c.url).then(function(ok){msg(ok?'링크를 복사했어요. 휴대폰 문자에 붙여넣어 보내세요.':c.url);});}
    else if(k==='insta')copy(c.url).then(function(ok){msg(ok?'링크를 복사했어요. 인스타그램 메시지에 붙여넣으세요.':c.url);if(ISM)go('instagram://direct-inbox');});
    else copy(c.url).then(function(ok){msg(ok?'링크를 복사했어요.':c.url);});
  };
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh&&!sh.hidden){close();e.stopPropagation();}},true);
}
function share(title,text,url){
  cur={title:title,text:text,url:url};
  if(!sh)build();var d=document.querySelector('dialog[open]');(d||document.body).appendChild(sh);msg('');sh.hidden=false;
}
window.MOKGAGU_SHARE=share;
function nameOf(dlg){
  var e=dlg.querySelector('#d-info h1,#d-info h2,#d-info h3,#d-info b,#d-info strong,h1,h2,h3,.d-name,.d-title');
  return (e&&e.textContent.trim().split('\n')[0])||'';
}
function attach(dlg){
  if(dlg.querySelector('.shr')||dlg.hasAttribute('data-noshare'))return;
  var b=document.createElement('button');b.className='shr';b.type='button';b.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" style="vertical-align:-2px"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7l-1 3.6c-.1.4.3.6.6.4l4.3-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg> 공유';
  b.onclick=function(ev){ev.stopPropagation();
    var n=nameOf(dlg),pg=location.pathname.split('/').pop()||'index.html';
    var t='조선의 목가구'+(n?' — '+n:'');
    /* 지금 보는 기물의 도록·번호를 알아내 그 기물이 바로 열리는 링크를 만든다(못 알아내면 이 도록 주소) */
    var who=window.MOKGAGU_WHO?window.MOKGAGU_WHO(dlg):Promise.resolve(null);
    who.then(function(c){
      var url=(c&&c.pid)?BASE+'index.html#see='+c.b+'/'+encodeURIComponent(c.pid):BASE+pg;
      share('조선의 목가구',t,url);
    },function(){share('조선의 목가구',t,BASE+pg);});};
  dlg.appendChild(b);
}
function scan(){document.querySelectorAll('dialog[open]').forEach(attach);}
new MutationObserver(scan).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['open']});
document.addEventListener('DOMContentLoaded',function(){
  scan();
  var s=document.getElementById('site-share');
  if(s)s.onclick=function(e){e.preventDefault();share('조선의 목가구','조선의 목가구 — 거믄 힌 고미술공부방',BASE);};
});
})();
