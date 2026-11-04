// "js" class lagti hai taaki CSS ka .js .reveal animation chale
document.documentElement.classList.add("js");

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

// Pehli baar: device ki setting follow karo
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

  // Link click par menu band
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );

  // Escape dabane par band
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  // Bahar click karne par band
  document.addEventListener("click", (e) => {
    if (
      mainNav.classList.contains("open") &&
      !mainNav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      setMenu(false);
    }
  });

  // Desktop size par wapas aane par reset
  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) setMenu(false);
  });
}

/* ---------- 3. Smooth scroll ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

/* ---------- 4. Active nav link + back-to-top ---------- */
const sectionIds = ["home", "about", "skills", "projects", "contact"];
const navLinks = document.querySelectorAll(".main-nav a");
const backToTop = document.getElementById("backToTop");

function onScroll() {
  // Active link
  let current = "home";
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 160) current = id;
  });
  // Page ke bilkul neeche pahunche to Contact active
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
    current = "contact";
  }
  navLinks.forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === "#" + current)
  );

  // Back-to-top button
  if (backToTop) backToTop.classList.toggle("show", window.scrollY > 400);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  );
}

/* ---------- 5. Scroll reveal (.reveal -> .visible) ---------- */
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
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
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
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
      if (f.error.textContent) validate(f); // error dikh raha ho to live check
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
  });
}