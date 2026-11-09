// SPA router: dynamic content loading, URL changes and state management
(function () {
  const views = document.querySelectorAll(".view");
  const routeLinks = document.querySelectorAll("[data-link]");
  const mainEl = document.getElementById("main");
  const skipLink = document.querySelector(".skip-link");
  const routes = ["home", "about", "skills", "projects", "contact"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Simple state management
  const state = { current: null };

  function getRoute() {
    const hash = window.location.hash.replace("#", "").trim();
    return hash === "" ? "home" : hash;
  }

  function render() {
    const route = getRoute();
    const id = routes.includes(route) ? route : "404"; // unknown URL = 404 page
    if (state.current === id) return;

    const target = document.getElementById("view-" + id);
    if (!target) return;

    views.forEach((v) => v.classList.remove("active"));
    target.classList.add("active");
    state.current = id;

    routeLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active-link", isActive);
      if (isActive && a.closest(".main-nav")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    document.title = target.dataset.title + " | Riya Baghel";
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (mainEl) mainEl.focus({ preventScroll: true });
    if (typeof setMenu === "function") setMenu(false);
  }

  // Back/forward button support
  window.addEventListener("hashchange", render);

  // Skip link: main content par focus
  if (skipLink && mainEl) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      mainEl.focus();
    });
  }

  render(); // first load
})();