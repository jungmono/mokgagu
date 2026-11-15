import sys, os
sys.path.insert(0,'/home/claude/work')
import cv2, numpy as np
from crop_mg import *
OUT2='/tmp/mg/c2'; BG=np.array([240,244,246],np.uint8)  # BGR 근처 중립 밝은 회색
THR=float(os.environ.get('THR',60)); NDARK=float(os.environ.get('ND',.30)); CL=float(os.environ.get('CL',.035)); RAT=float(os.environ.get('RAT',.16)); PAD=.08
CLOSE_BIG={20:.10,24:.10,32:.10,34:.10,12:.06}
def objmask(clean,i,H,W,big):
    f=clean.astype(np.float32)+1
    sm=cv2.resize(f,(W//6,H//6)); k=int(min(sm.shape[:2])*0.45)|1
    ker=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(k,k))
    bgc=cv2.morphologyEx(sm,cv2.MORPH_CLOSE,ker); bgc=cv2.resize(cv2.GaussianBlur(bgc,(0,0),9),(W,H))
    n=f/bgc; nm=n.mean(2); ratio=np.abs(np.log(n[...,2]/n[...,0]))
    g=cv2.cvtColor(clean,cv2.COLOR_BGR2GRAY).astype(np.float32)
    dev=cv2.cvtColor(np.clip(bgc,0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)-g
    S=(((dev>THR)&(nm<0.55))|((ratio>RAT)&(dev>16))|(nm<NDARK)).astype(np.uint8)&big
    S=cv2.morphologyEx(S,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    kk=int(CL*max(W,H))|1
    Sp=cv2.copyMakeBorder(S,kk,kk,kk,kk,cv2.BORDER_CONSTANT,value=0)
    Sp=cv2.morphologyEx(Sp,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(kk,kk)))
    m=(Sp[kk:-kk,kk:-kk]&big).astype(np.uint8)
    # GrabCut 으로 그림자·배경 분리
    sc=900/max(W,H); sc=min(sc,1.0)
    sw,sh=int(W*sc),int(H*sc)
    im=cv2.resize(clean,(sw,sh),interpolation=cv2.INTER_AREA)
    bgm=cv2.resize(big,(sw,sh),interpolation=cv2.INTER_NEAREST); sm_=cv2.resize(m,(sw,sh),interpolation=cv2.INTER_NEAREST)
    strict=cv2.resize(((nm<NDARK)|(dev>THR*1.4)).astype(np.uint8)&m,(sw,sh),interpolation=cv2.INTER_NEAREST)
    gc=np.full((sh,sw),cv2.GC_BGD,np.uint8)
    gc[cv2.dilate(bgm,np.ones((15,15),np.uint8))>0]=cv2.GC_PR_BGD
    gc[sm_>0]=cv2.GC_PR_FGD
    gc[cv2.erode(strict,np.ones((7,7),np.uint8))>0]=cv2.GC_FGD
    if (gc==cv2.GC_FGD).sum()>50:
        bgd=np.zeros((1,65));fgd=np.zeros((1,65))
        cv2.grabCut(im,gc,None,bgd,fgd,5,cv2.GC_INIT_WITH_MASK)
        fg=((gc==cv2.GC_FGD)|(gc==cv2.GC_PR_FGD)).astype(np.uint8)
        fg=cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
        m=cv2.resize(fg,(W,H),interpolation=cv2.INTER_LINEAR)
        m=(cv2.GaussianBlur(m.astype(np.float32),(0,0),2)>0.5).astype(np.uint8)
    bglike=((ratio<RAT)&(nm>0.42)).astype(np.uint8)
    bglike=cv2.morphologyEx(bglike,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    # 열 방향 위쪽 빠짐 메우기(배경 같은 곳은 제외)
    for x in np.where(m.any(0))[0]:
        ys=np.where(m[:,x])[0]; y0,y1=ys.min(),ys.max()
        seg=m[y0:y1+1,x]; m[y0:y1+1,x]=seg|(1-bglike[y0:y1+1,x])
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((7,7),np.uint8))
    if i in CLOSE_BIG:
        wid=m.sum(1); wide=np.where(wid>0.55*wid.max())[0]; y0,yb=wide.min(),wide.max()
        cols=np.where(m[y0:yb+1].any(0))[0]; x0,x1=cols.min(),cols.max()
        m[y0:yb+1,x0:x1+1]=1
    # 속 메우기: 배경 같은 구멍은 그대로 둠
    inv=(1-m).astype(np.uint8); nl,lab,st,_=cv2.connectedComponentsWithStats(inv,connectivity=4)
    for c in range(1,nl):
        x,y,w,h,a=st[c]
        if a<0.02*W*H and not(x==0 or y==0 or x+w==W or y+h==H):
            sel=lab==c
            if bglike[sel].mean()<0.5: m[sel]=1
    nl,lab,st,_=cv2.connectedComponentsWithStats(cv2.dilate(m,np.ones((15,15),np.uint8)))
    out=np.zeros_like(m)
    zones=CAP.get(i,[(0,0,.36,.20),(0,0,.17,.38)])
    for c in range(1,nl):
        x,y,w,h,a=st[c]
        if a<0.004*W*H: continue
        if min(w,h)<0.03*max(W,H) and max(w,h)>6*min(w,h): continue
        if min(w,h)<0.012*max(W,H): continue
        if (x<=2 or x+w>=W-2) and w<0.10*W: continue
        if any(x>=za*W-3 and y>=zb*H-3 and x+w<=zc*W+3 and y+h<=zd*H+3 for (za,zb,zc,zd) in zones) and a<0.05*W*H: continue
        out|=((lab==c)&(m>0)).astype(np.uint8)
    return out
def compose(clean,mask,box):
    H,W=clean.shape[:2]; x0,y0,x1,y1=box; bw,bh=x1-x0+1,y1-y0+1
    land=bw>=bh*0.0+bh*1.0
    r=4/3 if bw>=bh else 3/4
    cw=bw*(1+2*PAD); ch=bh*(1+2*PAD)
    if cw/ch<r: cw=ch*r
    else: ch=cw/r
    cw,ch=int(round(cw)),int(round(ch))
    can=np.empty((ch,cw,3),np.uint8); can[:]=BG
    soft=cv2.GaussianBlur(cv2.dilate(mask,np.ones((5,5),np.uint8)).astype(np.float32),(0,0),1.6)[...,None]
    ox=(cw-bw)//2-x0; oy=(ch-bh)//2-y0
    # 겹치는 영역만 복사
    sx0=max(0,-ox); sy0=max(0,-oy); sx1=min(W,cw-ox); sy1=min(H,ch-oy)
    reg=can[sy0+oy:sy1+oy,sx0+ox:sx1+ox].astype(np.float32)
    src=clean[sy0:sy1,sx0:sx1].astype(np.float32); a=soft[sy0:sy1,sx0:sx1]
    can[sy0+oy:sy1+oy,sx0+ox:sx1+ox]=(src*a+reg*(1-a)).astype(np.uint8)
    return can
if __name__=='__main__':
    only=set(sys.argv[1:])
    for i in range(1,len(fs)+1):
        if i in (1,2): continue
        if only and str(i) not in only: continue
        clean,comps,big=process(i); H,W=clean.shape[:2]
        if i in FULL:
            cv2.imwrite(f'{OUT2}/{i}.jpg',fit(clean,(0,0,W,H),0),[cv2.IMWRITE_JPEG_QUALITY,92]); continue
        if i in CLIPB: clean=clean[:int(CLIPB[i]*H)]; H=clean.shape[0]
        big=big[:H]; m=objmask(clean,i,H,W,big)
        if i in BOX:
            b=BOX[i]; z=np.zeros_like(m); z[int(b[1]*H):int(b[3]*H),int(b[0]*W):int(b[2]*W)]=1; m&=z
        parts=[(f'{i}',0,H)] if i not in SPLIT else [(f'{i}_1',0,int(SPLIT[i]*H)),(f'{i}_2',int(SPLIT[i]*H),H)]
        for name,a,b in parts:
            mm=m[a:b]; ys,xs=np.where(mm>0)
            if len(xs)==0: print('빈',name); continue
            box=(xs.min(),ys.min(),xs.max(),ys.max())
            cv2.imwrite(f'{OUT2}/{name}.jpg',compose(clean[a:b],mm,box),[cv2.IMWRITE_JPEG_QUALITY,92])
