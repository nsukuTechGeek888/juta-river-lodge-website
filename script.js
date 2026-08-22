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
// LOADING SCREEN
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
// SCROLL ANIMATIONS
// ============================================

function handleScrollAnimations() {
    const elements = document.querySelectorAll('.section, .split-venue, .experience-section, .book, .gallery, .drinks');
    elements.forEach(function(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight - 100) {
            el.classList.add('visible');
        }
    });
}

// Add fade-up class to sections
document.querySelectorAll('.section, .split-venue, .experience-section, .book, .gallery, .drinks').forEach(function(el) {
    el.classList.add('fade-up');
});

// Check on load and scroll
window.addEventListener('load', function() {
    setTimeout(handleScrollAnimations, 500);
});
window.addEventListener('scroll', handleScrollAnimations);

// ============================================
// FORCE ALL VIDEOS TO PLAY
// ============================================

function playAllVideos() {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.loop = true;
        heroVideo.style.display = 'block';
        heroVideo.classList.add('show');
        if (heroVideo.paused) {
            heroVideo.play().catch(function() {});
        }
    }
    
    const expVideo = document.querySelector('.experience-video');
    if (expVideo) {
        expVideo.muted = true;
        expVideo.playsInline = true;
        expVideo.loop = true;
        if (expVideo.paused) {
            expVideo.play().catch(function() {});
        }
    }
}

// Try to play immediately
setTimeout(playAllVideos, 500);
setTimeout(playAllVideos, 1500);
setTimeout(playAllVideos, 3000);

// Play on user interaction
document.addEventListener('click', function() {
    playAllVideos();
}, { once: true });

document.addEventListener('touchstart', function() {
    playAllVideos();
}, { once: true });

let scrollPlayed = false;
document.addEventListener('scroll', function() {
    if (!scrollPlayed) {
        playAllVideos();
        scrollPlayed = true;
    }
}, { once: true });

// Intersection Observer for experience video
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            const expVideo = document.querySelector('.experience-video');
            if (expVideo && expVideo.paused) {
                expVideo.play().catch(function() {});
            }
        }
    });
}, { threshold: 0.2 });

const expSection = document.querySelector('.experience-section');
if (expSection) {
    observer.observe(expSection);
}