const $=(s,r=document)=>r.querySelector(s);
function tick(){document.querySelectorAll(".timer").forEach(t=>{const d=Math.max(0,new Date(t.dataset.date)-Date.now());const v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];["days","hours","minutes","seconds"].forEach((n,i)=>{const el=$(`[data-${n}]`,t);if(el)el.textContent=String(v[i]).padStart(i===0?3:2,"0")})})}tick();setInterval(tick,1000);
const menu=$(".hamburger"), mobile=$(".mobile-menu");
function closeMenu(){menu?.setAttribute("aria-expanded","false");mobile?.classList.remove("open");mobile?.setAttribute("aria-hidden","true");document.body.classList.remove("lock")}
menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));mobile.classList.toggle("open",!open);mobile.setAttribute("aria-hidden",String(open));document.body.classList.toggle("lock",!open)});
document.querySelectorAll('.mobile-menu a[href^="#"],.nav a[href^="#"],.brand[href^="#"]').forEach(a=>a.addEventListener("click",closeMenu));
const progress=$(".progress span"), backToTop=$(".top");
function scrollUI(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+"%";backToTop.classList.toggle("show",scrollY>700)}addEventListener("scroll",scrollUI,{passive:true});scrollUI();
backToTop?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
addEventListener("resize",()=>{if(innerWidth>800)closeMenu()});
document.querySelectorAll("img").forEach(img=>{img.addEventListener("error",()=>img.style.opacity=".25")});

// ============================================
// LOADING SCREEN - SIMPLE & RELIABLE
// ============================================

setTimeout(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('home');
    const header = document.querySelector('.header');
    const footer = document.querySelector('footer');
    const mobileActions = document.querySelector('.mobile-actions');
    
    if (mainContent) mainContent.classList.add('loaded');
    if (header) header.classList.add('loaded');
    if (footer) footer.classList.add('loaded');
    if (mobileActions) mobileActions.classList.add('loaded');
    
    if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.6s ease';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 600);
    }
}, 2500);

// ============================================
// FORCE VIDEO PLAY ON MOBILE
// ============================================

function forcePlayVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    
    video.style.display = 'block';
    video.classList.add('show');
    
    if (video.paused) {
        video.play().catch(function() {
            console.log('🔇 Autoplay blocked, waiting for interaction...');
        });
    }
}

setTimeout(forcePlayVideo, 500);
setTimeout(forcePlayVideo, 1500);

document.addEventListener('click', function forcePlayOnce() {
    forcePlayVideo();
    document.removeEventListener('click', forcePlayOnce);
}, { once: true });

document.addEventListener('touchstart', function forcePlayTouch() {
    forcePlayVideo();
    document.removeEventListener('touchstart', forcePlayTouch);
}, { once: true });