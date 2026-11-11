/* 조선의 목가구 — 사람 모양(한복, 쪽빛 담채 · 반듯이 선 모습). 2026-11-11
 * MOKGAGU_PERSON.svg(x, yFloor, pxPerCm, H, who, sit) → SVG 조각
 *   who: 'm' 선비(도포·갓) | 'w' 여인(저고리·치마), sit: 앉은 모습
 *   그림 단위는 키 170 = 정수리 0 ~ 바닥 170, 가운데 x=0.
 * MOKGAGU_PERSON.width(H, who, sit) → 차지하는 가로 cm, top(H, who, sit) → 갓·머리까지 높이 cm
 */
(function () {
const M={robe:'#d7e0ec',sh:'#c3cfe0',ln:'#5d6b80',sk:'#ecdcc8',gat:'#4a4844',wh:'#fbfaf5',belt:'#56647a',shoe:'#5b5048',hair:'#3f352e'};
const W={jeo:'#f3e6c4',chima:'#a9b9d6',gor:'#7a5a8a',sk:'#ecdcc8',hair:'#3f352e',ln:'#5d6b80',wh:'#fbfaf5',shoe:'#8b6f8f'};
const S=(f,ln=M.ln,w=1.1)=>`fill="${f}" stroke="${ln}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"`;
const P=(d,f,ln)=>`<path d="${d}" ${S(f,ln)}/>`;
const L=(d,op=.45,c=M.ln,w=1)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
const G=(dy,s,dx=0)=>`<g transform="translate(${dx},${dy})">${s}</g>`;
const FL=(s)=>`<g transform="scale(-1,1)">${s}</g>`;
/* 머리 */
function gat(x=0){return `<g transform="translate(${x},0)"><path d="M-6.6,3.2 L-5.4,-9.6 C-3,-11.2 3,-11.2 5.4,-9.6 L6.6,3.2Z" ${S(M.gat)} fill-opacity=".9"/><ellipse cx="0" cy="3.6" rx="24.5" ry="3.3" ${S(M.gat)} fill-opacity=".55"/>${L('M-6.6,2.2 Q0,3.6 6.6,2.2',.6,'#222')}</g>`}
function mHead(){return P('M-4.2,17 L-4.6,27 L4.6,27 L4.2,17Z',M.sk)+`<ellipse cx="0" cy="11.2" rx="8.6" ry="10.6" ${S(M.sk)}/>`+
  P('M-8.5,9 C-8.9,-2.5 8.9,-2.5 8.5,9 C5,6.2 -5,6.2 -8.5,9Z',M.hair)+L('M-8.2,11 C-8.4,17 -5,21.5 -0.5,23.4 M8.2,11 C8.4,17 5,21.5 0.5,23.4',.75,'#3a3835',.9)+L('M-0.6,23.4 L-1.6,33 M0.6,23.4 L1.8,34',.75,'#3a3835',.9)+gat()}
function wHead(){return P('M-3.8,17 L-4.2,27 L4.2,27 L3.8,17Z',W.sk)+`<ellipse cx="0" cy="11.2" rx="8.4" ry="10.4" ${S(W.sk)}/>`+
  P('M-9,13 C-10.6,2 -6,-1.2 0,-1.2 C6,-1.2 10.6,2 9,13 C8.2,7.4 4.4,4.6 0.4,3.6 L0,2.2 L-0.4,3.6 C-4.4,4.6 -8.2,7.4 -9,13Z',W.hair)}
/* 깃·동정 */
function git(col,dx=0){return G(0,P('M-5,23.6 L5,23.6 L0.4,34Z',M.sk)+P('M-5,23.2 L-7.4,24.6 L-1.2,36.4 L1,33.6Z',M.wh)+P('M5,23.2 L7.6,24.6 L-6.4,47 L-9.2,44.6Z',M.wh),dx)}
/* ───── 선비 ───── */
const mBody='M-5,24 C-10,26 -16,28 -20,31.5 C-21.5,52 -21.5,72 -22.5,92 C-23.5,120 -26,144 -28,157.5 Q0,163 28,157.5 C26,144 23.5,120 22.5,92 C21.5,72 21.5,52 20,31.5 C16,28 10,26 5,24Z';
function mFeet(dx=0){return G(0,P('M-13,157 L-12.4,165 L-4,165 L-3.6,158.5Z',M.wh)+P('M3.6,158.5 L4,165 L12.4,165 L13,157Z',M.wh)+
  P('M-15.5,166.5 C-15.5,163.6 -4,163.4 -2.6,166.4 C-2.4,169 -3,170 -4.4,170 L-14,170 C-15.4,170 -15.6,168.4 -15.5,166.5Z',M.shoe)+P('M15.5,166.5 C15.5,163.6 4,163.4 2.6,166.4 C2.4,169 3,170 4.4,170 L14,170 C15.4,170 15.6,168.4 15.5,166.5Z',M.shoe),dx)}
function mBelt(y=62){return L(`M-21.6,${y} Q0,${y+2.6} 21.8,${y}`,1,M.belt,2)+L(`M-7,${y+1.4} C-8,${y+14} -9,${y+28} -9.4,${y+40} M-5.4,${y+1.6} C-5.4,${y+16} -5.6,${y+30} -5.2,${y+44}`,1,M.belt,1.5)+
  `<rect x="-10.6" y="${y+40}" width="2.4" height="5" fill="${M.belt}"/><rect x="-6.4" y="${y+44}" width="2.4" height="5" fill="${M.belt}"/><circle cx="-6.2" cy="${y+1.4}" r="1.9" fill="${M.belt}"/>`}
const mSeop=L('M-7.6,46 C-7.4,80 -5.6,122 -4.4,160',.5)+L('M11,66 C12,100 14.5,132 17,159',.3)+L('M-15,66 C-16,100 -18,132 -20,158.6',.3);
function manA(){ // 차렷
  const slv='M19.4,31.2 C26,34.4 30.4,44 32.4,58 C34.4,74 35.4,88 34.6,99 C30.6,102.4 24.4,102.4 20.4,99.4 C20.6,82 20.4,64 18.4,47Z';
  const hand=`<ellipse cx="27.6" cy="103" rx="3.5" ry="4.6" ${S(M.sk)}/>`;
  return mFeet()+P(mBody,M.robe)+mSeop+git()+mBelt()+hand+FL(hand)+P(slv,M.robe)+FL(P(slv,M.robe))+L('M21.5,97 C25,99 30,99 33.6,96.6',.4)+FL(L('M21.5,97 C25,99 30,99 33.6,96.6',.4))+mHead()}
const mLap='M-45,170 C-49.6,160 -45,150.4 -35,147.4 C-29,145.6 -24,146 -21,146 L21,146 C24,146 29,145.6 35,147.4 C45,150.4 49.6,160 45,170Z';
const mTorso='M-5,106 C-10,108 -16,110 -20,113.5 C-21,126 -22,138 -24,149 L24,149 C22,138 21,126 20,113.5 C16,110 10,108 5,106Z';
const mLegs=L('M-33,160 C-14,151 14,152 36,161.6',.45)+L('M31,157.6 C17,152.4 6,152.4 -5,156.4',.45);
function manSA(){const slv='M19.4,113.2 C27,117 31.4,128 33.2,140 C34.2,146 33.4,152 31.4,156 C27.4,158.4 22.4,156.6 20,153 C21,142 20.2,131 18.2,124Z';const hand=`<ellipse cx="27" cy="158" rx="4.4" ry="3.2" ${S(M.sk)}/>`;
  return P(mLap,M.robe)+mLegs+P(mTorso,M.robe)+G(82,git())+L('M-21.6,136 Q0,138.4 21.8,136',1,M.belt,2)+hand+FL(hand)+P(slv,M.robe)+FL(P(slv,M.robe))+G(82,mHead())}
const wJeo='M-5,24 C-9,26 -13,28 -17,30.8 L-17.6,46.4 Q0,48.6 17.6,46.4 L17,30.8 C13,28 9,26 5,24Z';
const wChima='M-16.8,45.6 C-21,72 -26.4,112 -31.4,150 C-32.6,158 -33,163 -33,166.4 C-19,170.6 19,170.6 33,166.4 C33,163 32.6,158 31.4,150 C26.4,112 21,72 16.8,45.6 Q0,48 -16.8,45.6Z';
const wFolds=L('M-8,47.4 C-10,90 -13.4,132 -16,168.6',.4,'#6f82a6')+L('M7.4,47.4 C9,90 12.4,132 15,168.6',.4,'#6f82a6')+L('M-13,46.6 C-17,90 -22.4,132 -26,167.6',.3,'#6f82a6')+L('M13,46.6 C17,90 22,132 25.4,167.6',.3,'#6f82a6')+L('M0,48 C0.6,90 0.4,132 0,169.4',.25,'#6f82a6');
const wShoe=P('M-9.4,167.6 C-8.4,165 -3.4,165.4 -2.6,168.4 C-3,170 -8,170 -9.4,169Z',W.wh)+P('M9.4,167.6 C8.4,165 3.4,165.4 2.6,168.4 C3,170 8,170 9.4,169Z',W.wh);
function goreum(len=40){return `<path d="M-4.4,39.4 C-9.6,46 -11.6,54 -12,${24+len} L-9,${24.6+len} C-8.4,56 -6.6,48 -3.2,41.4Z" ${S(W.gor,'#5d4670',.8)}/><path d="M-4.4,39.4 C-6.4,50 -7.2,62 -6.8,${39+len} L-3.6,${39+len} C-3.6,62 -2.6,50 -2,40.4Z" ${S(W.gor,'#5d4670',.8)}/><ellipse cx="-1.4" cy="38" rx="3.6" ry="2" transform="rotate(-24 -1.4 38)" ${S(W.gor,'#5d4670',.8)}/>`}
function womA(){const slv='M16.6,30.6 C21.4,33.4 24.4,42 25.8,56 C27,70 27.2,80 26.4,89 L20.6,89.6 C20.4,79 19.4,66 16.8,50Z';const kk='M20.5,84.6 L26.9,84 L26.4,89 L20.6,89.6Z';const hand=`<ellipse cx="23.5" cy="93" rx="2.9" ry="4.4" ${S(W.sk)}/>`;
  return P(wChima,W.chima)+wFolds+wShoe+P(wJeo,W.jeo)+git()+goreum()+hand+FL(hand)+P(slv,W.jeo)+FL(P(slv,W.jeo))+P(kk,W.gor,'#5d4670')+FL(P(kk,W.gor,'#5d4670'))+wHead()}
const wDome='M-50,170 C-53,152 -42,132 -19,126.4 Q0,123.6 19,126.4 C42,132 53,152 50,170Z';
const wDomeF=L('M-9,127 C-16,140 -24,156 -28,169.6',.4,'#6f82a6')+L('M8,127 C15,140 23,156 27,169.6',.4,'#6f82a6')+L('M-15,128 C-27,138 -38,154 -41,169.6',.3,'#6f82a6')+L('M15,128 C27,138 38,154 41,169.6',.3,'#6f82a6')+L('M0,126 C0.6,140 0.4,156 0,169.6',.25,'#6f82a6');
const wJeoS='M-5,106 C-9,108 -13,110 -17,112.8 L-17.6,128.4 Q0,130.6 17.6,128.4 L17,112.8 C13,110 9,108 5,106Z';
function womSA(){const slv='M16.6,112.6 C22,116 25,126 26,136 C26.6,142 25.4,147 23.4,150.4 L17.6,148.4 C18.6,140 18.4,131 16.8,123Z';const kk='M18.4,143.6 L24.8,146 L23.4,150.4 L17.6,148.4Z';const hand=`<ellipse cx="20.2" cy="152.6" rx="4" ry="3" ${S(W.sk)}/>`;
  return P(wDome,W.chima)+wDomeF+P(wJeoS,W.jeo)+G(82,git())+G(82,goreum(30))+hand+FL(hand)+P(slv,W.jeo)+FL(P(slv,W.jeo))+P(kk,W.gor,'#5d4670')+FL(P(kk,W.gor,'#5d4670'))+G(82,wHead())}
  var F = { m0: manA, w0: womA, m1: manSA, w1: womSA }, HALF = { m0: 36, w0: 28, m1: 50, w1: 54 }, TOP = { m0: 181.2, w0: 171.2, m1: 99.2, w1: 89.2 };
  function key(who, sit) { return (who === 'w' ? 'w' : 'm') + (sit ? 1 : 0); }
  window.MOKGAGU_PERSON = {
    svg: function (x, y0, s, H, who, sit) { return '<g transform="translate(' + x + ',' + y0 + ') scale(' + (s * H / 170) + ') translate(0,-170)">' + F[key(who, sit)]() + '</g>'; },
    width: function (H, who, sit) { return 2 * HALF[key(who, sit)] * H / 170; },
    top: function (H, who, sit) { return TOP[key(who, sit)] * H / 170; }
  };
})();
