// ============================================
// SUPABASE CONFIG - Load from config.js
// ============================================

const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://xgptapucpvogfiezquva.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || "sb_publishable_isUA857Cwiw5AXUEYxgccA_Ps3TozQF";

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = {
    async getEvents() {
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
            console.error('Error loading events:', e);
            return [];
        }
    },

    async saveEvent(event) {
        try {
            // Check if event exists
            const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${event.id}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const existing = await checkResponse.json();

            if (existing && existing.length > 0) {
                // Update existing event
                const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${event.id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(event)
                });
                return await response.json();
            } else {
                // Insert new event
                const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(event)
                });
                return await response.json();
            }
        } catch(e) {
            console.error('Error saving event:', e);
            throw e;
        }
    },

    async deleteEvent(id) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            return response.ok;
        } catch(e) {
            console.error('Error deleting event:', e);
            return false;
        }
    }
};

// ============================================
// MAIN ADMIN CODE
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Default events (as fallback)
const defaultEvents = [
    {
        id: "metro-home-coming",
        name: "Metro Home Coming",
        date: "2026-12-26",
        time: "20:00",
        location: "The Juta River · Giyani",
        description: "Live entertainment · MetroBeatz Presents",
        link: "",
        poster: "../assets/metro-home-coming.jpg",
        videoId: "",
        hero: true
    },
    {
        id: "juta-saturdays",
        name: "Juta Saturdays",
        date: "2026-07-04",
        time: "14:00",
        location: "The Juta River · Giyani",
        description: "Music · Food · People · Vibes",
        link: "",
        poster: "../assets/juta-saturdays.jpg",
        videoId: "",
        hero: false
    },
    {
        id: "peoples-party",
        name: "People's Party",
        date: "2026-06-26",
        time: "14:00",
        location: "The Juta River · Giyani",
        description: "Big energy · Live entertainment",
        link: "",
        poster: "../assets/peoples-party.jpg",
        videoId: "",
        hero: false
    },
    {
        id: "juta-saturdays-cream",
        name: "Juta Saturdays",
        date: "2026-07-11",
        time: "14:00",
        location: "The Juta River · Giyani",
        description: "Network · Music · Food · Parking",
        link: "",
        poster: "../assets/juta-saturdays-cream.jpg",
        videoId: "",
        hero: false
    }
];

let events = [];
let tempPosterData = "";
let tempVideoFile = null;
let tempVideoUrl = "";

// Load events from Supabase
async function loadEvents() {
    try {
        events = await supabase.getEvents();
        if (!events || events.length === 0) {
            console.log('Seeding default events...');
            for (const event of defaultEvents) {
                await supabase.saveEvent(event);
            }
            events = await supabase.getEvents();
        }
        renderEvents();
        updateStats();
    } catch(e) {
        console.error('Error loading events:', e);
        alert('Failed to connect to Supabase. Please check your configuration.');
    }
}

// Update stats
function updateStats() {
    const now = new Date();
    const totalEl = document.getElementById("total");
    const upcomingEl = document.getElementById("upcoming");
    const nextEl = document.getElementById("next");
    
    if (totalEl) totalEl.textContent = events.length;
    if (upcomingEl) {
        upcomingEl.textContent = events.filter(event => new Date(`${event.date}T${event.time}`) >= now).length;
    }
    
    const nextEvent = events.filter(event => new Date(`${event.date}T${event.time}`) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];
    if (nextEl) {
        nextEl.textContent = nextEvent ? new Date(`${nextEvent.date}T${nextEvent.time}`).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }) : "—";
    }
}

// Open the event editor modal
function openEventEditor(event = null) {
    const modal = document.getElementById("modal");
    if (!modal) return;
    
    modal.classList.add("open");
    
    document.getElementById("title").textContent = event ? "Edit event" : "Add event";
    document.getElementById("id").value = event?.id || "";
    document.getElementById("name").value = event?.name || "";
    document.getElementById("date").value = event?.date || "";
    document.getElementById("time").value = event?.time || "20:00";
    document.getElementById("location").value = event?.location || "The Juta River · Giyani";
    document.getElementById("desc").value = event?.description || "";
    document.getElementById("link").value = event?.link || "";
    
    const heroCheckbox = document.getElementById("hero");
    if (heroCheckbox) heroCheckbox.checked = event?.hero === true;
    
    tempPosterData = event?.poster || "";
    tempVideoUrl = event?.videoId || "";
    tempVideoFile = null;
    
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById("preview");
    if (!preview) return;
    let html = "";
    
    if (tempPosterData) {
        html += `<img src="${tempPosterData}" alt="Poster preview" style="max-height:120px;border-radius:8px;"><br>`;
    }
    
    if (tempVideoUrl) {
        html += `<small style="color:#4caf50;">✅ Video: ${tempVideoUrl.substring(0, 40)}...</small>`;
    } else if (tempVideoFile) {
        html += `<small style="color:#4caf50;">✅ Video selected (${Math.round(tempVideoFile.size / 1024)} KB)</small>`;
    }
    
    if (!tempPosterData && !tempVideoUrl && !tempVideoFile) {
        html = "No media selected";
    }
    preview.innerHTML = html;
}

// Close modal
document.getElementById("close")?.addEventListener("click", function() {
    document.getElementById("modal")?.classList.remove("open");
});

document.getElementById("modal")?.addEventListener("click", function(e) {
    if (e.target === this) {
        this.classList.remove("open");
    }
});

document.getElementById("add")?.addEventListener("click", function() {
    tempPosterData = "";
    tempVideoFile = null;
    tempVideoUrl = "";
    openEventEditor();
});

// Poster upload
document.getElementById("poster")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
        alert('Poster image is too large! Please use an image under 200KB.');
        this.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function() {
        tempPosterData = reader.result;
        updatePreview();
    };
    reader.readAsDataURL(file);
});

// Video upload (preview only - stored as URL)
document.getElementById("video")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
        alert('Video is too large! Please use a video under 50MB.');
        this.value = '';
        return;
    }
    
    // For demo, convert to data URL (small videos only)
    const reader = new FileReader();
    reader.onload = function() {
        tempVideoUrl = reader.result;
        tempVideoFile = file;
        updatePreview();
    };
    reader.readAsDataURL(file);
});

// Form submit
document.getElementById("form")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("id").value || crypto.randomUUID();
    const heroCheckbox = document.getElementById("hero");
    const isHero = heroCheckbox ? heroCheckbox.checked : false;

    if (isHero) {
        events.forEach(event => event.hero = false);
    }

    let posterToSave = tempPosterData;
    if (!posterToSave) {
        const existing = events.find(e => e.id === id);
        posterToSave = existing?.poster || "../assets/metro-home-coming.jpg";
    }

    let videoToSave = tempVideoUrl || "";

    const newEvent = {
        id: id,
        name: document.getElementById("name").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("desc").value.trim(),
        link: document.getElementById("link").value.trim(),
        poster: posterToSave,
        videoId: videoToSave,
        hero: isHero
    };

    try {
        await supabase.saveEvent(newEvent);
        await loadEvents();
        document.getElementById("modal")?.classList.remove("open");
        tempPosterData = "";
        tempVideoFile = null;
        tempVideoUrl = "";
    } catch(e) {
        alert('Failed to save event. Please try again.');
        console.error(e);
    }
});

window.deleteEvent = async function(id) {
    const event = events.find(event => event.id === id);
    if (!event) return;
    const confirmed = confirm(`Delete "${event.name}"?`);
    if (!confirmed) return;
    
    try {
        await supabase.deleteEvent(id);
        await loadEvents();
    } catch(e) {
        alert('Failed to delete event. Please try again.');
        console.error(e);
    }
};

window.editEvent = function(id) {
    const event = events.find(event => event.id === id);
    if (event) openEventEditor(event);
};

function escapeHTML(value = "") {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function renderEvents() {
    const now = new Date();
    const searchInput = document.getElementById("search");
    const filterSelect = document.getElementById("filter");
    const listContainer = document.getElementById("list");
    
    if (!listContainer) return;
    
    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const filter = filterSelect ? filterSelect.value : "all";

    const filteredEvents = events.filter(event => {
        const date = new Date(`${event.date}T${event.time}`);
        const matchesSearch = `${event.name} ${event.location} ${event.description}`.toLowerCase().includes(search);
        let matchesFilter = true;
        if (filter === "upcoming") matchesFilter = date >= now;
        if (filter === "past") matchesFilter = date < now;
        return matchesSearch && matchesFilter;
    });

    if (!filteredEvents.length) {
        listContainer.innerHTML = `<div style="text-align:center;padding:50px;color:#777;">No events found.</div>`;
        return;
    }

    listContainer.innerHTML = filteredEvents.map(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const posterSrc = event.poster || "../assets/metro-home-coming.jpg";
        const hasVideo = event.videoId && event.videoId !== "";
        return `
            <div class="row">
                <img src="${posterSrc}" alt="${escapeHTML(event.name)}">
                <div>
                    <small>
                        ${eventDate.toLocaleString("en-ZA")}
                        ${event.hero ? " · ⭐ HERO EVENT" : ""}
                        ${hasVideo ? " · 🎬 VIDEO BG" : ""}
                    </small>
                    <h3>${escapeHTML(event.name)}</h3>
                    <p>${escapeHTML(event.location)}${event.description ? " · " + escapeHTML(event.description) : ""}</p>
                </div>
                <div>
                    <button onclick="editEvent('${event.id}')">Edit</button>
                    <button class="del" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

document.getElementById("search")?.addEventListener("input", renderEvents);
document.getElementById("filter")?.addEventListener("change", renderEvents);

// Initial load
loadEvents();