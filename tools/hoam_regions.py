import cv2,numpy as np
def comps(img):
    H,W=img.shape[:2];S=W/1654.;k=lambda v:max(1,int(round(v*S)))
    g=cv2.GaussianBlur(cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32),(0,0),3*S)
    m=(g<251).astype(np.uint8);m[int(H*.885):,:]=0;m[:int(H*.025),:]=0
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((k(9),k(9)),np.uint8))
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((k(41),k(41)),np.uint8))
    nl,lab,st,_=cv2.connectedComponentsWithStats(m)
    cs=[(int(st[i,4]),[int(v) for v in st[i,:4]],i) for i in range(1,nl)]
    if not cs:return m,[],lab
    big=max(c[0] for c in cs)
    keep=[c for c in cs if c[0]>=0.04*big and c[0]>0.003*W*H]
    return m,keep,lab
def regions(img,n):
    m,keep,lab=comps(img)
    if not keep:return []
    M=np.zeros_like(m)
    for a,b,i in keep:M[lab==i]=1
    H,W=M.shape
    if n==1:
        ys,xs=np.where(M);return [[int(xs.min()),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)]]
    best=None
    for ax in (0,1):
        prof=M.any(axis=1-ax) # ax0: rows
        idx=np.where(prof)[0];a,b=idx[0],idx[-1]
        gaps=[];i=a
        while i<=b:
            if not prof[i]:
                j=i
                while not prof[j]:j+=1
                gaps.append((j-i,i,j));i=j
            else:i+=1
        gaps=sorted(gaps,reverse=True)[:n-1]
        if len(gaps)<n-1:continue
        sc=min(g[0] for g in gaps)/(H if ax==0 else W)
        if best is None or sc>best[0]:best=(sc,ax,sorted(g[1:] for g in gaps),a,b)
    if best is None:return None
    sc,ax,gp,a,b=best;cuts=[a]+[x for g in gp for x in g]+[b+1];out=[]
    for t in range(n):
        lo,hi=cuts[2*t],cuts[2*t+1]
        sub=M[lo:hi,:] if ax==0 else M[:,lo:hi]
        ys,xs=np.where(sub)
        if len(ys)==0:return None
        if ax==0:out.append([int(xs.min()),int(ys.min()+lo),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)])
        else:out.append([int(xs.min()+lo),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)])
    return out
