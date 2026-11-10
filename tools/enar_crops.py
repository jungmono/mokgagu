import glob,sys
import numpy as np, cv2
from PIL import Image, ImageOps
exec(open('tools/enar_items.py').read()); exec(open('tools/enar_inp.py').read())
SRC=sys.argv[3] if len(sys.argv)>3 else '/mnt/user-data/uploads/조선의 목공예_예나르'
fs=sorted(glob.glob(SRC+'/*.jpg'))
out=sys.argv[1]; maxe=int(sys.argv[2])
cache={}
for n,(p,b,name,h,s,note) in enumerate(I,1):
    if p not in cache: cache[p]=ImageOps.exif_transpose(Image.open(fs[p])).convert('RGB')
    im=cache[p]; k=im.size[0]/375
    x0,y0,x1,y1=[int(v*k) for v in b]
    c=im.crop((x0,y0,x1,y1)); a=np.array(c)
    mask=np.zeros(a.shape[:2],np.uint8)
    for r in INP.get(n,[]):
        rx0,ry0,rx1,ry1=[int(v*k) for v in r]
        mx0,my0,mx1,my1=max(rx0-x0,0),max(ry0-y0,0),min(rx1-x0,a.shape[1]),min(ry1-y0,a.shape[0])
        if mx1>mx0 and my1>my0: mask[my0:my1,mx0:mx1]=255
    if mask.any():
        sc=0.5; sm=cv2.resize(a,None,fx=sc,fy=sc,interpolation=cv2.INTER_AREA); mm=cv2.resize(mask,(sm.shape[1],sm.shape[0]),interpolation=cv2.INTER_NEAREST)
        r=cv2.inpaint(cv2.cvtColor(sm,cv2.COLOR_RGB2BGR),mm,6,cv2.INPAINT_TELEA)
        r=cv2.cvtColor(cv2.resize(r,(a.shape[1],a.shape[0]),interpolation=cv2.INTER_CUBIC),cv2.COLOR_BGR2RGB)
        a=np.where(mask[...,None]>0,r,a)
    c=Image.fromarray(a); c.thumbnail((maxe,maxe),Image.LANCZOS)
    c.save(f'{out}/{n:03d}.jpg',quality=82 if maxe>1000 else 88)
