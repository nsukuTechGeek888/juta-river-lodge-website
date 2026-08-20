/*
===========================================
JUTA RIVER EVENT ENGINE - WITH VIDEO CACHE
===========================================
*/

(function() {

    // ============================================
    // SUPABASE CONFIG
    // ============================================

    const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://xgptapucpvogfiezquva.supabase.co";
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || "sb_publishable_isUA857Cwiw5AXUEYxgccA_Ps3TozQF";

    // ============================================
    // DOM ELEMENTS
    // ============================================

    const videoElement = document.getElementById('hero-video');
    const imageElement = document.getElementById('hero-bg-img');
    const eventScroller = document.getElementById('event-list');
    const heroName = document.querySelector('.next-event strong');
    const heroDate = document.querySelector('.next-event span');
    const heroImg = document.querySelector('.next-event img');
    const timer = document.querySelector('.next-event .timer');
    
    // ============================================
    // CACHE KEYS
    // ============================================

    const CACHE_KEY = 'juta_video_cache';
    const EVENTS_KEY = 'juta_river_events_v2';

    // ============================================
    // VIDEO CACHE
    // ============================================

    function getCachedVideo() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch(e) {
            return null;
        }
    }

    function setCachedVideo(videoData) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(videoData));
        } catch(e) {}
    }

    // ============================================
    // PLAY VIDEO IMMEDIATELY (from cache)
    // ============================================

    function playVideoImmediately(videoSrc) {
        if (!videoElement || !videoSrc) return false;
        
        console.log('🎬 Playing video immediately from cache');
        
        // Set video source
        videoElement.src = videoSrc;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.preload = 'auto';
        
        // Show video
        videoElement.style.display = 'block';
        videoElement.classList.add('show');
        videoElement.style.opacity = '1';
        
        // Hide image
        if (imageElement) {
            imageElement.classList.remove('show');
            imageElement.style.opacity = '0';
            imageElement.style.display = 'none';
        }
        
        // Try to play
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(function() {
                // Will retry on interaction
            });
        }
        
        return true;
    }

    // ============================================
    // SHOW IMAGE (when no video)
    // ============================================

    function showImageImmediately(imageSrc) {
        if (!imageElement) return;
        
        console.log('🖼️ Showing image immediately');
        
        // Hide video
        if (videoElement) {
            videoElement.style.display = 'none';
            videoElement.classList.remove('show');
            videoElement.pause();
        }
        
        // Show image
        if (imageSrc) {
            imageElement.src = imageSrc;
        }
        imageElement.style.display = 'block';
        imageElement.classList.add('show');
        imageElement.style.opacity = '1';
    }

    // ============================================
    // LOAD CACHED VIDEO ON PAGE LOAD
    // ============================================

    function loadCachedVideo() {
        const cached = getCachedVideo();
        if (cached && cached.videoId && cached.videoId !== '' && cached.videoId !== 'null') {
            // We have a cached video - play it immediately
            playVideoImmediately(cached.videoId);
            return true;
        } else if (cached && cached.poster) {
            // No video, show cached poster
            showImageImmediately(cached.poster);
            return true;
        }
        return false;
    }

    // ============================================
    // FETCH EVENTS (background refresh)
    // ============================================

    async function fetchEvents() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=date.asc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log('📋 Loaded events from Supabase:', data.length);
            return data || [];
        } catch(e) {
            console.error('Error fetching events:', e);
            return [];
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    function getEventDate(event) {
        return new Date(`${event.date}T${event.time || "20:00"}:00+02:00`);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            if (m === "'") return '&#039;';
            return m;
        });
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleDateString('en-ZA', { month: 'short' }).toUpperCase();
        const year = d.getFullYear();
        return { day, month, year };
    }

    // ============================================
    // UPDATE HERO FROM FRESH DATA
    // ============================================

    function updateHeroFromFreshData(heroEvent) {
        if (!heroEvent) return;
        
        // Update text
        if (heroName) heroName.textContent = heroEvent.name || 'Event';
        
        if (heroDate) {
            const dateObj = new Date(heroEvent.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-ZA', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            heroDate.textContent = formattedDate + ' · GIYANI';
        }
        
        if (heroImg) {
            heroImg.src = heroEvent.poster || 'assets/metro-home-coming.jpg';
            heroImg.alt = heroEvent.name || 'Event';
        }
        
        if (timer) {
            timer.dataset.date = heroEvent.date + 'T' + (heroEvent.time || '20:00') + ':00+02:00';
        }
        
        // Update cache with new video/poster
        const hasVideo = heroEvent.videoId && 
                        heroEvent.videoId !== '' && 
                        heroEvent.videoId !== 'null' &&
                        heroEvent.videoId !== 'undefined';
        
        // Update cache
        setCachedVideo({
            videoId: hasVideo ? heroEvent.videoId : null,
            poster: heroEvent.poster || null
        });
        
        // Update background if video changed
        if (hasVideo && videoElement) {
            const currentSrc = videoElement.src;
            const newSrc = heroEvent.videoId;
            
            if (currentSrc !== newSrc) {
                console.log('🎬 Video changed, updating...');
                videoElement.src = newSrc;
                videoElement.load();
                
                // Play when ready
                videoElement.oncanplay = function() {
                    playVideoImmediately(newSrc);
                    videoElement.oncanplay = null;
                };
                
                // If already loaded enough
                if (videoElement.readyState >= 3) {
                    playVideoImmediately(newSrc);
                }
                
                // Fallback: try after delay
                setTimeout(function() {
                    if (!videoElement.currentTime) {
                        playVideoImmediately(newSrc);
                    }
                }, 1000);
            }
        } else if (!hasVideo && imageElement) {
            // No video - show poster
            showImageImmediately(heroEvent.poster || 'assets/juta-river-pool-and-lodge.jpeg');
        }
    }

    // ============================================
    // RENDER EVENT CARDS
    // ============================================

    function renderEventCards(events) {
        if (!eventScroller) return;
        
        const now = new Date();
        
        // Only render if empty
        if (eventScroller.children.length > 0) return;
        
        const sorted = [...events].sort((a, b) => {
            const aDate = getEventDate(a);
            const bDate = getEventDate(b);
            const aFuture = aDate >= now;
            const bFuture = bDate >= now;
            
            if (aFuture && !bFuture) return -1;
            if (!aFuture && bFuture) return 1;
            return aDate - bDate;
        });

        let html = '';
        
        sorted.forEach((event, index) => {
            const { day, month, year } = formatDate(event.date);
            const isUpcoming = getEventDate(event) >= now;
            
            let tag = '';
            if (event.hero) {
                tag = '<span class="tag">★ FEATURED</span>';
            } else if (isUpcoming && index === 0) {
                tag = '<span class="tag">NEXT EVENT</span>';
            } else if (isUpcoming) {
                tag = '<span class="tag">UPCOMING</span>';
            }

            let cardLink = '';
            if (event.link && event.link !== '' && event.link !== '#') {
                cardLink = `<a class="card-link" href="${event.link}">Get Tickets ↗</a>`;
            }

            const posterSrc = event.poster || 'assets/metro-home-coming.jpg';

            html += `
                <article class="event-card ${event.hero ? 'featured' : ''}" data-event-id="${event.id}">
                    <div class="poster">
                        <img src="${posterSrc}" 
                             alt="${escapeHTML(event.name)}"
                             onerror="this.src='assets/metro-home-coming.jpg'">
                        ${tag}
                    </div>
                    <div class="event-meta">
                        <div class="date">
                            <b>${day}</b>
                            <small>${month}<br>${year}</small>
                        </div>
                        <div>
                            <span>${escapeHTML(event.location || 'THE JUTA RIVER PRESENTS')}</span>
                            <h3>${escapeHTML(event.name)}</h3>
                            <p>${escapeHTML(event.description || 'Live at The Juta River')}</p>
                        </div>
                    </div>
                    ${cardLink}
                </article>
            `;
        });

        eventScroller.innerHTML = html;
        console.log(`✅ Rendered ${sorted.length} event cards`);
    }

    // ============================================
    // COUNTDOWN TIMER
    // ============================================

    function updateCountdown() {
        document.querySelectorAll('.timer').forEach(function(timer) {
            const targetDate = new Date(timer.dataset.date);
            if (isNaN(targetDate.getTime())) return;
            
            const diff = Math.max(0, targetDate.getTime() - Date.now());
            
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const daysEl = timer.querySelector('[data-days]');
            const hoursEl = timer.querySelector('[data-hours]');
            const minutesEl = timer.querySelector('[data-minutes]');
            const secondsEl = timer.querySelector('[data-seconds]');
            
            if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        });
    }

    // ============================================
    // MAIN RENDER FUNCTION
    // ============================================

    async function renderAllEvents() {
        console.log('🔄 Refreshing events in background...');
        
        const events = await fetchEvents();
        
        if (!events || events.length === 0) {
            if (eventScroller) {
                eventScroller.innerHTML = `
                    <p style="color:#999;padding:40px;text-align:center;grid-column:1/-1;">
                        No events scheduled yet. Check back soon!
                    </p>
                `;
            }
            return;
        }

        // Find hero event
        const now = new Date();
        let heroEvent = events.find(e => e.hero === true);
        
        if (!heroEvent) {
            const upcoming = events
                .filter(e => getEventDate(e) >= now)
                .sort((a, b) => getEventDate(a) - getEventDate(b));
            heroEvent = upcoming[0] || events[0];
        }

        // Update hero from fresh data
        updateHeroFromFreshData(heroEvent);
        
        // Render event cards
        renderEventCards(events);
        
        // Update countdown
        if (window._countdownInterval) {
            clearInterval(window._countdownInterval);
        }
        updateCountdown();
        window._countdownInterval = setInterval(updateCountdown, 1000);
    }

    // ============================================
    // INITIALIZATION - LOAD CACHED VIDEO FIRST
    // ============================================

    // 1. Load cached video immediately (0ms)
    const hasCached = loadCachedVideo();
    
    if (!hasCached) {
        // No cached video - show dark background briefly
        console.log('⏳ No cached video, waiting for data...');
    }

    // 2. Then fetch fresh data in background
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        renderAllEvents();
    } else {
        document.addEventListener('DOMContentLoaded', renderAllEvents);
    }

    // 3. Also fetch after a small delay to ensure cache is populated
    setTimeout(renderAllEvents, 500);

    // 4. Watch for video autoplay issues
    document.addEventListener('click', function() {
        if (videoElement && videoElement.src && !videoElement.currentTime) {
            videoElement.play().catch(function() {});
        }
    }, { once: true });

    console.log('🚀 Event engine initialized with video cache!');
    console.log('📋 Video loads instantly from cache, data refreshes in background');
})();