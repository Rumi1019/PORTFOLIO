function Nav(){return html`<nav className="nav"><a href="#top" className="logo"><img src=${IMG.me} alt=""/><span>Rumi</span></a><a href="#work">Work</a><a href="#services">Services</a><a href="#lab">Lab</a><a href="#contact">Contact</a></nav>`}

// Hero portrait: transparent PNG, shown with no frame. Falls back to the old photo only if the PNG fails to load.
function HeroPhoto(){
 const[bad,setBad]=useState(false);
 return html`<div className=${"me"+(bad?"":" cut")}><img src=${bad?IMG.me:HERO_PHOTO} alt="Portrait of Rumi" onError=${()=>setBad(true)}/></div>`}

function Hero(){
 const r=useRef(null);
 useEffect(()=>{const f=()=>r.current&&r.current.style.setProperty("--sy",Math.min(window.scrollY,700));f();window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f)},[]);
 return html`<header id="top" ref=${r} className="hero wrap">
  <h1 className="name"><${Word} text=${NAME[0]} outline=${true}/><${Word} text=${NAME[1]} delay=${350}/></h1>
  <${HeroPhoto}/>
  <div className="intro"><h2>Full Stack<br/>Developer</h2><p>Pro Vibe Coder. I build fast, clean apps with effortless style, and I make the web feel alive.</p><${Mag} href="#work">Let’s collaborate <${Icon} d=${ARROW} s=${16}/><//></div>
  <div className="socials">${SOCIALS.map((s,i)=>html`<${Pill} key=${s.n} s=${s} style=${{animationDelay:(1000+i*130)+"ms"}}/>`)}</div>
 </header>`}

function Work(){return html`<section id="work" className="wrap sec">
 <${Head} k="Selected work" t="Real projects, live on the web"/>
 <div className="wgrid">${SITES.map((p,k)=>html`<${Rev} key=${p.n} delay=${(k%2)*120}>
  <a className="wcard" href=${p.u} target="_blank" rel="noopener noreferrer">
   <div className="wimg"><${Shot} src=${p.i} title=${p.n} ratio="16/11"/><span className="badge">REAL PROJECT</span><span className="go"><${Icon} d=${ARROW} s=${26}/></span></div>
   <h3>${p.n}</h3>
   <div className="wfoot"><${Tags} t=${p.t}/><span className="link">${p.cta} <${Icon} d=${ARROW} s=${15}/></span></div>
  </a><//>`)}</div></section>`}

function Services(){
 const[open,setOpen]=useState(0);
 return html`<section id="services" className="wrap sec">
 <${Head} k="What I do" t="Services"/>
 <${Rev}><div style=${{borderTop:"1px solid var(--line)"}}>${SERVICES.map((s,k)=>html`<div key=${s.n} className=${"svc"+(open===k?" open":"")} onClick=${()=>setOpen(open===k?-1:k)}>
  <div className="svc-h"><span>${s.n}</span><${Icon} d=${open===k?XICON:ARROW} s=${34}/></div>
  <div className="svc-b"><div><p>${s.d}</p><div className="stack">${s.i.map(x=>html`<img key=${x} src=${x} alt=""/>`)}</div></div></div>
 </div>`)}</div><//></section>`}

function Contact(){return html`<section id="contact" className="contact">
 <${Rev}><h2 className="h2">Have a project<br/>in mind?</h2>
 <p className="lead">Together, we can build something fast, clear and impactful. Let’s bring your ideas to life.</p>
 <${Mag} href=${CONTACT}>Contact Me <${Icon} d=${ARROW} s=${16}/><//><//>
 <div className="crow"><a className="pill dark" href="#top"><img className="av" src=${IMG.me} alt=""/>Rumi</a>${SOCIALS.map(s=>html`<${Pill} key=${s.n} s=${s}/>`)}</div>
 <p className="foot">© 2026 Rumi. All rights reserved.</p></section>`}

// Big moving text band. Runs right to left, pauses when you hover it.
function Marquee(){
 const star=html`<svg className="mq-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z"/></svg>`;
 const row=k=>TICKER.map((t,i)=>html`<span className="mq-item" key=${k+i} aria-hidden=${k==="b"}><span className=${"mq-t"+(i%2?" out":"")}>${t}</span>${star}</span>`);
 return html`<div className="mq" role="marquee" aria-label=${TICKER.join(", ")}><div className="mq-track">${row("a")}${row("b")}</div></div>`}

// A river of floating language logos. Every logo follows the same winding current.
function River(){
 const D=34,N=LOGOS.length,wave="M0 60Q150 10 300 60T600 60T900 60T1200 60T1500 60T1800 60T2100 60T2400 60";
 return html`<section id="stack" className="wrap sec">
 <${Head} k="My stack" t="The code river"/>
 <${Rev}><div className="river">
  ${[["w1",34,"rgba(255,255,255,.85)",26],["w2",24,"rgba(124,196,255,.38)",38],["w3",44,"rgba(255,255,255,.6)",52],["w4",30,"rgba(124,196,255,.3)",64]].map(([c,top,col,du])=>html`<svg key=${c} className=${"wave "+c} style=${{top:top+"%",animationDuration:du+"s"}} viewBox="0 0 2400 120" preserveAspectRatio="none" aria-hidden="true"><path d=${wave} fill="none" stroke=${col} strokeWidth="3"/></svg>`)}
  <div className="rv-flow">${LOGOS.map((g,i)=>html`<div key=${g.n} className="rv-it" style=${{"--lane":i%3,"--d":(-i*D/N)+"s","--dur":D+"s"}}>
   <div className="rv-bob"><div className="rv-tile" style=${{animationDelay:(-i*.55)+"s"}}><svg viewBox="0 0 24 24" role="img" aria-label=${g.n}><path d=${g.d} fill=${g.c}/></svg></div><span>${g.n}</span></div></div>`)}</div>
 </div><//></section>`}