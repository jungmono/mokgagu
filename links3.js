/* 기물 창 아래 세 갈래: 같은 기종 / 이 지역 / 용어 */
(function(){
var K=['반닫이','이층장','삼층장','사방탁자','책탁자','약장','뒤주','문갑','경상','서안','안궤','소반','장롱','농','궤','함','장','상','탁자','병풍','연상','교자상','빗접','경대','찬탁'];
var R=[['경상','경상도'],['전라','전라도'],['평안','평안도'],['황해','황해도'],['강원','강원도'],['충청','충청도'],['경기','경기'],['함경','함경도'],['제주','제주'],['통영','통영'],['나주','나주'],['서울','서울']];
var css=document.createElement('style');css.textContent='.l3{display:flex;gap:8px;margin:18px 0 4px}.l3 a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;text-decoration:none;color:#000;background:#fff;border:2.5px solid #000;border-radius:12px;padding:10px 4px;box-shadow:3px 3px 0 #000;transition:.12s}.l3 a:hover,.l3 a:active{background:#000;color:#fff;transform:translate(2px,2px);box-shadow:1px 1px 0 #000}.l3 i{font-style:normal;font-size:24px;line-height:1}.l3 b{font-size:15px;font-weight:900}.l3 s{text-decoration:none;font-size:11.5px;opacity:.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}';
document.head.appendChild(css);
function build(inf){
 if(!inf||inf.querySelector('.l3'))return;
 var h=inf.querySelector('h3,h2,h1');if(!h)return;
 var t=(h.textContent||'').replace(/\s/g,''),all=inf.textContent;
 var k='';for(var i=0;i<K.length;i++){if(t.indexOf(K[i])>=0){k=K[i];break;}}
 if(!k)return;
 var rg='';for(var j=0;j<R.length;j++){if(all.indexOf(R[j][0])>=0){rg=R[j][1];break;}}
 var g=window.MOKGAGU_GLOSSARY,gt=k;
 if(g&&g.list){var f=g.list.filter(function(e){return e[0]===k||(e[4]||[]).indexOf(k)>=0;})[0];gt=f?f[0]:'';}
 var d=document.createElement('div');d.className='l3';
 d.innerHTML='<a href="index.html#q='+encodeURIComponent(k)+'"><i>🗂</i><b>같은 기종</b><s>다른 도록에서 보기</s></a>'+
  '<a href="bandaji-map.html"><i>🗺</i><b>이 지역</b><s>'+(rg?rg+' · ':'')+'여지도에서 보기</s></a>'+
  (gt?'<a href="glossary.html#'+encodeURIComponent(gt)+'"><i>📖</i><b>용어</b><s>사전에서 「'+gt+'」</s></a>':'');
 inf.appendChild(d);
}
function go(){var inf=document.getElementById('d-info');if(!inf)return;build(inf);
 new MutationObserver(function(){build(inf)}).observe(inf,{childList:true});}
if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
})();
