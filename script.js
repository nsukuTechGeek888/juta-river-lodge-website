const $ = (s, root=document) => root.querySelector(s);

function tick() {
  document.querySelectorAll(".countdown").forEach(c => {
    const target = new Date(c.dataset.date).getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const mins = Math.floor(diff / 60000) % 60;
    const secs = Math.floor(diff / 1000) % 60;
    $("[data-days]", c).textContent = String(days).padStart(2,"0");
    $("[data-hours]", c).textContent = String(hours).padStart(2,"0");
    $("[data-minutes]", c).textContent = String(mins).padStart(2,"0");
    $("[data-seconds]", c).textContent = String(secs).padStart(2,"0");
  });
}
tick(); setInterval(tick,1000);

const menu = $(".menu-btn");
const nav = $(".desktop-nav");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("mobile-open", !open);
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", () => nav?.classList.remove("mobile-open"));
});

const style = document.createElement("style");
style.textContent = `
@media(max-width:900px){
 .desktop-nav.mobile-open{display:flex;position:absolute;top:72px;left:14px;right:14px;margin:0;padding:18px;flex-direction:column;gap:18px;background:rgba(8,11,13,.96);border:1px solid rgba(255,255,255,.12);border-radius:16px;backdrop-filter:blur(18px)}
}
`;
document.head.appendChild(style);
