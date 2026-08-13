const $ = (s, root = document) => root.querySelector(s);

function tick() {
  document.querySelectorAll(".countdown").forEach(c => {
    const target = new Date(c.dataset.date).getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const mins = Math.floor(diff / 60000) % 60;
    const secs = Math.floor(diff / 1000) % 60;

    $("[data-days]", c).textContent = String(days).padStart(2, "0");
    $("[data-hours]", c).textContent = String(hours).padStart(2, "0");
    $("[data-minutes]", c).textContent = String(mins).padStart(2, "0");
    $("[data-seconds]", c).textContent = String(secs).padStart(2, "0");
  });
}
tick();
setInterval(tick, 1000);

// Mobile navigation
const menu = $(".menu-btn");
const mobileMenu = $(".mobile-menu");

function closeMenu() {
  if (!menu || !mobileMenu) return;
  menu.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  mobileMenu?.setAttribute("aria-hidden", String(open));
  mobileMenu?.classList.toggle("open", !open);
  document.body.classList.toggle("menu-open", !open);
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", closeMenu);
});

// Scroll progress + back-to-top
const progress = $(".scroll-progress span");
const backTop = $(".back-top");

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;
  backTop?.classList.toggle("show", window.scrollY > 650);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Reveal sections as they enter the viewport
const revealTargets = document.querySelectorAll(
  ".section-head, .event-card, .venue-content, .experience-card, .booking-card"
);
revealTargets.forEach(el => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => observer.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("visible"));
}

// Close the menu if the viewport is resized back to desktop.
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});
