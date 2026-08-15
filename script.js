const q=(s,r=document)=>r.querySelector(s);
const menu=q(".hamburger"), mobile=q(".mobile-nav");
function closeMenu(){if(!menu)return;menu.setAttribute("aria-expanded","false");mobile?.classList.remove("open");}
menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));mobile?.classList.toggle("open",!open)});
document.querySelectorAll(".mobile-nav a").forEach(a=>a.addEventListener("click",closeMenu));

function tick(){document.querySelectorAll(".timer").forEach(t=>{const d=Math.max(0,new Date(t.dataset.date)-Date.now());const vals=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];["days","hours","minutes","seconds"].forEach((n,i)=>q(`[data-${n}]`,t).textContent=String(vals[i]).padStart(2,"0"))})}
tick();setInterval(tick,1000);

const progress=q(".progress span"),top=q(".top");
function scrollUI(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+"%";top.classList.toggle("show",scrollY>600)}
addEventListener("scroll",scrollUI,{passive:true});scrollUI();
top.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
addEventListener("resize",()=>{if(innerWidth>820)closeMenu()});
