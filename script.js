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
// LOADING SCREEN CONTROLLER - IMPROVED
// ============================================

let isReady = false;
let loadingStartTime = Date.now();
let videoPlayed = false;
let eventsRendered = false;

function hideLoadingScreen() {
    // Don't hide if already hidden
    if (isReady) return;
    isReady = true;
    
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('home');
    const header = document.querySelector('.header');
    const footer = document.querySelector('footer');
    const mobileActions = document.querySelector('.mobile-actions');
    
    // Show main content with fade-in
    if (mainContent) mainContent.classList.add('loaded');
    if (header) header.classList.add('loaded');
    if (footer) footer.classList.add('loaded');
    if (mobileActions) mobileActions.classList.add('loaded');
    
    // Hide loading screen with fade-out
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 800);
    }
    
    console.log('✅ Loading complete - site ready!');
    console.log(`⏱️ Loading time: ${Math.round((Date.now() - loadingStartTime) / 1000)}s`);
}

// Check if everything is ready
function checkReadyState() {
    // Don't check if already ready
    if (isReady) return true;
    
    const video = document.getElementById('hero-video');
    const events = document.getElementById('event-list');
    
    // Check video: playing or no video needed
    const videoReady = !video || 
                      video.src === '' || 
                      video.src === 'about:blank' ||
                      (!video.paused && video.currentTime > 0) ||
                      video.readyState >= 3;
    
    // Check events: has content
    const eventsReady = events && events.children.length > 0;
    
    // Minimum display time (1.5 seconds for smooth experience)
    const minTimePassed = (Date.now() - loadingStartTime) > 1500;
    
    // All conditions met
    const allReady = videoReady && eventsReady && minTimePassed;
    
    if (allReady) {
        hideLoadingScreen();
        return true;
    }
    
    return false;
}

// Mark video as played (called from event-engine)
function markVideoPlayed() {
    videoPlayed = true;
    checkReadyState();
}

// Mark events as rendered (called from event-engine)
function markEventsRendered() {
    eventsRendered = true;
    checkReadyState();
}

// Check periodically
let loadingAttempts = 0;
const loadingInterval = setInterval(function() {
    loadingAttempts++;
    if (checkReadyState()) {
        clearInterval(loadingInterval);
    } else if (loadingAttempts > 50) {
        // Force hide after 7.5 seconds (50 * 150ms)
        hideLoadingScreen();
        clearInterval(loadingInterval);
        console.log('⏰ Force loaded after timeout');
    }
}, 150);

// Safety net - hide after 8 seconds max
setTimeout(function() {
    if (!isReady) {
        hideLoadingScreen();
        clearInterval(loadingInterval);
        console.log('⏰ Force loaded after safety timeout');
    }
}, 8000);

// Expose functions globally so event-engine can call them
window.checkReadyState = checkReadyState;
window.markVideoPlayed = markVideoPlayed;
window.markEventsRendered = markEventsRendered;