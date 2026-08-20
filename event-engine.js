/*
===========================================
JUTA RIVER EVENT ENGINE - WITH AUTOPLAY VIDEO
===========================================
*/

(function() {

    // ============================================
    // SUPABASE CONFIG - Load from config.js
    // ============================================

    const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://xgptapucpvogfiezquva.supabase.co";
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || "sb_publishable_isUA857Cwiw5AXUEYxgccA_Ps3TozQF";

    // ============================================
    // FETCH EVENTS FROM SUPABASE
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
    // RENDER ALL EVENTS
    // ============================================

    async function renderAllEvents() {
        console.log('🔄 Rendering all events...');
        
        const events = await fetchEvents();
        if (!events || events.length === 0) {
            console.log('⚠️ No events found in Supabase');
            const eventScroller = document.getElementById('event-list');
            if (eventScroller) {
                eventScroller.innerHTML = `
                    <p style="color:#999;padding:40px;text-align:center;grid-column:1/-1;">
                        No events scheduled yet. Check back soon!
                    </p>
                `;
            }
            return;
        }
        
        const now = new Date();
        console.log(`📋 Loaded ${events.length} events from Supabase`);

        // ============================================
        // 1. UPDATE HERO BACKGROUND (VIDEO OR IMAGE)
        // ============================================

        let heroEvent = events.find(e => e.hero === true);
        
        if (!heroEvent) {
            const upcoming = events
                .filter(e => getEventDate(e) >= now)
                .sort((a, b) => getEventDate(a) - getEventDate(b));
            heroEvent = upcoming[0] || events[0];
        }

        console.log('⭐ Hero event:', heroEvent?.name || 'None');

        const videoElement = document.getElementById('hero-video');
        const imageElement = document.getElementById('hero-bg-img');
        
        if (heroEvent) {
            const hasVideo = heroEvent.videoId && heroEvent.videoId !== '';
            
            if (hasVideo && videoElement) {
                // Set video source
                videoElement.src = heroEvent.videoId;
                videoElement.style.display = 'block';
                videoElement.classList.add('show');
                
                // 🎯 CRITICAL: These attributes enable autoplay
                videoElement.muted = true;
                videoElement.loop = true;
                videoElement.playsInline = true;
                videoElement.autoplay = true;
                
                // Force play with error handling
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(function(error) {
                        console.log('Video autoplay prevented, waiting for user interaction...');
                        // Retry after user clicks anywhere
                        document.addEventListener('click', function playOnClick() {
                            videoElement.play();
                            document.removeEventListener('click', playOnClick);
                        }, { once: true });
                    });
                }
                
                // Hide image
                if (imageElement) {
                    imageElement.classList.add('hide');
                }
                console.log('🎬 Playing background video for hero');
            } else if (imageElement) {
                // Show image
                imageElement.src = heroEvent.poster || 'assets/juta-river-pool-and-lodge.jpeg';
                imageElement.classList.remove('hide');
                
                // Hide video
                if (videoElement) {
                    videoElement.style.display = 'none';
                    videoElement.classList.remove('show');
                    videoElement.pause();
                }
                console.log('🖼️ Showing background image for hero');
            }
        }

        // ============================================
        // 2. UPDATE HERO TEXT CONTENT
        // ============================================

        const heroImg = document.querySelector('.next-event img');
        if (heroImg && heroEvent) {
            heroImg.src = heroEvent.poster || 'assets/metro-home-coming.jpg';
            heroImg.alt = heroEvent.name || 'Event';
        }

        const heroName = document.querySelector('.next-event strong');
        if (heroName && heroEvent) {
            heroName.textContent = heroEvent.name || 'Event';
        }

        const heroDate = document.querySelector('.next-event span');
        if (heroDate && heroEvent) {
            const dateObj = new Date(heroEvent.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-ZA', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            heroDate.textContent = formattedDate + ' · GIYANI';
        }

        const timer = document.querySelector('.next-event .timer');
        if (timer && heroEvent) {
            timer.dataset.date = heroEvent.date + 'T' + (heroEvent.time || '20:00') + ':00+02:00';
        }

        // ============================================
        // 3. RENDER EVENT CARDS
        // ============================================

        const eventScroller = document.getElementById('event-list');
        
        if (!eventScroller) {
            console.warn('⚠️ #event-list not found!');
            return;
        }

        eventScroller.innerHTML = '';

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
            if (event.link && event.link !== '') {
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
        console.log(`✅ Rendered ${sorted.length} event cards from Supabase`);

        // ============================================
        // 4. COUNTDOWN TIMER
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
    }

    // ============================================
    // INITIAL RENDER
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAllEvents);
    } else {
        renderAllEvents();
    }

    // Re-render every 30 seconds (in case admin updates)
    setInterval(renderAllEvents, 30000);

    console.log('🚀 Event engine initialized with Supabase!');

})();