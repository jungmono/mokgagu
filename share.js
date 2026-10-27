/* 기물 창(dialog)에 「공유」 단추를 달고, 홈 화면 공유 칩도 처리한다. */
(function(){
var css=document.createElement('style');
css.textContent='.shr{position:absolute;top:8px;left:8px;z-index:5;background:#fff;color:#111;border:1.5px solid #111;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer}.shr:active{background:#111;color:#fff}';
document.head.appendChild(css);
var BASE='https://jungmono.github.io/mokgagu/';
function say(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 16px;border-radius:999px;font-size:14px;z-index:2147483647';(document.querySelector('dialog[open]')||document.body).appendChild(d);setTimeout(function(){d.remove();},1800);}
function share(title,text,url){
  if(navigator.share){navigator.share({title:title,text:text,url:url}).catch(function(){});return;}
  var t=text+'\n'+url;
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){say('링크를 복사했어요');},function(){prompt('복사해서 보내 주세요',t);});}
  else prompt('복사해서 보내 주세요',t);
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
