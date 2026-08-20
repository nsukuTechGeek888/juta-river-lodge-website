const $=(s,r=document)=>r.querySelector(s);

// ----- Timer function -----
function tick(){
  document.querySelectorAll(".timer").forEach(t=>{
    const d=Math.max(0,new Date(t.dataset.date)-Date.now());
    const v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];
    ["days","hours","minutes","seconds"].forEach((n,i)=>{
      const el=$(`[data-${n}]`,t);
      if(el)el.textContent=String(v[i]).padStart(i===0?3:2,"0")
    })
  })
}
tick();setInterval(tick,1000);

// ----- Mobile menu -----
const menu=$(".hamburger"), mobile=$(".mobile-menu");
function closeMenu(){menu?.setAttribute("aria-expanded","false");mobile?.classList.remove("open");mobile?.setAttribute("aria-hidden","true");document.body.classList.remove("lock")}
menu?.addEventListener("click",()=>{
  const open=menu.getAttribute("aria-expanded")==="true";
  menu.setAttribute("aria-expanded",String(!open));
  mobile.classList.toggle("open",!open);
  mobile.setAttribute("aria-hidden",String(open));
  document.body.classList.toggle("lock",!open)
});
document.querySelectorAll('.mobile-menu a[href^="#"],.nav a[href^="#"],.brand[href^="#"]').forEach(a=>a.addEventListener("click",closeMenu));

// ----- Scroll progress & back to top -----
const progress=$(".progress span"),top=$(".top");
function scrollUI(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=(max?scrollY/max*100:0)+"%";
  top.classList.toggle("show",scrollY>700)
}
addEventListener("scroll",scrollUI,{passive:true});scrollUI();
top?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
addEventListener("resize",()=>{if(innerWidth>800)closeMenu()});

// ----- Handle image errors -----
document.querySelectorAll("img").forEach(img=>{
  img.addEventListener("error",()=>img.style.opacity=".25")
});

// ----- LOAD EVENTS FROM LOCALSTORAGE (same key as admin) -----
(function() {
  const STORAGE_KEY = 'juta_events_admin_v2';
  
  function getEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Ensure each event has a 'featured' property
        return parsed.map(e => ({ ...e, featured: e.featured === true }));
      }
      return [];
    } catch(e) {
      console.warn('Error loading events:', e);
      return [];
    }
  }

  // Seed default events if empty
  function seedEvents() {
    const existing = getEvents();
    if (existing.length > 0) return existing;
    
    const defaults = [
      { id: '1', name: 'Metro Home Coming', date: '2026-12-26', time: '16:00', location: 'The Juta River · Giyani', desc: 'Live entertainment · The Juta River', link: '#book', poster: 'assets/metro-home-coming.jpg', featured: true },
      { id: '2', name: 'Juta Saturdays', date: '2026-07-04', time: '14:00', location: 'The Juta River · Giyani', desc: 'Music · Food · People · Vibes', link: '#book', poster: 'assets/juta-saturdays.jpg', featured: false },
      { id: '3', name: 'People\'s Party Winter Edition', date: '2026-06-26', time: '18:00', location: 'The Juta River · Giyani', desc: 'Big energy · Live entertainment', link: '#book', poster: 'assets/peoples-party.jpg', featured: false },
      { id: '4', name: 'Juta Saturdays', date: '2026-07-11', time: '14:00', location: 'The Juta River · Giyani', desc: 'Network · Music · Food · Parking', link: '#book', poster: 'assets/juta-saturdays-cream.jpg', featured: false }
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch(e) { /* ignore */ }
    return defaults;
  }

  function renderEvents() {
    const events = seedEvents();
    const now = new Date();
    
    // Sort: upcoming first, then past
    const sorted = [...events].sort((a, b) => {
      const da = new Date(a.date + 'T' + a.time);
      const db = new Date(b.date + 'T' + b.time);
      return da - db;
    });

    // --- Hero section: find featured or next upcoming ---
    const featured = sorted.find(e => e.featured === true);
    const upcoming = sorted.filter(e => new Date(e.date + 'T' + e.time) >= now);
    const heroEvent = featured || (upcoming.length > 0 ? upcoming[0] : null);

    const heroAside = document.getElementById('hero-event');
    if (heroAside) {
      if (heroEvent) {
        const poster = heroEvent.poster || 'assets/metro-home-coming.jpg';
        const dateStr = new Date(heroEvent.date + 'T' + heroEvent.time);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = dateStr.toLocaleDateString('en-ZA', options);
        heroAside.innerHTML = `
          <div class="next-label">NEXT MAIN EVENT</div>
          <div class="timer" data-date="${heroEvent.date}T${heroEvent.time}:00+02:00">
            <div><b data-days>000</b><small>Days</small></div>
            <div><b data-hours>00</b><small>Hrs</small></div>
            <div><b data-minutes>00</b><small>Min</small></div>
            <div><b data-seconds>00</b><small>Sec</small></div>
          </div>
          <div class="next-event">
            <img src="${poster}" alt="${heroEvent.name}">
            <div>
              <span>${formattedDate} · GIYANI</span>
              <strong>${heroEvent.name}</strong>
              <a href="#events">View event →</a>
            </div>
          </div>
        `;
        // Re-init timer for this specific element
        const timer = heroAside.querySelector('.timer');
        if (timer) {
          const d = Math.max(0, new Date(timer.dataset.date) - Date.now());
          const v = [Math.floor(d/864e5), Math.floor(d/36e5)%24, Math.floor(d/6e4)%60, Math.floor(d/1e3)%60];
          ["days","hours","minutes","seconds"].forEach((n,i)=>{
            const el = timer.querySelector(`[data-${n}]`);
            if(el) el.textContent = String(v[i]).padStart(i===0?3:2,"0");
          });
        }
      } else {
        heroAside.innerHTML = `
          <div class="next-label">NEXT MAIN EVENT</div>
          <div style="padding:20px 0;text-align:center;color:#999;">
            <p>No events scheduled yet.<br>Check back soon!</p>
          </div>
        `;
      }
    }

    // --- Event list ---
    const listContainer = document.getElementById('event-list');
    if (!listContainer) return;

    if (sorted.length === 0) {
      listContainer.innerHTML = `<p style="color:#999;padding:40px;text-align:center;grid-column:1/-1;">No events scheduled yet. Check back soon!</p>`;
      return;
    }

    let html = '';
    sorted.forEach(event => {
      const poster = event.poster || 'assets/metro-home-coming.jpg';
      const dateObj = new Date(event.date + 'T' + event.time);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('en-ZA', { month: 'short' }).toUpperCase();
      const isUpcoming = dateObj >= now;
      let tag = '';
      if (event.featured) tag = '<span class="tag">FEATURED</span>';
      else if (isUpcoming) tag = '<span class="tag">UPCOMING</span>';
      
      html += `
        <article class="event-card ${event.featured ? 'featured' : ''}">
          <div class="poster">
            <img src="${poster}" alt="${event.name}">
            ${tag}
          </div>
          <div class="event-meta">
            <div class="date"><b>${String(day).padStart(2, '0')}</b><small>${month}</small></div>
            <div>
              <span>${event.location || 'THE JUTA RIVER PRESENTS'}</span>
              <h3>${event.name}</h3>
              <p>${event.desc || 'Live entertainment · The Juta River'}</p>
            </div>
          </div>
          <a class="card-link" href="${event.link || '#book'}">${event.link && event.link !== '#' ? 'Tickets / enquiry' : 'Event info'} <b>↗</b></a>
        </article>
      `;
    });
    listContainer.innerHTML = html;
  }

  // Initial render
  renderEvents();

  // Re-render when storage changes (if admin updates in another tab)
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY) {
      renderEvents();
    }
  });

  // Also re-render on visibility change (tab focus)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      renderEvents();
    }
  });
})();