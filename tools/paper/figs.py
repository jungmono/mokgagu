import csv, json, math, sys
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
import os
S=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'out')
for f in fm.findSystemFonts():
    if 'NotoSansCJK-Regular' in f: fm.fontManager.addfont(f)
plt.rcParams.update({'font.family':'Noto Sans CJK KR','font.size':10,'axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#555','axes.labelcolor':'#222','xtick.color':'#444','ytick.color':'#444','axes.unicode_minus':False})
rows=list(csv.DictReader(open(S+'/data.csv',encoding='utf-8-sig')))
for r in rows: r['w']=float(r['w']); r['h']=float(r['h']); r['R']=r['w']/r['h']
res=json.load(open(S+'/results.json'))
ORDER=['평안','황해','강원','경기','충청','전라','경상','제주']
ORDER=[g for g in ORDER if any(r['region']==g for r in rows)]   # 공개판에는 황해가 없음
INK='#222'; MUTE='#9a9a9a'; ACC='#b4532a'
rng=np.random.default_rng(1)
# 그림 1: 지역별 정면 비 분포
fig,ax=plt.subplots(figsize=(7.2,4.2),dpi=200)
for i,g in enumerate(ORDER):
    a=np.array([r['R'] for r in rows if r['region']==g]); x=i
    src=[r['src'] for r in rows if r['region']==g]
    jit=rng.uniform(-.18,.18,len(a))
    ax.scatter(x+jit,a,s=12,facecolor='none',edgecolor=MUTE,linewidth=.7,zorder=2)
    q1,md,q3=np.percentile(a,[25,50,75])
    ax.add_patch(plt.Rectangle((x-.28,q1),.56,q3-q1,fill=False,edgecolor=INK,linewidth=1.2,zorder=3))
    ax.plot([x-.28,x+.28],[md,md],color=ACC if g=='경상' else INK,linewidth=2.2,zorder=4,solid_capstyle='round')
    ax.text(x,0.62,f'n={len(a)}',ha='center',fontsize=8.5,color='#555')
for v,lab in [(1,'1 : 1'),(2**.5,'√2'),((1+5**.5)/2,'황금비')]:
    ax.axhline(v,color='#cfcfcf',linewidth=.8,linestyle=(0,(4,3)),zorder=1); ax.text(len(ORDER)-.45,v,lab,fontsize=8,color='#777',va='center')
ax.set_xticks(range(len(ORDER))); ax.set_xticklabels(ORDER); ax.set_xlim(-.6,len(ORDER)-.1); ax.set_ylim(.55,2.65)
ax.set_ylabel('정면 비 (가로 ÷ 높이)'); ax.set_xlabel('북 → 남' + ('   (황해는 표본이 적어 검정에서 뺌)' if '황해' in ORDER else ''),fontsize=9,color='#555')
ax.grid(axis='y',color='#eee',linewidth=.6); ax.set_axisbelow(True)
fig.tight_layout(); fig.savefig(S+'/fig1.png'); plt.close(fig)
# 그림 2: 가로 × 높이, 지역별 작은 그림
fig,axs=plt.subplots(2,4,figsize=(8.4,4.6),dpi=200,sharex=True,sharey=True)
for ax in list(axs.flat)[len(ORDER):]: ax.axis('off')
for ax,g in zip(axs.flat,ORDER):
    for k in [1,1.25,1.5,1.75,2]:
        ax.plot([0,150],[0,150/k],color='#e2e2e2',linewidth=.7,zorder=1)
    other=[r for r in rows if r['region']!=g]
    ax.scatter([r['w'] for r in other],[r['h'] for r in other],s=4,color='#ececec',zorder=1)
    sub=[r for r in rows if r['region']==g]
    ax.scatter([r['w'] for r in sub],[r['h'] for r in sub],s=11,facecolor=ACC if g=='경상' else INK,edgecolor='white',linewidth=.4,zorder=3)
    ax.set_title(f'{g} ({len(sub)})',fontsize=9.5,loc='left',color=INK)
    ax.set_xlim(55,135); ax.set_ylim(35,115); ax.set_aspect('equal'); ax.tick_params(labelsize=8)
for k,y in [(1,'1'),(1.5,'1.5'),(2,'2')]:
    axs[0,3].text(134,134/k if 134/k<114 else 113,y,fontsize=7,color='#999',ha='right',va='bottom')
fig.supxlabel('가로 (cm)',fontsize=9.5); fig.supylabel('높이 (cm)',fontsize=9.5)
fig.tight_layout(); fig.savefig(S+'/fig2.png'); plt.close(fig)
# 그림 3: 지역 중앙값(95% 신뢰구간)과 선행연구 평균
PRIOR={'김동귀 2017(도별 평균)':{'평안':920/917,'경기':918/844,'강원':848/757,'충청':884/718,'전라':959/696,'경상':926/548},
       '정복상 2003':{'경상':1.60,'전라':1.36},'권유리 2006':{'경상':912/620},'허미영 1993':{'전라':990/793}}
MK={'김동귀 2017(도별 평균)':'s','정복상 2003':'^','권유리 2006':'D','허미영 1993':'v'}
R7=['평안','강원','경기','충청','전라','경상','제주']
fig,ax=plt.subplots(figsize=(6.6,4.4),dpi=200)
for i,g in enumerate(R7):
    d=res['desc'][g]; y=len(R7)-1-i
    ax.plot(d['ci'],[y,y],color=INK,linewidth=1.6,solid_capstyle='round'); ax.scatter([d['med']],[y],s=36,color=ACC if g=='경상' else INK,zorder=3)
    for j,(k,v) in enumerate(PRIOR.items()):
        if g in v: ax.scatter([v[g]],[y+.22],marker=MK[k],s=22,facecolor='none',edgecolor='#666',linewidth=.9,zorder=2)
ax.set_yticks(range(len(R7))); ax.set_yticklabels(R7[::-1]); ax.set_xlabel('정면 비 (가로 ÷ 높이)')
ax.grid(axis='x',color='#eee',linewidth=.6); ax.set_axisbelow(True); ax.set_xlim(.95,1.85)
from matplotlib.lines import Line2D
h=[Line2D([],[],marker='o',color=INK,linestyle='-',label='본 연구 중앙값과 95% 신뢰구간')]+[Line2D([],[],marker=MK[k],markerfacecolor='none',markeredgecolor='#666',linestyle='none',label=k+' 평균으로 계산') for k in PRIOR]
ax.legend(handles=h,fontsize=7.5,frameon=False,loc='lower center',bbox_to_anchor=(0.45,1.0),ncol=2)
fig.tight_layout(); fig.savefig(S+'/fig3.png'); plt.close(fig)
print('ok')
