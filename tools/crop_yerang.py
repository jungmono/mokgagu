import sys, os, glob
import cv2, numpy as np
BG=np.array([240,244,246],np.uint8); PAD=.08
SRC='/home/claude/mokgagu-photos/photos/yerang'; OUT='/tmp/yr/c'
def pagecol(img):
    g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    h=np.bincount(g.ravel(),minlength=256).astype(float); h=np.convolve(h,np.ones(7)/7,'same')
    pg=150+int(np.argmax(h[150:233]))
    sel=np.abs(g.astype(int)-pg)<6
    pc=np.median(img[sel],axis=0).astype(np.float32)
    return pg,pc
OPT={2:dict(hull=1),4:dict(largest=1),83:dict(largest=1,chroma=1),6:dict(rat=.10,mar=8),10:dict(dark=40,rat=.12,mar=12),34:dict(fillall=1),30:dict(fillall=1)}
def mask_for(img,o={}):
    H,W=img.shape[:2]; pg,pc=pagecol(img)
    f=img.astype(np.float32)+1; n=f/(pc+1); nm=n.mean(2); ratio=np.abs(np.log(n[...,2]/n[...,0]))
    g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32)
    if o.get('chroma'): S=((ratio>.12)|(g<70)).astype(np.uint8)
    else: S=((g<pg-o.get('dark',55))|((ratio>o.get('rat',.16))&(g<pg-o.get('mar',25)))).astype(np.uint8)
    S=cv2.morphologyEx(S,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    S=cv2.morphologyEx(S,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
    nl,lab,st,_=cv2.connectedComponentsWithStats(S)
    areas=st[1:,4]; 
    if len(areas)==0: return None,pg,pc
    big=areas.max(); keep=np.zeros_like(S)
    for c in range(1,nl):
        x,y,w,h,a=st[c]
        if a<0.07*big: continue
        if y>0.88*H and h<0.05*H: continue
        if max(w,h)>5*min(w,h) and min(w,h)<0.025*max(W,H): continue
        keep[lab==c]=1
    S=keep
    if o.get('largest'):
        nl2,lab2,st2,_=cv2.connectedComponentsWithStats(S); cc=1+int(np.argmax(st2[1:,4])); S=(lab2==cc).astype(np.uint8)
    kk=int(.035*max(W,H))|1
    Sp=cv2.copyMakeBorder(S,kk,kk,kk,kk,cv2.BORDER_CONSTANT,value=0)
    Sc=cv2.morphologyEx(Sp,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(kk,kk)))[kk:-kk,kk:-kk]
    # grabcut
    sc=min(1.0,900/max(W,H)); sw,sh=int(W*sc),int(H*sc)
    im=cv2.resize(img,(sw,sh),interpolation=cv2.INTER_AREA)
    R=lambda a:cv2.resize(a.astype(np.uint8),(sw,sh),interpolation=cv2.INTER_NEAREST)
    gc=np.full((sh,sw),cv2.GC_BGD,np.uint8)
    gc[cv2.dilate(R(Sc),np.ones((15,15),np.uint8))>0]=cv2.GC_PR_BGD
    gc[R(Sc)>0]=cv2.GC_PR_FGD
    gc[cv2.erode(R(S&(g<pg-75)),np.ones((7,7),np.uint8))>0]=cv2.GC_FGD
    if (gc==cv2.GC_FGD).sum()>50:
        cv2.grabCut(im,gc,None,np.zeros((1,65)),np.zeros((1,65)),5,cv2.GC_INIT_WITH_MASK)
        fg=((gc==cv2.GC_FGD)|(gc==cv2.GC_PR_FGD)).astype(np.uint8)
        fg=cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
        m=cv2.resize(fg,(W,H),interpolation=cv2.INTER_LINEAR)
        m=(cv2.GaussianBlur(m.astype(np.float32),(0,0),2)>0.5).astype(np.uint8)
    else: m=Sc
    bglike=((ratio<.16)&(nm>.5)).astype(np.uint8); bglike=cv2.morphologyEx(bglike,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    for x in np.where(m.any(0))[0]:
        ys=np.where(m[:,x])[0]; y0,y1=ys.min(),ys.max(); m[y0:y1+1,x]|=(1-bglike[y0:y1+1,x])
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((7,7),np.uint8))
    inv=(1-m).astype(np.uint8); nl,lab,st,_=cv2.connectedComponentsWithStats(inv,connectivity=4)
    for c in range(1,nl):
        x,y,w,h,a=st[c]
        if a<0.02*W*H and not(x==0 or y==0 or x+w==W or y+h==H):
            sel=lab==c
            if o.get('fillall') or bglike[sel].mean()<0.5: m[sel]=1
    if o.get('hull'):
        cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea)
        hl=np.zeros_like(m); cv2.fillPoly(hl,[cv2.convexHull(c)],1); wid=m.sum(1); yb=np.where(wid>0.6*wid.max())[0].max(); hl[yb+1:]=0; m=(m|hl).astype(np.uint8)
    if o.get('largest'):
        nl2,lab2,st2,_=cv2.connectedComponentsWithStats(m); cc=1+int(np.argmax(st2[1:,4])); m=(lab2==cc).astype(np.uint8)
    # 큰 성분만, 캡션·가장자리 제거
    nl,lab,st,_=cv2.connectedComponentsWithStats(cv2.dilate(m,np.ones((15,15),np.uint8)))
    out=np.zeros_like(m); 
    ar=[st[c,4] for c in range(1,nl)]
    if not ar: return None,pg,pc
    mx=max(ar)
    for c in range(1,nl):
        x,y,w,h,a=st[c]
        if a<0.07*mx: continue
        out|=((lab==c)&(m>0)).astype(np.uint8)
    return out,pg,pc
def skew(img,m):
    ys,xs=np.where(m>0); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32); g=cv2.GaussianBlur(g,(0,0),1.5)
    gx=cv2.Sobel(g,cv2.CV_32F,1,0); gy=cv2.Sobel(g,cv2.CV_32F,0,1)
    er=cv2.erode(m,np.ones((15,15),np.uint8))
    sel=er>0; mag=np.hypot(gx,gy)[sel]; th=np.degrees(np.arctan2(gy,gx))[sel]
    th=((th+45)%90)-45   # -45..45
    best,bs=0,-1
    hist=np.zeros(161)
    idx=np.clip(((th+8)*10).astype(int),0,160); ok=np.abs(th)<=8
    np.add.at(hist,idx[ok],mag[ok]); hist=np.convolve(hist,np.ones(5)/5,'same')
    return (np.argmax(hist)/10.0-8.0) if hist.max()>0 else 0.0
def compose(clean,mask,box):
    H,W=clean.shape[:2]; x0,y0,x1,y1=box; bw,bh=x1-x0+1,y1-y0+1
    r=4/3 if bw>=bh else 3/4
    cw=bw*(1+2*PAD); ch=bh*(1+2*PAD)
    if cw/ch<r: cw=ch*r
    else: ch=cw/r
    cw,ch=int(round(cw)),int(round(ch))
    can=np.empty((ch,cw,3),np.uint8); can[:]=BG
    soft=cv2.GaussianBlur(cv2.dilate(mask,np.ones((5,5),np.uint8)).astype(np.float32),(0,0),1.6)[...,None]
    ox=(cw-bw)//2-x0; oy=(ch-bh)//2-y0
    sx0=max(0,-ox); sy0=max(0,-oy); sx1=min(W,cw-ox); sy1=min(H,ch-oy)
    reg=can[sy0+oy:sy1+oy,sx0+ox:sx1+ox].astype(np.float32)
    src=clean[sy0:sy1,sx0:sx1].astype(np.float32); a=soft[sy0:sy1,sx0:sx1]
    can[sy0+oy:sy1+oy,sx0+ox:sx1+ox]=(src*a+reg*(1-a)).astype(np.uint8)
    return can
def run(n):
    img=cv2.imread(f'{SRC}/Y{n:02d}.jpg'); H,W=img.shape[:2]
    m,pg,pc=mask_for(img,OPT.get(n,{}))
    if m is None: print('빈',n); return None
    ang=skew(img,m)
    if abs(ang)>0.3:
        best=None
        for sgn in (1,-1):
            M=cv2.getRotationMatrix2D((W/2,H/2),sgn*ang,1.0)
            i2=cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
            m2=cv2.warpAffine(m,M,(W,H),flags=cv2.INTER_NEAREST)
            r=abs(skew(i2,m2))
            if best is None or r<best[0]: best=(r,i2,m2,sgn)
        _,img,m,sg=best; ang=sg*ang
    ys,xs=np.where(m>0)
    out=compose(img,m,(xs.min(),ys.min(),xs.max(),ys.max()))
    cv2.imwrite(f'{OUT}/{n}.jpg',out,[cv2.IMWRITE_JPEG_QUALITY,92]); return ang
if __name__=='__main__':
    ns=[int(a) for a in sys.argv[1:]] or range(1,87)
    for n in ns: print(n,run(n),flush=True)
