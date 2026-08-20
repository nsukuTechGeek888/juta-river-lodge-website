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
// LOADING SCREEN - WAITS FOR CONTENT
// ============================================

let loadingHidden = false;

function hideLoadingScreen() {
    if (loadingHidden) return;
    loadingHidden = true;
    
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('home');
    const header = document.querySelector('.header');
    const footer = document.querySelector('footer');
    const mobileActions = document.querySelector('.mobile-actions');
    
    // Show content
    if (mainContent) mainContent.classList.add('loaded');
    if (header) header.classList.add('loaded');
    if (footer) footer.classList.add('loaded');
    if (mobileActions) mobileActions.classList.add('loaded');
    
    // Hide loading screen
    if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.6s ease';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 600);
    }
    
    console.log('✅ Content is ready!');
}

// Check if content is actually rendered
function checkContentReady() {
    // Check video is showing
    const video = document.getElementById('hero-video');
    const videoVisible = video && 
                        video.style.display !== 'none' && 
                        video.classList.contains('show');
    
    // Check events are rendered
    const events = document.getElementById('event-list');
    const eventsReady = events && events.children.length > 0;
    
    // Check hero text is updated
    const heroName = document.querySelector('.next-event strong');
    const heroTextReady = heroName && heroName.textContent && heroName.textContent !== 'Metro<br>Home Coming';
    
    // All conditions
    const allReady = (videoVisible || !video || !video.src) && eventsReady;
    
    if (allReady) {
        hideLoadingScreen();
        return true;
    }
    return false;
}

// Check every 200ms
const checkInterval = setInterval(function() {
    if (checkContentReady()) {
        clearInterval(checkInterval);
    }
}, 200);

// Force hide after 6 seconds (safety)
setTimeout(function() {
    hideLoadingScreen();
    clearInterval(checkInterval);
    console.log('⏰ Force hide after timeout');
}, 6000);

// Expose function for event-engine to call
window.contentReady = function() {
    checkContentReady();
};