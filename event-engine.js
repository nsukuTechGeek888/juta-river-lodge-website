/*
===========================================
JUTA RIVER EVENT ENGINE - OPTIMIZED FOR SPEED
===========================================
*/

(function() {

    // ============================================
    // SUPABASE CONFIG
    // ============================================

    const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://xgptapucpvogfiezquva.supabase.co";
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || "sb_publishable_isUA857Cwiw5AXUEYxgccA_Ps3TozQF";

    // ============================================
    // DOM ELEMENTS - Cached for speed
    // ============================================

    const videoElement = document.getElementById('hero-video');
    const imageElement = document.getElementById('hero-bg-img');
    const eventScroller = document.getElementById('event-list');
    const heroName = document.querySelector('.next-event strong');
    const heroDate = document.querySelector('.next-event span');
    const heroImg = document.querySelector('.next-event img');
    const timer = document.querySelector('.next-event .timer');
    
    // ============================================
    // CACHED EVENTS
    // ============================================

    let cachedEvents = [];
    let isLoading = false;

    // ============================================
    // FETCH EVENTS WITH CACHE
    // ============================================

    async function fetchEvents() {
        // If we already have events, return them immediately
        if (cachedEvents.length > 0) {
            return cachedEvents;
        }
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=date.asc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            cachedEvents = data || [];
            console.log('📋 Loaded events from Supabase:', cachedEvents.length);
            return cachedEvents;
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
    // PLAY VIDEO FUNCTION (with immediate play)
    // ============================================

    function playVideo() {
        if (!videoElement || !videoElement.src) return;
        
        // Force attributes
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        
        // Show video, hide image
        videoElement.style.display = 'block';
        videoElement.classList.add('show');
        if (imageElement) {
            imageElement.classList.add('hide');
            imageElement.style.opacity = '0';
        }
        
        // Try to play immediately
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(function(error) {
                console.log('🔇 Video autoplay blocked, waiting for interaction...');
                // Try again on any interaction
                const playOnInteraction = function() {
                    videoElement.play().catch(function() {});
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
        }
    }

    // ============================================
    // RENDER EVENTS - FAST!
    // ============================================

    async function renderAllEvents() {
        // Prevent multiple concurrent loads
        if (isLoading) return;
        isLoading = true;
        
        console.log('🔄 Rendering all events...');
        
        const events = await fetchEvents();
        const now = new Date();
        
        if (!events || events.length === 0) {
            if (eventScroller) {
                eventScroller.innerHTML = `
                    <p style="color:#999;padding:40px;text-align:center;grid-column:1/-1;">
                        No events scheduled yet. Check back soon!
                    </p>
                `;
            }
            isLoading = false;
            return;
        }

        // ============================================
        // 1. UPDATE HERO BACKGROUND - IMMEDIATE
        // ============================================

        let heroEvent = events.find(e => e.hero === true);
        
        if (!heroEvent) {
            const upcoming = events
                .filter(e => getEventDate(e) >= now)
                .sort((a, b) => getEventDate(a) - getEventDate(b));
            heroEvent = upcoming[0] || events[0];
        }

        console.log('⭐ Hero event:', heroEvent?.name || 'None');

        if (heroEvent) {
            const hasVideo = heroEvent.videoId && heroEvent.videoId !== '' && heroEvent.videoId !== 'null';
            
            // Update hero text FIRST (fast)
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
            
            // Update background - video or image
            if (hasVideo && videoElement) {
                // Check if video source changed
                const currentSrc = videoElement.src;
                const newSrc = heroEvent.videoId;
                
                if (currentSrc !== newSrc) {
                    console.log('🎬 Setting video source:', newSrc.substring(0, 50) + '...');
                    videoElement.src = newSrc;
                    videoElement.load();
                    
                    // Set up canplay event to play as soon as ready
                    videoElement.oncanplay = function() {
                        playVideo();
                        videoElement.oncanplay = null;
                    };
                    
                    // If video is already loaded enough, play immediately
                    if (videoElement.readyState >= 3) {
                        playVideo();
                    }
                } else {
                    // Same video, just play it
                    playVideo();
                }
            } else if (imageElement) {
                // Show image immediately
                imageElement.src = heroEvent.poster || 'assets/juta-river-pool-and-lodge.jpeg';
                imageElement.classList.remove('hide');
                imageElement.style.opacity = '1';
                
                if (videoElement) {
                    videoElement.style.display = 'none';
                    videoElement.classList.remove('show');
                    videoElement.pause();
                }
                console.log('🖼️ Showing background image for hero');
            }
        }

        // ============================================
        // 2. RENDER EVENT CARDS - FAST!
        // ============================================

        if (!eventScroller) {
            console.warn('⚠️ #event-list not found!');
            isLoading = false;
            return;
        }

        // Don't clear if we already have content - update in place
        if (eventScroller.children.length === 0) {
            // Sort events
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
        // 3. COUNTDOWN TIMER
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

        if (window._countdownInterval) {
            clearInterval(window._countdownInterval);
        }

        updateCountdown();
        window._countdownInterval = setInterval(updateCountdown, 1000);
        
        isLoading = false;
    }

    // ============================================
    // WATCH FOR STORAGE CHANGES
    // ============================================

    window.addEventListener('storage', function(e) {
        if (e.key === 'juta_river_events_v2') {
            console.log('🔄 Storage changed, re-rendering...');
            cachedEvents = []; // Clear cache to force reload
            renderAllEvents();
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('👁️ Tab became visible');
            // Retry playing video
            if (videoElement && videoElement.src && videoElement.style.display !== 'none') {
                playVideo();
            }
        }
    });

    // ============================================
    // INITIAL RENDER - FAST!
    // ============================================

    // Render immediately if DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        renderAllEvents();
    } else {
        document.addEventListener('DOMContentLoaded', renderAllEvents);
    }

    // Also render after a short delay to ensure everything is ready
    setTimeout(renderAllEvents, 100);

    console.log('🚀 Event engine initialized with Supabase!');
    console.log('📋 Events will render as soon as data loads');

})();