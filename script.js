(() => {
  "use strict";

  function init() {
    const timers = document.querySelectorAll(".timer[data-date]");

    function updateCountdown() {
      const now = Date.now();

      timers.forEach((timer) => {
        const target = new Date(timer.dataset.date).getTime();
        const remaining = Math.max(0, target - now);

        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        const values = { days, hours, minutes, seconds };
        Object.entries(values).forEach(([unit, value]) => {
          const el = timer.querySelector(`[data-${unit}]`);
          if (el) el.textContent = String(value).padStart(unit === "days" ? 3 : 2, "0");
        });
      });
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    const menu = document.querySelector(".hamburger");
    const mobile = document.querySelector(".mobile-menu");

    function closeMenu() {
      if (!menu || !mobile) return;
      menu.setAttribute("aria-expanded", "false");
      mobile.classList.remove("open");
      mobile.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lock");
    }

    menu?.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", String(!open));
      mobile?.classList.toggle("open", !open);
      mobile?.setAttribute("aria-hidden", String(open));
      document.body.classList.toggle("lock", !open);
    });

    document.querySelectorAll('.mobile-menu a[href^="#"], .nav a[href^="#"], .brand[href^="#"]').forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    const progress = document.querySelector(".progress span");
    const top = document.querySelector(".top");

    function scrollUI() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (max ? window.scrollY / max * 100 : 0) + "%";
      top?.classList.toggle("show", window.scrollY > 700);
    }

    window.addEventListener("scroll", scrollUI, { passive: true });
    scrollUI();
    top?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); });

    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => { img.style.opacity = ".25"; });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
