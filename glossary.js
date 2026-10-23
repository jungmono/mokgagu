/* 목가구 용어 사전 + 본문 속 용어 툴팁.
   [용어, 한자, 뜻, 갈래, (같은 말들), (출처 s=수업)]
   수업에서 들은 것은 s=1 로 표시. 뜻은 짧게, 확실한 것만 적었습니다. */
(function(){
var G=[
['반닫이','','앞면 위쪽 절반이 열리고 닫히는 궤 모양의 수납가구. 이불·옷·귀중품을 넣었다. 이름은 함경도 방언 「드닫이」에서 왔다고 배움.','가구',['드닫이'],1],
['궤','櫃','뚜껑이나 앞면을 열고 물건을 넣는 상자 모양 가구의 통칭. 중국에서는 가구 일반을 가리키는 말이기도 하다.','가구',['櫃'],1],
['뒤주','','곡식을 담아 두는 큰 궤 모양 가구. 곡식 양에 따라 집채뒤주(벼)·쌀뒤주로 나눠 부르기도 한다.','가구',['궤뒤주'],1],
['약장','藥欌','약재를 칸칸이 담는 작은 서랍이 줄지어 있는 장. 약재 이름을 적어 두고 쓴다.','가구',[],0],
['사방탁자','四方卓','네 기둥에 층층이 선반을 올리고 사방을 틔운 가구. 책·완상품을 올려 두었다.','가구',['탁자','책탁자'],0],
['책탁자','冊卓','책을 올려 두는 층 선반형 가구. 칸으로 구성되면 「격(格)」이라 한다.','가구',[],1],
['소반','小盤','한 사람 몫의 음식을 차려 나르던 작은 밥상. 조선은 바닥에 앉아 1인 1반이었다.','가구',['밥상'],1],
['개다리소반','','상다리가 개의 다리처럼 휜 소반.','가구',['개다리상'],0],
['호족반','虎足盤','다리가 호랑이 발 모양으로 휜 소반.','가구',[],0],
['구족반','狗足盤','다리가 개 다리 모양으로 휘어 내려온 소반.','가구',[],0],
['통영반','','통영에서 만든 소반. 지역 이름(통영·나주·해주)으로 소반을 구분해 부른다.','가구',['나주반','해주반'],1],
['풍혈','風穴','소반 다리나 상판 아래 둘레에 뚫은 구멍 장식. 풍혈이 있는 소반은 풍혈반이라 한다.','구조',['풍혈반'],0],
['서안','書案','책을 읽을 때 앞에 놓는 낮은 책상.','가구',['책상'],0],
['경상','經床','경서를 올려 두고 읽는 낮은 책상. 서안과 비슷하게 쓰인다.','가구',[],0],
['연상','硯床','벼루·먹·붓 등 문방구를 넣거나 올려 두는 작은 가구. 하단에 공간이 없는 연상은 연대가 없다고 배움.','가구',['벼루집','硯函','벼룻집'],1],
['문갑','文匣','서류·문방구 등을 넣어 두는 낮은 수납가구. 좌식 책장에서 변해 개화기(두 번째 개혁 무렵)에 등장했다고 배움.','가구',[],1],
['머릿장','','잠자리 머리맡에 두는 낮은 장. 이불·옷가지를 넣었다.','가구',['單層欌'],0],
['장','欌','층을 쌓거나 문을 달아 물건을 넣는 가구. 장/농이라는 이름은 일제강점기에 나왔다고 배움.','가구',[],1],
['농','籠','옷 등을 층층이 나눠 넣는 상자형 가구. 장과 달리 층마다 분리되는 형식을 가리킨다.','가구',[],0],
['삼층장','三層欌','세 층으로 쌓아 올린 장. 조선 후기에 나온 형식으로, 큰 것은 부잣집·왕실 가구의 뜻이 있다고 배움.','가구',['이층장'],1],
['의걸이장','','옷을 걸어 보관하는 장. 원앙장·의걸이장은 실용·형태가 이름에 쓰인 사례.','가구',['원앙장'],1],
['찬장','','음식·그릇을 넣어 두는 장. 연대 있는 것은 동자 단면이 각져 있다고 배움.','가구',[],1],
['앞닫이','','앞면이 위에서 아래로 여닫히는 낮은 장. 옷이 늘면서 나온 가구.','가구',[],1],
['함','函','물건을 넣는 작은 상자. 혼례함·의함(衣函) 등 쓰임에 따라 이름이 붙는다.','가구',[],1],
['가께수리','','금고 구실을 하는 작은 궤. 일본어에서 온 이름으로 보며, 각게수리·각계수리로도 적는다.','가구',['각게수리','각계수리','갑게수리'],0],
['필통','筆筒','붓을 꽂아 두는 통.','문방구',[],0],
['빗접','','빗·거울 등 머리 단장 도구를 담는 함. 정사각형에 가까운 것은 동경을 넣기 위한 것이라 연대가 있다고 배움.','가구',['빗접고비'],1],
['먹줄통','','목수가 먹줄을 튕겨 선을 긋는 도구. 왕실의 궁 수리와 소목장 후계 전승 표시에도 쓰였고, 해태 머리가 최고라고 배움.','도구',['먹통'],1],
['교의','交椅','제사 때 영혼이 내려와 앉는다고 보는 의자. 다리가 X자로 교차해 「交」.','제구',['交椅'],1],
['제상','祭床','제사 음식을 차리는 상.','제구',['祭床'],1],
['향탁','香卓','향로를 올려 두는 탁자.','제구',['香卓'],1],
['감실','龕室','신주·위패를 모시는 작은 방이나 집 모양의 함.','제구',[],1],
['영여','靈輿','제사 때 영혼을 모시고 이동하는 작은 가마.','제구',[],1],
['장석','裝錫','가구에 달리는 금속 장식·철물(경첩·고리·자물쇠 받침 등). 지역마다 다르다고 배움.','철물',['장식철물'],1],
['감잡이','','궤의 모서리·이음부를 감싸 보강하는 ㄷ자 쇠. 소모품으로 본다고 배움.','철물',[],1],
['거멀장','','두 널을 이어 맞대어 벌어지지 않게 거는 쇠(거멀못).','철물',['거멀못','거멀도'],1],
['돌쩌귀','','문짝을 기둥에 달아 돌려 여닫게 하는 경첩의 일종. 돌쩌귀 경첩은 200년 이전이라 배움.','철물',['돌져귀'],1],
['경첩','','문짝이 여닫히게 이어 주는 금속 장치.','철물',[],0],
['붕어자물쇠','','붕어 모양의 자물쇠. 뒤주에 주로 쓰였다.','철물',[],1],
['성수만세','聖壽萬歲','백동 자물쇠에 새긴 글귀. 이것이 새겨진 것은 고종 때 것이라 배움.','문양',[],1],
['환고리','','문·서랍에 달린 둥근 고리 손잡이. 이중 고리는 연대 있고 단순 고리는 연대 없다고 배움.','철물',[],1],
['동자','','장·탁자의 앞면 기둥 사이에 세우는 짧은 기둥. 숨은 동자·오목동자·헛동자·평동자 등이 있다.','구조',[],1],
['숨은 동자','','겉으로 보이지 않게 안쪽에 숨겨 세운 동자.','구조',['숨은동자'],1],
['헛동자','','모양만 내려고 붙인 동자.','구조',[],1],
['평동자','','면과 평평하게 맞춘 동자. 강점기 치장에 많이 쓰였다고 배움.','구조',[],1],
['통판','','이음 없이 한 장으로 켠 넓은 널. 앞판에 통판을 쓴 반닫이는 귀하게 본다.','구조',['통널'],0],
['사개맞춤','','두 널의 모서리를 손가락 깍지 끼듯 맞물려 짜는 이음. 귀가 나오지 않는 방식도 있다.','구조',['사개'],1],
['연귀맞춤','','두 부재의 모서리를 45도로 잘라 맞대는 이음.','구조',['연귀'],0],
['장부맞춤','','한쪽 부재에 장부를 내고 다른 쪽에 구멍을 파 끼우는 이음.','구조',['장부'],0],
['머름','','창 아래나 가구의 아랫부분에 짠 낮은 널 구조.','구조',['머름칸'],0],
['통발','','궤의 발 중 가장 단순한 것. 각목을 그대로 쓴 목발.','구조',[],1],
['평발','','낮고 사면을 감싸는 형태의 궤 발. 감잡이 등 디테일이 있다.','구조',[],1],
['집게발','','측면널이 이어져 그대로 발 구실을 하는 궤의 발.','구조',[],1],
['안상문','眼象紋','코끼리 눈 모양으로 파낸 문양. 여의두문 새김과 구별해 본다고 배움.','문양',['안상'],1],
['여의두문','如意頭紋','여의(如意)의 머리 모양을 본뜬 구름 모양 문양.','문양',['여의두'],1],
['쌍희','囍','「囍」 문자 문양. 강점기에 많이 쓰였고 조선시대에는 쓰지 않았다고 배움.','문양',['쌍희자'],1],
['수복강녕','壽福康寧','오래 살고 복되고 건강하며 편안하라는 뜻의 글귀. 오래된 글귀로, 부귀다남·백수백복은 강점기에 시작했다고 배움.','문양',['부귀다남','백수백복'],1],
['박쥐문','','박쥐(蝠)는 복(福)과 음이 같아 복을 비는 문양으로 쓴다.','문양',['蝠'],0],
['나전칠기','螺鈿漆器','조개껍데기를 갈아 붙이고 옻칠로 마감한 공예품.','공예',['나전'],0],
['화각','華角','소뿔을 얇게 펴 뒷면에 채색 그림을 그려 붙이는 공예.','공예',['화각공예'],0],
['대모','玳瑁','바다거북류의 등껍질. 투명한 황갈색 무늬로 가구·함을 꾸민다.','공예',['대모갑'],1],
['백동','白銅','구리와 니켈 합금의 흰 금속. 개화기 큰 장석에 많이 쓰였다.','철물',[],1],
['황동','黃銅','구리와 아연의 합금. 산화되면 붉게 보인다고 배움.','철물',['놋'],1],
['무쇠','','철을 주조해 만든 단단한 쇠. 오동나무 이층농은 황동보다 무쇠 장석이 더 오래됐다고 배움.','철물',[],1],
['느티나무','','단단하고 결이 아름다운 나무. 반닫이·장롱 앞판에 많이 쓰인다.','나무',['괴목'],0],
['오동나무','','가볍고 습기·뒤틀림에 강한 나무. 의류·문서를 넣는 장·함에 쓴다.','나무',['오동'],0],
['소나무','','우리나라에서 가장 흔한 가구 재료. 뒤판·속 부재에 많이 쓰인다.','나무',[],0],
['먹감나무','','감나무 속의 검은 먹빛 무늬 부분을 쓰는 나무. 판재 무늬를 장식으로 삼는다.','나무',['먹감'],0],
['용목','龍木','용이 꿈틀거리는 듯한 화려한 나뭇결을 이르는 말(용목이라는 나무는 없다고 배움).','나무',['용두머리장'],1],
['화류목','樺榴木','타지에서 들어온 귀한 나무임을 강조하는 재료명.','나무',['화류'],1],
['수심','','나무 줄기의 중심(심). 수심을 지나게 켠 판재는 오래되면 휜다고 배움.','나무',[],1],
['개화기','開化期','조선 말~일제강점기 초 문물이 바뀌던 시기. 수업에서는 개화기 가구를 4단계로 나눠 감정 기준으로 삼는다.','시대',[],1],
['창안품','創案品','조선 기물은 창안품, 개화기 기물은 상품이라 연대가 중요하다고 배움.','감정',[],1],
['땟물','','오랜 세월 사람 손때가 묻어 생긴 은은한 윤기.','감정',['손때'],1],
['소목장','小木匠','가구·문틀 등 작은 목재를 다루는 목수.','사람',['소목'],0],
['금사리','','경기 광주의 도자 가마 터. 태토가 달라 밝으면서 광채가 난다고 배움.','도자',[],1],
['분원','分院','조선 왕실용 도자기를 굽던 광주의 관요.','도자',[],1],
['태토','胎土','도자기를 빚는 바탕흙.','도자',[],1],
['어피함','魚皮函','상어 가죽(어피)을 씌워 만든 함.','가구',['어피'],0],
['인궤','印櫃','인장(도장)을 보관하는 상자.','가구',['印櫃'],0],
['지통','紙筒','두루마리 종이를 꽂아 두는 통.','문방구',[],0],
['등가','燈架','등잔을 올려 두는 받침.','도구',['등경걸이','등경'],0]
];
var IDX={};G.forEach(function(g){IDX[g[0]]=g;(g[4]||[]).forEach(function(a){IDX[a]=g;});});
var KEYS=Object.keys(IDX).filter(function(k){return k.length>=2;}).sort(function(a,b){return b.length-a.length;});
window.MOKGAGU_GLOSSARY={list:G,find:function(k){return IDX[k];}};
if(location.pathname.indexOf('glossary')>=0)return;       // 사전 화면은 따로
var re=new RegExp(KEYS.map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|'),'g');
var SKIP='A,BUTTON,INPUT,TEXTAREA,SCRIPT,STYLE,SELECT,SVG,CODE,.gl,[data-nogl],.lk-k,.card-title,h1,h2,h3';
var css=document.createElement('style');
css.textContent='.gl{border-bottom:1px dotted #555;cursor:help}.gl:hover{background:#eee}'+
'#glpop{position:fixed;z-index:99999;max-width:min(300px,86vw);background:#fff;color:#111;border:1.5px solid #111;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.6;box-shadow:0 6px 20px rgba(0,0,0,.2);display:none}'+
'#glpop b{font-size:14px}#glpop small{color:#666}#glpop a{color:#111;font-size:12px;text-decoration:underline}';
document.head.appendChild(css);
var pop=document.createElement('div');pop.id='glpop';document.body.appendChild(pop);
function show(el){
  var g=IDX[el.getAttribute('data-gl')];if(!g)return;
  pop.innerHTML='<b>'+g[0]+'</b> '+(g[1]?'<small>'+g[1]+'</small> ':'')+'<small>· '+g[3]+'</small><br>'+g[2]+(g[5]?'<br><small>수업에서 배운 내용</small>':'')+'<br><a href="glossary.html#'+encodeURIComponent(g[0])+'">용어 사전에서 보기</a>';
  pop.style.display='block';
  var r=el.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
  var x=Math.max(8,Math.min(innerWidth-w-8,r.left)),y=r.bottom+6;if(y+h>innerHeight-8)y=Math.max(8,r.top-h-6);
  pop.style.left=x+'px';pop.style.top=y+'px';
}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.gl');if(t){e.stopPropagation();show(t);}else if(!e.target.closest('#glpop'))pop.style.display='none';},true);
document.addEventListener('mouseover',function(e){var t=e.target.closest&&e.target.closest('.gl');if(t&&matchMedia('(hover:hover)').matches)show(t);});
document.addEventListener('mouseout',function(e){if(e.target.closest&&e.target.closest('.gl')&&matchMedia('(hover:hover)').matches)pop.style.display='none';});
window.addEventListener('scroll',function(){pop.style.display='none';},true);
var BLOCK='P,LI,DIV,TD,SPAN';
function wrap(root){
  if(!root||root.nodeType!==1||root.closest&&root.closest(SKIP))return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    if(n.nodeValue.length<2||!/[가-힣]/.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
    var p=n.parentNode;if(!p||p.closest(SKIP))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;}});
  var nodes=[],n;while((n=w.nextNode())&&nodes.length<4000)nodes.push(n);
  var seen=new Map();
  nodes.forEach(function(n){
    var p=n.parentNode,blk=p.closest('p,li,.d-desc,.lk-note,td,div')||p;
    var set=seen.get(blk);if(!set){set={};seen.set(blk,set);}
    var s=n.nodeValue;re.lastIndex=0;var m,last=0,frag=null;
    while((m=re.exec(s))){
      var g=IDX[m[0]];if(!g||set[g[0]])continue;set[g[0]]=1;
      frag=frag||document.createDocumentFragment();
      frag.appendChild(document.createTextNode(s.slice(last,m.index)));
      var sp=document.createElement('span');sp.className='gl';sp.setAttribute('data-gl',m[0]);sp.textContent=m[0];frag.appendChild(sp);
      last=m.index+m[0].length;
    }
    if(frag){frag.appendChild(document.createTextNode(s.slice(last)));p.replaceChild(frag,n);}
  });
}
var timer,pend=[];
function flush(){timer=0;var l=pend;pend=[];l.forEach(wrap);}
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(a){if(a.nodeType===1&&!(a.classList&&a.classList.contains('gl'))&&a.id!=='glpop')pend.push(a);});});
  if(pend.length&&!timer)timer=setTimeout(flush,250);}).observe(document.body,{childList:true,subtree:true});
setTimeout(function(){wrap(document.body);},600);
})();
