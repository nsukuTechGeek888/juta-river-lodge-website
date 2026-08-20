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
// LOADING SCREEN CONTROLLER
// ============================================

function hideLoadingScreen() {
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
        loadingScreen.classList.add('hidden');
        // After animation, remove from DOM
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 800);
    }
}

// Check if everything is ready
function checkReadyState() {
    const video = document.getElementById('hero-video');
    const events = document.getElementById('event-list');
    
    const videoReady = !video || video.readyState >= 3 || video.src === '' || video.src === 'about:blank';
    const eventsReady = events && events.children.length > 0;
    
    if (videoReady && eventsReady) {
        hideLoadingScreen();
        return true;
    }
    return false;
}

// Check periodically
let loadingAttempts = 0;
const loadingInterval = setInterval(function() {
    loadingAttempts++;
    if (checkReadyState()) {
        clearInterval(loadingInterval);
    } else if (loadingAttempts > 40) {
        // Force hide after 6 seconds (40 * 150ms = 6s)
        hideLoadingScreen();
        clearInterval(loadingInterval);
        console.log('⏰ Force loaded after timeout');
    }
}, 150);

// Safety net - hide after 6 seconds
setTimeout(function() {
    hideLoadingScreen();
    clearInterval(loadingInterval);
}, 6000);

// Expose checkReadyState globally so event-engine can call it
window.checkReadyState = checkReadyState;