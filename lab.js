// The Stunt Lab: two racket-swinging robots, speed control, rally counter, cursor spotlight, click sparks
function Eye({left,top}){
 const r=useRef(null),[p,setP]=useState({x:0,y:0});
 useEffect(()=>{const f=e=>{if(!r.current)return;const b=r.current.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,a=Math.atan2(dy,dx),d=Math.min(14,Math.hypot(dx,dy)/12);setP({x:Math.cos(a)*d,y:Math.sin(a)*d})};
  window.addEventListener("mousemove",f);return()=>window.removeEventListener("mousemove",f)},[]);
 return html`<div ref=${r} className="bob" style=${{position:"absolute",top,left,pointerEvents:"none"}}>
  <div className="eyeball" style=${{width:58,height:58,borderRadius:"50%",background:"#f5f5f7",display:"flex",alignItems:"center",justifyContent:"center"}}>
   <div style=${{width:24,height:24,borderRadius:"50%",background:"#1d1d1f",transform:`translate(${p.x}px,${p.y}px)`}}><div style=${{width:8,height:8,borderRadius:"50%",background:"#fff",margin:"5px 0 0 5px"}}/></div></div></div>`}

function Runaway(){
 const[o,setO]=useState({x:0,y:0}),[n,setN]=useState(0),[done,setDone]=useState(false);
 const run=()=>{if(n>=6){setDone(true);return}setN(n+1);setO({x:(Math.random()-.5)*280,y:(Math.random()-.5)*120})};
 const label=n>=6?(done?"Nice reflexes!":"Okay, you win"):"Click me";
 return html`<button onMouseEnter=${run} onTouchStart=${run} className="ctl" style=${{position:"absolute",bottom:"12%",left:"43%",padding:"10px 20px",color:"#fff",transform:`translate(${o.x}px,${o.y}px)`,transition:"transform .25s"}}>${label}</button>`}

function Block({label,bg,style}){
 const[p,setP]=useState({x:0,y:0}),st=useRef(null);
 const down=e=>{const el=e.currentTarget,r=el.getBoundingClientRect(),a=el.parentElement.getBoundingClientRect();
  el.setPointerCapture(e.pointerId);
  st.current={sx:e.clientX-p.x,sy:e.clientY-p.y,minX:a.left-(r.left-p.x),maxX:a.right-r.width-(r.left-p.x),minY:a.top-(r.top-p.y),maxY:a.bottom-r.height-(r.top-p.y)}};
 const move=e=>{const s=st.current;if(!s)return;setP({x:Math.max(s.minX,Math.min(s.maxX,e.clientX-s.sx)),y:Math.max(s.minY,Math.min(s.maxY,e.clientY-s.sy))})};
 return html`<div className="block" onPointerDown=${down} onPointerMove=${move} onPointerUp=${()=>st.current=null} onClick=${e=>e.stopPropagation()} style=${{background:bg,transform:`translate(${p.x}px,${p.y}px)`,...style}}>${label}</div>`}

// ---------- The rally ----------
// One clock drives everything, so each swing meets the ball at the exact moment it arrives.
const D0=1.2;                         // seconds the ball flies from one robot to the other (at "Normal")
const SH=[96,72],REACH=92,TC=-100;    // shoulder point, racket length, arm angle at the moment of impact
const rad=d=>d*Math.PI/180;
const ease=t=>t*t*(3-2*t),easeIn=t=>t*t,easeOut=t=>1-(1-t)*(1-t);
// swing timeline around the moment of impact: [seconds, arm angle, shoulder/body lean, easing]
const KF=[[-.7,-150,0],[-.28,-195,-9,ease],[0,TC,5,easeIn],[.22,-35,10,easeOut],[.7,-150,0,ease]];
function pose(t){
 if(t<=KF[0][0])return[KF[0][1],KF[0][2]];
 for(let i=1;i<KF.length;i++){const a=KF[i-1],b=KF[i];
  if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]),e=b[3](u);return[a[1]+(b[1]-a[1])*e,a[2]+(b[2]-a[2])*e]}}
 return[KF[4][1],KF[4][2]]}
// where the middle of the racket is (in robot drawing units) for a given arm angle and body lean
function headAt(a,l){
 const L=rad(l),vx=SH[0]-60,vy=SH[1]-124,
  sx=60+vx*Math.cos(L)-vy*Math.sin(L),sy=124+vx*Math.sin(L)+vy*Math.cos(L),A=rad(a+l);
 return[sx-REACH*Math.sin(A),sy+REACH*Math.cos(A)]}
const[HX,HY]=headAt(TC,KF[2][2]);
// positions inside the arena (pixels) for the current arena size
function layout(W,H){
 const rw=Math.min(W*.2,140),s=rw/120,top=H-H*.06-170*s,lx=W*.06,rx=W-W*.06-rw;
 return{s,top,floor:top+160*s,h:Math.max(50,Math.min(120,H*.22)),
  L:{x:lx+HX*s,y:top+HY*s,cx:lx+60*s},R:{x:rx+(120-HX)*s,y:top+HY*s,cx:rx+60*s}}}

// racket strings, worked out once
const RK={x:96,y:164,rx:16,ry:22};
const STRINGS=[-10,-5,0,5,10].map(d=>{const h=RK.ry*Math.sqrt(1-(d/RK.rx)**2);return`M${RK.x+d} ${(RK.y-h).toFixed(1)}V${(RK.y+h).toFixed(1)}`}).concat(
 [-14,-7,0,7,14].map(d=>{const w=RK.rx*Math.sqrt(1-(d/RK.ry)**2);return`M${(RK.x-w).toFixed(1)} ${RK.y+d}H${(RK.x+w).toFixed(1)}`})).join("");

function Robot({flip,c,r}){return html`<svg viewBox="0 0 120 170" style=${{position:"absolute",bottom:"6%",[flip?"right":"left"]:"6%",width:"min(20%,140px)",overflow:"visible",transform:flip?"scaleX(-1)":"none"}}>
 <rect x="34" y="124" width="14" height="36" rx="6" fill="#8e8e93"/><rect x="72" y="124" width="14" height="36" rx="6" fill="#8e8e93"/>
 <g ref=${r.up}>
  <g ref=${r.off}><rect x="18" y="70" width="12" height="40" rx="6" fill="#8e8e93"/></g>
  <rect x="24" y="62" width="72" height="60" rx="16" fill="#e5e5ea"/><rect x="44" y="76" width="32" height="8" rx="4" fill=${c}/>
  <rect x="30" y="10" width="60" height="46" rx="14" fill=${c}/>
  <line x1="60" y1="10" x2="60" y2="1" stroke=${c} strokeWidth="3"/><circle cx="60" cy="1" r="4" fill="#7cc4ff"/>
  <circle cx="48" cy="33" r="8" fill="#fff" stroke="#1c1c1e" strokeWidth="2"/><circle cx="72" cy="33" r="8" fill="#fff" stroke="#1c1c1e" strokeWidth="2"/>
  <g ref=${r.pup}><circle cx="48" cy="33" r="3.8" fill="#1c1c1e"/><circle cx="72" cy="33" r="3.8" fill="#1c1c1e"/></g>
  <g ref=${r.arm}>
   <rect x="90" y="66" width="12" height="52" rx="6" fill=${c}/>
   <rect x="93.5" y="118" width="5" height="26" rx="2.5" fill="#3a3a3c"/>
   <path d="M94 142 86 153M98 142 106 153" stroke="#7cc4ff" strokeWidth="3" strokeLinecap="round" fill="none"/>
   <ellipse cx=${RK.x} cy=${RK.y} rx=${RK.rx} ry=${RK.ry} fill="rgba(124,196,255,.14)" stroke="#7cc4ff" strokeWidth="4"/>
   <path d=${STRINGS} stroke="rgba(255,255,255,.6)" strokeWidth="1" fill="none"/>
   <circle cx="96" cy="120" r="7.5" fill="#8e8e93"/>
  </g>
  <circle cx="96" cy="72" r="6" fill="#d1d1d6" stroke="#8e8e93" strokeWidth="2"/>
 </g></svg>`}

const SPEEDS=[["Chill",1.8],["Normal",1],["Turbo",.45]];

function Lab(){
 const[spd,setSpd]=useState(1),[rally,setRally]=useState(0),[sparks,setSparks]=useState([]),ar=useRef(null);
 const spdRef=useRef(1);spdRef.current=spd;
 const R1={up:useRef(null),off:useRef(null),pup:useRef(null),arm:useRef(null)},R2={up:useRef(null),off:useRef(null),pup:useRef(null),arm:useRef(null)};
 const ballRef=useRef(null),shRef=useRef(null),floorRef=useRef(null),sim=useRef({T:-.9,t0:0,k:-1,W:0,H:0,on:true});
 const burst=(x,y,n=12)=>{const id=Date.now()+Math.random(),s=Array.from({length:n},(_,i)=>{const a=Math.random()*6.28,d=40+Math.random()*60;return{id:id+i,x,y,dx:Math.cos(a)*d,dy:Math.sin(a)*d}});
  setSparks(o=>[...o,...s]);setTimeout(()=>setSparks(o=>o.filter(k=>!s.includes(k))),800)};
 const burstRef=useRef(burst);burstRef.current=burst;
 useEffect(()=>{
  const arena=ar.current,S=sim.current;let raf;
  const size=()=>{S.W=arena.clientWidth;S.H=arena.clientHeight};size();
  const ro=new ResizeObserver(size);ro.observe(arena);
  const io=new IntersectionObserver(([e])=>{S.on=e.isIntersecting;S.t0=0});io.observe(arena);
  const frame=now=>{
   raf=requestAnimationFrame(frame);
   if(!S.on||!S.W)return;
   const dt=S.t0?Math.min(.05,(now-S.t0)/1000):0;S.t0=now;
   S.T+=dt/spdRef.current;                       // game clock: slower for "Chill", faster for "Turbo"
   const T=S.T,W=S.W,H=S.H,g=layout(W,H),k=Math.floor(T/D0);
   // ball: flies in an arc from the robot that just hit it to the other robot
   let bx,by;
   if(T<0){bx=g.L.x;by=g.L.y+Math.sin(now/260)*4}
   else{const A=k%2?g.R:g.L,B=k%2?g.L:g.R,u=T/D0-k;bx=A.x+(B.x-A.x)*u;by=A.y+(B.y-A.y)*u-4*g.h*u*(1-u)}
   const d=T-Math.round(T/D0)*D0,pulse=Math.max(0,1-Math.abs(d)/.09);       // little squash when struck
   ballRef.current.style.transform=`translate(${bx-12}px,${by-12}px) scale(${1+.4*pulse})`;
   const up=Math.max(0,g.floor-by),sk=Math.max(.3,1-up/(H*.8));
   shRef.current.style.transform=`translate(${bx-14}px,${g.floor-3}px) scale(${sk},1)`;shRef.current.style.opacity=(.55*sk).toFixed(2);
   floorRef.current.style.top=g.floor+"px";
   // a new hit: count it and throw sparks
   if(k>S.k&&k>=0){S.k=k;const P=k%2?g.R:g.L;setRally(k+1);burstRef.current(P.x,P.y,8)}
   // robots: wind up, swing through the ball, follow through, get ready again
   [[R1,0,g.L,false],[R2,D0,g.R,true]].forEach(([r,o,P,flip])=>{
    const tau=T<o-.7?-9:((T-o+D0)%(2*D0)+2*D0)%(2*D0)-D0,[a,l]=pose(tau);
    r.arm.current.setAttribute("transform",`rotate(${a.toFixed(1)} 96 72)`);
    r.up.current.setAttribute("transform",`rotate(${l.toFixed(1)} 60 124)`);
    r.off.current.setAttribute("transform",`rotate(${(-(a+150)*.25).toFixed(1)} 24 72)`);
    let dx=(bx-P.cx)/(W*.35),dy=(by-(g.top+33*g.s))/(H*.35);if(flip)dx=-dx;
    const m=Math.hypot(dx,dy)||1,f=Math.min(1,m);
    r.pup.current.setAttribute("transform",`translate(${(dx/m*f*3).toFixed(2)} ${(dy/m*f*3).toFixed(2)})`)})};
  raf=requestAnimationFrame(frame);
  return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect()}},[]);
 const pos=e=>{const b=ar.current.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 const move=e=>{const[x,y]=pos(e);ar.current.style.setProperty("--mx",x+"px");ar.current.style.setProperty("--my",y+"px")};
 return html`<section id="lab" className="max-w-6xl mx-auto px-5 py-20">
 <${Head} k="The stunt lab" t="Now, the fun part."/>
 <${Rev}><div ref=${ar} className="arena" style=${{"--spd":spd}} onMouseMove=${move} onClick=${e=>burst(...pos(e))}>
  <div className="grid-bg"/><div className="spot"/><div ref=${floorRef} className="floor"/>
  <${Robot} c="#f5f5f7" r=${R1}/><${Robot} flip=${true} c="#a1a1a6" r=${R2}/>
  <div ref=${shRef} className="bshadow"/><div ref=${ballRef} className="ball"/>
  <${Eye} left="40%" top="12%"/><${Eye} left="52%" top="12%"/>
  <${Runaway}/>
  <${Block} label="HTML" bg="#f5f5f7" style=${{right:"6%",top:"14%"}}/>
  <${Block} label="CSS" bg="#c7c7cc" style=${{right:"17%",top:"26%"}}/>
  <${Block} label="JS" bg="#7cc4ff" style=${{right:"8%",top:"36%"}}/>
  <div style=${{position:"absolute",top:16,left:18,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}} onClick=${e=>e.stopPropagation()}>
   ${SPEEDS.map(([n,v])=>html`<button key=${n} className=${"ctl"+(spd===v?" on":"")} onClick=${()=>setSpd(v)}>${n}</button>`)}
   <span style=${{color:"#8e8e93",font:"12px ui-monospace,monospace",marginLeft:6}}>rally ${rally}</span></div>
  <div style=${{position:"absolute",bottom:12,width:"100%",textAlign:"center",color:"#636366",font:"12px ui-monospace,monospace",pointerEvents:"none"}}>click anywhere for sparks. drag the blocks. catch the button.</div>
  ${sparks.map(s=>html`<i key=${s.id} className="spark" style=${{left:s.x,top:s.y,"--dx":s.dx+"px","--dy":s.dy+"px"}}/>`)}
 </div><//>
 <${Rev} delay=${150}><div className="glass" style=${{padding:"40px 26px",marginTop:24,textAlign:"center"}}>
  <p style=${{fontSize:"clamp(24px,4vw,44px)",fontWeight:700,letterSpacing:"-.03em",lineHeight:1.2,margin:0}}>Serious architecture. Playful execution.<br/><span style=${{color:"var(--mute)"}}>I don't just build websites; I bring them to life.</span></p>
 </div><//></section>`}
