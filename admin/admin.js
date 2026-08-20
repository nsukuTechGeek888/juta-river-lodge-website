// ============================================
// SUPABASE CONFIG - Load from config.js
// ============================================

const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://xgptapucpvogfiezquva.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || "sb_publishable_isUA857Cwiw5AXUEYxgccA_Ps3TozQF";

// ============================================
// SUPABASE CLIENT - USING DELETE + INSERT (works)
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

    // DELETE + INSERT method - always works
    async saveEvent(event) {
        try {
            console.log('💾 Saving event:', event);
            
            // First, try to delete if exists
            const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${event.id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            console.log('🗑️ Delete response:', deleteResponse.status);
            
            // Always insert fresh
            console.log('➕ Inserting event:', event.id);
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(event)
            });
            
            const text = await insertResponse.text();
            console.log('📝 Insert response:', insertResponse.status, text);
            
            if (!insertResponse.ok) {
                throw new Error(`Insert failed: ${insertResponse.status} - ${text}`);
            }
            
            const result = text ? JSON.parse(text) : {};
            console.log('✅ Save successful:', result);
            return result;
            
        } catch(e) {
            console.error('❌ Error saving event:', e);
            throw e;
        }
    },

    async deleteEvent(id) {
        try {
            console.log('🗑️ Deleting event:', id);
            const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            console.log('🗑️ Delete response:', response.status);
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

let events = [];
let tempPosterData = "";
let tempVideoFile = null;
let tempVideoUrl = "";
let editingEventId = null;

// ============================================
// DEFAULT EVENTS
// ============================================

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

// ============================================
// LOAD EVENTS
// ============================================

async function loadEvents() {
    try {
        events = await supabase.getEvents();
        if (!events || events.length === 0) {
            console.log('🌱 Seeding default events...');
            showToast('Setting up default events...', 'info');
            for (const event of defaultEvents) {
                try {
                    await supabase.saveEvent(event);
                } catch(e) {
                    console.warn('⚠️ Could not seed event:', event.id, e.message);
                }
            }
            events = await supabase.getEvents();
            showToast(`✅ Loaded ${events.length} events`, 'success');
        } else {
            showToast(`✅ Loaded ${events.length} events`, 'success');
        }
        renderEvents();
        updateStats();
    } catch(e) {
        console.error('Error loading events:', e);
        showToast('❌ Failed to connect to Supabase: ' + e.message, 'error');
    }
}

// ============================================
// STATS
// ============================================

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

// ============================================
// EDITOR MODAL
// ============================================

function openEventEditor(event = null) {
    const modal = document.getElementById("modal");
    if (!modal) return;
    
    modal.classList.add("open");
    document.body.style.overflow = 'hidden';
    
    if (event) {
        editingEventId = event.id;
        document.getElementById("title").textContent = "✏️ Edit event";
        document.getElementById("id").value = event.id;
        document.getElementById("name").value = event.name || "";
        document.getElementById("date").value = event.date || "";
        document.getElementById("time").value = event.time || "20:00";
        document.getElementById("location").value = event.location || "The Juta River · Giyani";
        document.getElementById("desc").value = event.description || "";
        document.getElementById("link").value = event.link || "";
        document.getElementById("hero").checked = event.hero === true;
        
        tempPosterData = event.poster || "";
        tempVideoUrl = event.videoId || "";
        tempVideoFile = null;
    } else {
        editingEventId = null;
        document.getElementById("title").textContent = "➕ Add event";
        document.getElementById("id").value = "";
        document.getElementById("name").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "20:00";
        document.getElementById("location").value = "The Juta River · Giyani";
        document.getElementById("desc").value = "";
        document.getElementById("link").value = "";
        document.getElementById("hero").checked = false;
        
        tempPosterData = "";
        tempVideoUrl = "";
        tempVideoFile = null;
    }
    
    updatePreview();
}

function closeModal() {
    document.getElementById("modal")?.classList.remove("open");
    document.body.style.overflow = '';
    tempPosterData = "";
    tempVideoFile = null;
    tempVideoUrl = "";
    editingEventId = null;
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
        html = "📷 No media selected";
    }
    preview.innerHTML = html;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const colors = {
        success: '#4caf50',
        error: '#ff6b6b',
        info: '#f1c45e'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 24px;
        background: #0d1214;
        border: 1px solid ${colors[type] || colors.info}55;
        border-radius: 12px;
        color: #eee;
        font-size: 13px;
        z-index: 999;
        box-shadow: 0 12px 40px #000000aa;
        animation: slideUp .3s ease;
        max-width: 400px;
        backdrop-filter: blur(12px);
    `;
    
    toast.innerHTML = `
        <span style="color: ${colors[type] || colors.info};">●</span>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = '.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.getElementById("close")?.addEventListener("click", closeModal);

document.getElementById("modal")?.addEventListener("click", function(e) {
    if (e.target === this) closeModal();
});

document.getElementById("add")?.addEventListener("click", function() {
    tempPosterData = "";
    tempVideoFile = null;
    tempVideoUrl = "";
    openEventEditor();
});

// ============================================
// POSTER UPLOAD
// ============================================

document.getElementById("poster")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
        showToast('❌ Poster too large! Max 200KB', 'error');
        this.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function() {
        tempPosterData = reader.result;
        updatePreview();
        showToast('✅ Poster uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
});

// ============================================
// VIDEO UPLOAD
// ============================================

document.getElementById("video")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
        showToast('❌ Video too large! Max 50MB', 'error');
        this.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function() {
        tempVideoUrl = reader.result;
        tempVideoFile = file;
        updatePreview();
        showToast(`✅ Video selected (${Math.round(file.size / 1024)} KB)`, 'success');
    };
    reader.readAsDataURL(file);
});

// ============================================
// FORM SUBMIT
// ============================================

document.getElementById("form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    try {
        const id = document.getElementById("id").value || crypto.randomUUID();
        const isHero = document.getElementById("hero").checked;
        
        // Un-hero all others if this is hero
        if (isHero) {
            events.forEach(event => event.hero = false);
        }
        
        // Prepare event data - make sure all fields match Supabase columns
        const eventData = {
            id: id,
            name: document.getElementById("name").value.trim() || "Untitled Event",
            date: document.getElementById("date").value || "2026-12-31",
            time: document.getElementById("time").value || "20:00",
            location: document.getElementById("location").value.trim() || "The Juta River · Giyani",
            description: document.getElementById("desc").value.trim() || "",
            link: document.getElementById("link").value.trim() || "",
            poster: tempPosterData || "../assets/metro-home-coming.jpg",
            videoId: tempVideoUrl || "",
            hero: isHero
        };
        
        console.log('📝 Saving event:', eventData);
        
        // Save to Supabase (DELETE + INSERT)
        await supabase.saveEvent(eventData);
        
        // Reload events
        await loadEvents();
        
        // Close modal and reset
        closeModal();
        showToast('✅ Event saved successfully!', 'success');
        
    } catch(e) {
        console.error('❌ Save failed:', e);
        showToast('❌ Failed to save: ' + e.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Save event';
    }
});

// ============================================
// DELETE EVENT
// ============================================

window.deleteEvent = async function(id) {
    const event = events.find(event => event.id === id);
    if (!event) return;
    const confirmed = confirm(`Delete "${event.name}"?`);
    if (!confirmed) return;
    
    try {
        showToast('🗑️ Deleting event...', 'info');
        await supabase.deleteEvent(id);
        await loadEvents();
        showToast('✅ Event deleted successfully', 'success');
    } catch(e) {
        showToast('❌ Failed to delete event: ' + e.message, 'error');
        console.error(e);
    }
};

// ============================================
// EDIT EVENT
// ============================================

window.editEvent = function(id) {
    console.log('✏️ Editing event:', id);
    const event = events.find(event => event.id === id);
    if (event) {
        console.log('📋 Event found:', event);
        openEventEditor(event);
    } else {
        console.error('❌ Event not found:', id);
        showToast('❌ Event not found', 'error');
    }
};

// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value = "") {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// ============================================
// RENDER EVENTS
// ============================================

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
        listContainer.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#555;">
                <div style="font-size:48px;margin-bottom:12px;">📅</div>
                <p style="font-size:14px;">No events found</p>
                <p style="font-size:11px;color:#444;">Click "+ Add event" to create your first event</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filteredEvents.map(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const posterSrc = event.poster || "../assets/metro-home-coming.jpg";
        const hasVideo = event.videoId && event.videoId !== "";
        const isUpcoming = eventDate >= now;
        
        return `
            <div class="row">
                <img src="${posterSrc}" alt="${escapeHTML(event.name)}" onerror="this.src='../assets/metro-home-coming.jpg'">
                <div>
                    <small>
                        ${eventDate.toLocaleDateString("en-ZA", { day: '2-digit', month: 'short', year: 'numeric' })} 
                        at ${eventDate.toLocaleTimeString("en-ZA", { hour: '2-digit', minute: '2-digit' })}
                        ${isUpcoming ? ' 🔵' : ''}
                        ${event.hero ? ' ⭐' : ''}
                        ${hasVideo ? ' 🎬' : ''}
                    </small>
                    <h3>
                        ${escapeHTML(event.name)}
                        ${event.hero ? '<span class="badge-featured">★ FEATURED</span>' : ''}
                    </h3>
                    <p>${escapeHTML(event.location)}${event.description ? " · " + escapeHTML(event.description) : ""}</p>
                </div>
                <div class="actions">
                    <button class="edit-btn" onclick="editEvent('${event.id}')">✏️ Edit</button>
                    <button class="del" onclick="deleteEvent('${event.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

// ============================================
// SEARCH & FILTER
// ============================================

document.getElementById("search")?.addEventListener("input", renderEvents);
document.getElementById("filter")?.addEventListener("change", renderEvents);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById("add")?.click();
    }
});

// ============================================
// INITIAL LOAD
// ============================================

showToast('🚀 Loading events...', 'info');
loadEvents();

console.log('🚀 Juta River Admin Dashboard initialized!');
console.log('📋 Keyboard shortcuts: ESC to close modal, Ctrl+N to add event');