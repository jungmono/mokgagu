import csv, json, math, random, sys
import numpy as np
from scipy import stats
import os
S=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'out')
rows=list(csv.DictReader(open(S+'/data.csv',encoding='utf-8-sig')))
for r in rows: r['w']=float(r['w']); r['h']=float(r['h']); r['R']=r['w']/r['h']; r['D']=math.hypot(r['w'],r['h'])
REG=['평안','경기','강원','충청','전라','경상','제주']
ORD={'평안':1,'경기':2,'강원':2,'충청':3,'전라':4,'경상':4}
rng=np.random.default_rng(20261029)
def desc(sub):
    out={}
    for g in REG+['황해']:
        a=np.array([r['R'] for r in sub if r['region']==g])
        if len(a)==0: continue
        bs=np.median(rng.choice(a,(10000,len(a)),replace=True),axis=1)
        out[g]=dict(n=int(len(a)),med=round(float(np.median(a)),3),q1=round(float(np.percentile(a,25)),3),q3=round(float(np.percentile(a,75)),3),mn=round(float(a.min()),2),mx=round(float(a.max()),2),ci=[round(float(np.percentile(bs,2.5)),3),round(float(np.percentile(bs,97.5)),3)],
                    w_med=float(np.median([r['w'] for r in sub if r['region']==g])),h_med=float(np.median([r['h'] for r in sub if r['region']==g])))
    return out
def kw(sub):
    groups=[[r['R'] for r in sub if r['region']==g] for g in REG]
    groups=[x for x in groups if len(x)>0]
    H,p=stats.kruskal(*groups); n=sum(len(x) for x in groups)
    return dict(H=round(float(H),2),df=len(groups)-1,p=float(p),eps2=round(float(H/(n-1)),3),n=n)
def dunn(sub):
    data=[(r['R'],r['region']) for r in sub if r['region'] in REG]
    vals=np.array([d[0] for d in data]); ranks=stats.rankdata(vals); n=len(vals)
    _,cnt=np.unique(vals,return_counts=True); T=sum(c**3-c for c in cnt)
    s2=(n*(n+1)/12)-T/(12*(n-1))
    mr={g:ranks[[d[1]==g for d in data]].mean() for g in REG}; ng={g:sum(d[1]==g for d in data) for g in REG}
    res=[]
    for i,a in enumerate(REG):
        for b in REG[i+1:]:
            z=(mr[a]-mr[b])/math.sqrt(s2*(1/ng[a]+1/ng[b])); p=2*(1-stats.norm.cdf(abs(z))); res.append([a,b,round(z,2),p])
    m=len(res); order=sorted(range(m),key=lambda i:res[i][3]); adj=[0]*m; run=0
    for k,i in enumerate(order): run=max(run,min(1,(m-k)*res[i][3])); adj[i]=run
    for i in range(m): res[i].append(adj[i])
    return res
def jt(sub, perm=20000):
    d=[(ORD[r['region']],r['R']) for r in sub if r['region'] in ORD]
    lv=sorted(set(x[0] for x in d)); grp=[np.array([x[1] for x in d if x[0]==l]) for l in lv]
    def J(gs):
        s=0
        for i in range(len(gs)):
            for j in range(i+1,len(gs)):
                s+=np.sum(gs[j][:,None]>gs[i][None,:])+0.5*np.sum(gs[j][:,None]==gs[i][None,:])
        return s
    j0=J(grp); allv=np.concatenate(grp); sizes=[len(g) for g in grp]; N=len(allv)
    EJ=(N**2-sum(s**2 for s in sizes))/4; VJ=(N**2*(2*N+3)-sum(s**2*(2*s+3) for s in sizes))/72; z=(j0-EJ)/math.sqrt(VJ)
    cnt=0
    for _ in range(perm):
        p=rng.permutation(allv); gs=[]; k=0
        for s in sizes: gs.append(p[k:k+s]); k+=s
        if J(gs)>=j0: cnt+=1
    return dict(J=float(j0),z=round(z,2),p_norm=float(1-stats.norm.cdf(z)),p_perm=(cnt+1)/(perm+1),n=N)
def lat_rho(sub):
    LAT={'평안':39.5,'황해':38.3,'경기':37.5,'강원':37.6,'충청':36.5,'전라':35.3,'경상':35.6}
    a=[(LAT[r['region']],r['R']) for r in sub if r['region'] in LAT and r['region']!='황해']
    rho,p=stats.spearmanr([x[0] for x in a],[x[1] for x in a]); return dict(rho=round(float(rho),3),p=float(p),n=len(a))
def size_rho(sub):
    out={}
    for g in REG:
        a=[r for r in sub if r['region']==g]
        rho,p=stats.spearmanr([r['D'] for r in a],[r['R'] for r in a]); out[g]=dict(n=len(a),rho=round(float(rho),3),p=float(p))
    return out
def refband(sub,width=0.03):
    out={}
    for ref,name in [(1.0,'1:1'),(math.sqrt(2),'√2'),(1.5,'3:2'),((1+5**.5)/2,'황금비')]:
        a=np.array([r['R'] for r in sub if r['region'] in REG]); lo,hi=ref*(1-width),ref*(1+width); bw=hi-lo
        inb=int(np.sum((a>=lo)&(a<hi))); left=int(np.sum((a>=lo-bw)&(a<lo))); right=int(np.sum((a>=hi)&(a<hi+bw)))
        per={}
        for g in REG:
            b=np.array([r['R'] for r in sub if r['region']==g]); per[g]=int(np.sum((b>=lo)&(b<hi)))
        out[name]=dict(ref=round(ref,3),band=[round(lo,3),round(hi,3)],n_in=inb,left=left,right=right,ratio=round(inb/max(1,(left+right)/2),2),per=per)
    return out
def srcdiff(sub):
    out={}
    for g in REG:
        a=[r['R'] for r in sub if r['region']==g and r['src']=='joseongwe']; b=[r['R'] for r in sub if r['region']==g and r['src']!='joseongwe']
        if len(a)>=4 and len(b)>=4:
            U,p=stats.mannwhitneyu(a,b); out[g]=dict(n_jg=len(a),n_other=len(b),med_jg=round(float(np.median(a)),3),med_other=round(float(np.median(b)),3),p=float(p))
    return out
res=dict(n=len(rows),desc=desc(rows),kw=kw(rows),dunn=dunn(rows),jt=jt(rows),lat=lat_rho(rows),size=size_rho(rows),ref=refband(rows),src=srcdiff(rows))
terc=np.percentile([r['D'] for r in rows if r['region'] in REG],[100/3,200/3]); res['D_cut']=[round(float(x),1) for x in terc]
sens={}
for name,f in [('조선의 궤 제외',lambda r:r['src']!='joseongwe'),('경매 제외',lambda r:r['src']!='auction'),('민속유물이해 제외',lambda r:r['src']!='minsok'),('고을명 표기만',lambda r:bool(r['town']) and r['town'] not in ('경상','전라','충청','강원','경기','황해','평안','함경','제주'))]:
    sub=[r for r in rows if f(r)]
    try: sens[name]=dict(n=len([r for r in sub if r['region'] in REG]),kw=kw(sub),jt=jt(sub,perm=5000),med={g:v['med'] for g,v in desc(sub).items()},nreg={g:v['n'] for g,v in desc(sub).items()})
    except Exception as e: sens[name]=str(e)
res['sens']=sens
json.dump(res,open(S+'/results.json','w'),ensure_ascii=False,indent=1,default=float)
print(json.dumps({k:res[k] for k in ['n','kw','jt','lat','D_cut']},ensure_ascii=False))
for g,v in res['desc'].items(): print(g,v['n'],v['med'],[v['q1'],v['q3']],v['ci'],v['mn'],v['mx'])
print('dunn sig',[d for d in res['dunn'] if d[4]<0.05])
print('size',res['size']); print('ref',json.dumps(res['ref'],ensure_ascii=False)); print('src',res['src'])
for k,v in sens.items(): print(k, v['n'], v['kw'], v['jt']['z'], v['jt']['p_perm'], v['med'])
