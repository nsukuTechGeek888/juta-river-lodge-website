const $=(s,r=document)=>r.querySelector(s);
function tick(){document.querySelectorAll(".timer").forEach(t=>{const d=Math.max(0,new Date(t.dataset.date)-Date.now());const v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];["days","hours","minutes","seconds"].forEach((n,i)=>{const el=$(`[data-${n}]`,t);if(el)el.textContent=String(v[i]).padStart(i===0?3:2,"0")})})}tick();setInterval(tick,1000);
const menu=$(".hamburger"), mobile=$(".mobile-menu");
function closeMenu(){menu?.setAttribute("aria-expanded","false");mobile?.classList.remove("open");mobile?.setAttribute("aria-hidden","true");document.body.classList.remove("lock")}
menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));mobile.classList.toggle("open",!open);mobile.setAttribute("aria-hidden",String(open));document.body.classList.toggle("lock",!open)});
document.querySelectorAll('.mobile-menu a[href^="#"],.nav a[href^="#"],.brand[href^="#"]').forEach(a=>a.addEventListener("click",closeMenu));
const progress=$(".progress span"),top=$(".top");
function scrollUI(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+"%";top.classList.toggle("show",scrollY>700)}addEventListener("scroll",scrollUI,{passive:true});scrollUI();
top?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
addEventListener("resize",()=>{if(innerWidth>800)closeMenu()});
document.querySelectorAll("img").forEach(img=>{img.addEventListener("error",()=>img.style.opacity=".25")});
