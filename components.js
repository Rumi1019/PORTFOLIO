// Shared helpers used by every section
const {useState,useEffect,useRef}=React;
const html=htm.bind(React.createElement);

const Icon=({d,s=18})=>html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d=${d}/></svg>`;
const ARROW="M7 7h10v10M7 17 17 7",XICON="M18 6 6 18M6 6l12 12",TERM="m4 17 6-6-6-6M12 19h8",CODE="m16 18 6-6-6-6M8 6l-6 6 6 6";
const GH="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2";
const GLOBE="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z";

// Fades a block in when it scrolls into view
function Rev({children,delay=0,className="",style={}}){
 const r=useRef(null),[v,set]=useState(false);
 useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){set(true);o.disconnect()}},{threshold:.1});o.observe(r.current);return()=>o.disconnect()},[]);
 return html`<div ref=${r} className=${"rev "+(v?"in ":"")+className} style=${{transitionDelay:delay+"ms",...style}}>${children}</div>`}

// Image with a clean fallback if it fails to load
function Shot({src,title,ratio="16/10"}){
 const[bad,setBad]=useState(false);
 if(bad)return html`<div style=${{aspectRatio:ratio,background:"linear-gradient(135deg,#f5f5f7,#cfd0d6)",display:"flex",alignItems:"center",justifyContent:"center",font:"600 24px system-ui",color:"#3a3a3c"}}>${title}</div>`;
 return html`<img className="img" style=${{aspectRatio:ratio}} src=${src} alt=${title} onError=${()=>setBad(true)}/>`}

// Big letters that slide up one by one
const Word=({text,outline,delay=0})=>html`<span className=${"word"+(outline?" out":"")}>${[...text].map((c,i)=>html`<span className="ch" key=${i}><i style=${{animationDelay:(delay+i*80)+"ms"}}>${c}</i></span>`)}</span>`;

// Button that leans toward the mouse
function Mag({href,children}){
 const r=useRef(null),ext=/^http/.test(href);
 const mv=e=>{const b=r.current.getBoundingClientRect();r.current.style.transform=`translate(${(e.clientX-b.left-b.width/2)*.25}px,${(e.clientY-b.top-b.height/2)*.35}px)`};
 return html`<a ref=${r} className="btn" href=${href} target=${ext?"_blank":undefined} rel=${ext?"noopener noreferrer":undefined} onMouseMove=${mv} onMouseLeave=${()=>r.current.style.transform=""}>${children}</a>`}

const Pill=({s,style})=>html`<a className="pill" href=${s.u} target="_blank" rel="noopener noreferrer" style=${style}><${Icon} d=${s.i} s=${16}/>${s.n}</a>`;
const Tags=({t})=>html`<div style=${{display:"flex",flexWrap:"wrap",gap:8}}>${t.map(x=>html`<span className="tag" key=${x}>${x}</span>`)}</div>`;
const Head=({k,t})=>html`<${Rev}><p className="kick">${k}</p><h2 className="h2">${t}</h2><//>`;
