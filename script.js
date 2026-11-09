// "js" class lagti hai taaki CSS ka .js .reveal animation chale
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Dark mode (body.dark + localStorage) ---------- */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  const dark = theme === "dark";
  document.body.classList.toggle("dark", dark);
  if (themeToggle) {
    themeToggle.textContent = dark ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (e) {}

if (!savedTheme) {
  savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
}

/* ---------- 2. Mobile menu (☰ / ✕) ---------- */
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

function setMenu(open) {
  if (!menuToggle || !mainNav) return;
  mainNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.textContent = open ? "✕" : "☰";
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () =>
    setMenu(!mainNav.classList.contains("open"))
  );

  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainNav.classList.contains("open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      mainNav.classList.contains("open") &&
      !mainNav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      setMenu(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) setMenu(false);
  });
}

/* ---------- 3. SPA router (hash based) ---------- */
const views = document.querySelectorAll(".view");
const routeLinks = document.querySelectorAll("[data-link]");
const mainEl = document.getElementById("main");
const routes = ["home", "about", "skills", "projects", "contact"];
const state = { current: null }; // simple state management

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

  // Active link highlight + aria-current
  routeLinks.forEach((a) => {
    const isActive = a.getAttribute("href") === "#" + id;
    a.classList.toggle("active-link", isActive);
    if (isActive && a.closest(".main-nav")) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  document.title = target.dataset.title + " | Riya Baghel";
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  if (mainEl) mainEl.focus({ preventScroll: true });
  setMenu(false);
}

window.addEventListener("hashchange", render); // back/forward button support
render();

// Skip link: hash change kiye bina main content par focus
const skipLink = document.querySelector(".skip-link");
if (skipLink && mainEl) {
  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    mainEl.focus();
  });
}

/* ---------- 4. Back-to-top button ---------- */
const backToTop = document.getElementById("backToTop");

function onScroll() {
  if (backToTop) backToTop.classList.toggle("show", window.scrollY > 400);
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }
  },
  { passive: true }
);
onScroll();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (skipLink) skipLink.focus({ preventScroll: true });
  });
}

/* ---------- 5. Scroll reveal (.reveal -> .visible) ---------- */
const revealEls = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- 6. Contact form validation ---------- */
const form = document.getElementById("contactForm");

if (form) {
  const status = document.getElementById("formStatus");

  const fields = [
    {
      input: document.getElementById("name"),
      error: document.getElementById("nameError"),
      check: (v) => (v.length < 2 ? "Please enter your name." : ""),
    },
    {
      input: document.getElementById("email"),
      error: document.getElementById("emailError"),
      check: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? ""
          : "Please enter a valid email address.",
    },
    {
      input: document.getElementById("message"),
      error: document.getElementById("messageError"),
      check: (v) =>
        v.length < 10 ? "Message should be at least 10 characters." : "",
    },
  ];

  function validate(f) {
    const msg = f.check(f.input.value.trim());
    f.error.textContent = msg;
    f.input.classList.toggle("invalid", msg !== "");
    f.input.setAttribute("aria-invalid", String(msg !== ""));
    return msg === "";
  }

  fields.forEach((f) => {
    f.input.addEventListener("blur", () => validate(f));
    f.input.addEventListener("input", () => {
      if (f.error.textContent) validate(f);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    const results = fields.map(validate);
    if (!results.every(Boolean)) {
      status.textContent = "Please fix the errors above.";
      status.classList.add("error");
      fields[results.indexOf(false)].input.focus();
      return;
    }

    const name = fields[0].input.value.trim();
    status.textContent = "Thanks " + name + "! Your message has been sent.";
    status.classList.add("success");
    form.reset();
    fields.forEach((f) => {
      f.input.removeAttribute("aria-invalid");
      f.input.classList.remove("invalid");
    });
  });
}